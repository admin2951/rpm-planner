"use client";

import { useActionState, useRef, useEffect } from "react";
import { importResultsAction } from "@/app/actions/results";
import type { ActionState } from "@/app/actions/auth";
import { FormRow, TextArea, TextInput } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function ImportResultsForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    importResultsAction,
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
      <FormRow label="貼上多行文字，每一行變成一筆 R（之後可再各自補上 P 和 M）" required>
        <TextArea
          name="text"
          rows={5}
          placeholder={"完成半年財務規劃\n學會一首新曲子\n把陽台的植物種活"}
          required
        />
      </FormRow>
      <FormRow label="套用到整批的截止日期（選填）">
        <TextInput type="date" name="targetDate" />
      </FormRow>
      <SubmitButton>批次匯入</SubmitButton>
    </form>
  );
}
