"use client";

import { useActionState, useRef, useEffect } from "react";
import { createResultAction } from "@/app/actions/results";
import type { ActionState } from "@/app/actions/auth";
import { FormRow, TextInput, TextArea } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function NewResultForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createResultAction,
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
      <FormRow label="R・成果（Result）" required>
        <TextInput
          name="title"
          placeholder="你承諾達成的具體、可衡量的結果是什麼？"
          required
        />
      </FormRow>
      <FormRow label="P・理由（Purpose）">
        <TextArea
          name="purpose"
          rows={2}
          placeholder="為什麼你想要這個？什麼樣的情感動力會讓你堅持到底？"
        />
      </FormRow>
      <FormRow label="M・行動計畫（MAP，一行一個行動，選填）">
        <TextArea
          name="actions"
          rows={3}
          placeholder={"要達成這個結果，你必須採取哪些具體行動？\n第一步...\n第二步..."}
        />
      </FormRow>
      <FormRow label="時間・預計多久內完成">
        <TextInput type="date" name="targetDate" />
      </FormRow>
      <SubmitButton>新增 RPM 條目</SubmitButton>
    </form>
  );
}
