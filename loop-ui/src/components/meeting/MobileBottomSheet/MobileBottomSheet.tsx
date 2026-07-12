import { useState } from "react";
import { motion, useDragControls, type PanInfo } from "framer-motion";
import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";
import { getInteractiveTransition } from "../../../motion/motion";

export type SheetSnap = "peek" | "half" | "full";

export interface MobileBottomSheetProps {
  open: boolean;
  snap?: SheetSnap;
  onSnapChange?: (snap: SheetSnap) => void;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const HEIGHTS: Record<SheetSnap, string> = {
  peek: "30vh",
  half: "50vh",
  full: "92vh",
};

function nextSnap(offsetY: number, current: SheetSnap): SheetSnap {
  if (offsetY > 80) {
    if (current === "full") return "half";
    if (current === "half") return "peek";
    return "peek";
  }
  if (offsetY < -80) {
    if (current === "peek") return "half";
    if (current === "half") return "full";
    return "full";
  }
  return current;
}

/** Mobile chat/participant panels: peek / half / full. */
export function MobileBottomSheet({
  open,
  snap: controlledSnap,
  onSnapChange,
  onClose,
  children,
  className,
  title,
}: MobileBottomSheetProps) {
  const [internalSnap, setInternalSnap] = useState<SheetSnap>("half");
  const snap = controlledSnap ?? internalSnap;
  const setSnap = (s: SheetSnap) => {
    setInternalSnap(s);
    onSnapChange?.(s);
  };
  const reduced = usePrefersReducedMotion();
  const controls = useDragControls();

  if (!open) return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (reduced) return;
    const next = nextSnap(info.offset.y, snap);
    if (next === "peek" && info.offset.y > 140) {
      onClose?.();
      return;
    }
    setSnap(next);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-inverse-surface/40"
        aria-label="Dismiss sheet"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Panel"}
        drag={reduced ? false : "y"}
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        animate={{ height: HEIGHTS[snap] }}
        transition={getInteractiveTransition(reduced)}
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col rounded-t-xl border border-outline-variant/20 bg-surface-container-lowest shadow-elevation-2",
          className,
        )}
      >
        <div
          className="flex cursor-grab justify-center py-fv-sm active:cursor-grabbing"
          onPointerDown={(e) => controls.start(e)}
        >
          <span className="h-1 w-10 rounded-full bg-outline-variant" aria-hidden />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </motion.div>
    </div>
  );
}
