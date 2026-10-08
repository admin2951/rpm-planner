import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskTable } from "@/components/task-table";
import {
  currentWeekKey,
  shiftWeekKey,
  weekRange,
  formatWeekLabel,
  startOfWeek,
  startOfDay,
  toDateKey,
} from "@/lib/date";

/** 一頁顯示幾週 */
const WEEKS_PER_PAGE = 8;

/**
 * 完成紀錄（瑣事）。依「完成日」分週，從錨點那一週往前列，
 * 可以一直往前翻到最早的紀錄。主頁 /tasks 只留這週與上週。
 */
export default async function TaskHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const thisWeekKey = currentWeekKey();
  // 只接受 YYYY-MM-DD，而且一律對齊到該週週一，避免網址被亂塞
  const anchorKey = /^\d{4}-\d{2}-\d{2}$/.test(week ?? "")
    ? toDateKey(startOfWeek(startOfDay(week!)))
    : thisWeekKey;

  const oldestKeyInPage = shiftWeekKey(anchorKey, -(WEEKS_PER_PAGE - 1));
  const windowFrom = weekRange(oldestKeyInPage).from;
  const windowTo = weekRange(anchorKey).to;

  const chore = { resultId: null, status: "DONE" } as const;

  const [tasks, olderCount, totalDone] = await Promise.all([
    prisma.task.findMany({
      where: { ...chore, completedAt: { gte: windowFrom, lte: windowTo } },
      orderBy: [{ completedAt: "desc" }],
    }),
    prisma.task.count({
      where: { ...chore, completedAt: { lt: windowFrom } },
    }),
    prisma.task.count({ where: chore }),
  ]);

  // 依完成日所在的那一週分組（新的在前）
  const groups = new Map<string, typeof tasks>();
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const key = toDateKey(startOfWeek(t.completedAt));
    const list = groups.get(key);
    if (list) list.push(t);
    else groups.set(key, [t]);
  }
  const weekKeys = [...groups.keys()].sort().reverse();

  const newerKey = shiftWeekKey(anchorKey, WEEKS_PER_PAGE);
  const hasNewer = anchorKey !== thisWeekKey;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-ink">完成紀錄</h1>
          <Link href="/tasks" className="text-sm text-sage-dark hover:underline">
            ← 回待辦事項
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">
          平常瑣事的完成紀錄，依完成的那一週分開列。目前累計完成 {totalDone} 件。
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-clay bg-white px-4 py-2.5 text-sm">
        {olderCount > 0 ? (
          <Link
            href={`/tasks/history?week=${shiftWeekKey(anchorKey, -WEEKS_PER_PAGE)}`}
            className="text-sage-dark hover:underline"
          >
            ← 更早（還有 {olderCount} 件）
          </Link>
        ) : (
          <span className="text-muted/60">沒有更早的紀錄了</span>
        )}
        <span className="text-xs text-muted">
          {formatWeekLabel(oldestKeyInPage)} ~ {formatWeekLabel(anchorKey)}
        </span>
        {hasNewer ? (
          <Link
            href={
              newerKey >= thisWeekKey
                ? "/tasks/history"
                : `/tasks/history?week=${newerKey}`
            }
            className="text-sage-dark hover:underline"
          >
            較近 →
          </Link>
        ) : (
          <span className="text-muted/60">已經是最近的</span>
        )}
      </div>

      {weekKeys.length === 0 && (
        <p className="rounded-lg border border-clay bg-white px-3 py-4 text-sm text-muted">
          這段期間沒有完成紀錄{olderCount > 0 ? "，可以往前翻看更早的。" : "。"}
        </p>
      )}

      {weekKeys.map((key) => {
        const list = groups.get(key)!;
        return (
          <div key={key}>
            <div className="mb-1 flex items-baseline gap-2">
              <h2 className="text-sm font-semibold text-ink">
                {key === thisWeekKey
                  ? "這週完成"
                  : key === shiftWeekKey(thisWeekKey, -1)
                    ? "上週完成"
                    : "完成"}
                （{list.length}）
              </h2>
              <span className="text-xs text-muted">{formatWeekLabel(key)}</span>
            </div>
            <TaskTable tasks={list} />
          </div>
        );
      })}
    </div>
  );
}
