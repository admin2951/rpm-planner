import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResultEditForm } from "@/components/result-edit-form";
import { NewTaskForm } from "@/components/new-task-form";
import { TaskItem } from "@/components/task-item";

export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, allResults] = await Promise.all([
    prisma.result.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: [
            { dueDate: { sort: "asc", nulls: "last" } },
            { order: "asc" },
            { createdAt: "asc" },
          ],
          include: { deliverables: { orderBy: { order: "asc" } } },
        },
      },
    }),
    prisma.result.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  if (!result) notFound();

  return (
    <div className="space-y-6">
      <Link href="/results" className="text-sm text-muted hover:text-ink">
        ← 回 RPM 列表
      </Link>

      <ResultEditForm result={result} />

      <div>
        <h2 className="text-sm font-semibold text-muted">M・大規模行動計畫（MAP）</h2>
        <p className="mb-3 mt-0.5 text-xs text-muted">
          要達成這個結果，你必須採取哪些具體行動？
        </p>
        <div className="space-y-2">
          {result.tasks.length === 0 && (
            <p className="text-sm text-muted">還沒有行動項目，在下面新增第一步。</p>
          )}
          {result.tasks.map((t) => (
            <TaskItem key={t.id} task={t} results={allResults} />
          ))}
        </div>
        <div className="mt-4">
          <NewTaskForm resultId={result.id} />
        </div>
      </div>
    </div>
  );
}
