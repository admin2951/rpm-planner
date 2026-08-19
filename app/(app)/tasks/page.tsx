import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuickCapture } from "@/components/quick-capture";
import { TaskTable } from "@/components/task-table";
import {
  currentWeekKey,
  shiftWeekKey,
  weekRange,
  formatWeekLabel,
} from "@/lib/date";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekKey = week || currentWeekKey();
  const { from, to } = weekRange(weekKey);

  const [weekTasks, unscheduled] = await Promise.all([
    prisma.task.findMany({
      where: { resultId: null, dueDate: { gte: from, lte: to } },
      orderBy: [{ dueDate: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.task.findMany({
      where: { resultId: null, dueDate: null },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">待辦事項</h1>
        <p className="mt-1 text-sm text-muted">
          平常瑣碎雜事的待辦事項，依週次排列，隨手改任何一格就會自動存檔。
        </p>
      </div>

      <QuickCapture placeholder="隨手記下任何想法或代辦（之後可再設定截止日）…" />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">{formatWeekLabel(weekKey)}</h2>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/tasks?week=${shiftWeekKey(weekKey, -1)}`}
            className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
          >
            ← 上週
          </Link>
          {weekKey !== currentWeekKey() && (
            <Link
              href="/tasks"
              className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
            >
              回本週
            </Link>
          )}
          <Link
            href={`/tasks?week=${shiftWeekKey(weekKey, 1)}`}
            className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
          >
            下週 →
          </Link>
        </div>
      </div>

      <TaskTable tasks={weekTasks} />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">未排定日期</h2>
        <TaskTable tasks={unscheduled} />
      </div>
    </div>
  );
}
