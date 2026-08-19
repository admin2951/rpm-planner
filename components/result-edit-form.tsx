"use client";

import { useActionState, useState } from "react";
import type { Result, ResultStatus } from "@prisma/client";
import { updateResultAction, deleteResultAction } from "@/app/actions/results";
import type { ActionState } from "@/app/actions/auth";
import { FormRow, TextInput, TextArea, Select } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { toDateKey, formatDeadline, daysUntil } from "@/lib/date";

const STATUS_LABEL: Record<ResultStatus, string> = {
  ACTIVE: "進行中",
  DONE: "已完成",
  ARCHIVED: "已封存",
};

export function ResultEditForm({ result }: { result: Result }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateResultAction,
    {}
  );

  if (!editing) {
    return (
      <div className="rounded-lg border border-clay bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-sage-dark">
              {STATUS_LABEL[result.status]}
            </span>
            <p className="mt-1 text-xs font-semibold text-sage-dark">R・成果</p>
            <h1 className="text-xl font-semibold text-ink">{result.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg border border-clay px-3 py-1.5 text-sm text-ink hover:bg-sand"
          >
            編輯
          </button>
        </div>
        {result.purpose && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-sage-dark">P・理由</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted">{result.purpose}</p>
          </div>
        )}
        {result.targetDate && (
          <p className={"mt-3 text-xs " + (daysUntil(result.targetDate) <= 0 ? "font-medium text-red-600" : "text-muted")}>
            時間：{toDateKey(result.createdAt)} 建立 → {toDateKey(result.targetDate)} 截止
            （共 {Math.max(0, Math.round((result.targetDate.getTime() - result.createdAt.getTime()) / 86400000))} 天，{formatDeadline(result.targetDate)}）
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-sage-dark/40 bg-sand/40 p-5">
      <form action={formAction} className="space-y-3">
        <FormMessage state={state} />
        <input type="hidden" name="id" value={result.id} />
        <FormRow label="R・成果（Result）" required>
          <TextInput name="title" defaultValue={result.title} required />
        </FormRow>
        <FormRow label="P・理由（Purpose）">
          <TextArea
            name="purpose"
            defaultValue={result.purpose ?? ""}
            rows={3}
            placeholder="為什麼你想要這個？什麼樣的情感動力會讓你堅持到底？"
          />
        </FormRow>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="時間・預計多久內完成">
            <TextInput
              type="date"
              name="targetDate"
              defaultValue={result.targetDate ? toDateKey(result.targetDate) : ""}
            />
          </FormRow>
          <FormRow label="狀態">
            <Select name="status" defaultValue={result.status}>
              {(["ACTIVE", "DONE", "ARCHIVED"] as ResultStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </FormRow>
        </div>
        <div className="flex justify-end gap-2 pt-1">
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

      <form
        action={deleteResultAction}
        onSubmit={(e) => {
          if (!window.confirm(`刪除「${result.title}」？底下的行動項目會變成未掛 RPM 條目的待辦事項，不會被刪除。`))
            e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={result.id} />
        <button type="submit" className="text-xs text-muted hover:text-red-600">
          刪除這個 RPM 條目
        </button>
      </form>
    </div>
  );
}
