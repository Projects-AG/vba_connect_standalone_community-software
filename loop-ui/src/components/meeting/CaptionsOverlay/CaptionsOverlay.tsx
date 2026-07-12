import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getPresenceVariants } from "../../../motion/motion";
import type { CaptionLine, ComponentUiState } from "../../../types/meeting";

export interface CaptionsOverlayProps {
  lines: CaptionLine[];
  visible?: boolean;
  uiState?: ComponentUiState;
  className?: string;
  /** Max lines shown (newest last) */
  maxLines?: number;
}

export function CaptionsOverlay({
  lines,
  visible = true,
  uiState = "default",
  className,
  maxLines = 3,
}: CaptionsOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const variants = getPresenceVariants(reduced);
  const shown = lines.slice(-maxLines);
  const empty = uiState === "empty" || shown.length === 0;

  if (!visible) return null;

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Live captions"
      data-state={uiState}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-fv-md",
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        {!empty ? (
          <motion.div
            key={shown.map((l) => l.captionId).join("-")}
            {...variants}
            className="overlay-material max-w-2xl rounded-xl border border-outline-variant/20 px-fv-md py-fv-sm shadow-elevation-1"
          >
            {uiState === "loading" ? (
              <p className="text-body-md text-on-surface-variant">Starting captions…</p>
            ) : null}
            {uiState === "error" ? (
              <p className="text-body-md text-error">Captions unavailable.</p>
            ) : null}
            {shown.map((line) => (
              <p
                key={line.captionId}
                className={cn(
                  "text-body-md text-on-surface",
                  !line.isFinal && "text-on-surface-variant",
                )}
              >
                <span className="font-semibold text-primary">{line.displayName}: </span>
                {line.text}
              </p>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
