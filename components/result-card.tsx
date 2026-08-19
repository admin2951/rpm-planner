"use client";

import Link from "next/link";
import { deleteResultAction } from "@/app/actions/results";
import { formatDeadline, daysUntil } from "@/lib/date";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "進行中",
  DONE: "已完成",
  ARCHIVED: "已封存",
};

export function ResultCard({
  result,
}: {
  result: {
    id: string;
    title: string;
    purpose: string | null;
    status: string;
    targetDate: Date | null;
    done: number;
    total: number;
  };
}) {
  return (
    <div className="relative rounded-lg border border-clay bg-white p-4 transition hover:border-sage-dark/50 hover:shadow-sm">
      <Link
        href={`/results/${result.id}`}
        className="absolute inset-0 z-0"
        aria-label={result.title}
      />
      <div className="pointer-events-none relative z-[1]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink">{result.title}</p>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {STATUS_LABEL[result.status]}
          </span>
        </div>
        {result.purpose && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted">{result.purpose}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>
            M 行動 {result.done}/{result.total}
          </span>
          {result.targetDate && (
            <span className={daysUntil(result.targetDate) <= 0 ? "font-medium text-red-600" : ""}>
              {formatDeadline(result.targetDate)}
            </span>
          )}
        </div>
      </div>

      <form
        action={deleteResultAction}
        className="relative z-[2] mt-2 flex justify-end"
        onSubmit={(e) => {
          if (
            !window.confirm(
              `刪除「${result.title}」？底下的行動項目會變成未掛 RPM 條目的待辦事項，不會被刪除。`
            )
          )
            e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={result.id} />
        <button type="submit" className="text-xs text-muted hover:text-red-600">
          刪除
        </button>
      </form>
    </div>
  );
}
