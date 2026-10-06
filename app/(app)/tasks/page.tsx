import { prisma } from "@/lib/prisma";
import { QuickCapture } from "@/components/quick-capture";
import { TaskTable } from "@/components/task-table";
import { currentWeekKey, shiftWeekKey, weekRange, formatWeekLabel } from "@/lib/date";

/**
 * 這一頁只放「平常的瑣事」——不含 RPM 底下的行動項目（那些在 RPM 頁看）。
 * 分區直接對應三個問題：還有什麼沒做完 / 這週要做什麼 / 下週要做什麼。
 */
export default async function TasksPage() {
  const thisWeekKey = currentWeekKey();
  const nextWeekKey = shiftWeekKey(thisWeekKey, 1);
  const thisWeek = weekRange(thisWeekKey);
  const nextWeek = weekRange(nextWeekKey);

  const chore = { resultId: null } as const;
  const open = { ...chore, status: { not: "DONE" } } as const;
  const byDue = [
    { dueDate: "asc" as const },
    { order: "asc" as const },
    { createdAt: "asc" as const },
  ];

  const [overdue, thisWeekTasks, nextWeekTasks, later, unscheduled, recentlyDone] =
    await Promise.all([
      prisma.task.findMany({
        where: { ...open, dueDate: { lt: thisWeek.from } },
        orderBy: byDue,
      }),
      prisma.task.findMany({
        where: { ...open, dueDate: { gte: thisWeek.from, lte: thisWeek.to } },
        orderBy: byDue,
      }),
      prisma.task.findMany({
        where: { ...open, dueDate: { gte: nextWeek.from, lte: nextWeek.to } },
        orderBy: byDue,
      }),
      prisma.task.findMany({
        where: { ...open, dueDate: { gt: nextWeek.to } },
        orderBy: byDue,
      }),
      prisma.task.findMany({
        where: { ...open, dueDate: null },
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.task.findMany({
        where: { ...chore, status: "DONE" },
        orderBy: [{ completedAt: "desc" }],
        take: 10,
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">待辦事項</h1>
        <p className="mt-1 text-sm text-muted">
          平常的瑣事。改任何一格都會自動存檔；改截止日就會自動換到對應的區塊。
        </p>
      </div>

      <QuickCapture placeholder="隨手記下任何想法或代辦（之後可再設定截止日）…" />

      <Section
        title="還沒做完"
        count={overdue.length}
        hint="截止日已經過了，還沒打勾完成"
        tone="danger"
        tasks={overdue}
      />

      <Section
        title="這週"
        subtitle={formatWeekLabel(thisWeekKey)}
        count={thisWeekTasks.length}
        tasks={thisWeekTasks}
        emptyHint="這週沒有排定的事情。"
      />

      <Section
        title="下週"
        subtitle={formatWeekLabel(nextWeekKey)}
        count={nextWeekTasks.length}
        tasks={nextWeekTasks}
        emptyHint="下週還沒有排定的事情。"
      />

      {later.length > 0 && (
        <Section title="更之後" count={later.length} tasks={later} />
      )}

      <Section
        title="未排定日期"
        count={unscheduled.length}
        hint="還沒決定什麼時候做"
        tasks={unscheduled}
      />

      {recentlyDone.length > 0 && (
        <Section title="最近完成" count={recentlyDone.length} tasks={recentlyDone} />
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  hint,
  count,
  tasks,
  tone,
  emptyHint,
}: {
  title: string;
  subtitle?: string;
  hint?: string;
  count: number;
  tasks: Parameters<typeof TaskTable>[0]["tasks"];
  tone?: "danger";
  emptyHint?: string;
}) {
  if (count === 0 && !emptyHint) return null;

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <h2
          className={
            "text-sm font-semibold " +
            (tone === "danger" ? "text-red-600" : "text-ink")
          }
        >
          {title}（{count}）
        </h2>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {count === 0 ? (
        <p className="rounded-lg border border-clay bg-white px-3 py-4 text-sm text-muted">
          {emptyHint}
        </p>
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
}
