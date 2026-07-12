/**
 * Additive motion config (Part 3) — DO NOT merge into / overwrite DESIGN.md tokens.
 * Standard UI still uses cubic-bezier(0.4, 0, 0.2, 1) @ 300ms from tokens.css.
 */

export const standardMotion = {
  durationMs: 300,
  hoverDurationMs: 150,
  easing: [0.4, 0, 0.2, 1] as const,
} as const;

/** Spring for meaningful state changes (pin, sheets, mic/camera toggles, join/leave). */
export const springMotion = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/** prefers-reduced-motion fallback: linear 150ms, no transform travel. */
export const reducedMotion = {
  duration: 0.15,
  ease: "linear" as const,
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const reducedTransition = {
  duration: 0.15,
  ease: "linear" as const,
};

export function getInteractiveTransition(prefersReducedMotion: boolean) {
  return prefersReducedMotion ? reducedTransition : springTransition;
}

/** Fade-only variant when reduced motion is preferred (no translate/scale travel). */
export function getPresenceVariants(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: reducedTransition },
      exit: { opacity: 0, transition: reducedTransition },
    };
  }
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: springTransition },
    exit: { opacity: 0, y: 8, transition: springTransition },
  };
}
