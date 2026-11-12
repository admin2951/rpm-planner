import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { TaskItem } from "@/components/task-item";
import { DailyNoteEditor } from "@/components/daily-note-editor";
import {
  todayKey,
  startOfDay,
  endOfDay,
  shiftDateKey,
  formatDateLabel,
} from "@/lib/date";
import { PageTitle } from "@/components/page-title";
import { SectionTitle } from "@/components/section-title";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireUser();
  const { date } = await searchParams;
  const dateKey = date || todayKey();
  const from = startOfDay(dateKey);
  const to = endOfDay(dateKey);

  const [dueTasks, completedTasks, note, results] = await Promise.all([
    prisma.task.findMany({
      where: { dueDate: { gte: from, lte: to }, status: { not: "DONE" } },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      include: {
        result: { select: { id: true, title: true } },
        deliverables: { orderBy: { order: "asc" } },
      },
    }),
    prisma.task.findMany({
      where: { completedAt: { gte: from, lte: to } },
      orderBy: { completedAt: "desc" },
      include: {
        result: { select: { id: true, title: true } },
        deliverables: { orderBy: { order: "asc" } },
      },
    }),
    prisma.dailyNote.findUnique({ where: { date: from } }),
    prisma.result.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle en="Today">{formatDateLabel(dateKey)}</PageTitle>
          <p className="mt-1 text-sm text-muted">今日到期事項與已完成的紀錄</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/today?date=${shiftDateKey(dateKey, -1)}`}
            className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
          >
            ← 前一天
          </Link>
          {dateKey !== todayKey() && (
            <Link
              href="/today"
              className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
            >
              回今天
            </Link>
          )}
          <Link
            href={`/today?date=${shiftDateKey(dateKey, 1)}`}
            className="rounded-lg border border-clay px-3 py-1.5 text-ink hover:bg-sand"
          >
            後一天 →
          </Link>
        </div>
      </div>

      <div>
        <SectionTitle title="今日待辦" count={dueTasks.length}>到期</SectionTitle>
        <div className="space-y-2">
          {dueTasks.length === 0 && <p className="text-sm text-muted">這天沒有到期的項目。</p>}
          {dueTasks.map((t) => (
            <TaskItem key={t.id} task={t} results={results} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="今日已完成" count={completedTasks.length} />
        <div className="space-y-2">
          {completedTasks.length === 0 && (
            <p className="text-sm text-muted">這天還沒有完成的項目。</p>
          )}
          {completedTasks.map((t) => (
            <TaskItem key={t.id} task={t} results={results} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="每日心得" />
        <DailyNoteEditor dateKey={dateKey} content={note?.content ?? ""} />
      </div>
    </div>
  );
}
