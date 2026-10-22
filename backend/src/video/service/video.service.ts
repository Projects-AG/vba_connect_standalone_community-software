// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class VideoService {

//     createRoom(roomName: string) {

//         return {
//             success: true,
//             message: 'Room created successfully',
//             roomName,
//         };

//     }

// }

import {
    BadRequestException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EgressStatus, LivekitModel } from '../model/livekit.model';
import { MeetingRecordingService } from '../../meeting/service/meeting-recording.service';
import { RecordingProcessingService } from '../../meeting/service/recording-processing.service';
import { MeetNoteIntegrationService } from '../../meeting/service/meetnote-integration.service';

import * as fs from 'fs';
import { randomBytes } from 'crypto';

@Injectable()
export class VideoService {

    private readonly logger = new Logger(VideoService.name);

    // In-process guard so duplicate stop requests cannot launch multiple
    // concurrent finalization/polling loops for the same Egress ID.
    private readonly finalizationInProgress = new Set<string>();

    // Short-lived, single-use playback tokens for authenticated video
    // playback. Native <video> elements cannot attach Authorization headers,
    // so we issue time-limited tokens tied to a specific recording and pass
    // them as a query parameter on the download URL.
    private readonly playbackTokens = new Map<string, {
        recordingId: string;
        expiresAt: number;
        used: boolean;
    }>();

    private readonly PLAYBACK_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

    private validateRoomName(roomName: string): string {

        const candidate = roomName?.trim();

        if (!candidate) {
            throw new BadRequestException('Room name is required');
        }

        if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(candidate)) {
            throw new BadRequestException('Room name contains invalid characters');
        }

