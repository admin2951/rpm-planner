"use client";

import { createWorkLogAction } from "@/app/actions/work-logs";
import { SubmitButton } from "@/components/submit-button";
import { formatMinutes, TIME_STEP_MIN } from "@/lib/date";

/**
 * 新增一筆時段紀錄。開始時間預設接在前一筆結束的地方，
 * 送出後 React 會自動清空欄位，可以連續記下一段。
 */
export function WorkLogAddForm({
  dateKey,
  suggestedStart,
}: {
  dateKey: string;
  suggestedStart: number;
}) {
  const start = formatMinutes(suggestedStart);
  const end = formatMinutes(Math.min(suggestedStart + 30, 23 * 60 + 55));

  return (
    <form
      key={start}
      action={createWorkLogAction}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-clay bg-white p-3"
    >
      <input type="hidden" name="date" value={dateKey} />

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">開始</span>
        <input
          type="time"
          name="start"
          step={TIME_STEP_MIN * 60}
          defaultValue={start}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">結束</span>
        <input
          type="time"
          name="end"
          step={TIME_STEP_MIN * 60}
          defaultValue={end}
          className={inputClass}
        />
      </label>

      <label className="flex min-w-[14rem] flex-1 flex-col gap-1">
        <span className="text-xs text-muted">做了什麼</span>
        <input
          name="content"
          required
          autoComplete="off"
          placeholder="例如：看診、整理叫貨單、跟工廠開會"
          className={inputClass}
        />
      </label>

      <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <span className="text-xs text-muted">備註（選填）</span>
        <input
          name="note"
          autoComplete="off"
          placeholder="補充說明"
          className={inputClass}
        />
      </label>

      <SubmitButton className="px-4 py-2 text-xs">新增紀錄</SubmitButton>
    </form>
  );
}

const inputClass =
  "rounded-lg border border-clay bg-cream/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-sage-dark focus:bg-white";
