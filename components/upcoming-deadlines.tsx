import Link from "next/link";
import { daysUntil, formatDeadline } from "@/lib/date";

export function UpcomingDeadlines({
  results,
}: {
  results: { id: string; title: string; targetDate: Date }[];
}) {
  if (results.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-clay bg-white px-3 py-2.5">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="shrink-0 text-xs font-semibold text-muted">⏰ 即將到期</span>
        {results.map((r) => {
          const days = daysUntil(r.targetDate);
          const urgent = days <= 0;
          const soon = days > 0 && days <= 3;
          return (
            <Link
              key={r.id}
              href={`/results/${r.id}`}
              className={
                "shrink-0 rounded-full px-3 py-1 text-xs transition hover:opacity-80 " +
                (urgent
                  ? "bg-red-50 text-red-700"
                  : soon
                    ? "bg-gold text-forest"
                    : "bg-sand text-ink")
              }
            >
              {r.title}・{formatDeadline(r.targetDate)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
