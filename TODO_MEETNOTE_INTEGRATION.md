# TODO: Loop → MeetNote API Integration (PLAN ONLY)

**Status:** Planning document. Nothing in this list has been implemented.
**Scope:** Replace Loop's native Python transcription pipeline with the MeetNote API (upload → async transcription → insights), persisting results back into Loop's DB.
**No implementation** — use this as the task breakdown for the implementation session.

---

## Repo roots (for all paths below)

- Loop backend: `vba_connect_standalone_community-software/backend/src`
- Loop frontend: `vba_connect_standalone_community-software/frontend/src`
- MeetNote reference API (FastAPI): `MeetNote/backend/app`

---

## 0. Ground truth from investigation (do not re-derive)

Existing Loop pieces already present:
- `MeetNoteIntegrationService` — auth (login + static token), `/recordings/upload`, FFmpeg mp4→webm conversion, `getMeetingInsights()` fetching transcript/intelligence/action-items/decisions from MeetNote APIs.
- `VideoService` — LiveKit Egress lifecycle; `finalizeRecording()` polls egress to COMPLETE then calls `handleCompletedEgress()` → `RecordingProcessingService.processRecording()` (Python subprocess).
- `RecordingProcessingService` — invokes `python process_recording.py` via `execFile`, persists transcript/action-items/decisions to Loop DB.
- `MeetingService.getMeetingInsights()` — reads transcript/action-items/decisions from Loop DB tables.
- `MeetingRecordingEntity` — already has `meetnoteMeetingId`, `meetnoteStatus`, `transcriptStatus`, `intelligenceStatus`, `processingStatus`, `transcriptError`, `intelligenceError`, `errorMessage`, `summary`, `keyPoints`, `openQuestions`.
- FFmpeg installed at configured `FFMPEG_PATH`.

MeetNote API facts (from `MeetNote/backend/app`):
- `POST /auth/login` → `{ access_token, token_type }` (JWT; `Authorization: Bearer <token>`).
- `POST /recordings/upload` (multipart: `file` WebM, `meeting_code`, `duration_seconds`) → `{ meeting_id, meeting_code, filename, duration_seconds, status: "uploaded" }`. `meeting_code` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 64 chars. Only `video/webm`/`audio/webm` accepted. 100 MB limit.
- `GET /meetings/{id}` → meeting record (schema lacks `transcription_status`, so poll the sub-endpoints instead).
- `GET /meetings/{id}/transcript` → segments `[]` until saved.
- `GET /meetings/{id}/intelligence` → `{ status: pending|processing|completed|failed, summary, key_points, open_questions, ... }`.
- Transcription is async/in-process in MeetNote (one job at a time); Loop must poll until terminal status.

---

## A. Environment variables

Files: `backend/.env`, `backend/.env.example`

- [ ] Add `MEETNOTE_BASE_URL` (default `http://localhost:8000`) — already read by `getBaseUrl()` but not documented in env files.
- [ ] Add `MEETNOTE_SERVICE_EMAIL` / `MEETNOTE_SERVICE_PASSWORD` — service-account credentials used by `getAuthHeaders()` login path.
- [ ] Add `MEETNOTE_SERVICE_TOKEN` (optional) — static bearer token; when set, login is skipped and token is reused directly.
- [ ] Add `MEETNOTE_POLL_INTERVAL_MS` (default `5000`) and `MEETNOTE_MAX_POLL_ATTEMPTS` (default `36` → ~3 min) — for background transcription polling.
- [ ] Keep `FFMPEG_PATH` (already present in `.env`; still needed for mp4→webm conversion before upload).
- [ ] Remove (after Python removal): `LOOP_PYTHON_EXECUTABLE`, `LOOP_PYTHON_SCRIPT_PATH`, and the `MEETNOTE_BACKEND_PATH` injection in `runPythonProcess`.

Frontend `.env`: no changes required (`VITE_API_URL=http://localhost:3000` already proxies to backend).

---

## B. Backend — `meetnote-integration.service.ts`

File: `backend/src/meeting/service/meetnote-integration.service.ts`

