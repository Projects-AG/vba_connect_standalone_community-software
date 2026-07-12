import { motion } from "framer-motion";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getInteractiveTransition } from "../../../motion/motion";
import type { ComponentUiState, ConnectivityState } from "../../../types/meeting";

export type ControlBarAction =
  | "mute"
  | "camera"
  | "share"
  | "chat"
  | "participants"
  | "copilot"
  | "leave";

export interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isSharing?: boolean;
  chatOpen?: boolean;
  participantsOpen?: boolean;
  connectivityState?: ConnectivityState;
  uiState?: ComponentUiState;
  /** Use overlay-material blur over live video (in-call floating bar only) */
  overlayMaterial?: boolean;
  disabledActions?: ControlBarAction[];
  onAction: (action: ControlBarAction) => void;
  className?: string;
}

const ACTIONS: Array<{
  id: ControlBarAction;
  label: string;
  icon: string;
  accent?: boolean;
  danger?: boolean;
}> = [
  { id: "mute", label: "Mute", icon: "mic" },
  { id: "camera", label: "Camera", icon: "videocam" },
  { id: "share", label: "Share", icon: "present_to_all" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "participants", label: "People", icon: "group" },
  { id: "copilot", label: "Copilot", icon: "auto_awesome", accent: true },
  { id: "leave", label: "Leave", icon: "call_end", danger: true },
];

export function ControlBar({
  isMuted,
  isCameraOff,
  isSharing = false,
  chatOpen = false,
  participantsOpen = false,
  connectivityState = "online",
  uiState = "default",
  overlayMaterial = true,
  disabledActions = [],
  onAction,
  className,
}: ControlBarProps) {
  const reduced = usePrefersReducedMotion();
  const barDisabled = uiState === "disabled" || connectivityState === "offline";
  const loading = uiState === "loading";

  return (
    <div
      role="toolbar"
      aria-label="Meeting controls"
      aria-disabled={barDisabled}
      data-state={uiState}
      className={cn(
        "flex items-center gap-fv-sm rounded-full border border-outline-variant/20 px-fv-md py-fv-sm shadow-elevation-2",
        overlayMaterial ? "overlay-material" : "bg-surface-container-lowest",
        barDisabled && "opacity-50",
        className,
      )}
    >
      {connectivityState === "reconnecting" || loading ? (
        <span className="px-fv-sm text-label-md text-on-surface-variant" role="status">
          {loading ? "Loading…" : "Reconnecting…"}
        </span>
      ) : null}

      {connectivityState === "permission-denied" ? (
        <span className="px-fv-sm text-label-md text-error" role="alert">
          Device permission denied
        </span>
      ) : null}

      {ACTIONS.map((action) => {
        const toggled =
          (action.id === "mute" && isMuted) ||
          (action.id === "camera" && isCameraOff) ||
          (action.id === "share" && isSharing) ||
          (action.id === "chat" && chatOpen) ||
          (action.id === "participants" && participantsOpen);

        const icon =
          action.id === "mute" && isMuted
            ? "mic_off"
            : action.id === "camera" && isCameraOff
              ? "videocam_off"
              : action.icon;

        const actionDisabled =
          barDisabled || disabledActions.includes(action.id);

        return (
          <button
            key={action.id}
            type="button"
            className="flex min-w-16 flex-col items-center gap-fv-xs transition-opacity duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50"
            aria-label={action.label}
            aria-pressed={
              action.id === "leave" || action.id === "copilot" ? undefined : toggled
            }
            disabled={actionDisabled}
            onClick={() => onAction(action.id)}
          >
            <motion.span
              key={`${action.id}-${icon}-${toggled}`}
              initial={reduced ? false : { scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={getInteractiveTransition(reduced)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                action.danger
                  ? "bg-error text-on-error"
                  : action.accent
                    ? "bg-primary text-on-primary"
                    : toggled
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-low text-on-surface",
              )}
            >
              <Icon name={icon} />
            </motion.span>
            <span className="text-label-md text-on-surface-variant">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
