import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MeetingRecordingEntity } from '../entities/meeting-recording.entity';
import { TranscriptSegmentEntity } from '../entities/transcript-segment.entity';
import { ActionItemEntity } from '../entities/action-item.entity';
import { DecisionEntity } from '../entities/decision.entity';
import { MeetNoteIntegrationService } from './meetnote-integration.service';
import * as fs from 'fs';

@Injectable()
export class RecordingProcessingService {
  private readonly logger = new Logger(RecordingProcessingService.name);

  // In-process guard so duplicate processing requests for the same recording
  // UUID cannot launch multiple concurrent upload/poll flows.
  private readonly processingInProgress = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MeetingRecordingEntity)
    private readonly recordingRepo: Repository<MeetingRecordingEntity>,
    @InjectRepository(TranscriptSegmentEntity)
    private readonly transcriptRepo: Repository<TranscriptSegmentEntity>,
    @InjectRepository(ActionItemEntity)
    private readonly actionItemRepo: Repository<ActionItemEntity>,
    @InjectRepository(DecisionEntity)
    private readonly decisionRepo: Repository<DecisionEntity>,
    private readonly meetNoteIntegrationService: MeetNoteIntegrationService,
  ) {}

  private getRecordingsRoot(): string {
    return this.configService.get<string>('LOOP_RECORDINGS_PATH') || 'D:/LoopRecordings';
  }

  /**
   * Process a completed recording through MeetNote:
   *
   * 1. Upload the recording to MeetNote (MP4 is converted to WebM first).
   * 2. Poll MeetNote transcription status until terminal.
   * 3. When transcription completes, persist transcript, intelligence,
   *    decisions, and action items to Loop tables.
   *
   * This replaces the former Python subprocess (process_recording.py).
   * Loop does not invoke Python; MeetNote owns transcription and AI.
   */
  async processRecording(recordingId: string, filePath: string): Promise<void> {
    // Idempotency: in-process guard prevents concurrent processing loops.
    if (this.processingInProgress.has(recordingId)) {
      this.logger.log(
        `Processing already in progress for recordingId="${recordingId}"; ignoring duplicate request.`,
      );
      return;
    }

    const record = await this.recordingRepo.findOne({ where: { recordingId } });
    if (!record) {
      this.logger.error(`Recording record not found for recordingId="${recordingId}"`);
      return;
    }

    // Skip if already fully processed through MeetNote.
    if (record.processingStatus === 'completed' && record.meetnoteMeetingId) {
      this.logger.log(
        `Recording already processed for recordingId="${recordingId}"; skipping.`,
      );
      return;
    }

    // DB-level guard: a recording left in 'processing' after a crash is
    // recovered and reprocessed. The in-process Set guard (checked above)
    // prevents true concurrency, so a stale 'processing' status is safe to
    // override. A 'completed' status still means idempotent skip.
    if (record.processingStatus === 'processing') {
      this.logger.log(
        `Recording has stale processing status for recordingId="${recordingId}"; recovering and reprocessing.`,
      );
      // Fall through — processRecording resets status below.
    }

    // Validate and resolve the recording file path.
    const resolvedPath = this.meetNoteIntegrationService.resolveHostFilePath(filePath);
    if (!resolvedPath) {
      await this.markFailed(recordingId, 'Recording output path could not be resolved');
      return;
    }

    if (!this.isPathAllowed(resolvedPath)) {
      await this.markFailed(recordingId, 'Recording path is not allowed');
      return;
    }

    let fileStats: fs.Stats | null = null;
    try {
      fileStats = fs.statSync(resolvedPath);
    } catch {
      fileStats = null;
    }

    if (!fileStats || !fileStats.isFile() || fileStats.size === 0) {
      await this.markFailed(
        recordingId,
        'Recording file is missing or empty on disk',
      );
      return;
    }

    // Mark as processing before launching the upload/poll flow.
    this.processingInProgress.add(recordingId);
    await this.recordingRepo.update({ recordingId }, {
      transcriptStatus: 'processing',
      intelligenceStatus: 'processing',
      processingStatus: 'processing',
      meetnoteStatus: 'uploading',
      errorMessage: null,
    });

    try {
      // Step 1: Upload to MeetNote (converts MP4→WebM, then multipart upload).
      const uploadResult = await this.meetNoteIntegrationService.submitRecording(record);

      if (uploadResult.skipped) {
        const reason = uploadResult.reason || 'Upload skipped';
        this.logger.log(
          `MeetNote upload skipped for recordingId="${recordingId}": ${reason}`,
        );

        if (uploadResult.meetnoteMeetingId) {
          // Already uploaded previously; skip to polling.
          await this.runPollingAndPersist(recordingId, String(uploadResult.meetnoteMeetingId));
          return;
        }

        // Not uploaded and not skippable — mark failed.
        await this.markFailed(recordingId, reason);
        return;
      }

      const meetnoteMeetingId = uploadResult.meetnoteMeetingId;
      if (!meetnoteMeetingId) {
        await this.markFailed(recordingId, 'MeetNote upload did not return a meeting_id');
        return;
      }

      // Step 2: Poll transcription status, then persist results.
      await this.runPollingAndPersist(recordingId, meetnoteMeetingId);

      this.logger.log(
        `Processing completed for recordingId="${recordingId}" meetnoteMeetingId="${meetnoteMeetingId}"`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Processing failed for recordingId="${recordingId}": ${message}`,
      );
      await this.recordingRepo.update({ recordingId }, {
        processingStatus: 'failed',
        transcriptStatus: 'failed',
        intelligenceStatus: 'failed',
        meetnoteStatus: 'failed',
        transcriptError: message,
        intelligenceError: message,
        errorMessage: message,
      });
    } finally {
      this.processingInProgress.delete(recordingId);
    }
  }

  /**
   * Poll MeetNote transcription status and, once complete, persist all
   * results to Loop tables.
   */
  private async runPollingAndPersist(
    recordingId: string,
    meetnoteMeetingId: string,
  ): Promise<void> {
    const snapshot = await this.meetNoteIntegrationService.pollUntilTranscriptionComplete(
      meetnoteMeetingId,
      {
        onStatusChange: (status) => {
          this.recordingRepo.update({ recordingId }, {
            meetnoteStatus: status.status || 'pending',
            transcriptStatus: status.status === 'completed' ? 'completed' : status.status || 'processing',
          }).catch(() => {
            // Best-effort progress persistence; must not abort polling.
          });
        },
      },
    );

    if (snapshot.status === 'failed') {
      // MeetNote supports one automatic retry via POST
      // /meetings/{meeting_id}/transcription/retry. Do not retry when status
      // is pending or processing; only on terminal failure.
      this.logger.log(
        `Transcription failed for recordingId="${recordingId}" meetnoteMeetingId="${meetnoteMeetingId}"; attempting one automatic retry.`,
      );
      try {
        await this.meetNoteIntegrationService.retryTranscription(meetnoteMeetingId);
        // Poll again after retry, with a reduced attempt budget.
        const retrySnapshot = await this.meetNoteIntegrationService.pollUntilTranscriptionComplete(
          meetnoteMeetingId,
          {
            intervalMs: Number(this.configService.get<string>('MEETNOTE_POLL_INTERVAL_MS') || 5000),
            maxAttempts: Number(this.configService.get<string>('MEETNOTE_MAX_POLL_ATTEMPTS') || 120),
            onStatusChange: (status) => {
              this.recordingRepo.update({ recordingId }, {
                meetnoteStatus: status.status || 'pending',
                transcriptStatus: status.status === 'completed' ? 'completed' : status.status || 'processing',
              }).catch(() => {
                // Best-effort progress persistence.
              });
            },
          },
        );

        if (retrySnapshot.status === 'completed') {
          // Fall through to persistence below.
        } else if (retrySnapshot.status === 'failed') {
          await this.recordingRepo.update({ recordingId }, {
            processingStatus: 'failed',
            transcriptStatus: 'failed',
            intelligenceStatus: 'failed',
            meetnoteStatus: 'failed',
            transcriptError: retrySnapshot.error || 'Transcription failed after retry',
            intelligenceError: retrySnapshot.error || 'Transcription failed after retry',
            errorMessage: retrySnapshot.error || 'Transcription failed after retry',
          });
          return;
        } else {
          await this.recordingRepo.update({ recordingId }, {
            processingStatus: 'failed',
            transcriptStatus: 'failed',
            intelligenceStatus: 'failed',
            meetnoteStatus: retrySnapshot.status || 'failed',
            transcriptError: 'Transcription did not reach a terminal status after retry',
            intelligenceError: 'Transcription did not reach a terminal status after retry',
            errorMessage: 'Transcription did not reach a terminal status after retry',
          });
          return;
        }
      } catch (retryError) {
        const message = retryError instanceof Error ? retryError.message : String(retryError);
        this.logger.error(
          `Automatic transcription retry failed for recordingId="${recordingId}": ${message}`,
        );
        await this.recordingRepo.update({ recordingId }, {
          processingStatus: 'failed',
          transcriptStatus: 'failed',
          intelligenceStatus: 'failed',
          meetnoteStatus: 'failed',
          transcriptError: message,
          intelligenceError: message,
          errorMessage: message,
        });
        return;
      }
    }

    // Step 3: Persist transcript, intelligence, decisions, action items.
    try {
      await this.meetNoteIntegrationService.persistMeetNoteResults(
        recordingId,
        meetnoteMeetingId,
      );
    } catch (persistError) {
      const message = persistError instanceof Error ? persistError.message : String(persistError);
      this.logger.error(
        `Failed to persist MeetNote results for recordingId="${recordingId}": ${message}`,
      );
      // Transcription completed; persist failure is non-fatal for the flow.
      await this.recordingRepo.update({ recordingId }, {
        processingStatus: 'completed',
        transcriptStatus: 'completed',
        intelligenceStatus: 'failed',
        intelligenceError: message,
        errorMessage: message,
      });
      return;
    }

    await this.recordingRepo.update({ recordingId }, {
      processingStatus: 'completed',
      transcriptStatus: 'completed',
      intelligenceStatus: 'completed',
      meetnoteStatus: 'completed',
      errorMessage: null,
    });
  }

  /**
   * Validate that a resolved file path lives within the configured recordings
   * directory. Reuses the same allow-list logic as
   * MeetNoteIntegrationService.isAllowedRecordingPath.
   */
  private isPathAllowed(filePath: string): boolean {
    return this.meetNoteIntegrationService.isAllowedRecordingPath(filePath);
  }

  private async markFailed(recordingId: string, message: string): Promise<void> {
    this.logger.error(`Processing failed for recordingId="${recordingId}": ${message}`);
    await this.recordingRepo.update({ recordingId }, {
      processingStatus: 'failed',
      transcriptStatus: 'failed',
      intelligenceStatus: 'failed',
      meetnoteStatus: 'failed',
      transcriptError: message,
      intelligenceError: message,
      errorMessage: message,
    });
  }
}
