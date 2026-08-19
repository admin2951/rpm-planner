"use client";

import { useActionState } from "react";
import { upsertDailyNoteAction } from "@/app/actions/daily-notes";
import type { ActionState } from "@/app/actions/auth";
import { TextArea } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function DailyNoteEditor({
  dateKey,
  content,
}: {
  dateKey: string;
  content: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    upsertDailyNoteAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-clay bg-white p-4">
      <FormMessage state={state} />
      <input type="hidden" name="date" value={dateKey} />
      <TextArea
        name="content"
        defaultValue={content}
        rows={5}
        placeholder="今天完成了什麼？有什麼心得或反思？"
      />
      <div className="flex justify-end">
        <SubmitButton>儲存今日紀錄</SubmitButton>
      </div>
    </form>
  );
}
