# Loop-to-MeetNote Integration Implementation Plan

## Files to modify:

### 1. backend/.env — Add MeetNote integration env vars
- MEETNOTE_BASE_URL=http://localhost:8000
- MEETNOTE_SERVICE_EMAIL=...
- MEETNOTE_SERVICE_PASSWORD=...
- (Optional) MEETNOTE_SERVICE_TOKEN=...
- MEETNOTE_POLL_INTERVAL_MS=5000
- MEETNOTE_MAX_POLL_ATTEMPTS=120
- Keep FFMPEG_PATH

### 2. backend/.env.example — Document env vars (no secrets)

### 3. backend/src/meeting/service/meetnote-integration.service.ts
- Add bearer token cache (login-on-demand, cache until expiry, retry on 401)
- Fix meeting_code slugification (lowercase alphanumeric + dashes, max 64)
- Idempotency: skip upload if meetnoteMeetingId already set
- Add polling methods: pollTranscriptionStatus, getTranscript, getIntelligence, getDecisions, getActionItems, retryTranscription
- Add persistMeetNoteResults() to write results to Loop DB

### 4. backend/src/meeting/service/recording-processing.service.ts
- Remove execFile Python subprocess (process_recording.py, LOOP_PYTHON_*, MEETNOTE_BACKEND_PATH)
- Repurpose processRecording() to delegate to MeetNote upload + set statuses

### 5. backend/src/video/service/video.service.ts
- handleCompletedEgress(): call meetNoteIntegrationService.submitRecording() instead of recordingProcessingService.processRecording()
- Kick off background poll loop after successful upload

### 6. backend/src/meeting/service/meeting.service.ts
- getMeetingInsights(): delegate to MeetNoteIntegrationService.getMeetingInsights()

### 7. backend/src/meeting/meeting.module.ts
- Verify MeetNoteIntegrationService is exported (already is)

### 8. backend/src/meeting/meeting.controller.ts
- No changes needed (GET /meeting/:id/insights route exists)

### 9. frontend/src/pages/MeetingRecapPage.jsx
- Show processing status from MeetNote

### 10. frontend/src/pages/RecordingsLibraryPage.jsx
- Already shows status; verify alignment

### 11. backend/python/process_recording.py
- Leave the file in place (do not delete MeetNote reference code)
- Remove Python invocation from Loop code

### 12. Tests
- Update video.service.spec.ts (remove Python processRecording expectations, add MeetNote upload)
- Update meeting.service.spec.ts (use MeetNote APIs)
- Add meetnote-integration.service.spec.ts tests (already exists - extend)
- Add recording-processing.service.spec.ts tests
