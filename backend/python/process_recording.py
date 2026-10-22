#!/usr/bin/env python3
"""Loop-native recording processing entry point.

Reuses MeetNote's existing Python processing services (faster-whisper
transcription, optional sherpa-onnx diarization, Gemini/rule-based
intelligence) to process a Loop recording file and emit structured JSON
results for the NestJS backend to persist.

The entry point accepts a recording UUID and a validated local file path.
It does NOT connect to Loop's database; NestJS persists the structured
results through the existing TypeORM/MySQL configuration.
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Make MeetNote's app package importable so we can reuse its existing
# processing services without copying the FastAPI application.
MEETNOTE_BACKEND = os.environ.get(
    "MEETNOTE_BACKEND_PATH",
    r"D:\Loop_integration\MeetNote\backend",
)
if MEETNOTE_BACKEND not in sys.path:
    sys.path.insert(0, MEETNOTE_BACKEND)

from app.services.transcription_service import (  # noqa: E402
    EmptyTranscription,
    TranscriptionError,
    transcribe_recording,
)
from app.services.meeting_extraction import (  # noqa: E402
    TranscriptLine,
    extract_meeting_intelligence,
)
from app.services.gemini_service import (  # noqa: E402
    generate_meeting_intelligence,
)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Process a Loop recording file.")
    parser.add_argument(
        "--recording-id",
        required=True,
        help="Loop recording UUID",
    )
    parser.add_argument(
        "--file-path",
        required=True,
        help="Local path to the recording file",
    )
    return parser


def main() -> int:
    parser = _build_parser()
    args = parser.parse_args()

    recording_id = args.recording_id
    file_path = Path(args.file_path)

    # Validate that the file exists before processing.
    if not file_path.is_file():
        result = {
            "recordingId": recording_id,
            "transcript": [],
            "language": None,
            "intelligence": None,
            "action_items": [],
            "decisions": [],
            "error": "Recording file not found",
            "method": "none",
        }
        print(json.dumps(result))
        return 0

    # --- Transcription (MeetNote faster-whisper pipeline) ---------------
    try:
        transcription_result = transcribe_recording(file_path)
    except EmptyTranscription:
        result = {
            "recordingId": recording_id,
            "transcript": [],
            "language": None,
            "intelligence": None,
            "action_items": [],
            "decisions": [],
            "error": "No speech was detected",
            "method": "none",
        }
        print(json.dumps(result))
        return 0
    except TranscriptionError as exc:
        result = {
            "recordingId": recording_id,
            "error": f"Transcription failed: {exc}",
        }
        print(json.dumps(result), file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001 - report unexpected failures as JSON
        result = {
            "recordingId": recording_id,
            "error": f"Transcription failed: {exc}",
        }
        print(json.dumps(result), file=sys.stderr)
        return 1

    transcript = [
        {
            "speaker": cue.speaker or "Unknown",
            "start_time": cue.start,
            "end_time": cue.end,
            "text": cue.text,
        }
        for cue in transcription_result.segments
    ]

    # --- Intelligence (Gemini with rule-based fallback) ----------------
    lines = [
        TranscriptLine(text=cue.text, start=cue.start, speaker=cue.speaker)
        for cue in transcription_result.segments
    ]

    intelligence = None
    open_questions = []
    method = "none"
    intel_result = None

    try:
        intel_result, open_questions = generate_meeting_intelligence(lines, None)
        method = "gemini"
    except Exception:
        try:
            intel_result = extract_meeting_intelligence(lines, None)
            open_questions = []
            method = "rule-based"
        except Exception as exc:
            result = {
                "recordingId": recording_id,
                "transcript": transcript,
                "language": transcription_result.language,
                "error": f"Intelligence generation failed: {exc}",
                "method": "none",
            }
            print(json.dumps(result), file=sys.stderr)
            return 1

    if intel_result is not None:
        intelligence = {
            "summary": intel_result.summary,
            "key_points": [
                {"text": kp.text, "timestamp": kp.timestamp}
                for kp in intel_result.key_points
            ],
            "open_questions": open_questions,
        }

    result = {
        "recordingId": recording_id,
        "transcript": transcript,
        "language": transcription_result.language,
        "intelligence": intelligence,
        "action_items": [
            {
                "task": item.task,
                "assignee": item.assignee,
                "due_date": item.due_date.isoformat() if item.due_date else None,
                "timestamp": item.timestamp,
            }
            for item in intel_result.action_items
        ],
        "decisions": [
            {
                "decision": item.decision,
                "timestamp": item.timestamp,
                "context": item.context,
            }
            for item in intel_result.decisions
        ],
        "method": method,
    }
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
