function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  src,
  name = "",
  size = "md",
  className = "",
  overflow,
}) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
    xl: "h-20 w-20 text-2xl",
  };

  if (overflow != null) {
    return (
      <div
        className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full border-2 border-loop-surface-lowest bg-loop-secondary-container font-bold text-loop-on-secondary-container ${className}`}
      >
        +{overflow}
      </div>
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-full border-2 border-loop-surface-lowest object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full border-2 border-loop-surface-lowest bg-loop-surface-high font-bold text-loop-on-surface-variant ${className}`}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

export function AvatarStack({ people = [], max = 3, size = "md" }) {
  const shown = people.slice(0, max);
  const rest = people.length - max;

  return (
    <div className="flex -space-x-2">
      {shown.map((person) => (
        <Avatar
          key={person.id || person.name}
          src={person.src}
          name={person.name}
          size={size}
        />
      ))}
      {rest > 0 ? <Avatar overflow={rest} size={size} /> : null}
    </div>
  );
}