- [ ] **Token caching.** Add an in-memory cache `{ accessToken, expiresAt }` (or a simple timestamp). `getAuthHeaders()`:
  1. If `MEETNOTE_SERVICE_TOKEN` is configured, use it directly (no login).
  2. If cached token exists and is not near expiry, reuse it.
  3. Otherwise `POST /auth/login` with service credentials, cache the token with an expiry (subtract a skew margin, e.g. 60s).
  4. On 401 from any MeetNote call, clear cache and retry once (covers token rotation/expiry).
- [ ] **Fix `meeting_code` format.** In `submitRecording()`, replace
  `meetingCode = (meeting?.meetingId || recording.roomName || 'loop-meeting').replace(/\s+/g, '-')`
  with a slugifier that lowercases, collapses whitespace/runs of non-alphanumerics to single hyphens, trims leading/trailing hyphens, enforces `^[a-z0-9]+(?:-[a-z0-9]+)*$`, caps at 64 chars, and falls back to `loop-meeting` (valid slug) when empty/invalid. UUIDs (`randomUUID()` from meeting creation) must never be sent as `meeting_code`.
- [ ] **Idempotency check before upload.** At the top of `submitRecording()`, if `recording.meetnoteMeetingId` is set AND `recording.meetnoteStatus === 'uploaded'`, return `{ skipped: true, reason: 'already uploaded to MeetNote', meetnoteMeetingId }` without re-uploading or re-converting.
- [ ] **Add meeting status polling helpers.**
  - `getMeetingStatus(meetnoteMeetingId)` → `GET /meetings/{id}/intelligence` (returns `status`) and/or `GET /meetings/{id}/transcript`. Returns `{ transcriptionStatus, intelligenceStatus, error }`.
  - `pollUntilComplete(meetnoteMeetingId, onProgress, intervalMs, maxAttempts)` → loops until status is `completed` or `failed`, invoking `onProgress(status)` each iteration; throws/returns final status on timeout.
- [ ] **Persist MeetNote results to Loop DB.** Add `persistMeetNoteResults(recordingId, insights)`:
  - Upsert `MeetingRecordingEntity`: `transcriptStatus`, `intelligenceStatus`, `processingStatus`, `summary`, `keyPoints`, `openQuestions`, `transcriptError`, `intelligenceError`, `errorMessage`.
  - Replace transcript segments in `TranscriptSegmentEntity` (delete + insert, idempotent).
  - Replace action items in `ActionItemEntity` and decisions in `DecisionEntity` (delete + insert with `originKey`, idempotent — matches existing Python-service pattern).
- [ ] Keep FFmpeg conversion (`convertRecordingToWebm`, `getFfmpegExecutable`, `resolveHostFilePath`, `isAllowedRecordingPath`) intact — still needed before upload.

---

## C. Backend — `recording-processing.service.ts`

File: `backend/src/meeting/service/recording-processing.service.ts`

- [ ] **Remove Python subprocess integration.** Delete `runPythonProcess()`, `getPythonExecutable()`, `getPythonScriptPath()`, `isPathAllowed()` (path validation moves to `MeetNoteIntegrationService`), `markFailed()`, `ProcessingResult` interface, `execFile`/`promisify` imports.
- [ ] **Repurpose `processRecording(recordingId, filePath)`:**
  1. In-process guard + `processingStatus === 'completed'` skip (keep existing idempotency).
  2. Resolve/validate `filePath` via `meetNoteIntegrationService.resolveHostFilePath()` + `isAllowedRecordingPath()` (move check into meetnote service or keep a thin wrapper).
  3. Call `meetNoteIntegrationService.submitRecording(record)` (handles conversion, upload, idempotency, DB status update to `meetnoteStatus: 'uploaded'`).
  4. Set `transcriptStatus: 'processing'`, `intelligenceStatus: 'processing'`, `processingStatus: 'processing'` (or `'uploaded'` — decide on naming; keep `processing` to drive the polling loop).
  5. Return; the polling loop (in VideoService or a dedicated service) owns status progression to `completed`/`failed`.
- [ ] Alternative (to decide in implementation): delete `RecordingProcessingService` entirely and have `VideoService` call `MeetNoteIntegrationService` directly; update `video.module.ts` / `meeting.module.ts` accordingly.

---

## D. Backend — `video.service.ts`

File: `backend/src/video/service/video.service.ts`

