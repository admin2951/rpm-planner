"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import type { ActionState } from "@/app/actions/auth";
import { FormRow, TextInput } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function LoginForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <FormRow label="Email" required>
        <TextInput
          name="email"
          type="email"
          placeholder="admin@esheco.com"
          autoComplete="email"
          required
        />
      </FormRow>
      <FormRow label="密碼" required>
        <TextInput
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </FormRow>
      <SubmitButton className="w-full">登入</SubmitButton>
    </form>
  );
}
