import { AppBar } from "./AppBar";
import { NavRail } from "./NavRail";

export function WorkspaceShell({
  brand = "LOOP",
  activeNav,
  onNavigate,
  user,
  searchPlaceholder,
  notificationDot,
  children,
  hideAppBar = false,
}) {
  return (
    <div className="loop-ui min-h-screen bg-loop-background font-[family-name:var(--font-loop)] text-loop-on-surface antialiased">
      {!hideAppBar ? (
        <AppBar
          brand={brand}
          user={user}
          searchPlaceholder={searchPlaceholder}
          notificationDot={notificationDot}
        />
      ) : null}
      <NavRail activeId={activeNav} onNavigate={onNavigate} user={user} />
      <main
        className={`ml-20 flex min-h-screen flex-col overflow-hidden bg-loop-surface ${
          hideAppBar ? "pt-0" : "pt-12"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
