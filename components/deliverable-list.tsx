"use client";

import { useRef } from "react";
import {
  createDeliverableAction,
  toggleDeliverableAction,
  deleteDeliverableAction,
} from "@/app/actions/deliverables";

type Deliverable = {
  id: string;
  title: string;
  done: boolean;
};

export function DeliverableList({
  taskId,
  deliverables,
}: {
  taskId: string;
  deliverables: Deliverable[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mt-2 space-y-1.5">
      {deliverables.map((d) => (
        <div key={d.id} className="flex items-center gap-2">
          <form action={toggleDeliverableAction}>
            <input type="hidden" name="id" value={d.id} />
            <button
              type="submit"
              aria-label={d.done ? "標記交付物為未完成" : "標記交付物為完成"}
              className={
                "flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition " +
                (d.done
                  ? "border-sage-dark bg-sage-dark text-cream"
                  : "border-clay text-transparent hover:border-sage-dark")
              }
            >
              ✓
            </button>
          </form>
          <span
            className={
              "flex-1 text-xs " + (d.done ? "text-muted line-through" : "text-ink")
            }
          >
            {d.title}
          </span>
          <form action={deleteDeliverableAction}>
            <input type="hidden" name="id" value={d.id} />
            <button
              type="submit"
              className="text-xs text-muted hover:text-red-600"
            >
              刪除
            </button>
          </form>
        </div>
      ))}

      <form
        ref={formRef}
        action={async (formData) => {
          await createDeliverableAction(formData);
          formRef.current?.reset();
        }}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="taskId" value={taskId} />
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-xs text-muted">
          ＋
        </span>
        <input
          name="title"
          placeholder="新增交付物，按 Enter 送出…"
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="flex-1 border-0 bg-transparent py-0.5 text-xs text-ink outline-none placeholder:text-muted/60"
        />
      </form>
    </div>
  );
}
