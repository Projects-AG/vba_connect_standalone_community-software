import { Avatar } from "../primitives/Avatar";
import { Icon } from "../primitives/Icon";

const DEFAULT_ITEMS = [
  { id: "activity", label: "Activity", icon: "notifications" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "teams", label: "Teams", icon: "groups" },
  { id: "calendar", label: "Calendar", icon: "calendar_today" },
  { id: "calls", label: "Calls", icon: "call" },
  { id: "files", label: "Files", icon: "folder" },
];

export function NavRail({
  items = DEFAULT_ITEMS,
  activeId,
  onNavigate,
  user,
  showLabels = true,
  onHelp,
  onSettings,
}) {
  return (
    <nav className="fixed bottom-0 left-0 top-12 z-40 flex w-20 flex-col items-center border-r border-loop-outline-variant/30 bg-loop-surface-lowest py-4 backdrop-blur-xl">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-loop-primary text-sm font-black text-white">
        L
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className={`relative flex w-full flex-col items-center gap-1 py-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                active
                  ? "text-loop-primary"
                  : "text-loop-on-surface-variant hover:text-loop-primary"
              }`}
            >
              {active ? (
                <span className="absolute left-0 h-8 w-1 rounded-r-full bg-loop-primary" />
              ) : null}
              <Icon name={item.icon} filled={active} />
              {showLabels ? (
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  {item.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pb-2">
        <button
          type="button"
          onClick={onHelp}
          className="text-loop-on-surface-variant transition-colors hover:text-loop-primary"
          aria-label="Help"
        >
          <Icon name="help" />
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="text-loop-on-surface-variant transition-colors hover:text-loop-primary"
          aria-label="Settings"
        >
          <Icon name="settings" />
        </button>
        <Avatar src={user?.src} name={user?.name} />
      </div>
    </nav>
  );
}
