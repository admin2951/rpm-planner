import Link from "next/link";
import {
  monthDays,
  monthLeadingBlanks,
  shiftMonthKey,
  formatMonthLabel,
  formatDuration,
  todayKey,
} from "@/lib/date";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export type DaySummary = {
  minutes: number;
  items: { content: string; minutes: number }[];
};

/**
 * 當月月曆：每一格顯示那天總共記了多久、做了哪些事，
 * 點下去就切到那天的完整紀錄。
 */
export function WorkLogMonth({
  monthKey,
  selectedKey,
  byDay,
}: {
  monthKey: string;
  selectedKey: string;
  byDay: Map<string, DaySummary>;
}) {
  const days = monthDays(monthKey);
  const blanks = monthLeadingBlanks(monthKey);
  const today = todayKey();
  const monthTotal = days.reduce(
    (sum, k) => sum + (byDay.get(k)?.minutes ?? 0),
    0
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-medium text-ink">
            {formatMonthLabel(monthKey)}
          </h2>
          <span className="text-xs text-muted">
            這個月共 {formatDuration(monthTotal)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/log?date=${selectedKey}&month=${shiftMonthKey(monthKey, -1)}`}
            className="rounded-lg border border-clay px-2.5 py-1 text-ink hover:bg-sand"
            aria-label="上個月"
          >
            ‹
          </Link>
          <Link
            href={`/log?date=${selectedKey}&month=${shiftMonthKey(monthKey, 1)}`}
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
          const day = byDay.get(key);
          const selected = key === selectedKey;
          const isToday = key === today;
          return (
            <Link
              key={key}
              href={`/log?date=${key}&month=${monthKey}`}
              className={
                "flex min-h-[4.75rem] flex-col rounded-lg border p-1.5 text-left transition " +
                (selected
                  ? "border-sage-dark bg-gold"
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
                {day && (
                  <span className="text-[11px] font-medium text-ink">
                    {Math.round((day.minutes / 60) * 10) / 10}h
                  </span>
                )}
              </div>

              {day && (
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {day.items.slice(0, 2).map((item, i) => (
                    <p
                      key={i}
                      title={`${item.content}（${formatDuration(item.minutes)}）`}
                      className="truncate text-[10px] leading-tight text-ink"
                    >
                      {item.content}
                      <span className="text-muted">
                        {" "}
                        {formatDuration(item.minutes)}
                      </span>
                    </p>
                  ))}
                  {day.items.length > 2 && (
                    <p className="text-[10px] leading-tight text-muted">
                      還有 {day.items.length - 2} 項
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
