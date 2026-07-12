import { useState } from "react";
import { PreCallDeviceCheck } from "../components/meeting/PreCallDeviceCheck/PreCallDeviceCheck";
import { VideoTile } from "../components/meeting/VideoTile/VideoTile";
import { ControlBar, type ControlBarAction } from "../components/meeting/ControlBar/ControlBar";
import { ParticipantList } from "../components/meeting/ParticipantList/ParticipantList";
import { ScreenShareBanner } from "../components/meeting/ScreenShareBanner/ScreenShareBanner";
import { useIntegratedMeeting } from "./useIntegratedMeeting";

/**
 * Backend-wired meeting experience.
 * Uses only Nest video APIs + LiveKit:
 * PreCallDeviceCheck → create-room + generate-token → VideoTile grid + ControlBar
 * (+ ParticipantList, ScreenShareBanner, ConnectionQualityBadge via tiles).
 */
export function IntegratedMeetingApp() {
  const meeting = useIntegratedMeeting();
  const [roomInput, setRoomInput] = useState("meeting-001");
  const [peopleOpen, setPeopleOpen] = useState(false);

  const onAction = async (action: ControlBarAction) => {
    if (action === "mute") await meeting.toggleMute();
    if (action === "camera") await meeting.toggleCamera();
    if (action === "share") await meeting.toggleShare();
    if (action === "participants") setPeopleOpen((v) => !v);
    if (action === "leave") await meeting.endMeetingForAll();
    // chat / copilot not backed by current Nest API
  };

  if (meeting.phase === "precall" || meeting.phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-fv-md bg-background p-fv-margin-desktop font-[family-name:var(--font-sans)]">
        <div className="w-full max-w-lg text-center">
          <p className="mb-fv-xs text-label-md uppercase tracking-wide text-primary">
            LOOP · Integrated video
          </p>
          <p className="mb-fv-md text-body-sm text-on-surface-variant">
            API {meeting.apiBaseUrl} · LiveKit {meeting.livekitUrl}
          </p>
          {meeting.error ? (
            <div
              className="mb-fv-md rounded-xl border border-error/30 bg-error-container px-fv-md py-fv-sm text-body-md text-on-error-container"
              role="alert"
            >
              {meeting.error}
              <button
                type="button"
                className="ml-fv-sm font-semibold underline"
                onClick={meeting.clearError}
              >
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        <PreCallDeviceCheck
          displayName={meeting.displayName || "Guest"}
          onDisplayNameChange={meeting.setDisplayName}
          roomName={roomInput}
          onRoomNameChange={setRoomInput}
          cameras={meeting.devices.cameras.map((d) => ({
            deviceId: d.deviceId,
            label: d.label || d.deviceId,
            kind: "videoinput" as const,
          }))}
          microphones={meeting.devices.mics.map((d) => ({
            deviceId: d.deviceId,
            label: d.label || d.deviceId,
            kind: "audioinput" as const,
          }))}
          selectedCameraId={meeting.selectedCameraId}
          selectedMicId={meeting.selectedMicId}
          isCameraOff={meeting.isCameraOff}
          isMuted={meeting.isMuted}
          previewMediaStream={meeting.previewStream}
          connectivityState={
            meeting.permissionDenied ? "permission-denied" : "online"
          }
          uiState={meeting.phase === "error" ? "error" : "default"}
          onSelectCamera={meeting.setSelectedCameraId}
          onSelectMic={meeting.setSelectedMicId}
          onToggleCamera={() => void meeting.toggleCamera()}
          onToggleMute={() => void meeting.toggleMute()}
          onJoin={() => void meeting.join(meeting.displayName || "Guest", roomInput)}
        />
      </div>
    );
  }

  if (meeting.phase === "connecting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-body-lg text-on-surface-variant">
        Connecting to {meeting.roomName}…
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col bg-surface font-[family-name:var(--font-sans)] text-on-surface">
      <header className="flex items-center justify-between border-b border-outline-variant/30 px-fv-margin-desktop py-fv-md">
        <div>
          <h1 className="text-headline-lg text-on-surface">{meeting.roomName}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {meeting.displayName} · {meeting.participants.length} in call
          </p>
        </div>
      </header>

      {meeting.screenSharer ? (
        <div className="px-fv-margin-desktop pt-fv-md">
          <ScreenShareBanner
            sharerId={meeting.screenSharer.participantId}
            sharerName={meeting.screenSharer.displayName}
            isLocalShare={meeting.screenSharer.isLocal}
            onStopShare={
              meeting.screenSharer.isLocal
                ? () => void meeting.toggleShare()
                : undefined
            }
          />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-fv-md p-fv-margin-desktop pb-32">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-fv-md md:grid-cols-2 lg:grid-cols-3">
          {meeting.participants.map((p) => (
            <VideoTile
              key={p.participantId}
              participantId={p.participantId}
              displayName={p.displayName}
              mediaStream={p.mediaStream}
              isMuted={p.isMuted}
              isCameraOff={p.isCameraOff}
              isSpeaking={p.isSpeaking}
              isPinned={p.isPinned}
              isScreenSharing={p.isScreenSharing}
              connectionQuality={p.connectionQuality}
              onPinToggle={(id, pinned) =>
                meeting.setPinnedId(pinned ? id : null)
              }
              className="min-h-[200px]"
            />
          ))}
        </div>

        {peopleOpen ? (
          <ParticipantList
            participants={meeting.participants}
            className="hidden w-80 shrink-0 md:flex"
            onClose={() => setPeopleOpen(false)}
            onPinParticipant={(id, pinned) =>
              meeting.setPinnedId(pinned ? id : null)
            }
          />
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-fv-md z-40 flex justify-center">
        <div className="pointer-events-auto">
          <ControlBar
            isMuted={meeting.isMuted}
            isCameraOff={meeting.isCameraOff}
            isSharing={meeting.isSharing}
            participantsOpen={peopleOpen}
            overlayMaterial
            disabledActions={["chat", "copilot"]}
            onAction={(a) => void onAction(a)}
          />
        </div>
      </div>
    </div>
  );
}
