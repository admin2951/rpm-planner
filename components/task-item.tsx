"use client";

import { useActionState, useState } from "react";
import type { Priority, Task, TaskStatus } from "@prisma/client";
import {
  toggleTaskDoneAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/app/actions/tasks";
import type { ActionState } from "@/app/actions/auth";
import { FormRow, TextInput, TextArea, Select } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { PriorityBadge } from "@/components/priority-badge";
import { formatShortDate, toDateKey } from "@/lib/date";

type TaskWithResult = Task & { result?: { id: string; title: string } | null };

export function TaskItem({
  task,
  results = [],
  showResult = false,
  showMeta = false,
}: {
  task: TaskWithResult;
  results?: { id: string; title: string }[];
  showResult?: boolean;
  showMeta?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateTaskAction,
    {}
  );
  const done = task.status === "DONE";

  return (
    <div className="rounded-lg border border-clay/60 bg-white">
      <div className="flex items-start gap-3 px-3.5 py-3">
        <form action={toggleTaskDoneAction} className="mt-0.5">
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            aria-label={done ? "標記為未完成" : "標記為完成"}
            className={
              "flex h-5 w-5 items-center justify-center rounded-full border text-xs transition " +
              (done
                ? "border-sage-dark bg-sage-dark text-cream"
                : "border-clay text-transparent hover:border-sage-dark")
            }
          >
            ✓
          </button>
        </form>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={
              "truncate text-sm " +
              (done ? "text-muted line-through" : "text-ink")
            }
          >
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && <span>截止 {formatShortDate(task.dueDate)}</span>}
            {showMeta && <span>建立於 {formatShortDate(task.createdAt)}</span>}
            {showResult && task.result && (
              <span className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5">
                R：{task.result.title}
              </span>
            )}
          </div>
          {showMeta && task.notes && (
            <p className="mt-1 truncate text-xs text-muted">備註：{task.notes}</p>
          )}
        </button>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded px-1.5 py-1 text-xs text-sage-dark hover:underline"
        >
          編輯
        </button>

        <form
          action={deleteTaskAction}
          onSubmit={(e) => {
            if (!window.confirm("刪除這個項目？")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className="rounded px-1.5 py-1 text-xs text-muted hover:text-red-600"
          >
            刪除
          </button>
        </form>
      </div>

      {editing && (
        <form
          action={formAction}
          className="space-y-3 border-t border-clay/40 bg-sand/40 px-3.5 py-3.5"
        >
          <FormMessage state={state} />
          <input type="hidden" name="id" value={task.id} />
          <FormRow label="內容" required>
            <TextInput name="title" defaultValue={task.title} required />
          </FormRow>
          <FormRow label="備註">
            <TextArea name="notes" defaultValue={task.notes ?? ""} rows={2} />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="優先順序">
              <Select name="priority" defaultValue={task.priority}>
                {(["MUST", "SHOULD", "COULD"] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {{ MUST: "必須", SHOULD: "應該", COULD: "可以" }[p]}
                  </option>
                ))}
              </Select>
            </FormRow>
            <FormRow label="狀態">
              <Select name="status" defaultValue={task.status}>
                {(["TODO", "DOING", "DONE"] as TaskStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {{ TODO: "待辦", DOING: "進行中", DONE: "已完成" }[s]}
                  </option>
                ))}
              </Select>
            </FormRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="截止日期">
              <TextInput
                type="date"
                name="dueDate"
                defaultValue={task.dueDate ? toDateKey(task.dueDate) : ""}
              />
            </FormRow>
            <FormRow label="掛在 RPM 條目底下">
              <Select name="resultId" defaultValue={task.resultId ?? ""}>
                <option value="">（不掛，留在待辦事項）</option>
                {results.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </Select>
            </FormRow>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-clay px-4 py-2 text-sm text-muted hover:bg-white"
            >
              取消
            </button>
            <SubmitButton>儲存</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
