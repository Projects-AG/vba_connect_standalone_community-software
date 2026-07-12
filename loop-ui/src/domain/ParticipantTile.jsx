import { Icon } from "../primitives/Icon";

export function ParticipantTile({
  name,
  src,
  initials,
  muted = false,
  speaking = false,
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-loop-surface-high shadow-lg ring-1 ring-loop-outline-variant/10 ${
        speaking ? "ring-2 ring-loop-primary ring-offset-2 ring-offset-loop-surface" : ""
      } ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[160px] w-full items-center justify-center bg-loop-surface-high">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-loop-secondary-container text-2xl font-bold text-loop-on-secondary-container">
            {initials || name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-white backdrop-blur-md">
        <Icon name={muted ? "mic_off" : "mic"} size={16} />
        <span className="text-xs font-semibold tracking-wide">{name}</span>
      </div>

      {speaking ? (
        <div className="absolute right-3 top-3 rounded bg-loop-primary px-2 py-1 text-[10px] font-bold uppercase text-white">
          Speaking
        </div>
      ) : null}
    </div>
  );
}

export function AiSummaryCard({
  text = "Decided: Move the launch date to Nov 15th to accommodate the new security audit requirements.",
  tags = ["Task", "Timeline"],
}) {
  return (
    <div className="relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-xl bg-loop-primary-container p-6 text-white shadow-lg ring-1 ring-loop-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Icon name="bolt" size={18} filled />
        </div>
        <span className="text-xs font-semibold tracking-wider text-white/90">
          AI REAL-TIME SUMMARY
        </span>
      </div>
      <div className="space-y-4">
        <p className="text-base font-semibold leading-tight">{text}</p>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
