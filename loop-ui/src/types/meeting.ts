/**
 * Shared API / WebSocket-facing types for meeting UI components.
 * Backend engineers: feed these shapes into the UI kit.
 */

export type ConnectionQuality = "excellent" | "good" | "poor" | "lost";

export type ConnectivityState =
  | "online"
  | "offline"
  | "reconnecting"
  | "degraded-bandwidth"
  | "permission-denied";

export type ComponentUiState =
  | "default"
  | "hover"
  | "focus-visible"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "empty";

export interface MeetingParticipant {
  participantId: string;
  displayName: string;
  avatarUrl?: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeaking: boolean;
  isPinned: boolean;
  isScreenSharing: boolean;
  isLocal?: boolean;
  connectionQuality: ConnectionQuality;
  /** Media stream URL or object URL for <video src> when not using attachTrack */
  streamUrl?: string | null;
  /** Optional LiveKit/WebRTC MediaStream for imperative attach */
  mediaStream?: MediaStream | null;
}

export interface ChatMessage {
  messageId: string;
  participantId: string;
  displayName: string;
  body: string;
  sentAt: string; // ISO-8601
  isLocal?: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: "audioinput" | "videoinput" | "audiooutput";
}

export interface CaptionLine {
  captionId: string;
  participantId: string;
  displayName: string;
  text: string;
  isFinal: boolean;
}
