const tones = {
  primary: "bg-loop-primary/10 text-loop-primary",
  secondary: "bg-loop-secondary-container text-loop-on-secondary-container",
  error: "bg-loop-error-container text-loop-on-error-container",
  neutral: "bg-loop-surface-high text-loop-on-surface-variant",
  live: "bg-loop-primary/10 text-loop-primary",
};

export function Badge({ children, tone = "primary", className = "", dot }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${tones[tone]} ${className}`}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
