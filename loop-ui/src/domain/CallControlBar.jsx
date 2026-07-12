import { Icon } from "../primitives/Icon";

const controls = [
  { id: "mute", label: "Mute", icon: "mic" },
  { id: "camera", label: "Camera", icon: "videocam" },
  { id: "share", label: "Share", icon: "present_to_all" },
  { id: "copilot", label: "Copilot", icon: "auto_awesome", accent: true },
  { id: "leave", label: "Leave", icon: "call_end", danger: true },
];

export function CallControlBar({
  muted,
  cameraOff,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-loop-outline-variant/20 bg-loop-surface-lowest px-4 py-3 shadow-[0px_12px_32px_rgba(0,0,0,0.12)] ${className}`}
    >
      {controls.map((control) => {
        const icon =
          control.id === "mute" && muted
            ? "mic_off"
            : control.id === "camera" && cameraOff
              ? "videocam_off"
              : control.icon;

        return (
          <button
            key={control.id}
            type="button"
            onClick={() => onAction?.(control.id)}
            className="flex min-w-[64px] flex-col items-center gap-1 transition-transform active:scale-95"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                control.danger
                  ? "bg-loop-error text-white"
                  : control.accent
                    ? "bg-loop-primary text-white"
                    : "bg-loop-surface-low text-loop-on-surface"
              }`}
            >
              <Icon name={icon} />
            </span>
            <span className="text-[11px] font-semibold text-loop-on-surface-variant">
              {control.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
