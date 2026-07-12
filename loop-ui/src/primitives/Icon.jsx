export function Icon({ name, filled = false, className = "", size }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
