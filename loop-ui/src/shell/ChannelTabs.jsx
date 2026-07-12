export function ChannelTabs({ tabs = [], activeId, onChange, onAdd }) {
  return (
    <div className="relative mt-2 flex items-center gap-8">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={`relative pb-3 text-base font-semibold transition-colors ${
              active
                ? "text-loop-primary"
                : "text-loop-outline hover:text-loop-on-surface"
            }`}
          >
            {tab.label}
            {active ? (
              <span className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-loop-primary" />
            ) : null}
          </button>
        );
      })}
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="ml-auto pb-3 text-loop-outline transition-colors hover:text-loop-primary"
          aria-label="Add tab"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      ) : null}
    </div>
  );
}
