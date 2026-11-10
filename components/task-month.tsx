import Link from "next/link";
import {
  monthDays,
  monthLeadingBlanks,
  shiftMonthKey,
  formatMonthLabel,
  monthKeyOf,
} from "@/lib/date";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export type TaskDay = { title: string; done: boolean }[];

/**
 * 待辦事項的月曆：每一格列出當天截止的事情，
 * 點一下就在下方顯示那天要完成的完整清單。
 */
export function TaskMonth({
  monthKey,
  selectedKey,
  todayKey,
  byDay,
}: {
  monthKey: string;
  selectedKey: string;
  todayKey: string;
  byDay: Map<string, TaskDay>;
}) {
  const days = monthDays(monthKey);
  const blanks = monthLeadingBlanks(monthKey);
  const openThisMonth = days.reduce(
    (sum, k) => sum + (byDay.get(k)?.filter((t) => !t.done).length ?? 0),
    0
  );
  const href = (day: string, month: string) => `/tasks?day=${day}&month=${month}`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-medium text-ink">{formatMonthLabel(monthKey)}</h2>
          <span className="text-xs text-muted">這個月還有 {openThisMonth} 件要做</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={href(selectedKey, shiftMonthKey(monthKey, -1))}
            className="rounded-lg border border-clay px-2.5 py-1 text-ink hover:bg-sand"
            aria-label="上個月"
          >
            ‹
          </Link>
          {monthKey !== monthKeyOf(todayKey) || selectedKey !== todayKey ? (
            <Link
              href={href(todayKey, monthKeyOf(todayKey))}
              className="rounded-lg border border-clay px-2.5 py-1 text-xs text-ink hover:bg-sand"
            >
              今天
            </Link>
          ) : null}
          <Link
            href={href(selectedKey, shiftMonthKey(monthKey, 1))}
            className="rounded-lg border border-clay px-2.5 py-1 text-ink hover:bg-sand"
            aria-label="下個月"
          >
            ›
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((key) => {
          const tasks = byDay.get(key) ?? [];
          const open = tasks.filter((t) => !t.done);
          const selected = key === selectedKey;
          const isToday = key === todayKey;
          const overdue = key < todayKey && open.length > 0;
          return (
            <Link
              key={key}
              href={href(key, monthKey)}
              scroll={false}
              className={
                "flex min-h-[4.75rem] flex-col rounded-lg border p-1.5 text-left transition " +
                (selected
                  ? "border-sage-dark bg-gold"
                  : overdue
                    ? "border-red-200 bg-red-50 hover:bg-red-100/70"
                    : "border-clay bg-white hover:bg-sand/60")
              }
            >
              <div className="flex items-baseline justify-between">
                <span
                  className={
                    "text-[11px] " +
                    (isToday
                      ? "rounded bg-sage-dark px-1 font-medium text-cream"
                      : "text-muted")
                  }
                >
                  {Number(key.slice(8))}
                </span>
                {open.length > 0 && (
                  <span
                    className={
                      "text-[11px] font-medium " + (overdue ? "text-red-600" : "text-ink")
                    }
                  >
                    {open.length} 件
                  </span>
                )}
              </div>

              {tasks.length > 0 && (
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {tasks.slice(0, 2).map((t, i) => (
                    <p
                      key={i}
                      title={t.title}
                      className={
                        "truncate text-[10px] leading-tight " +
                        (t.done ? "text-muted line-through" : "text-ink")
                      }
                    >
                      {t.title}
                    </p>
                  ))}
                  {tasks.length > 2 && (
                    <p className="text-[10px] leading-tight text-muted">
                      還有 {tasks.length - 2} 項
                    </p>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
