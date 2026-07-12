import { AvatarStack } from "../primitives/Avatar";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { Icon } from "../primitives/Icon";

export function FocusCard({
  title = "Q4 Product Vision Sync",
  description = "Align roadmap milestones and review the latest Figma prototype before Friday's leadership sync.",
  startsIn = "Starts in 12 mins",
  people = [],
  onJoin,
  onReschedule,
}) {
  return (
    <Card lift className="loop-entrance">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Today's Focus</Badge>
          <span className="text-sm font-medium text-loop-primary">{startsIn}</span>
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-loop-on-surface">
        {title}
      </h3>
      <p className="mb-5 max-w-2xl text-sm leading-5 text-loop-on-surface-variant">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <AvatarStack people={people} max={4} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReschedule}
            className="text-sm font-semibold text-loop-primary transition-colors hover:underline"
          >
            Reschedule
          </button>
          <Button
            onClick={onJoin}
            icon={<Icon name="video_call" size={18} />}
          >
            Join Meeting
          </Button>
        </div>
      </div>
    </Card>
  );
}
