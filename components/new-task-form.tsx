"use client";

import { useActionState, useRef, useEffect } from "react";
import type { Priority } from "@prisma/client";
import { createTaskAction } from "@/app/actions/tasks";
import type { ActionState } from "@/app/actions/auth";
import { FormRow, TextInput, Select } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

const PRIORITY_LABEL: Record<Priority, string> = {
  MUST: "必須",
  SHOULD: "應該",
  COULD: "可以",
};

export function NewTaskForm({ resultId }: { resultId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createTaskAction,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state.message]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-lg border border-clay bg-white p-4"
    >
      <FormMessage state={state} />
      <input type="hidden" name="resultId" value={resultId} />
      <div className="grid grid-cols-[1fr_140px_140px] gap-3">
        <FormRow label="行動項目" required>
          <TextInput name="title" placeholder="這個成果需要採取的下一步行動" required />
        </FormRow>
        <FormRow label="優先順序">
          <Select name="priority" defaultValue="SHOULD">
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </Select>
        </FormRow>
        <FormRow label="到期日">
          <TextInput type="date" name="dueDate" />
        </FormRow>
      </div>
      <SubmitButton>新增行動項目</SubmitButton>
    </form>
  );
}
