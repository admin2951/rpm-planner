"use client";

import type { WorkLog } from "@prisma/client";
import {
  updateWorkLogAction,
  deleteWorkLogAction,
} from "@/app/actions/work-logs";
import { formatMinutes, formatDuration, timeOptions } from "@/lib/date";

const COLS = "grid-cols-[86px_14px_86px_1fr_minmax(0,14rem)_76px_40px]";
const OPTIONS = timeOptions();

function submitOnEvent(
  e: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>
) {
  e.currentTarget.form?.requestSubmit();
}

const cellClass =
  "w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-ink outline-none transition hover:border-clay focus:border-sage-dark focus:bg-white";

export function WorkLogTable({ rows }: { rows: WorkLog[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-clay bg-white">
      <div
        className={`grid ${COLS} items-center gap-x-2 border-b border-clay/60 bg-sand/60 px-3 py-2 text-xs font-medium text-muted`}
      >
        <div>開始</div>
        <div />
        <div>結束</div>
        <div>做了什麼</div>
        <div>備註</div>
        <div className="text-right">時長</div>
        <div />
      </div>

      {rows.map((row) => (
        <form
          key={row.id}
          action={updateWorkLogAction}
          className={`grid ${COLS} items-center gap-x-2 border-b border-clay/40 px-3 py-1.5 last:border-b-0 hover:bg-sand/30`}
        >
          <input type="hidden" name="id" value={row.id} />

          <select
            name="start"
            defaultValue={formatMinutes(row.startMin)}
            onChange={submitOnEvent}
            className={cellClass + " cursor-pointer"}
          >
            {withValue(OPTIONS, formatMinutes(row.startMin)).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="text-center text-xs text-muted">–</span>
          <select
            name="end"
            defaultValue={formatMinutes(row.endMin)}
            onChange={submitOnEvent}
            className={cellClass + " cursor-pointer"}
          >
            {withValue(OPTIONS, formatMinutes(row.endMin)).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            name="content"
            defaultValue={row.content}
            onBlur={submitOnEvent}
            className={cellClass}
          />
          <input
            name="note"
            defaultValue={row.note ?? ""}
            placeholder="—"
            onBlur={submitOnEvent}
            className={cellClass + " placeholder:text-muted/50"}
          />

          <span className="text-right text-xs text-muted">
            {formatDuration(Math.max(row.endMin - row.startMin, 0))}
          </span>

          <button
            type="submit"
            formAction={deleteWorkLogAction}
            onClick={(e) => {
              if (!window.confirm(`刪除「${row.content}」這筆紀錄？`))
                e.preventDefault();
            }}
            className="justify-self-center rounded px-1.5 py-1 text-xs text-muted transition hover:bg-red-50 hover:text-red-600"
            title="刪除"
          >
            ✕
          </button>
        </form>
      ))}
    </div>
  );
}

/** 既有紀錄若不是整點或半點（例如手動改過），也要出現在選單裡 */
function withValue(options: string[], value: string): string[] {
  if (options.includes(value)) return options;
  return [...options, value].sort();
}
