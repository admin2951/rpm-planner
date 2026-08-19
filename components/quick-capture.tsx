"use client";

import { useActionState, useRef, useEffect } from "react";
import { createQuickTaskAction } from "@/app/actions/tasks";
import type { ActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function QuickCapture({ placeholder = "隨手記下任何想法或代辦…" }: { placeholder?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createQuickTaskAction,
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
      className="flex items-center gap-2 rounded-lg border border-clay bg-white p-2"
    >
      <span className="pl-1 text-lg text-sage">＋</span>
      <input
        name="title"
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 bg-transparent px-1 py-1.5 text-sm text-ink outline-none placeholder:text-muted"
      />
      <SubmitButton className="px-4 py-2 text-xs">新增</SubmitButton>
    </form>
  );
}
