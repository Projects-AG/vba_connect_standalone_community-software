import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getInteractiveTransition } from "../../../motion/motion";
import type {
  ComponentUiState,
  ConnectionQuality,
  ConnectivityState,
} from "../../../types/meeting";
import { ConnectionQualityBadge } from "../ConnectionQualityBadge/ConnectionQualityBadge";

export interface VideoTileProps {
  participantId: string;
  displayName: string;
  streamUrl?: string | null;
  mediaStream?: MediaStream | null;
  avatarUrl?: string | null;
  isMuted: boolean;
  isCameraOff?: boolean;
  isSpeaking: boolean;
  isPinned: boolean;
  isScreenSharing: boolean;
  connectionQuality: ConnectionQuality;
  connectivityState?: ConnectivityState;
  uiState?: ComponentUiState;
  onPinToggle?: (participantId: string, pinned: boolean) => void;
  onFocus?: (participantId: string) => void;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function VideoTile({
  participantId,
  displayName,
  streamUrl,
  mediaStream,
  avatarUrl,
  isMuted,
  isCameraOff = false,
  isSpeaking,
  isPinned,
  isScreenSharing,
  connectionQuality,
  connectivityState = "online",
  uiState = "default",
  onPinToggle,
  onFocus,
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const disabled = uiState === "disabled";
  const loading = uiState === "loading";
  const error = uiState === "error" || connectivityState === "offline";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (mediaStream) {
      el.srcObject = mediaStream;
      return () => {
        el.srcObject = null;
      };
    }
    el.srcObject = null;
  }, [mediaStream]);

  const showVideo =
    !isCameraOff && !error && !loading && (Boolean(streamUrl) || Boolean(mediaStream));

  return (
    <motion.article
      layout={!reduced}
      transition={getInteractiveTransition(reduced)}
      className={cn(
        "relative flex min-h-[160px] overflow-hidden rounded-xl bg-surface-container-high shadow-elevation-1 ring-1 ring-outline-variant/10",
        isSpeaking && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
        isPinned && "z-10",
        disabled && "pointer-events-none opacity-50",
        uiState === "empty" && "items-center justify-center",
        className,
      )}
      data-participant-id={participantId}
      data-state={uiState}
      aria-label={`${displayName}${isSpeaking ? ", speaking" : ""}${isMuted ? ", muted" : ""}`}
      tabIndex={disabled ? -1 : 0}
      onFocus={() => onFocus?.(participantId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPinToggle?.(participantId, !isPinned);
        }
      }}
    >
      {loading ? (
        <div
          className="flex w-full items-center justify-center text-body-md text-on-surface-variant"
          role="status"
        >
          Connecting…
        </div>
      ) : null}

      {error && !loading ? (
        <div
          className="flex w-full flex-col items-center justify-center gap-fv-sm p-fv-md text-center"
          role="alert"
        >
          <Icon name="wifi_off" className="text-error" />
          <p className="text-body-sm text-on-surface-variant">
            {connectivityState === "reconnecting"
              ? "Reconnecting…"
              : connectivityState === "permission-denied"
                ? "Camera permission denied"
                : "Video unavailable"}
          </p>
        </div>
      ) : null}

      {!loading && !error && showVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={mediaStream ? undefined : streamUrl ?? undefined}
          autoPlay
          playsInline
          muted
          aria-hidden
        />
      ) : null}

      {!loading && !error && !showVideo ? (
        <div className="flex h-full min-h-[160px] w-full items-center justify-center bg-surface-container-high">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container text-headline-xl text-on-secondary-container"
              aria-hidden
            >
              {initials(displayName)}
            </div>
          )}
        </div>
      ) : null}

      <div className="absolute bottom-fv-sm left-fv-sm flex max-w-[85%] items-center gap-fv-sm rounded-lg border border-outline-variant/20 bg-inverse-surface/40 px-fv-sm py-fv-xs text-inverse-on-surface backdrop-blur-md">
        <Icon name={isMuted ? "mic_off" : "mic"} size={16} />
        <span className="truncate text-label-md">{displayName}</span>
      </div>

      <div className="absolute right-fv-sm top-sm flex items-center gap-fv-xs">
        <ConnectionQualityBadge quality={connectionQuality} size="sm" />
        {isScreenSharing ? (
          <span className="rounded bg-primary px-fv-sm py-fv-xs text-label-md text-on-primary">
            Sharing
          </span>
        ) : null}
        {isSpeaking ? (
          <span className="rounded bg-primary px-fv-sm py-fv-xs text-label-md uppercase text-on-primary">
            Speaking
          </span>
        ) : null}
        <button
          type="button"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-inverse-surface/40 text-inverse-on-surface backdrop-blur-md transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            isPinned && "bg-primary text-on-primary",
          )}
          aria-pressed={isPinned}
          aria-label={isPinned ? `Unpin ${displayName}` : `Pin ${displayName}`}
          disabled={disabled}
          onClick={() => onPinToggle?.(participantId, !isPinned)}
        >
          <motion.span
            key={isPinned ? "pinned" : "unpinned"}
            initial={reduced ? false : { scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={getInteractiveTransition(reduced)}
            className="flex"
          >
            <Icon name={isPinned ? "keep" : "keep_off"} size={18} filled={isPinned} />
          </motion.span>
        </button>
      </div>

      {connectivityState === "degraded-bandwidth" ? (
        <div className="absolute inset-x-0 top-0 bg-error-container px-fv-sm py-fv-xs text-center text-label-md text-on-error-container">
          Degraded connection
        </div>
      ) : null}

      {connectivityState === "reconnecting" && !error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container/80 text-body-md text-on-surface-variant">
          Reconnecting…
        </div>
      ) : null}
    </motion.article>
  );
}
