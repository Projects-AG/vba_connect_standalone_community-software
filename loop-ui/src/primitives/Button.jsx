const variants = {
  primary:
    "bg-loop-primary text-loop-on-primary hover:bg-loop-primary-hover shadow-sm",
  secondary:
    "bg-transparent border border-loop-outline-variant text-loop-on-surface hover:bg-loop-surface-low",
  ghost: "bg-transparent text-loop-on-surface-variant hover:bg-loop-surface-highest",
  danger: "bg-loop-error text-white hover:bg-[#93000a]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