- [ ] **`handleCompletedEgress()` — wire MeetNote upload into Egress finalization.** Replace
  `await this.recordingProcessingService.processRecording(updated.recordingId, resolvedPath);`
  with:
  1. Fetch the recording record (`findByEgressId`).
  2. Idempotency: if `processingStatus === 'completed'` (already done), skip (existing guard).
  3. Call `meetNoteIntegrationService.submitRecording(record)` → MeetNote upload.
  4. Persist `meetnoteMeetingId` / `meetnoteStatus: 'uploaded'` (already done inside `submitRecording`).
  5. Start background polling: `void this.pollMeetNoteProcessing(egressId, recordingId, meetnoteMeetingId)` (fire-and-forget, guarded by a per-egress/per-recording in-progress `Set` like `finalizationInProgress`).
- [ ] **Add `pollMeetNoteProcessing()`** (or equivalent):
  - Loop (interval from `MEETNOTE_POLL_INTERVAL_MS`, max attempts from `MEETNOTE_MAX_POLL_ATTEMPTS`) calling `meetNoteIntegrationService.getMeetingStatus(meetnoteMeetingId)`.
  - On `completed`: fetch full insights (`GET /meetings/{id}/transcript`, `/intelligence`, `/action-items`, `/decisions` — reuse existing `getJson` calls), call `persistMeetNoteResults(recordingId, insights)`, set `processingStatus: 'completed'`, clear errors.
  - On `failed`: set `processingStatus: 'failed'`, `transcriptStatus`/`intelligenceStatus: 'failed'`, store `errorMessage`.
  - On timeout: set `processingStatus: 'failed'` with timeout error message.
  - Log each poll attempt (mirror existing `finalizeRecording` logging style).
- [ ] Keep `finalizeRecording` idempotency guard (`finalizationInProgress`) and terminal FAILED/ABORTED/LIMIT_REACHED handling unchanged.

---

## E. Backend — `meeting.service.ts`

File: `backend/src/meeting/service/meeting.service.ts`

- [ ] **`getMeetingInsights(meetingId)` should use MeetNote APIs.** Replace the Loop-DB read path (transcriptRepo/actionItemRepo/decisionRepo + recording summary fields) with delegation to `meetNoteIntegrationService.getMeetingInsights(meetingId)` (already implemented in the MeetNote service and returns the same shape). Keep fallback behavior for recordings with `meetnoteMeetingId === null` (return empty insight shape, error `null`). Keep `NotFoundException` for missing meeting.

---

## F. Backend — `meeting-recording.service.ts` (minor)

File: `backend/src/meeting/service/meeting-recording.service.ts`

- [ ] Verify `updateProcessingStatus(egressId, patch)` accepts `Partial<MeetingRecordingEntity>` so it can persist `meetnoteStatus`, `transcriptStatus`, `intelligenceStatus`, `processingStatus`, `errorMessage` set by the polling loop. No change expected; confirm and add a dedicated `updateMeetnoteProgress` helper only if needed for clarity.

---

## G. Backend — `meeting-recording.entity.ts` (verify)

File: `backend/src/meeting/entities/meeting-recording.entity.ts`

- [ ] Confirm all needed columns already exist: `meetnoteMeetingId`, `meetnoteStatus`, `transcriptStatus`, `intelligenceStatus`, `processingStatus`, `transcriptError`, `intelligenceError`, `errorMessage`, `summary`, `keyPoints`, `openQuestions`. Add `meetnoteSyncedAt` (`@UpdateDateColumn` reuse or new column) only if the implementation wants a last-synced timestamp — optional, mark as out of scope unless required.

---

## H. Backend — controllers & module wiring

Files: `backend/src/video/controller/video.controller.ts`, `backend/src/meeting/controller/meeting.controller.ts`, `backend/src/video/video.module.ts`, `backend/src/meeting/meeting.module.ts`

- [ ] Verify `GET /meeting/:meetingId/insights` (already wired to `MeetingService.getMeetingInsights`) — no route change needed after delegation to MeetNote service.
- [ ] Verify `VideoModule`/`MeetingModule` providers/exports still satisfy dependencies after `RecordingProcessingService` refactor (it remains a provider, just without Python). Add `MeetNoteIntegrationService` to exports where missing (already exported in `MeetingModule`; `VideoModule` lists it as provider).
- [ ] (Optional) Add a manual retry endpoint `POST /video/recording/:recordingId/meetnote/retry` — defer to follow-up.

