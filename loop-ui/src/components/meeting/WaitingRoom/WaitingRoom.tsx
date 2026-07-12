import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import type { ComponentUiState } from "../../../types/meeting";

export interface WaitingRoomProps {
  open: boolean;
  meetingTitle: string;
  hostName?: string;
  waitingCount?: number;
  message?: string;
  uiState?: ComponentUiState;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function WaitingRoom({
  open,
  meetingTitle,
  hostName,
  waitingCount = 0,
  message = "Waiting for the host to let you in…",
  uiState = "default",
  onCancel,
  onRetry,
  className,
}: WaitingRoomProps) {
  const loading = uiState === "loading" || uiState === "default";
  const error = uiState === "error";

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-inverse-surface/40" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-fv-lg shadow-elevation-2 focus:outline-none",
            className,
          )}
          aria-describedby="waiting-room-desc"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-headline-lg text-on-surface">
            {meetingTitle}
          </Dialog.Title>
          <VisuallyHidden>
            <Dialog.Description>Waiting room</Dialog.Description>
          </VisuallyHidden>
          <div id="waiting-room-desc" className="mt-fv-md space-y-fv-sm">
            <div className="flex items-center gap-fv-sm text-primary">
              {loading && !error ? (
                <Icon name="hourglass_top" className="animate-pulse" />
              ) : null}
              {error ? <Icon name="error" className="text-error" /> : null}
              <p
                className={cn(
                  "text-body-md",
                  error ? "text-error" : "text-on-surface-variant",
                )}
                role={error ? "alert" : "status"}
              >
                {error ? "Admission failed. Try again or leave." : message}
              </p>
            </div>
            {hostName ? (
              <p className="text-body-sm text-on-surface-variant">Host: {hostName}</p>
            ) : null}
            {waitingCount > 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                {waitingCount} others waiting
              </p>
            ) : null}
          </div>
          <div className="mt-fv-lg flex justify-end gap-fv-sm">
            {error && onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-outline-variant px-fv-md py-fv-sm text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Retry
              </button>
            ) : null}
            {onCancel ? (
              <Dialog.Close asChild>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg bg-error px-fv-md py-fv-sm text-label-md text-on-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Leave
                </button>
              </Dialog.Close>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
