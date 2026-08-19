"use client";

import type { Task, TaskStatus } from "@prisma/client";
import { quickUpdateTaskAction, deleteTaskAction } from "@/app/actions/tasks";
import { toDateKey, formatShortDate } from "@/lib/date";

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "待辦",
  DOING: "進行中",
  DONE: "已完成",
};

const GRID_COLS = "grid-cols-[40px_1fr_100px_90px_140px_1fr_44px]";

function submitOnEvent(e: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.form?.requestSubmit();
}

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-clay bg-white">
      <div className={`grid ${GRID_COLS} gap-x-2 border-b border-clay/60 bg-sand/60 px-3 py-2 text-xs font-semibold text-muted`}>
        <div>順序</div>
        <div>任務</div>
        <div>狀態</div>
        <div>建立日期</div>
        <div>截止日</div>
        <div>備註</div>
        <div />
      </div>

      {tasks.length === 0 && (
        <p className="px-3 py-4 text-sm text-muted">這裡還沒有項目。</p>
      )}

      {tasks.map((t, i) => (
        <form
          key={t.id}
          action={quickUpdateTaskAction}
          className={`contents`}
        >
          <input type="hidden" name="id" value={t.id} />
          <div
            className={`grid ${GRID_COLS} col-span-full items-center gap-x-2 border-b border-clay/40 px-3 py-1.5 last:border-b-0`}
          >
            <span className="text-xs text-muted">{i + 1}</span>
            <input
              name="title"
              defaultValue={t.title}
              onBlur={submitOnEvent}
              className={
                "min-w-0 rounded border-0 bg-transparent px-1 py-1 text-sm outline-none focus:bg-sand/60 " +
                (t.status === "DONE" ? "text-muted line-through" : "text-ink")
              }
            />
            <select
              name="status"
              defaultValue={t.status}
              onChange={submitOnEvent}
              className="rounded border-0 bg-transparent px-1 py-1 text-xs text-ink outline-none focus:bg-sand/60"
            >
              {(["TODO", "DOING", "DONE"] as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted">{formatShortDate(t.createdAt)}</span>
            <input
              type="date"
              name="dueDate"
              defaultValue={t.dueDate ? toDateKey(t.dueDate) : ""}
              onChange={submitOnEvent}
              className="rounded border-0 bg-transparent px-1 py-1 text-xs text-ink outline-none focus:bg-sand/60"
            />
            <input
              name="notes"
              defaultValue={t.notes ?? ""}
              placeholder="備註"
              onBlur={submitOnEvent}
              className="min-w-0 rounded border-0 bg-transparent px-1 py-1 text-xs text-muted outline-none placeholder:text-muted/60 focus:bg-sand/60"
            />
            <button
              type="submit"
              formAction={deleteTaskAction}
              onClick={(e) => {
                if (!window.confirm("刪除這個項目？")) e.preventDefault();
              }}
              className="justify-self-center text-xs text-muted hover:text-red-600"
            >
              刪除
            </button>
          </div>
        </form>
      ))}
    </div>
  );
}
