export function Card({ children, className = "", lift = false, padding = "md" }) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`rounded-2xl border border-loop-outline-variant/30 bg-loop-surface-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.04)] ${
        lift ? "loop-card-lift" : ""
      } ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