---

## I. Tests to update

Files: `*.spec.ts` under `backend/src`

- [ ] `meetnote-integration.service.spec.ts` — add/extend cases for: token caching (login called once, reused), static `MEETNOTE_SERVICE_TOKEN` path, 401 retry, `meeting_code` slug validation (UUID rejected, spaces → hyphens, length cap), idempotency skip when `meetnoteStatus === 'uploaded'`.
- [ ] `video.service.spec.ts` — replace `recordingProcessingService.processRecording` mocks with `meetNoteIntegrationService.submitRecording` + polling mocks; `handleCompletedEgress` tests must assert MeetNote upload is invoked and polling is kicked off; remove/rewrite Python subprocess path tests.
- [ ] `recording-processing.service.spec.ts` (if exists) — remove Python subprocess tests; add tests for `processRecording` → `submitRecording` delegation and status transitions.
- [ ] `meeting.service.spec.ts` — `getMeetingInsights` tests should assert delegation to `meetNoteIntegrationService.getMeetingInsights`, not Loop DB reads.
- [ ] Update any spec that constructs `RecordingProcessingService` with removed constructor args.

---

## J. Frontend

Files under `frontend/src`

- [ ] `services/meetingApi.js` — no change required (`getMeetingInsights` already hits `/meeting/:id/insights`).
- [ ] `pages/RecordingsLibraryPage.jsx` — status badges already treat `processing`, `uploading`, `in_progress` as "processing". Confirm `meetnoteStatus: 'uploaded'` with `processingStatus: 'processing'` shows correctly; consider adding a distinct "Uploading to MeetNote" label when `meetnoteStatus === 'uploading'` (only if backend emits that status).
- [ ] `pages/MeetingRecapPage.jsx` — while insights are processing (`processingStatus` not `completed` or `meetnoteStatus` not complete), show "Transcript is being processed…" instead of empty-state text; the page already re-fetches insights on load, so polling can be added here (interval refetch until completed) — optional enhancement.
- [ ] No new API endpoints required from the frontend side.

---

## K. Remove Python subprocess integration (cleanup)

- [ ] Delete `backend/python/process_recording.py` (or move to an archive folder) once `RecordingProcessingService` no longer calls it.
- [ ] Remove `LOOP_PYTHON_EXECUTABLE`, `LOOP_PYTHON_SCRIPT_PATH` from `backend/.env` and `.env.example`.
- [ ] Remove `MEETNOTE_BACKEND_PATH` env injection (was only used by the Python subprocess).
- [ ] Verify nothing else imports `recording-processing.service.ts`'s removed members (`getPythonScriptPath`, `runPythonProcess`, etc.).

---

## Suggested implementation order

1. Env vars (A) + token caching + `meeting_code` slug fix + idempotency in `meetnote-integration.service.ts` (B-1..B-3).
2. `pollUntilComplete` + `persistMeetNoteResults` in `meetnote-integration.service.ts` (B-4..B-5).
3. `recording-processing.service.ts` Python removal + `processRecording` delegation (C).
4. `video.service.ts` MeetNote upload wiring + polling loop (D).
5. `meeting.service.ts` delegation (E).
6. Verify F/G/H (no-op or minor).
7. Update specs (I).
8. Frontend status UI (J).
9. Python cleanup (K).

---

## Definition of done (verification checklist)

- [ ] Egress COMPLETE → recording uploaded to MeetNote (`meetnoteMeetingId` set, `meetnoteStatus: 'uploaded'`).
- [ ] Duplicate Egress completion / re-upload is skipped (idempotency).
- [ ] Background polling transitions `processingStatus` → `completed` when MeetNote transcription + intelligence finish, or → `failed` on MeetNote failure/timeout.
- [ ] Transcript segments, action items, decisions, summary/key_points persisted to Loop DB tables.
- [ ] `GET /meeting/:id/insights` returns MeetNote-sourced data.
- [ ] No `execFile`/`python`/`process_recording.py` references remain in Loop backend.
- [ ] Existing specs pass with updated mocks; new specs cover token caching, slug validation, idempotency.
- [ ] Env vars documented in `.env.example`.
