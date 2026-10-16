import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WorkLogTable } from "@/components/work-log-table";
import { WorkLogAddForm } from "@/components/work-log-add-form";
import { WorkLogTimeline } from "@/components/work-log-timeline";
import { copyWorkLogsAction } from "@/app/actions/work-logs";
import { WorkLogMonth, type DaySummary } from "@/components/work-log-month";
import {
  todayKey,
  dateKeyToUtcDay,
  utcDayToKey,
  monthKeyOf,
  monthRange,
  shiftDateKey,
  formatDateLabel,
  formatMinutes,
  formatDuration,
  DAY_START_MIN,
  DAY_END_MIN,
} from "@/lib/date";

/**
 * 工作紀錄：一天之內每個時段做了什麼。
 * 預設看 09:30–21:30，紀錄超出這個範圍時時間軸會自動放寬。
 */
export default async function WorkLogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; month?: string }>;
}) {
  const { date, month } = await searchParams;
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date! : todayKey();
  const prevKey = shiftDateKey(dateKey, -1);
  const monthKey = /^\d{4}-\d{2}$/.test(month ?? "")
    ? month!
    : monthKeyOf(dateKey);
  const monthSpan = monthRange(monthKey);

  const [rows, prevCount, monthRows] = await Promise.all([
    prisma.workLog.findMany({
      where: { date: dateKeyToUtcDay(dateKey) },
      orderBy: [{ startMin: "asc" }, { createdAt: "asc" }],
    }),
    prisma.workLog.count({ where: { date: dateKeyToUtcDay(prevKey) } }),
    prisma.workLog.findMany({
      where: { date: { gte: monthSpan.from, lte: monthSpan.to } },
      select: { date: true, startMin: true, endMin: true, content: true },
      orderBy: [{ date: "asc" }, { startMin: "asc" }],
    }),
  ]);

  const logged = rows.reduce(
    (sum, r) => sum + Math.max(r.endMin - r.startMin, 0),
    0
  );
  const windowFrom = Math.min(DAY_START_MIN, ...rows.map((r) => r.startMin));
  const windowTo = Math.max(DAY_END_MIN, ...rows.map((r) => r.endMin));
  const gaps = findGaps(rows, DAY_START_MIN, DAY_END_MIN);
  const suggestedStart = rows.length
    ? Math.min(Math.max(...rows.map((r) => r.endMin)), 23 * 60 + 30)
    : DAY_START_MIN;

  // 當月每一天：總時數與當天做了哪些事
  const byDay = new Map<string, DaySummary>();
  for (const r of monthRows) {
    const key = utcDayToKey(r.date);
    const minutes = Math.max(r.endMin - r.startMin, 0);
    const day = byDay.get(key) ?? { minutes: 0, items: [] };
    day.minutes += minutes;
    day.items.push({ content: r.content, minutes });
    byDay.set(key, day);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-ink">工作紀錄</h1>
          <p className="mt-1 text-sm text-muted">
            {formatDateLabel(dateKey)}　每個時段做了什麼，記下來就看得到一整天。
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/log?date=${prevKey}`}
            className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
          >
            ← 前一天
          </Link>
          {dateKey !== todayKey() && (
            <Link
              href="/log"
              className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
            >
              回今天
            </Link>
          )}
          <Link
            href={`/log?date=${shiftDateKey(dateKey, 1)}`}
            className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
          >
            後一天 →
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-clay bg-white p-4">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          <span className="text-ink">
            已記錄 <span className="font-medium">{formatDuration(logged)}</span>
          </span>
          <span className="text-muted">共 {rows.length} 段</span>
          <span className="text-muted">
            預設時段 {formatMinutes(DAY_START_MIN)}–{formatMinutes(DAY_END_MIN)}
          </span>
        </div>
        <WorkLogTimeline rows={rows} from={windowFrom} to={windowTo} />
        {gaps.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            還沒填的時段：
            {gaps.map((g, i) => (
              <span key={g.from} className="text-ink">
                {i > 0 && "、"}
                {formatMinutes(g.from)}–{formatMinutes(g.to)}
              </span>
            ))}
          </p>
        )}
      </div>

      <WorkLogAddForm dateKey={dateKey} suggestedStart={suggestedStart} />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-clay bg-white px-4 py-6 text-center">
          <p className="text-sm text-muted">這天還沒有任何紀錄。</p>
          {prevCount > 0 && (
            <form action={copyWorkLogsAction} className="mt-3">
              <input type="hidden" name="from" value={prevKey} />
              <input type="hidden" name="to" value={dateKey} />
              <button
                type="submit"
                className="rounded-lg border border-sage-dark px-3 py-1.5 text-sm text-sage-dark transition hover:bg-gold"
              >
                複製前一天的 {prevCount} 段紀錄過來
              </button>
            </form>
          )}
        </div>
      ) : (
        <WorkLogTable rows={rows} />
      )}

      <WorkLogMonth
        monthKey={monthKey}
        selectedKey={dateKey}
        byDay={byDay}
      />
    </div>
  );
}

/** 找出預設時段內還沒被任何紀錄蓋到的空檔 */
function findGaps(
  rows: { startMin: number; endMin: number }[],
  from: number,
  to: number
): { from: number; to: number }[] {
  const sorted = [...rows].sort((a, b) => a.startMin - b.startMin);
  const gaps: { from: number; to: number }[] = [];
  let cursor = from;
  for (const r of sorted) {
    if (r.startMin > cursor) gaps.push({ from: cursor, to: Math.min(r.startMin, to) });
    cursor = Math.max(cursor, r.endMin);
    if (cursor >= to) break;
  }
  if (cursor < to) gaps.push({ from: cursor, to });
  return gaps.filter((g) => g.to > g.from);
}
