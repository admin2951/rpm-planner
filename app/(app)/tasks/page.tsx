import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { QuickCapture } from "@/components/quick-capture";
import { TaskTable } from "@/components/task-table";
import { TaskMonth, type TaskDay } from "@/components/task-month";
import {
  currentWeekKey,
  shiftWeekKey,
  weekRange,
  formatWeekLabel,
  taipeiTodayKey,
  monthKeyOf,
  monthRange,
  shiftMonthKey,
  dateKeyToUtcDay,
  utcDayToKey,
  shiftDateKey,
  formatDayLabel,
} from "@/lib/date";

/**
 * 這一頁只放「平常的瑣事」——不含 RPM 底下的行動項目（那些在 RPM 頁看）。
 * 分區直接對應三個問題：還有什麼沒做完 / 這週要做什麼 / 下週要做什麼，
 * 後面再接這週與上週的完成紀錄；更早的在 /tasks/history。
 */
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; month?: string }>;
}) {
  await requireUser();
  const { day, month } = await searchParams;
  // 月曆：截止日存成 UTC 午夜（new Date("YYYY-MM-DD")），所以這裡也一律用 UTC 日期比對
  const today = taipeiTodayKey();
  const selectedKey = /^\d{4}-\d{2}-\d{2}$/.test(day ?? "") ? day! : today;
  const monthKey = /^\d{4}-\d{2}$/.test(month ?? "") ? month! : monthKeyOf(selectedKey);
  const monthFrom = monthRange(monthKey).from;
  const monthTo = monthRange(shiftMonthKey(monthKey, 1)).from;
  const dayFrom = dateKeyToUtcDay(selectedKey);
  const dayTo = dateKeyToUtcDay(shiftDateKey(selectedKey, 1));

  const thisWeekKey = currentWeekKey();
  const nextWeekKey = shiftWeekKey(thisWeekKey, 1);
  const lastWeekKey = shiftWeekKey(thisWeekKey, -1);
  const thisWeek = weekRange(thisWeekKey);
  const nextWeek = weekRange(nextWeekKey);
  const lastWeek = weekRange(lastWeekKey);

  const chore = { resultId: null } as const;
  const open = { ...chore, status: { not: "DONE" } } as const;
  const byDue = [
    { dueDate: "asc" as const },
    { order: "asc" as const },
    { createdAt: "asc" as const },
  ];

  const [
    monthTasks,
    dayTasks,
    overdue,
    thisWeekTasks,
    nextWeekTasks,
    later,
    unscheduled,
    doneRecent,
  ] = await Promise.all([
      // 月曆與當天清單只放還沒做完的：打勾完成就從這裡消失（完成的看下方「這週完成」）
      prisma.task.findMany({
        where: { ...open, dueDate: { gte: monthFrom, lt: monthTo } },
        select: { title: true, dueDate: true },
        orderBy: byDue,
      }),
      prisma.task.findMany({
        where: { ...open, dueDate: { gte: dayFrom, lt: dayTo } },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
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
      // 完成紀錄用「完成日」分組，不是截止日：上週到期、這週才做完的算這週
      prisma.task.findMany({
        where: {
          ...chore,
          status: "DONE",
          completedAt: { gte: lastWeek.from, lte: thisWeek.to },
        },
        orderBy: [{ completedAt: "desc" }],
      }),
    ]);

  const doneThisWeek = doneRecent.filter(
    (t) => t.completedAt && t.completedAt >= thisWeek.from
  );
  const doneLastWeek = doneRecent.filter(
    (t) => t.completedAt && t.completedAt < thisWeek.from
  );

  // 月曆每一格：當天截止、還沒做完的事
  const byDay = new Map<string, TaskDay>();
  for (const t of monthTasks) {
    if (!t.dueDate) continue;
    const key = utcDayToKey(t.dueDate);
    const list = byDay.get(key) ?? [];
    list.push({ title: t.title });
    byDay.set(key, list);
  }

  const dayTitle =
    selectedKey === today ? `今天要完成的事` : `${formatDayLabel(selectedKey)}要完成的事`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-ink">待辦事項</h1>
        <p className="mt-1 text-sm text-muted">
          平常的瑣事。改任何一格都會自動存檔；改截止日就會自動換到對應的區塊。
        </p>
      </div>

      <TaskMonth
        monthKey={monthKey}
        selectedKey={selectedKey}
        todayKey={today}
        byDay={byDay}
      />

      <div>
        <div className="mb-1 flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-ink">
            {dayTitle}（{dayTasks.length}）
          </h2>
          {selectedKey === today && (
            <span className="text-xs text-muted">{formatDayLabel(selectedKey)}</span>
          )}
        </div>
        {dayTasks.length === 0 ? (
          <p className="rounded-lg border border-clay bg-white px-3 py-3 text-sm text-muted">
            這天沒有還沒做完的事情。
          </p>
        ) : (
          <TaskTable tasks={dayTasks} />
        )}
      </div>

      <QuickCapture placeholder="隨手記下任何想法或代辦（之後可再設定截止日）…" />

      <Section
        title="還沒做完"
        count={overdue.length}
        hint="截止日已經過了，還沒打勾完成"
        tone="danger"
        tasks={overdue}
        emptyHint="都跟上了，沒有逾期的事情。"
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
        emptyHint="沒有待排定的事情。"
      />

      <Section
        title="這週完成"
        subtitle={formatWeekLabel(thisWeekKey)}
        count={doneThisWeek.length}
        tasks={doneThisWeek}
        emptyHint="這週還沒完成任何事。"
      />

      <Section
        title="上週完成"
        subtitle={formatWeekLabel(lastWeekKey)}
        count={doneLastWeek.length}
        tasks={doneLastWeek}
        emptyHint="上週沒有完成紀錄。"
      />

      <div>
        <Link
          href="/tasks/history"
          className="text-sm text-sage-dark hover:underline"
        >
          看更早的完成紀錄 →
        </Link>
      </div>
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
            (tone === "danger" && count > 0 ? "text-red-600" : "text-ink")
          }
        >
          {title}（{count}）
        </h2>
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>
      {hint && count > 0 && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {count === 0 ? (
        <p className="rounded-lg border border-clay bg-white px-3 py-3 text-sm text-muted">
          {emptyHint}
        </p>
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
}
