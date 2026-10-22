import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { MeetingEntity } from '../entities/meeting.entity';
import { MeetingRecordingEntity } from '../entities/meeting-recording.entity';
import { TranscriptSegmentEntity } from '../entities/transcript-segment.entity';
import { ActionItemEntity } from '../entities/action-item.entity';
import { DecisionEntity } from '../entities/decision.entity';

const MEETNOTE_LOGIN_PATH = '/auth/login';
const MEETNOTE_UPLOAD_PATH = '/recordings/upload';

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class MeetNoteIntegrationService {
  private tokenCache: CachedToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MeetingEntity)
    private readonly meetingRepo: Repository<MeetingEntity>,
    @InjectRepository(MeetingRecordingEntity)
    private readonly recordingRepo: Repository<MeetingRecordingEntity>,
    @InjectRepository(TranscriptSegmentEntity)
    private readonly transcriptRepo: Repository<TranscriptSegmentEntity>,
    @InjectRepository(ActionItemEntity)
    private readonly actionItemRepo: Repository<ActionItemEntity>,
    @InjectRepository(DecisionEntity)
    private readonly decisionRepo: Repository<DecisionEntity>,
  ) {}

  private getBaseUrl() {
    return (
      this.configService.get<string>('MEETNOTE_BASE_URL') ||
      this.configService.get<string>('MEETNOTE_API_URL') ||
      'http://localhost:8000'
    );
  }

  private getServiceToken() {
    return this.configService.get<string>('MEETNOTE_SERVICE_TOKEN') || null;
  }

  private getServiceCredentials() {
    return {
      email: this.configService.get<string>('MEETNOTE_SERVICE_EMAIL') || '',
      password: this.configService.get<string>('MEETNOTE_SERVICE_PASSWORD') || '',
    };
  }

  resolveHostFilePath(filePath: string | null | undefined) {
    if (!filePath) return null;

    const normalized = filePath.trim();
    if (!normalized) return null;

    if (normalized.startsWith('/out/')) {
      const hostRoot =
        this.configService.get<string>('LOOP_RECORDINGS_PATH') || 'D:/LoopRecordings';
      return path.join(hostRoot, path.basename(normalized)).replace(/\\/g, '/');
    }

    return normalized;
  }

  isAllowedRecordingPath(filePath: string | null | undefined) {
    if (!filePath) return false;

    const configuredRoot = this.configService.get<string>('LOOP_RECORDINGS_PATH') || 'D:/LoopRecordings';
    const allowedRoot = path.resolve(configuredRoot.replace(/\\/g, '/'));
    const normalized = path.resolve(filePath.replace(/\\/g, '/'));

    return normalized === allowedRoot || normalized.startsWith(`${allowedRoot}${path.sep}`);
  }

  /**
   * Obtain a Bearer token for MeetNote service-account authentication.
   *
   * Uses a static MEETNOTE_SERVICE_TOKEN when configured. Otherwise logs in
   * via POST /auth/login with MEETNOTE_SERVICE_EMAIL/PASSWORD and caches the
   * resulting JWT until it expires (default 60 minutes, with a 60-second
   * safety margin). On a 401 response from a downstream call, callers should
   * call invalidateToken() and retry once.
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const staticToken = this.getServiceToken();
    if (staticToken) {
      return { Authorization: `Bearer ${staticToken}` };
    }

    const now = Date.now();
    if (this.tokenCache && now < this.tokenCache.expiresAt) {
      return { Authorization: `Bearer ${this.tokenCache.accessToken}` };
    }

    const { email, password } = this.getServiceCredentials();
    if (!email || !password) {
      return {};
    }

    const response = await fetch(`${this.getBaseUrl()}${MEETNOTE_LOGIN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const detail = await this.extractSanitizedErrorDetail(response);
      throw new Error(
        `MeetNote login failed with status ${response.status}${detail ? `: ${detail}` : ''}`,
      );
    }

    const payload = await response.json();
    const accessToken =
      payload.access_token ||
      payload.token ||
      payload.data?.access_token ||
      payload.data?.token;

    if (!accessToken) {
      throw new Error('MeetNote login response did not include an access token');
    }

    // MeetNote defaults access_token_expire_minutes to 60. Cache with a
    // 60-second safety margin so we refresh before expiry.
    const expiresAt = now + (59 * 60 * 1000);
    this.tokenCache = { accessToken, expiresAt };

    return { Authorization: `Bearer ${accessToken}` };
  }

  /**
   * Read the error response body and return a sanitized diagnostic detail.
   *
   * MeetNote's FastAPI returns Pydantic validation errors as
   * { detail: [{ type, loc, msg, input }] } on HTTP 422, and
   * { detail: "Incorrect email or password" } on HTTP 401.
   *
   * The `input` field in validation errors may contain the submitted email
   * or password, so only `msg` values are included. Passwords, access
   * tokens, and secret-like values are always redacted. Nothing secret is
   * ever logged or surfaced to callers.
   */
  private async extractSanitizedErrorDetail(response: Response): Promise<string | null> {
    let text: string;
    try {
      text = await response.text();
    } catch {
      return null;
    }
    if (!text) return null;

    try {
      const payload = JSON.parse(text);
      const detail = payload.detail;
      if (detail === undefined) return null;

      if (typeof detail === 'string') {
        return this.sanitizeString(detail);
      }

      if (Array.isArray(detail)) {
        // Pydantic validation errors: extract only the human-readable
        // messages, never the `input` values (which may contain the email
        // or password submitted in the request).
        const messages = detail
          .map((item: unknown) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              return String((item as Record<string, unknown>).msg);
            }
            return String(item);
          })
          .filter(Boolean);
        return messages.length > 0 ? this.sanitizeString(messages.join('; ')) : null;
      }

      return this.sanitizeString(String(detail));
    } catch {
      // Response body is not JSON; return a truncated sanitized version.
      return this.sanitizeString(text.slice(0, 200));
    }
  }

  /**
   * Redact secret-like values from a diagnostic string so it is safe to
   * include in error messages and logs.
   */
  private sanitizeString(value: string): string {
    return value
      .replace(/\bpassword\b\s*[:=]\s*\S+/gi, 'password: [redacted]')
      .replace(
        /\b(access_token|token|secret|api[_-]?key|private_key)\b\s*[:=]\s*\S+/gi,
        '$1: [redacted]',
      )
      .replace(/\bsk-[A-Za-z0-9_\-]{8,}\b/g, '[redacted]')
      .slice(0, 500);
  }

  invalidateToken(): void {
    this.tokenCache = null;
  }

  /**
   * Export a meeting from MeetNote as a file blob (PDF, DOCX, TXT, or JSON).
   * Reuses MeetNote's existing /meetings/{meeting_id}/export endpoint.
   */
  async exportMeeting(
    meetnoteMeetingId: string | number,
    format: string,
    sections: Record<string, boolean>,
  ): Promise<{ data: Blob; headers: Record<string, string> }> {
    const headers = await this.getAuthHeaders();
    const url = new URL(`${this.getBaseUrl()}/meetings/${meetnoteMeetingId}/export`);
    url.searchParams.append('format', format);
    for (const [key, value] of Object.entries(sections)) {
      url.searchParams.append(key, String(value));
    }

    const response = await fetch(url.toString(), {
      headers,
    });

    if (response.status === 404 || response.status === 204) {
      throw new Error('Meeting not found');
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`MeetNote export failed (${response.status}): ${message || 'export'}`);
    }

    const blob = await response.blob();
    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key] = value;
    });

    return { data: blob, headers: headerMap };
  }

  private async getJson<T>(pathName: string): Promise<T | null> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.getBaseUrl()}${pathName}`, {
      headers,
    });

    if (response.status === 404 || response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`MeetNote request failed (${response.status}): ${message || pathName}`);
    }

    return response.json() as Promise<T>;
  }

  private async postJson<T>(
    pathName: string,
    body?: unknown,
    query?: Record<string, string | boolean | number>,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = new URL(`${this.getBaseUrl()}${pathName}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.append(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 404 || response.status === 204) {
      return null as unknown as T;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`MeetNote request failed (${response.status}): ${message || pathName}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Retrieve meeting insights from MeetNote APIs for all recordings of a
   * Loop meeting. Falls back gracefully per-recording when an endpoint
   * fails.
   */
  async getMeetingInsights(meetingId: string) {
    const meeting = await this.meetingRepo.findOne({ where: { meetingId } });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const recordings = await this.recordingRepo.find({
      where: { meetingId },
      order: { createdAt: 'DESC' },
    });

    const insights = await Promise.all(
      recordings.map(async (recording) => {
        if (!recording.meetnoteMeetingId) {
          return {
            recordingId: recording.recordingId,
            meetnoteMeetingId: null,
            meetnoteStatus: recording.meetnoteStatus || 'pending',
            transcript: [],
            intelligence: null,
            actionItems: [],
            decisions: [],
            error: recording.errorMessage || null,
          };
        }

        const meetnoteMeetingId = String(recording.meetnoteMeetingId);

        try {
          const [
            transcript,
            intelligence,
            actionItems,
            decisions,
          ] = await Promise.all([
            this.getJson<Array<{
              id: number;
              meeting_id: number;
              speaker: string;
              start_time: number;
              end_time: number;
              text: string;
              source: string;
              created_at: string;
            }>>(
              `/meetings/${meetnoteMeetingId}/transcript`
            ),
            this.getJson<{
              meeting_id: number;
              status: string | null;
              error: string | null;
              method: string;
              summary: string | null;
              summary_source: string | null;
              key_points: Array<{ text: string; timestamp: number | null }>;
            }>(
              `/meetings/${meetnoteMeetingId}/intelligence`
            ),
            this.getJson<Array<{
              id: number;
              meeting_id: number;
              task: string;
              assignee: string | null;
              due_date: string | null;
              status: string;
              timestamp: number | null;
              source: string;
              origin_key: string | null;
              created_at: string;
              updated_at: string;
            }>>(
              `/meetings/${meetnoteMeetingId}/action-items`
            ),
            this.getJson<Array<{
              id: number;
              meeting_id: number;
              decision: string;
              timestamp: number;
              context: string | null;
              source: string;
              created_at: string;
            }>>(
              `/meetings/${meetnoteMeetingId}/decisions`
            ),
          ]);

          // Fetch Loop's persisted action-item status overrides for this
          // recording so checkbox state survives page refreshes.
          const loopItems = await this.actionItemRepo.find({
            where: { recordingId: recording.recordingId },
          });
          const loopStatusByOriginKey = new Map<string, string>();
          for (const item of loopItems) {
            if (item.originKey) {
              loopStatusByOriginKey.set(item.originKey, item.status);
            }
          }

          return {
            recordingId: recording.recordingId,
            meetnoteMeetingId,
            meetnoteStatus: recording.meetnoteStatus || 'uploaded',
            transcript: transcript || [],
            intelligence: {
              status: intelligence?.status ?? null,
              error: intelligence?.error ?? null,
              method: intelligence?.method ?? null,
              summary: intelligence?.summary ?? null,
              summary_source: intelligence?.summary_source ?? null,
              key_points: intelligence?.key_points ?? [],
              open_questions: [], // MeetNote does not persist or expose open questions
            },
            actionItems: (actionItems || []).map((item) => ({
              id: item.id,
              originKey: item.origin_key ?? null,
              task: item.task,
              assignee: item.assignee,
              dueDate: item.due_date,
              // Loop's persisted status override takes precedence over
              // MeetNote's status so checkbox state persists across refreshes.
              status: loopStatusByOriginKey.get(item.origin_key ?? '') ?? item.status,
              timestamp: item.timestamp,
              source: item.source,
            })),
            decisions: (decisions || []).map((d) => ({
              id: d.id,
              decision: d.decision,
              timestamp: d.timestamp,
              context: d.context,
              source: d.source,
            })),
            error: intelligence?.error || recording.errorMessage || null,
          };
        } catch (error) {
          return {
            recordingId: recording.recordingId,
            meetnoteMeetingId,
            meetnoteStatus: recording.meetnoteStatus || 'uploaded',
            transcript: [],
            intelligence: null,
            actionItems: [],
            decisions: [],
            error: error instanceof Error ? error.message : 'Unknown MeetNote fetch error',
          };
        }
      }),
    );

    return {
      success: true,
      data: {
        meetingId,
        insights,
      },
    };
  }

  private getFfmpegExecutable() {
    const configured =
      this.configService.get<string>('FFMPEG_PATH') ||
      this.configService.get<string>('MEETNOTE_FFMPEG_PATH') ||
      'ffmpeg';

    if (!configured || configured.trim() === '') {
      return null;
    }

    const candidate = configured.trim();
    if (candidate.includes('"') || candidate.includes("'")) {
      return candidate.replace(/^['"]|['"]$/g, '');
    }

    if (path.isAbsolute(candidate) || candidate.includes(path.sep) || candidate.includes('/')) {
      return fs.existsSync(candidate) ? candidate : null;
    }

    return candidate;
  }

  private async isWebmFile(filePath: string): Promise<boolean> {
    try {
      const buffer = fs.readFileSync(filePath).subarray(0, 4);
      return buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
    } catch {
      return false;
    }
  }

  async convertRecordingToWebm(inputPath: string): Promise<string> {
    const resolvedInputPath = inputPath.trim();
    if (!resolvedInputPath) {
      throw new Error('Recording input path is empty');
    }

    if (await this.isWebmFile(resolvedInputPath)) {
      return resolvedInputPath;
    }

    const ffmpegPath = this.getFfmpegExecutable();
    if (!ffmpegPath) {
      throw new Error(
        'FFmpeg is not installed or configured. Install FFmpeg and set FFMPEG_PATH or MEETNOTE_FFMPEG_PATH to the executable path.',
      );
    }

    const outputPath = path.join(
      path.dirname(resolvedInputPath),
      `${path.basename(resolvedInputPath, path.extname(resolvedInputPath))}-${Date.now()}.webm`,
    );

    try {
      const { execFile } = await import('child_process');
      const { promisify } = await import('util');
      const execFileAsync = promisify(execFile);

      await execFileAsync(ffmpegPath, [
        '-y',
        '-i',
        resolvedInputPath,
        '-c:v',
        'libvpx-vp9',
        '-crf',
        '30',
        '-b:v',
        '0',
        '-c:a',
        'libopus',
        outputPath,
      ]);

      if (!(await this.isWebmFile(outputPath))) {
        throw new Error(`Conversion output is not a valid WebM file: ${outputPath}`);
      }

      return outputPath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`FFmpeg conversion failed for ${resolvedInputPath}: ${message}`);
    }
  }

  /**
   * Build a MeetNote-compatible meeting_code from a Loop meeting id or room
   * name. MeetNote requires ^[a-z0-9]+(?:-[a-z0-9]+)*$ and max 64 chars.
   * UUIDs contain uppercase and are invalid, so we slugify and truncate.
   */
  private buildMeetingCode(recording: MeetingRecordingEntity): string {
    const source =
      recording.roomName ||
      recording.meetingId ||
      'loop-meeting';
    // Lowercase, replace non-alphanumeric runs with single dashes, trim edges.
    const slug = String(source)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'loop-meeting';
    return slug.slice(0, 64);
  }

  async submitRecording(recording: MeetingRecordingEntity) {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) {
      return { skipped: true, reason: 'MEETNOTE_BASE_URL not configured' };
    }

    // Idempotency: if this recording was already uploaded to MeetNote, do not
    // submit again. Reuse the existing meetnoteMeetingId.
    if (recording.meetnoteMeetingId) {
      return {
        skipped: true,
        reason: 'Already uploaded to MeetNote',
        meetnoteMeetingId: recording.meetnoteMeetingId,
        meetnoteStatus: recording.meetnoteStatus,
      };
    }

    const resolvedPath = this.resolveHostFilePath(recording.filePath);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return {
        skipped: true,
        reason: `Recording file still missing: ${recording.filePath || '<unknown>'}`,
      };
    }

    const meeting = recording.meetingId
      ? await this.meetingRepo.findOne({ where: { meetingId: recording.meetingId } })
      : await this.meetingRepo.findOne({ where: { roomName: recording.roomName ?? undefined } });

    const meetingCode = this.buildMeetingCode(recording);
    let uploadPath = resolvedPath;
    let cleanupPath: string | null = null;

    try {
      uploadPath = await this.convertRecordingToWebm(resolvedPath);
      if (uploadPath !== resolvedPath) {
        cleanupPath = uploadPath;
      }

      const fileBuffer = fs.readFileSync(uploadPath);
      const body = new FormData();
      body.append('meeting_code', meetingCode);
      body.append('duration_seconds', String(Math.max(recording.durationSeconds || 0, 1)));
      body.append('file', new Blob([fileBuffer], { type: 'video/webm' }), path.basename(uploadPath));

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${baseUrl}${MEETNOTE_UPLOAD_PATH}`, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MeetNote upload failed (${response.status}): ${errorText}`);
      }

      const payload = await response.json();
      const meetnoteMeetingId = String(
        payload.meeting_id ?? payload.data?.meeting_id ?? payload.id ?? payload.meetingId ?? '',
      );

      await this.recordingRepo.update(
        { recordingId: recording.recordingId },
        {
          meetnoteMeetingId: meetnoteMeetingId || null,
          meetnoteStatus: 'uploaded',
          status: 'uploaded',
          errorMessage: null,
        },
      );

      return {
        success: true,
        data: payload,
        meetnoteMeetingId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.recordingRepo.update(
        { recordingId: recording.recordingId },
        {
          meetnoteStatus: 'failed',
          status: 'failed',
          errorMessage: message,
        },
      );
      throw new Error(message);
    } finally {
      if (cleanupPath && fs.existsSync(cleanupPath)) {
        fs.unlinkSync(cleanupPath);
      }
    }
  }

  /**
   * Check MeetNote transcription status for a meeting.
   * Returns { status, language, segment_count, error } or null if not found.
   */
  async getTranscriptionStatus(meetnoteMeetingId: string | number) {
    return this.getJson<{
      meeting_id: number;
      status: string | null;
      language: string | null;
      segment_count: number;
      error: string | null;
    }>(`/meetings/${meetnoteMeetingId}/transcription`);
  }

  /**
   * Retry a failed MeetNote transcription. Returns the status snapshot.
   * Do not call when status is already pending or processing.
   */
  async retryTranscription(meetnoteMeetingId: string | number) {
    return this.postJson<{
      meeting_id: number;
      status: string | null;
      language: string | null;
      segment_count: number;
      error: string | null;
    }>(`/meetings/${meetnoteMeetingId}/transcription/retry`);
  }

  /**
   * Poll MeetNote transcription status until it reaches a terminal state
   * (completed or failed), or the attempt budget is exhausted.
   *
   * onStatusChange is invoked with each snapshot so callers can persist
   * progress to Loop DB between polls.
   */
  async pollUntilTranscriptionComplete(
    meetnoteMeetingId: string | number,
    options: {
      intervalMs?: number;
      maxAttempts?: number;
      onStatusChange?: (snapshot: {
        status: string | null;
        language: string | null;
        segment_count: number;
        error: string | null;
      }) => void;
    } = {},
  ): Promise<{
    status: string | null;
    language: string | null;
    segment_count: number;
    error: string | null;
  }> {
    const intervalMs = options.intervalMs ?? Number(this.configService.get<string>('MEETNOTE_POLL_INTERVAL_MS') || 5000);
    const maxAttempts = options.maxAttempts ?? Number(this.configService.get<string>('MEETNOTE_MAX_POLL_ATTEMPTS') || 120);

    let lastSnapshot: {
      status: string | null;
      language: string | null;
      segment_count: number;
      error: string | null;
    } = { status: null, language: null, segment_count: 0, error: null };

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const snapshot = await this.getTranscriptionStatus(meetnoteMeetingId);
        if (snapshot) {
          lastSnapshot = {
            status: snapshot.status ?? null,
            language: snapshot.language ?? null,
            segment_count: snapshot.segment_count ?? 0,
            error: snapshot.error ?? null,
          };
          options.onStatusChange?.(lastSnapshot);
        }

        const status = lastSnapshot.status;
        if (status === 'completed' || status === 'failed') {
          return lastSnapshot;
        }
      } catch (error) {
        // A transient poll failure should not abort the whole recording; log
        // and keep polling within the attempt budget.
        const message = error instanceof Error ? error.message : String(error);
        this.logDebug(
          `Transcription poll attempt ${attempt}/${maxAttempts} failed for meetnoteMeetingId="${meetnoteMeetingId}": ${message}`,
        );
      }

      if (attempt < maxAttempts) {
        await this.sleep(intervalMs);
      }
    }

    return lastSnapshot;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logDebug(message: string): void {
    // Keep logging minimal; the NestJS logger is not available in this
    // service's constructor signature. Use console for debug traces.
    // eslint-disable-next-line no-console
    console.log(`[MeetNoteIntegrationService] ${message}`);
  }

  /**
   * Persist MeetNote results (transcript, intelligence, decisions, action
   * items) into Loop's own tables for a recording, keyed by recordingId.
   * Idempotent: replaces previously generated rows so re-syncs do not
   * duplicate data.
   */
  async persistMeetNoteResults(
    recordingId: string,
    meetnoteMeetingId: string | number,
  ): Promise<void> {
    const id = String(meetnoteMeetingId);

    const [
      transcript,
      intelligence,
      actionItems,
      decisions,
    ] = await Promise.all([
      this.getJson<Array<{
        id: number;
        meeting_id: number;
        speaker: string;
        start_time: number;
        end_time: number;
        text: string;
        source: string;
      }>>(`/meetings/${id}/transcript`),
      this.getJson<{
        meeting_id: number;
        status: string | null;
        error: string | null;
        method: string;
        summary: string | null;
        summary_source: string | null;
        key_points: Array<{ text: string; timestamp: number | null }>;
      }>(`/meetings/${id}/intelligence`),
      this.getJson<Array<{
        id: number;
        meeting_id: number;
        task: string;
        assignee: string | null;
        due_date: string | null;
        status: string;
        timestamp: number | null;
        source: string;
      }>>(`/meetings/${id}/action-items`),
      this.getJson<Array<{
        id: number;
        meeting_id: number;
        decision: string;
        timestamp: number;
        context: string | null;
        source: string;
      }>>(`/meetings/${id}/decisions`),
    ]);

    // --- Transcript segments ---
    if (transcript && transcript.length > 0) {
      await this.transcriptRepo.delete({ recordingId });
      const segments = transcript.map((t) =>
        this.transcriptRepo.create({
          recordingId,
          speaker: t.speaker || 'Unknown',
          startTime: t.start_time,
          endTime: t.end_time,
          text: t.text,
          source: t.source || 'ai',
        }),
      );
      await this.transcriptRepo.save(segments);
    }

    const transcriptStatus = transcript ? 'completed' : 'failed';

    // --- Intelligence (summary + key points) ---
    if (intelligence) {
      await this.recordingRepo.update({ recordingId }, {
        summary: intelligence.summary ?? null,
        keyPoints: intelligence.key_points ?? null,
        openQuestions: null, // MeetNote does not expose open questions
        intelligenceStatus: intelligence.status === 'failed' ? 'failed' : 'completed',
        intelligenceError: intelligence.error ?? null,
      });
    }

    // --- Action items ---
    if (actionItems && actionItems.length > 0) {
      await this.actionItemRepo.delete({ recordingId });
      const items = actionItems.map((item) =>
        this.actionItemRepo.create({
          recordingId,
          task: item.task,
          assignee: item.assignee,
          dueDate: item.due_date ? new Date(item.due_date) : null,
          status: item.status,
          timestamp: item.timestamp ?? null,
          source: item.source,
        }),
      );
      await this.actionItemRepo.save(items);
    }

    // --- Decisions ---
    if (decisions && decisions.length > 0) {
      await this.decisionRepo.delete({ recordingId });
      const decs = decisions.map((d) =>
        this.decisionRepo.create({
          recordingId,
          decision: d.decision,
          timestamp: d.timestamp,
          context: d.context || null,
          source: d.source,
        }),
      );
      await this.decisionRepo.save(decs);
    }

    await this.recordingRepo.update({ recordingId }, {
      transcriptStatus,
      transcriptError: transcript ? null : 'No transcript available from MeetNote',
    });
  }
}
