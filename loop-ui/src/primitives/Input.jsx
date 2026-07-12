import { Icon } from "./Icon";

export function Input({
  className = "",
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      {icon ? (
        <Icon
          name={icon}
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-loop-outline"
        />
      ) : null}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-transparent bg-loop-surface-low py-1.5 text-sm text-loop-on-surface outline-none transition-all duration-200 placeholder:text-loop-outline focus:border-loop-primary focus:ring-2 focus:ring-loop-primary/20 ${
          icon ? "pl-10 pr-4" : "px-4"
        }`}
        {...props}
      />
    </div>
  );
}
