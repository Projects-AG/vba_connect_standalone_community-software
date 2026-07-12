import { Avatar } from "../primitives/Avatar";
import { Icon } from "../primitives/Icon";
import { Input } from "../primitives/Input";

export function AppBar({
  brand = "LOOP",
  searchPlaceholder = "Search for files, people, or gists",
  searchValue,
  onSearchChange,
  user,
  onHelp,
  onNotifications,
  onSettings,
  notificationDot = false,
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center justify-between border-b border-loop-outline-variant/30 bg-loop-surface/90 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-tight text-loop-primary md:text-[28px] md:leading-9">
          {brand}
        </span>
        <div className="ml-2 hidden md:block md:w-96">
          <Input
            icon="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button
          type="button"
          onClick={onHelp}
          className="rounded-full p-2 text-loop-on-surface-variant transition-colors hover:bg-loop-surface-highest"
          aria-label="Help"
        >
          <Icon name="help" />
        </button>
        <button
          type="button"
          onClick={onNotifications}
          className="relative rounded-full p-2 text-loop-on-surface-variant transition-colors hover:bg-loop-surface-highest"
          aria-label="Notifications"
        >
          <Icon name="notifications" />
          {notificationDot ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-loop-error" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="rounded-full p-2 text-loop-on-surface-variant transition-colors hover:bg-loop-surface-highest"
          aria-label="Settings"
        >
          <Icon name="settings" />
        </button>
        <Avatar
          src={user?.src}
          name={user?.name}
          className="ml-2 border border-loop-outline-variant"
        />
      </div>
    </header>
  );
}
