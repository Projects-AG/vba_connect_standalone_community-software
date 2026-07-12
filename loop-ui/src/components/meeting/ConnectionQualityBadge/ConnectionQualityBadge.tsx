import type { ConnectionQuality } from "../../../types/meeting";
import { Icon } from "../../shared/Icon";
import { cn } from "../../../lib/cn";

export interface ConnectionQualityBadgeProps {
  quality: ConnectionQuality;
  size?: "sm" | "md";
  className?: string;
  /** Hide label; icon + aria-label only */
  iconOnly?: boolean;
}

const META: Record<
  ConnectionQuality,
  { label: string; icon: string; className: string }
> = {
  excellent: {
    label: "Excellent",
    icon: "signal_cellular_alt",
    className: "text-primary",
  },
  good: {
    label: "Good",
    icon: "signal_cellular_alt_2_bar",
    className: "text-secondary",
  },
  poor: {
    label: "Poor",
    icon: "signal_cellular_alt_1_bar",
    className: "text-on-error-container",
  },
  lost: {
    label: "Lost",
    icon: "signal_cellular_nodata",
    className: "text-error",
  },
};

export function ConnectionQualityBadge({
  quality,
  size = "md",
  className,
  iconOnly = true,
}: ConnectionQualityBadgeProps) {
  const meta = META[quality];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-fv-xs rounded-full bg-inverse-surface/40 px-fv-xs py-fv-xs text-inverse-on-surface backdrop-blur-md",
        className,
      )}
      role="status"
      aria-label={`Connection quality: ${meta.label}`}
    >
      <Icon
        name={meta.icon}
        size={size === "sm" ? 14 : 18}
        className={meta.className}
      />
      {!iconOnly ? (
        <span className="text-label-md text-inverse-on-surface">{meta.label}</span>
      ) : null}
    </span>
  );
}
