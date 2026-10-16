import type { WorkLog } from "@prisma/client";
import { formatMinutes } from "@/lib/date";

/** 一天的時間軸：把每段紀錄依時間畫成色塊，一眼看出哪裡還是空的 */
export function WorkLogTimeline({
  rows,
  from,
  to,
}: {
  rows: WorkLog[];
  from: number;
  to: number;
}) {
  const span = Math.max(to - from, 1);
  const pct = (min: number) => ((min - from) / span) * 100;

  // 每兩小時一個刻度，從整點開始
  const ticks: number[] = [];
  for (let m = Math.ceil(from / 120) * 120; m <= to; m += 120) ticks.push(m);

  return (
    <div>
      <div className="relative h-11 overflow-hidden rounded-lg border border-clay bg-sand/50">
        {rows.map((r) => {
          const left = Math.max(pct(r.startMin), 0);
          const width = Math.max(pct(r.endMin) - left, 0.6);
          return (
            <div
              key={r.id}
              title={`${formatMinutes(r.startMin)}–${formatMinutes(r.endMin)} ${r.content}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              className="absolute inset-y-0 flex items-center overflow-hidden border-r border-white/30 bg-sage-dark px-1.5"
            >
              <span className="truncate text-[11px] leading-none text-cream">
                {r.content}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative mt-1 h-4">
        {ticks.map((m) => (
          <span
            key={m}
            style={{ left: `${pct(m)}%` }}
            className="absolute -translate-x-1/2 text-[10px] text-muted"
          >
            {formatMinutes(m)}
          </span>
        ))}
      </div>
    </div>
  );
}
