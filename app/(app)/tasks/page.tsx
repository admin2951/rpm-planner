import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { QuickCapture } from "@/components/quick-capture";
import { TaskTable } from "@/components/task-table";
import {
  currentWeekKey,
  shiftWeekKey,
  weekRange,
  formatWeekLabel,
  startOfDay,
  todayKey,
} from "@/lib/date";

/**
 * 依狀態篩選時會跨所有週次列出來，
 * 這樣總覽點進來就不會因為事情排在別週而看不到。
 */
const VIEWS = [
  { key: "week", label: "依週次" },
  { key: "todo", label: "未完成" },
  { key: "doing", label: "進行中" },
  { key: "overdue", label: "逾期" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

/**
 * 篩選時「不分週次，也包含 RPM 底下的行動項目」——
 * 總覽上的數字就是這些，點進來才不會對不起來。
 */
function filterFor(view: Exclude<ViewKey, "week">): Prisma.TaskWhereInput {
  const today = startOfDay(todayKey());
  if (view === "doing") return { status: "DOING" };
  if (view === "overdue") {
    return { status: { not: "DONE" }, dueDate: { lt: today } };
  }
  return { status: { not: "DONE" } };
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; view?: string }>;
}) {
  const { week, view: viewRaw } = await searchParams;
  const view: ViewKey = VIEWS.some((v) => v.key === viewRaw)
    ? (viewRaw as ViewKey)
    : "week";

  const weekKey = week || currentWeekKey();
  const { from, to } = weekRange(weekKey);

  const filtered =
    view === "week"
      ? []
      : await prisma.task.findMany({
          where: filterFor(view),
          include: { result: { select: { id: true, title: true } } },
          orderBy: [
            { dueDate: { sort: "asc", nulls: "last" } },
            { order: "asc" },
            { createdAt: "asc" },
          ],
        });

  const [overdue, weekTasks, unscheduled] =
    view === "week"
      ? await Promise.all([
          // 這一週之前還沒完成的：一週一週翻的時候才不會把前面漏掉的事情埋在後面
          prisma.task.findMany({
            where: {
              resultId: null,
              status: { not: "DONE" },
              dueDate: { lt: from },
            },
            orderBy: [{ dueDate: "asc" }, { order: "asc" }, { createdAt: "asc" }],
          }),
          prisma.task.findMany({
            where: { resultId: null, dueDate: { gte: from, lte: to } },
            orderBy: [{ dueDate: "asc" }, { order: "asc" }, { createdAt: "asc" }],
          }),
          prisma.task.findMany({
            where: { resultId: null, dueDate: null },
            orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          }),
        ])
      : [[], [], []];

  const activeLabel = VIEWS.find((v) => v.key === view)!.label;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">待辦事項</h1>
        <p className="mt-1 text-sm text-muted">
          平常瑣碎雜事的待辦事項，隨手改任何一格就會自動存檔。
        </p>
      </div>

      <QuickCapture placeholder="隨手記下任何想法或代辦（之後可再設定截止日）…" />

      <div className="flex flex-wrap gap-1.5 border-b border-clay/60 pb-3">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={v.key === "week" ? "/tasks" : `/tasks?view=${v.key}`}
            className={
              "rounded-full px-3 py-1.5 text-sm transition " +
              (view === v.key
                ? "bg-gold font-semibold text-forest"
                : "text-muted hover:bg-sand")
            }
          >
            {v.label}
          </Link>
        ))}
      </div>

      {view !== "week" ? (
        <div>
          <h2
            className={
              "mb-2 text-sm font-semibold " +
              (view === "overdue" ? "text-red-600" : "text-muted")
            }
          >
            {activeLabel}（{filtered.length}）
          </h2>
          <p className="mb-2 text-xs text-muted">
            不分週次，也包含 RPM 底下的行動項目，全部列出來。
          </p>
          <TaskTable tasks={filtered} showResult />
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-red-600">
                逾期未完成（{overdue.length}）
              </h2>
              <p className="mb-2 text-xs text-muted">
                這一週之前還沒完成的事情，改好截止日就會回到對應的那一週。
              </p>
              <TaskTable tasks={overdue} />
            </div>
          )}

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
        </>
      )}
    </div>
  );
}
