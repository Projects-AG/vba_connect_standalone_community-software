import { Button } from "../primitives/Button";
import { Icon } from "../primitives/Icon";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    cells.push({ day: prevDays - i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ day: d, outside: false });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, outside: true });
  }
  return cells;
}

export function CalendarView({
  year = 2024,
  month = 9,
  monthLabel = "October 2024",
  events = {},
  onSchedule,
}) {
  const cells = buildMonthCells(year, month);
  const today = 11;

  return (
    <div className="loop-scrollbar h-[calc(100vh-3rem)] overflow-y-auto p-6 md:p-8">
      <div className="mb-4 flex flex-col gap-4 rounded-xl bg-loop-surface-lowest p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-loop-on-surface">
            {monthLabel}
          </h2>
          <div className="flex items-center rounded-lg bg-loop-surface-container p-1">
            <button type="button" className="rounded p-1 hover:bg-loop-surface-highest">
              <Icon name="chevron_left" />
            </button>
            <span className="px-3 text-xs font-semibold tracking-wide uppercase">
              Today
            </span>
            <button type="button" className="rounded p-1 hover:bg-loop-surface-highest">
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-loop-surface-container p-1">
            <button
              type="button"
              className="rounded-md bg-white px-4 py-1 text-xs font-semibold shadow-sm"
            >
              Month
            </button>
            <button
              type="button"
              className="px-4 py-1 text-xs font-semibold text-loop-on-surface-variant"
            >
              Week
            </button>
            <button
              type="button"
              className="px-4 py-1 text-xs font-semibold text-loop-on-surface-variant"
            >
              Day
            </button>
          </div>
          <Button onClick={onSchedule} icon={<Icon name="add" size={18} />}>
            Schedule New Meeting
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-loop-outline-variant/20 bg-loop-surface-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-7 border-b border-loop-outline-variant/20">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold tracking-wide text-loop-on-surface-variant"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, index) => {
            const dayEvents = !cell.outside ? events[cell.day] || [] : [];
            const isToday = !cell.outside && cell.day === today;
            return (
              <div
                key={`${cell.day}-${index}`}
                className={`min-h-24 border-r border-b border-loop-outline-variant/10 p-2 ${
                  cell.outside ? "opacity-30" : ""
                } ${isToday ? "bg-loop-primary/5" : ""}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center text-xs font-semibold ${
                    isToday
                      ? "rounded-full bg-loop-primary text-white"
                      : "text-loop-on-surface"
                  }`}
                >
                  {cell.day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={`${event.title}-${event.time}`}
                      className={`cursor-pointer rounded border-l-2 p-1 text-[11px] font-semibold ${
                        event.tone === "secondary"
                          ? "border-loop-secondary bg-loop-secondary-container text-loop-on-secondary-container"
                          : "border-loop-primary bg-loop-primary/10 text-loop-primary"
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
