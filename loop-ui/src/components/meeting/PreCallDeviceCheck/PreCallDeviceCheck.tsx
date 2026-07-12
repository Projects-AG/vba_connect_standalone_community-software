import { useEffect, useRef } from "react";
import * as Select from "@radix-ui/react-select";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import type {
  ComponentUiState,
  ConnectivityState,
  DeviceInfo,
} from "../../../types/meeting";

export interface PreCallDeviceCheckProps {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers?: DeviceInfo[];
  selectedCameraId?: string;
  selectedMicId?: string;
  selectedSpeakerId?: string;
  isCameraOff: boolean;
  isMuted: boolean;
  previewStreamUrl?: string | null;
  /** Prefer MediaStream from getUserMedia for live preview */
  previewMediaStream?: MediaStream | null;
  connectivityState?: ConnectivityState;
  uiState?: ComponentUiState;
  onSelectCamera: (deviceId: string) => void;
  onSelectMic: (deviceId: string) => void;
  onSelectSpeaker?: (deviceId: string) => void;
  onToggleCamera: () => void;
  onToggleMute: () => void;
  onJoin: () => void;
  onCancel?: () => void;
  className?: string;
  /** Optional room name field for Nest create-room / token */
  roomName?: string;
  onRoomNameChange?: (roomName: string) => void;
}

function DeviceSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value?: string;
  options: DeviceInfo[];
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-fv-xs">
      <label className="text-label-md uppercase text-on-surface-variant">{label}</label>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          className="flex w-full items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-fv-md py-fv-sm text-body-md text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50"
          aria-label={label}
        >
          <Select.Value placeholder={`Select ${label.toLowerCase()}`} />
          <Select.Icon>
            <Icon name="expand_more" size={18} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest shadow-elevation-2">
            <Select.Viewport className="p-fv-xs">
              {options.map((d) => (
                <Select.Item
                  key={d.deviceId}
                  value={d.deviceId}
                  className="cursor-pointer rounded-md px-fv-md py-fv-sm text-body-md text-on-surface outline-none data-[highlighted]:bg-surface-container-low"
                >
                  <Select.ItemText>{d.label || d.deviceId}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function PreCallDeviceCheck({
  displayName,
  onDisplayNameChange,
  cameras,
  microphones,
  speakers = [],
  selectedCameraId,
  selectedMicId,
  selectedSpeakerId,
  isCameraOff,
  isMuted,
  previewStreamUrl,
  previewMediaStream,
  connectivityState = "online",
  uiState = "default",
  onSelectCamera,
  onSelectMic,
  onSelectSpeaker,
  onToggleCamera,
  onToggleMute,
  onJoin,
  onCancel,
  className,
  roomName,
  onRoomNameChange,
}: PreCallDeviceCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const permissionDenied = connectivityState === "permission-denied";
  const disabled = uiState === "disabled" || connectivityState === "offline";
  const loading = uiState === "loading";
  const hasPreview =
    !isCameraOff &&
    !permissionDenied &&
    (Boolean(previewMediaStream) || Boolean(previewStreamUrl));

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (previewMediaStream) {
      el.srcObject = previewMediaStream;
      return () => {
        el.srcObject = null;
      };
    }
    el.srcObject = null;
  }, [previewMediaStream]);

  return (
    <section
      aria-label="Device check before joining"
      data-state={uiState}
      className={cn(
        "w-full max-w-lg rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-fv-lg shadow-elevation-1",
        className,
      )}
    >
      <h1 className="mb-fv-md text-headline-lg text-on-surface">Ready to join?</h1>

      <div className="relative mb-fv-md aspect-video overflow-hidden rounded-xl bg-surface-container-high">
        {hasPreview ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={previewMediaStream ? undefined : previewStreamUrl ?? undefined}
            autoPlay
            muted
            playsInline
            aria-label="Camera preview"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-fv-sm text-on-surface-variant">
            <Icon name={permissionDenied ? "videocam_off" : "person"} size={40} />
            <p className="text-body-md">
              {permissionDenied
                ? "Camera/mic permission denied"
                : isCameraOff
                  ? "Camera is off"
                  : "No preview"}
            </p>
          </div>
        )}
        <div className="absolute bottom-fv-sm left-1/2 flex -translate-x-1/2 gap-fv-sm">
          <button
            type="button"
            onClick={onToggleMute}
            disabled={disabled}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
            aria-pressed={isMuted}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <Icon name={isMuted ? "mic_off" : "mic"} />
          </button>
          <button
            type="button"
            onClick={onToggleCamera}
            disabled={disabled}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
            aria-pressed={isCameraOff}
            aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            <Icon name={isCameraOff ? "videocam_off" : "videocam"} />
          </button>
        </div>
      </div>

      {uiState === "error" ? (
        <p className="mb-fv-md text-body-md text-error" role="alert">
          Could not access devices.
        </p>
      ) : null}

      <div className="mb-fv-md space-y-fv-md">
        {onRoomNameChange ? (
          <div className="space-y-fv-xs">
            <label
              htmlFor="precall-room"
              className="text-label-md uppercase text-on-surface-variant"
            >
              Room name
            </label>
            <input
              id="precall-room"
              value={roomName ?? ""}
              disabled={disabled}
              onChange={(e) => onRoomNameChange(e.target.value)}
              placeholder="meeting-001"
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-fv-md py-fv-sm text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        ) : null}
        <div className="space-y-fv-xs">
          <label htmlFor="precall-name" className="text-label-md uppercase text-on-surface-variant">
            Display name
          </label>
          <input
            id="precall-name"
            value={displayName}
            disabled={disabled}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-fv-md py-fv-sm text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>
        <DeviceSelect
          label="Camera"
          value={selectedCameraId}
          options={cameras}
          onChange={onSelectCamera}
          disabled={disabled || permissionDenied}
        />
        <DeviceSelect
          label="Microphone"
          value={selectedMicId}
          options={microphones}
          onChange={onSelectMic}
          disabled={disabled || permissionDenied}
        />
        {speakers.length > 0 && onSelectSpeaker ? (
          <DeviceSelect
            label="Speaker"
            value={selectedSpeakerId}
            options={speakers}
            onChange={onSelectSpeaker}
            disabled={disabled}
          />
        ) : null}
      </div>

      <div className="flex justify-end gap-fv-sm">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-outline-variant px-fv-md py-fv-sm text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          onClick={onJoin}
          disabled={
            disabled ||
            loading ||
            !displayName.trim() ||
            permissionDenied ||
            (onRoomNameChange && !roomName?.trim())
          }
          className="rounded-lg bg-primary px-fv-md py-fv-sm text-label-md text-on-primary transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-on-primary-fixed-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
        >
          {loading ? "Joining…" : "Join meeting"}
        </button>
      </div>
    </section>
  );
}
