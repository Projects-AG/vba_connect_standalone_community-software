import { Button } from "../primitives/Button";
import { Icon } from "../primitives/Icon";

export function InsightBanner({
  title = "Ambient Workspace Insights",
  description = "The Q4 roadmap is 85% aligned. Maya uploaded the latest Figma prototype which addresses mobile friction. 3 tasks need your review.",
  actionLabel = "Review Sync",
  onAction,
}) {
  return (
    <div className="loop-entrance flex flex-col gap-4 rounded-2xl border border-loop-primary-container/20 bg-loop-primary/5 p-6 shadow-sm md:flex-row md:items-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-loop-primary text-white">
        <Icon name="auto_awesome" size={28} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-loop-on-surface">{title}</h3>
        <p className="mt-1 text-sm text-loop-on-surface-variant">{description}</p>
      </div>
      <Button onClick={onAction} className="shrink-0">
        {actionLabel}
      </Button>
    </div>
  );
}

export function AmbientToast({
  title = "Ambient Insight",
  message = "Mute notifications for your upcoming focus block?",
  onConfirm,
  onDismiss,
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex max-w-lg -translate-x-1/2 flex-col gap-3 rounded-2xl bg-loop-inverse-surface px-4 py-3 text-loop-inverse-on-surface shadow-[0px_12px_32px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Icon name="lightbulb" className="text-amber-300" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-white/70">{message}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:ml-4">
        <Button size="sm" onClick={onConfirm}>
          Yes
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-2 text-xs font-semibold text-white/70 hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
