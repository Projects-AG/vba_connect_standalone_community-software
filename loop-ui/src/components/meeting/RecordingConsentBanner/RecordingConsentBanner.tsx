import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getPresenceVariants } from "../../../motion/motion";
import type { ComponentUiState } from "../../../types/meeting";

export interface RecordingConsentBannerProps {
  open: boolean;
  recorderName?: string;
  uiState?: ComponentUiState;
  /** Compact toast-style (supports swipe dismiss via onDismiss) */
  variant?: "dialog" | "toast";
  onAccept: () => void;
  onDecline: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function RecordingConsentBanner({
  open,
  recorderName,
  uiState = "default",
  variant = "dialog",
  onAccept,
  onDecline,
  onDismiss,
  className,
}: RecordingConsentBannerProps) {
  const reduced = usePrefersReducedMotion();
  const variants = getPresenceVariants(reduced);
  const message = recorderName
    ? `${recorderName} started recording this meeting.`
    : "This meeting is being recorded.";

  if (variant === "toast") {
    if (!open) return null;
    return (
      <motion.div
        drag={reduced ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 100) onDismiss?.() ?? onDecline();
        }}
        {...variants}
        role="alertdialog"
        aria-labelledby="recording-consent-title"
        aria-describedby="recording-consent-desc"
        data-state={uiState}
        className={cn(
          "fixed bottom-fv-md left-1/2 z-50 flex w-[min(100%-2rem,28rem)] -translate-x-1/2 flex-col gap-fv-sm rounded-xl border border-outline-variant/20 bg-inverse-surface p-fv-md text-inverse-on-surface shadow-elevation-2 sm:flex-row sm:items-center",
          className,
        )}
      >
        <div className="flex items-start gap-fv-sm">
          <Icon name="radio_button_checked" className="text-error" />
          <div>
            <p id="recording-consent-title" className="text-headline-md">
              Recording in progress
            </p>
            <p id="recording-consent-desc" className="text-body-sm text-inverse-on-surface/80">
              {message} Continue to stay, or leave the call.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-fv-sm sm:ml-auto">
          <button
            type="button"
            onClick={onDecline}
            className="rounded-lg px-fv-md py-fv-sm text-label-md text-inverse-on-surface/80 hover:text-inverse-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Leave
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-lg bg-primary px-fv-md py-fv-sm text-label-md text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Stay
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-inverse-surface/40" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-fv-lg shadow-elevation-2 focus:outline-none",
            className,
          )}
        >
          <div className="mb-fv-md flex items-center gap-fv-sm text-error">
            <Icon name="radio_button_checked" />
            <Dialog.Title className="text-headline-lg text-on-surface">
              Recording consent
            </Dialog.Title>
          </div>
          <Dialog.Description className="text-body-md text-on-surface-variant">
            {message} By staying, you consent to being recorded.
          </Dialog.Description>
          <div className="mt-fv-lg flex justify-end gap-fv-sm">
            <button
              type="button"
              onClick={onDecline}
              className="rounded-lg border border-outline-variant px-fv-md py-fv-sm text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              Leave meeting
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="rounded-lg bg-primary px-fv-md py-fv-sm text-label-md text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              I consent — stay
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
