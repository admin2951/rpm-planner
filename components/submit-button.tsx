"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "inline-flex items-center justify-center gap-3 bg-sage-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-moss disabled:opacity-60 " +
        className
      }
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
      <span aria-hidden className="font-normal">→</span>
    </button>
  );
}
