import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuickCapture } from "@/components/quick-capture";
import { TaskItem } from "@/components/task-item";
import { UpcomingDeadlines } from "@/components/upcoming-deadlines";
import {
  currentWeekKey,
  shiftWeekKey,
  weekRange,
  formatWeekLabel,
  formatDeadline,
  daysUntil,
} from "@/lib/date";

/**
 * 總覽＝三個問題的摘要：還有什麼沒做完 / 這週要做什麼 / 下週要做什麼。
 * 瑣事（待辦事項）和 RPM 的行動分開計數，不混成同一個數字。
 */
export default async function DashboardPage() {
  const thisWeekKey = currentWeekKey();
  const nextWeekKey = shiftWeekKey(thisWeekKey, 1);
  const thisWeek = weekRange(thisWeekKey);
  const nextWeek = weekRange(nextWeekKey);

  const open = { status: { not: "DONE" } } as const;
  const chore = { ...open, resultId: null } as const;
  const rpm = { ...open, resultId: { not: null } } as const;

  const counts = (scope: typeof chore | typeof rpm) => [
    prisma.task.count({ where: { ...scope, dueDate: { lt: thisWeek.from } } }),
    prisma.task.count({
      where: { ...scope, dueDate: { gte: thisWeek.from, lte: thisWeek.to } },
    }),
    prisma.task.count({
      where: { ...scope, dueDate: { gte: nextWeek.from, lte: nextWeek.to } },
    }),
  ];

  const [
    choreCounts,
    rpmCounts,
    activeResults,
    allResults,
    deadlineCandidates,
    needsAttention,
  ] = await Promise.all([
    Promise.all(counts(chore)),
    Promise.all(counts(rpm)),
    prisma.result.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        tasks: {
          select: { status: true, title: true, dueDate: true },
          orderBy: [
            { dueDate: { sort: "asc", nulls: "last" } },
            { order: "asc" },
            { createdAt: "asc" },
          ],
        },
      },
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
    // 逾期 + 這週到期的，全部（含 RPM 行動），讓你一眼看到該處理什麼
    prisma.task.findMany({
      where: { ...open, dueDate: { lte: thisWeek.to } },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      include: {
        result: { select: { id: true, title: true } },
        deliverables: { orderBy: { order: "asc" } },
      },
      take: 10,
    }),
  ]);

  const [choreOverdue, choreThisWeek, choreNextWeek] = choreCounts;
  const [rpmOverdue, rpmThisWeek, rpmNextWeek] = rpmCounts;

  const upcoming = deadlineCandidates.filter(
    (r) => r.targetDate && daysUntil(r.targetDate) <= 14
  ) as { id: string; title: string; targetDate: Date }[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">總覽</h1>
        <p className="mt-1 text-sm text-muted">
          還有什麼沒做完、這週要做什麼、下週要做什麼。
        </p>
      </div>

      <UpcomingDeadlines results={upcoming} />

      <QuickCapture />

      <div className="overflow-hidden rounded-lg border border-clay bg-white">
        <div className="grid grid-cols-[1fr_repeat(3,90px)] gap-x-2 border-b border-clay/60 bg-sand/60 px-4 py-2 text-xs font-semibold text-muted">
          <div />
          <div className="text-right">還沒做完</div>
          <div className="text-right">這週</div>
          <div className="text-right">下週</div>
        </div>
        <SummaryRow
          label="待辦事項"
          sublabel="平常的瑣事"
          href="/tasks"
          overdue={choreOverdue}
          thisWeek={choreThisWeek}
          nextWeek={choreNextWeek}
        />
        <SummaryRow
          label="RPM"
          sublabel="專案底下的行動"
          href="/results"
          overdue={rpmOverdue}
          thisWeek={rpmThisWeek}
          nextWeek={rpmNextWeek}
        />
      </div>
      <p className="-mt-6 text-xs text-muted">
        這週：{formatWeekLabel(thisWeekKey)}　下週：{formatWeekLabel(nextWeekKey)}
      </p>

      {needsAttention.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted">
            需要處理（逾期與這週到期）
          </h2>
          <div className="space-y-2">
            {needsAttention.map((t) => (
              <TaskItem key={t.id} task={t} results={allResults} />
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
        {activeResults.length === 0 && (
          <p className="text-sm text-muted">還沒有進行中的 RPM 條目，到「RPM」頁新增一個吧。</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {activeResults.map((r) => {
            const done = r.tasks.filter((t) => t.status === "DONE").length;
            const total = r.tasks.length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            const next = r.tasks.find((t) => t.status !== "DONE");
            return (
              <Link
                key={r.id}
                href={`/results/${r.id}`}
                className="rounded-lg border border-clay bg-white p-4 hover:border-sage-dark/50 hover:shadow-sm"
              >
                <p className="text-sm font-medium text-ink">{r.title}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    進度 {done}/{total}（{percent}%）
                  </span>
                  {r.targetDate && (
                    <span className={daysUntil(r.targetDate) <= 0 ? "font-medium text-red-600" : ""}>
                      {formatDeadline(r.targetDate)}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-sage-dark"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 truncate text-xs text-muted">
                  下一步：{next ? next.title : total === 0 ? "還沒有行動項目" : "都完成了"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  sublabel,
  href,
  overdue,
  thisWeek,
  nextWeek,
}: {
  label: string;
  sublabel: string;
  href: string;
  overdue: number;
  thisWeek: number;
  nextWeek: number;
}) {
  return (
    <Link
      href={href}
      className="grid grid-cols-[1fr_repeat(3,90px)] items-center gap-x-2 border-b border-clay/40 px-4 py-3 transition last:border-b-0 hover:bg-sand/40"
    >
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-muted">{sublabel}</p>
      </div>
      <p
        className={
          "text-right text-xl font-semibold " +
          (overdue > 0 ? "text-red-600" : "text-muted/50")
        }
      >
        {overdue}
      </p>
      <p
        className={
          "text-right text-xl font-semibold " +
          (thisWeek > 0 ? "text-sage-dark" : "text-muted/50")
        }
      >
        {thisWeek}
      </p>
      <p
        className={
          "text-right text-xl font-semibold " +
          (nextWeek > 0 ? "text-ink" : "text-muted/50")
        }
      >
        {nextWeek}
      </p>
    </Link>
  );
}
