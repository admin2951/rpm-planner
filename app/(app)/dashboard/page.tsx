import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuickCapture } from "@/components/quick-capture";
import { TaskItem } from "@/components/task-item";
import { UpcomingDeadlines } from "@/components/upcoming-deadlines";
import { startOfDay, endOfDay, todayKey, formatDeadline, daysUntil } from "@/lib/date";

export default async function DashboardPage() {
  const dateKey = todayKey();
  const from = startOfDay(dateKey);
  const to = endOfDay(dateKey);

  const [overdueAndToday, inboxCount, results, results2, deadlineCandidates] = await Promise.all([
    prisma.task.findMany({
      where: { dueDate: { lte: to }, status: { not: "DONE" } },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      include: { result: { select: { id: true, title: true } } },
      take: 10,
    }),
    prisma.task.count({ where: { resultId: null, status: { not: "DONE" } } }),
    prisma.result.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { tasks: { select: { status: true } } },
    }),
    prisma.result.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.result.findMany({
      where: { status: "ACTIVE", targetDate: { not: null } },
      orderBy: { targetDate: "asc" },
      select: { id: true, title: true, targetDate: true },
      take: 10,
    }),
  ]);

  const overdue = overdueAndToday.filter((t) => t.dueDate && t.dueDate < from);
  const dueToday = overdueAndToday.filter((t) => t.dueDate && t.dueDate >= from);
  const upcoming = deadlineCandidates.filter(
    (r) => r.targetDate && daysUntil(r.targetDate) <= 14
  ) as { id: string; title: string; targetDate: Date }[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">總覽</h1>
        <p className="mt-1 text-sm text-muted">隨手記下任何想法，或看看今天該做什麼。</p>
      </div>

      <UpcomingDeadlines results={upcoming} />

      <QuickCapture />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/tasks"
          className="rounded-lg border border-clay bg-white p-4 hover:border-sage-dark/50"
        >
          <p className="text-2xl font-semibold text-sage-dark">{inboxCount}</p>
          <p className="mt-1 text-sm text-muted">未完成的待辦事項</p>
        </Link>
        <div className="rounded-lg border border-clay bg-white p-4">
          <p className="text-2xl font-semibold text-red-600">{overdue.length}</p>
          <p className="mt-1 text-sm text-muted">已過期</p>
        </div>
        <Link
          href="/today"
          className="rounded-lg border border-clay bg-white p-4 hover:border-sage-dark/50"
        >
          <p className="text-2xl font-semibold text-sage-dark">{dueToday.length}</p>
          <p className="mt-1 text-sm text-muted">今天到期</p>
        </Link>
      </div>

      {(overdue.length > 0 || dueToday.length > 0) && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted">需要處理</h2>
          <div className="space-y-2">
            {[...overdue, ...dueToday].map((t) => (
              <TaskItem key={t.id} task={t} results={results2} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">進行中的 RPM</h2>
          <Link href="/results" className="text-xs text-sage-dark hover:underline">
            查看全部
          </Link>
        </div>
        {results.length === 0 && (
          <p className="text-sm text-muted">還沒有進行中的 RPM 條目，到「RPM」頁新增一個吧。</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((r) => {
            const done = r.tasks.filter((t) => t.status === "DONE").length;
            const total = r.tasks.length;
            return (
              <Link
                key={r.id}
                href={`/results/${r.id}`}
                className="rounded-lg border border-clay bg-white p-4 hover:border-sage-dark/50 hover:shadow-sm"
              >
                <p className="text-xs font-semibold text-sage-dark">R</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{r.title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    M 行動 {done}/{total}
                  </span>
                  {r.targetDate && (
                    <span className={daysUntil(r.targetDate) <= 0 ? "font-medium text-red-600" : ""}>
                      {formatDeadline(r.targetDate)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
