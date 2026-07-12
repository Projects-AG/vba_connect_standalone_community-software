import { cn } from "../../lib/cn";

type IconProps = {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean | "true" | "false";
};

/** Material Symbols Outlined — not SF Symbols. */
export function Icon({
  name,
  filled = false,
  className,
  size,
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={size ? { fontSize: size } : undefined}
      aria-hidden={ariaHidden}
    >
      {name}
    </span>
  );
}