        return candidate;

    }

    private validateEgressId(egressId: string): string {

        const candidate = egressId?.trim();

        if (!candidate) {
            throw new BadRequestException('Egress ID is required');
        }

        if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(candidate)) {
            throw new BadRequestException('Egress ID contains invalid characters');
        }

        return candidate;

    }

    private getPollIntervalMs(): number {

        return Number(this.configService.get<string>('LOOP_RECORDING_POLL_INTERVAL_MS') || 2000);

    }

    private getMaxAttempts(): number {

        return Number(this.configService.get<string>('LOOP_RECORDING_MAX_ATTEMPTS') || 60);

    }

    private sleep(ms: number): Promise<void> {

        return new Promise((resolve) => setTimeout(resolve, ms));

    }

    constructor(
        private readonly configService: ConfigService,
        private readonly livekitModel: LivekitModel,
        private readonly meetingRecordingService: MeetingRecordingService,
        private readonly recordingProcessingService: RecordingProcessingService,
        private readonly meetNoteIntegrationService: MeetNoteIntegrationService,
    ) { }

    async createRoom(roomName: string) {

        try {

            const room =
                await this.livekitModel.createRoom(roomName);

            return {
                success: true,
                message: 'Room created successfully',
                room,
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to create room',
            );

        }

    }

    async generateToken(
        roomName: string,
        participantName: string,
    ) {

        try {

            const token =
                await this.livekitModel.generateToken(
                    roomName,
                    participantName,
                );

            return {
                success: true,
                token,
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to generate access token',
            );

        }

    }

    async getParticipants(roomName: string) {

        try {

            const participants =
                await this.livekitModel.getParticipants(roomName);

            return {
                success: true,
                participants,
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to fetch room participants',
            );

        }

    }

    async endRoom(roomName: string) {

        try {

            await this.livekitModel.endRoom(roomName);

            return {
                success: true,
                message: 'Room ended successfully',
            };

        } catch (error) {

            throw new InternalServerErrorException(
                'Failed to end LiveKit room',
            );

        }

    }

    async startRecording(roomName: string) {

        const validatedRoomName = this.validateRoomName(roomName);

        try {

            this.logger.log(`Starting recording for room="${validatedRoomName}"`);

            const egress = await this.livekitModel.startRecording(validatedRoomName);
            const egressPayload = egress as unknown as Record<string, unknown>;
            const egressId = typeof egressPayload.egressId === 'string' ? egressPayload.egressId : null;

            if (!egressId) {
                throw new InternalServerErrorException('LiveKit did not return an egress ID');
            }

            await this.meetingRecordingService.upsertForRoom({
                roomName: validatedRoomName,
                egressId,
                status: 'starting',
            });

            this.logger.log(`Recording started room="${validatedRoomName}" egressId="${egressId}"`);

            return {
                success: true,
                egress,
            };

        } catch (error) {

            this.logger.error(`Failed to start recording for room="${validatedRoomName}"`, error instanceof Error ? error.stack : String(error));

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to start recording',
            );

        }

    }

    /**
     * Normalize a LiveKit Egress status into a code/name pair.
     *
     * The livekit-server-sdk returns EgressInfo.status as a numeric EgressStatus
     * enum (STARTING=0, ACTIVE=1, ENDING=2, COMPLETE=3, FAILED=4, ABORTED=5,
     * LIMIT_REACHED=6). Some test fixtures or older transports may pass a string
     * instead, so both forms are handled defensively. No status names are
     * invented; only values defined by the SDK are recognized.
     */
    private normalizeEgressStatus(status: unknown): { code: number | null; name: string | null } {

        if (typeof status === 'number') {
            return {
                code: status,
                name: (EgressStatus as unknown as Record<number, string>)[status] ?? String(status),
            };
        }

        if (typeof status === 'string') {
            const upper = status.toUpperCase();
            const codeMap: Record<string, number> = {
                'EGRESS_STARTING': EgressStatus.EGRESS_STARTING,
                'EGRESS_ACTIVE': EgressStatus.EGRESS_ACTIVE,
                'EGRESS_ENDING': EgressStatus.EGRESS_ENDING,
                'EGRESS_COMPLETE': EgressStatus.EGRESS_COMPLETE,
                'EGRESS_FAILED': EgressStatus.EGRESS_FAILED,
                'EGRESS_ABORTED': EgressStatus.EGRESS_ABORTED,
                'EGRESS_LIMIT_REACHED': EgressStatus.EGRESS_LIMIT_REACHED,
                // Compact aliases without underscores for defensive matching.
                'EGRESSCOMPLETE': EgressStatus.EGRESS_COMPLETE,
                'EGRESSFAILED': EgressStatus.EGRESS_FAILED,
                'EGRESSABORTED': EgressStatus.EGRESS_ABORTED,
            };
            const code = codeMap[upper];
            if (typeof code === 'number') {
                return { code, name: upper };
            }
            return { code: null, name: upper };
        }

        return { code: null, name: null };
    }

    /**
     * Extract output file information from a LiveKit EgressInfo response.
     *
     * The SDK places output metadata in EgressInfo.fileResults[0] (FileInfo with
     * location/filename/duration/size). Fall back to top-level fields only if
     * present; never fabricate values.
     */
    private extractFileInfo(egress: unknown): {
        filePath: string | null;
        fileName: string | null;
        durationSeconds: number | null;
        fileSizeBytes: number | null;
    } {

        const payload = egress as unknown as Record<string, unknown>;
        const fileResults = payload.fileResults as Array<Record<string, unknown>> | undefined;
        const file = Array.isArray(fileResults) && fileResults.length > 0 ? fileResults[0] : null;

        let location: string | null = null;
        let filename: string | null = null;
        let duration: number | null = null;
        let size: number | null = null;

        if (file) {
            location = typeof file.location === 'string' ? file.location :
                typeof file.filepath === 'string' ? file.filepath : null;
            filename = typeof file.filename === 'string' ? file.filename : null;

            // LiveKit SDK reports FileInfo.duration as int64 nanoseconds.
            // Convert to seconds (finite, non-negative, within MySQL INT range)
            // before persisting so the value never overflows duration_seconds.
            const rawDuration = file.duration;
            if (typeof rawDuration === 'bigint' || typeof rawDuration === 'number') {
                const nanos = typeof rawDuration === 'bigint' ? Number(rawDuration) : rawDuration;
                if (Number.isFinite(nanos) && nanos >= 0) {
                    const seconds = Math.round(nanos / 1e9);
                    duration = Math.min(seconds, 2147483647);
                }
            }

            const rawSize = file.size;
            size = typeof rawSize === 'bigint' ? Number(rawSize) :
                typeof rawSize === 'number' ? rawSize : null;
        }

        // Fall back to top-level fields if the fileResults shape is absent.
        const filePath = location ||
            (typeof payload.filepath === 'string' ? payload.filepath : null) ||
            (typeof payload.fileLocation === 'string' ? payload.fileLocation : null) ||
            (typeof payload.url === 'string' ? payload.url : null) ||
            null;

        return {
            filePath: filePath ?? null,
            fileName: filename ?? null,
            durationSeconds: duration,
            fileSizeBytes: size,
        };
    }

    private async finalizeRecording(egressId: string, roomName?: string): Promise<void> {

        // Idempotency: if finalization is already running for this Egress ID,
        // do not start a second concurrent polling loop.
        if (this.finalizationInProgress.has(egressId)) {
            this.logger.log(`Finalization already in progress for egressId="${egressId}" room="${roomName ?? '<unknown>'}"; ignoring duplicate request.`);
            return;
        }

        this.finalizationInProgress.add(egressId);

        const pollIntervalMs = this.getPollIntervalMs();
        const maxAttempts = this.getMaxAttempts();

        this.logger.log(`Finalization started for egressId="${egressId}" room="${roomName ?? '<unknown>'} maxAttempts=${maxAttempts} pollIntervalMs=${pollIntervalMs}`);

        try {
            let attempts = 0;

            while (attempts < maxAttempts) {
                await this.sleep(pollIntervalMs);
                attempts += 1;

                // Fetch the egress status. Transient fetch errors are retried;
                // they do not indicate a terminal state.
                let egress;
                try {
                    egress = await this.livekitModel.getRecording(egressId);
                } catch (fetchError) {
                    this.logger.debug(
                        `Egress fetch error egressId="${egressId}" attempt=${attempts}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
                    );
                    continue;
                }

                if (!egress) {
                    // Egress not yet visible; keep polling.
                    this.logger.debug(`Egress not yet visible egressId="${egressId}" attempt=${attempts}`);
                    continue;
                }

                const egressPayload = egress as unknown as Record<string, unknown>;
                const norm = this.normalizeEgressStatus(egressPayload.status);
                const { filePath, fileName, durationSeconds, fileSizeBytes } = this.extractFileInfo(egress);

                this.logger.log(
                    `Egress poll egressId="${egressId}" room="${roomName ?? '<unknown>'}" attempt=${attempts}/${maxAttempts} ` +
                    `statusCode=${norm.code ?? 'unknown'} statusName=${norm.name ?? 'unknown'} ` +
                    `filePath=${filePath ?? '<none>'} durationSeconds=${durationSeconds ?? '<none>'} fileSizeBytes=${fileSizeBytes ?? '<none>'}`,
                );

                // ---- Terminal: COMPLETED ----
                // Handle completion definitively; never let metadata or
                // processing failures fall through into the retry loop below.
                if (norm.code === EgressStatus.EGRESS_COMPLETE ||
                    norm.name === 'EGRESS_COMPLETE' || norm.name === 'COMPLETED') {
                    await this.handleCompletedEgress(
                        egressId,
                        roomName,
                        { filePath, fileName, durationSeconds, fileSizeBytes },
                    );
                    return;
                }

                // ---- Terminal: FAILED / ABORTED / LIMIT_REACHED ----
                if (norm.code === EgressStatus.EGRESS_FAILED ||
                    norm.code === EgressStatus.EGRESS_ABORTED ||
                    norm.code === EgressStatus.EGRESS_LIMIT_REACHED ||
                    norm.name === 'EGRESS_FAILED' || norm.name === 'FAILED') {
                    this.logger.warn(`Egress failed egressId="${egressId}" room="${roomName ?? '<unknown>'}" status=${norm.name ?? norm.code}`);
                    await this.meetingRecordingService.updateProcessingStatus(egressId, {
                        status: 'failed',
                        processingStatus: 'failed',
                        errorMessage: 'LiveKit recording failed to complete',
                    });
                    return;
                }

                // ---- Non-terminal: persist progress metadata, keep polling ----
                try {
                    await this.meetingRecordingService.updateProcessingStatus(egressId, {
                        status: norm.name ? norm.name.toLowerCase().replace(/_/g, '-') : 'starting',
                        filePath: filePath ?? undefined,
                        fileName: fileName ?? undefined,
                        durationSeconds: durationSeconds ?? undefined,
                        fileSizeBytes: fileSizeBytes ?? undefined,
                    });
                } catch (metaError) {
                    // A metadata persistence hiccup must not abort the whole
                    // recording; log and continue polling the terminal state.
                    this.logger.warn(
                        `Failed to persist egress progress metadata egressId="${egressId}" attempt=${attempts}: ${metaError instanceof Error ? metaError.message : String(metaError)}`,
                    );
                }
            }

            // Timeout: the polling window closed without a recognized terminal
            // status. This is distinct from a confirmed Egress failure.
            this.logger.error(`Recording finalization timed out egressId="${egressId}" room="${roomName ?? '<unknown>'} attempts=${attempts} maxAttempts=${maxAttempts}`);
            await this.meetingRecordingService.updateProcessingStatus(egressId, {
                status: 'stalled',
                processingStatus: 'failed',
                errorMessage: 'Recording did not finish within the expected time window',
            });
        } finally {
            // Clean up in-progress state safely on every exit path.
            this.finalizationInProgress.delete(egressId);
            this.logger.log(`Finalization finished for egressId="${egressId}" room="${roomName ?? '<unknown>'}"`);
        }
    }

    /**
     * Handle a confirmed Egress completion: persist final metadata, validate
     * the output file, and invoke Loop-native processing exactly once.
     *
     * Any failure here is recorded as a failed recording with the actual
     * error message; it is NOT retried by the polling loop.
     */
    private async handleCompletedEgress(
        egressId: string,
        roomName: string | undefined,
        fileInfo: {
            filePath: string | null;
            fileName: string | null;
            durationSeconds: number | null;
            fileSizeBytes: number | null;
        },
    ): Promise<void> {
        const updated = await this.meetingRecordingService.findByEgressId(egressId);
        if (!updated) {
            this.logger.warn(`Egress completed but no recording record found for egressId="${egressId}"`);
            return;
        }

        // Prevent duplicate processing for an already-completed recording.
        if (updated.processingStatus === 'completed') {
            this.logger.log(`Loop-native processing already completed for egressId="${egressId}" recordingId="${updated.recordingId ?? '<none>'}"; skipping duplicate submission.`);
            return;
        }

        // Persist final metadata (path, name, duration, size) before processing.
        // Do NOT set processingStatus here: processRecording() owns that state
        // transition. Setting it to 'processing' here would cause processRecording()
        // to self-skip (it treats 'processing' as already-in-flight).
        try {
            await this.meetingRecordingService.updateProcessingStatus(egressId, {
                status: 'completed',
                filePath: fileInfo.filePath ?? undefined,
                fileName: fileInfo.fileName ?? undefined,
                durationSeconds: fileInfo.durationSeconds ?? undefined,
                fileSizeBytes: fileInfo.fileSizeBytes ?? undefined,
            });
        } catch (metaError) {
            const message = metaError instanceof Error ? metaError.message : String(metaError);
            this.logger.error(`Egress completed but metadata persistence failed egressId="${egressId}": ${message}`);
            await this.meetingRecordingService.updateProcessingStatus(egressId, {
                status: 'failed',
                processingStatus: 'failed',
                errorMessage: `Recording completed but metadata persistence failed: ${message}`,
            });
            return;
        }

        // Resolve the /out/ container path to the host recordings path.
        // Prefer the filePath from the Egress completion result (fileInfo),
        // which is the path LiveKit confirmed at completion time. Fall back to
        // the DB record's filePath if the Egress result did not include one.
        const resolvedPath = this.meetNoteIntegrationService.resolveHostFilePath(
            fileInfo.filePath ?? updated.filePath ?? undefined,
        );
        if (!resolvedPath) {
            this.logger.error(`Egress completed but could not resolve output path egressId="${egressId}" filePath="${fileInfo.filePath ?? updated.filePath ?? '<none>'}"`);
            await this.meetingRecordingService.updateProcessingStatus(egressId, {
                status: 'failed',
                processingStatus: 'failed',
                errorMessage: 'Recording completed but output path could not be resolved',
            });
            return;
        }

        // Validate that the MP4 exists and is non-empty.
        let fileStats: fs.Stats | null = null;
        try {
            fileStats = fs.statSync(resolvedPath);
        } catch {
            fileStats = null;
        }

        if (!fileStats || !fileStats.isFile() || fileStats.size === 0) {
            this.logger.error(`Egress completed but output file is missing or empty egressId="${egressId}" resolvedPath="${resolvedPath}"`);
            await this.meetingRecordingService.updateProcessingStatus(egressId, {
                status: 'failed',
                processingStatus: 'failed',
                errorMessage: 'Recording completed but output file is missing or empty on disk',
            });
            return;
        }

        this.logger.log(`Egress output validated egressId="${egressId}" resolvedPath="${resolvedPath}" size=${fileStats.size} bytes; handing recording to MeetNote for transcription and AI.`);

        // Hand the recording to MeetNote (upload + background polling for
        // transcription/AI). Do not await: transcription is asynchronous on
        // MeetNote's side and must not block the Egress finalization request.
        // processRecording() is idempotent and guards against duplicate runs.
        void this.recordingProcessingService.processRecording(updated.recordingId, resolvedPath).catch((processError) => {
            const message = processError instanceof Error ? processError.message : String(processError);
            this.logger.error(`MeetNote processing failed for egressId="${egressId}" recordingId="${updated.recordingId ?? '<none>'}": ${message}`);
        });

        this.logger.log(`MeetNote processing started for egressId="${egressId}" recordingId="${updated.recordingId ?? '<none>'}"`);
    }

    async stopRecording(egressId: string) {

        const validatedEgressId = this.validateEgressId(egressId);

        try {

            this.logger.log(`Stop requested for egressId="${validatedEgressId}"`);

            const egress = await this.livekitModel.stopRecording(validatedEgressId);
            const egressPayload = egress as unknown as Record<string, unknown>;
            const roomName = typeof egressPayload.roomName === 'string' ? egressPayload.roomName : undefined;

            await this.meetingRecordingService.updateProcessingStatus(validatedEgressId, {
                status: 'stopping',
            });

            this.logger.log(`Stop accepted for egressId="${validatedEgressId}" room="${roomName ?? '<unknown>'}"; scheduling finalization.`);

            // Fire-and-forget finalization; idempotency guard prevents duplicate loops.
            void this.finalizeRecording(validatedEgressId, roomName);

            return {
                success: true,
                egress,
            };

        } catch (error) {

            this.logger.error(`Failed to stop recording egressId="${validatedEgressId}"`, error instanceof Error ? error.stack : String(error));

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to stop recording',
            );

        }

    }

    async getRecording(egressId: string) {

        const validatedEgressId = this.validateEgressId(egressId);

        try {

            const egress = await this.livekitModel.getRecording(validatedEgressId);

            return {
                success: true,
                egress,
            };

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to fetch recording',
            );

        }

    }

    async getRecordingFile(recordingId: string, userId: string | undefined, playbackToken?: string) {
        const record = await this.meetingRecordingService.findByRecordingId(recordingId);
        if (!record || !record.filePath) {
            throw new NotFoundException('Recording not found');
        }

        // Enforce ownership only when a Bearer token is present.
        // Native <video> elements use the playback-token query param instead.
        if (userId && record.meetingId) {
            const meeting = await this.meetingRecordingService.findMeetingByIdAndUser(
                record.meetingId,
                userId,
            );
            if (!meeting) {
                throw new NotFoundException('Recording not found');
            }
        }

        const resolvedPath = this.meetNoteIntegrationService.resolveHostFilePath(record.filePath);
        if (!resolvedPath || !require('fs').existsSync(resolvedPath)) {
            throw new NotFoundException('Recording file not available on disk');
        }

        const normalized = require('path').resolve(resolvedPath);
        if (!this.meetNoteIntegrationService.isAllowedRecordingPath(normalized)) {
            throw new NotFoundException('Recording path is not allowed');
        }

        // Validate playback token if provided (alternative to Bearer auth
        // for native <video> elements that cannot attach custom headers).
        if (playbackToken) {
            if (!this.validatePlaybackToken(playbackToken, recordingId)) {
                throw new NotFoundException('Invalid or expired playback token');
            }
        }

        return {
            filePath: normalized,
            fileName: record.fileName || require('path').basename(normalized),
        };
    }

    /**
     * Generate a short-lived, single-use playback token for a recording.
     * The caller must already be authenticated (Bearer token) to call this.
     * Ownership is enforced: only the meeting owner can generate a token.
     */
    async generatePlaybackToken(recordingId: string, userId: string): Promise<string> {
        const record = await this.meetingRecordingService.findByRecordingId(recordingId);
        if (!record || !record.meetingId) {
            throw new NotFoundException('Recording not found');
        }

        // Enforce ownership: only the meeting owner can generate a token.
        const meeting = await this.meetingRecordingService.findMeetingByIdAndUser(
            record.meetingId,
            userId,
        );
        if (!meeting) {
            throw new NotFoundException('Recording not found');
        }

        const token = randomBytes(32).toString('hex');
        this.playbackTokens.set(token, {
            recordingId,
            expiresAt: Date.now() + this.PLAYBACK_TOKEN_TTL_MS,
            used: false,
        });

        // Periodic cleanup to prevent unbounded growth.
        if (this.playbackTokens.size > 1000) {
            const now = Date.now();
            for (const [key, value] of this.playbackTokens.entries()) {
                if (value.used || value.expiresAt < now) {
                    this.playbackTokens.delete(key);
                }
            }
        }

        return token;
    }

    /**
     * Validate a playback token. Returns true if the token is valid,
     * unexpired, unused, and matches the given recordingId. Marks the
     * token as used on success (single-use).
     */
    private validatePlaybackToken(token: string, recordingId: string): boolean {
        const entry = this.playbackTokens.get(token);
        if (!entry) {
            return false;
        }
        if (entry.used) {
            return false;
        }
        if (entry.expiresAt < Date.now()) {
            this.playbackTokens.delete(token);
            return false;
        }
        if (entry.recordingId !== recordingId) {
            return false;
        }
        entry.used = true;
        return true;
    }

}
