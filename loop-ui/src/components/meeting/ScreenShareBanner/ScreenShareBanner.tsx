import { motion } from "framer-motion";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getPresenceVariants } from "../../../motion/motion";
import type { ComponentUiState } from "../../../types/meeting";

export interface ScreenShareBannerProps {
  sharerName: string;
  sharerId: string;
  isLocalShare?: boolean;
  uiState?: ComponentUiState;
  onStopShare?: () => void;
  onViewShare?: () => void;
  className?: string;
}

export function ScreenShareBanner({
  sharerName,
  sharerId,
  isLocalShare = false,
  uiState = "default",
  onStopShare,
  onViewShare,
  className,
}: ScreenShareBannerProps) {
  const reduced = usePrefersReducedMotion();
  const variants = getPresenceVariants(reduced);

  if (uiState === "empty") return null;

  return (
    <motion.div
      {...variants}
      role="status"
      aria-live="polite"
      data-sharer-id={sharerId}
      data-state={uiState}
      className={cn(
        "flex flex-wrap items-center justify-between gap-fv-sm rounded-xl border border-primary-container/30 bg-primary/5 px-fv-md py-fv-sm",
        uiState === "disabled" && "opacity-50",
        className,
      )}
    >
      <div className="flex items-center gap-fv-sm text-on-surface">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
          <Icon name="present_to_all" />
        </span>
        <div>
          <p className="text-headline-md">
            {isLocalShare ? "You are sharing your screen" : `${sharerName} is sharing`}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {uiState === "loading" ? "Starting share…" : "Screen share active"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-fv-sm">
        {!isLocalShare && onViewShare ? (
          <button
            type="button"
            onClick={onViewShare}
            className="rounded-lg border border-outline-variant px-fv-md py-fv-sm text-label-md text-on-surface transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            View
          </button>
        ) : null}
        {isLocalShare && onStopShare ? (
          <button
            type="button"
            onClick={onStopShare}
            className="rounded-lg bg-error px-fv-md py-fv-sm text-label-md text-on-error transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-on-error-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Stop sharing
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
