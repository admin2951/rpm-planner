import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResultCreatePanel } from "@/components/result-create-panel";
import { UpcomingDeadlines } from "@/components/upcoming-deadlines";
import { ResultCard } from "@/components/result-card";
import { daysUntil } from "@/lib/date";
import type { ResultStatus } from "@prisma/client";

const TABS: { key: string; label: string }[] = [
  { key: "ACTIVE", label: "進行中" },
  { key: "DONE", label: "已完成" },
  { key: "ARCHIVED", label: "已封存" },
  { key: "ALL", label: "全部" },
];

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusRaw } = await searchParams;
  const activeTab = TABS.some((t) => t.key === statusRaw) ? statusRaw! : "ACTIVE";

  const [results, deadlineCandidates] = await Promise.all([
    prisma.result.findMany({
      where: activeTab === "ALL" ? {} : { status: activeTab as ResultStatus },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { tasks: { select: { id: true, status: true } } },
    }),
    prisma.result.findMany({
      where: { status: "ACTIVE", targetDate: { not: null } },
      orderBy: { targetDate: "asc" },
      select: { id: true, title: true, targetDate: true },
      take: 10,
    }),
  ]);

  const upcoming = deadlineCandidates.filter(
    (r) => r.targetDate && daysUntil(r.targetDate) <= 14
  ) as { id: string; title: string; targetDate: Date }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">RPM</h1>
        <div className="mt-2 grid gap-1.5 text-sm text-muted sm:grid-cols-3">
          <p>
            <span className="font-semibold text-sage-dark">R・成果</span>：你要達成的具體、可衡量結果
          </p>
          <p>
            <span className="font-semibold text-sage-dark">P・理由</span>：為什麼你想要這個
          </p>
          <p>
            <span className="font-semibold text-sage-dark">M・行動計畫</span>：要做哪些具體行動
          </p>
        </div>
      </div>

      <UpcomingDeadlines results={upcoming} />

      <ResultCreatePanel />

      <div className="flex flex-wrap gap-1.5 border-b border-clay/60 pb-3">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ACTIVE" ? "/results" : `/results?status=${t.key}`}
            className={
              "rounded-full px-3 py-1.5 text-sm transition " +
              (activeTab === t.key
                ? "bg-gold font-semibold text-forest"
                : "text-muted hover:bg-sand")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((r) => {
          const done = r.tasks.filter((t) => t.status === "DONE").length;
          const total = r.tasks.length;
          return (
            <ResultCard
              key={r.id}
              result={{
                id: r.id,
                title: r.title,
                purpose: r.purpose,
                status: r.status,
                targetDate: r.targetDate,
                done,
                total,
              }}
            />
          );
        })}
      </div>
      {results.length === 0 && (
        <p className="text-sm text-muted">
          {activeTab === "ACTIVE" ? "還沒有任何 RPM 條目，先新增一個吧。" : "這個狀態目前沒有條目。"}
        </p>
      )}
    </div>
  );
}
