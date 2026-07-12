import { Avatar } from "../primitives/Avatar";
import { Badge } from "../primitives/Badge";
import { Card } from "../primitives/Card";
import { Icon } from "../primitives/Icon";

export function ActivityFeed({ items = [], onViewAll }) {
  return (
    <Card padding="md" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-loop-on-surface">
          Recent Activity
        </h3>
        <Badge tone="live" dot>
          Live
        </Badge>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            {item.ai ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-loop-primary text-white">
                <Icon name="auto_awesome" size={16} />
              </div>
            ) : (
              <Avatar src={item.src} name={item.name} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-loop-on-surface">
                <span className="font-semibold">{item.name}</span>{" "}
                <span className="text-loop-on-surface-variant">{item.action}</span>
              </p>
              {item.detail ? (
                <p className="mt-0.5 truncate text-xs text-loop-outline">
                  {item.detail}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-loop-outline">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-loop-surface-low py-2.5 text-sm font-semibold text-loop-on-surface-variant transition-colors hover:bg-loop-surface-high"
      >
        <Icon name="history" size={18} />
        View All Activity
      </button>
    </Card>
  );
}
