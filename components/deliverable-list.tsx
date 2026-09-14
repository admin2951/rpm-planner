"use client";

import { useRef, useState } from "react";
import {
  createDeliverableAction,
  toggleDeliverableAction,
  updateDeliverableAction,
  deleteDeliverableAction,
} from "@/app/actions/deliverables";

type Deliverable = {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  done: boolean;
};

/** 只把 http(s) 當成可點的連結，避免貼進 javascript: 這類網址 */
function safeHref(url: string | null): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}

function DeliverableRow({ deliverable }: { deliverable: Deliverable }) {
  const [editing, setEditing] = useState(false);
  const href = safeHref(deliverable.url);

  return (
    <div className="rounded border border-transparent hover:border-clay/60">
      <div className="flex items-center gap-2">
        <form action={toggleDeliverableAction}>
          <input type="hidden" name="id" value={deliverable.id} />
          <button
            type="submit"
            aria-label={deliverable.done ? "標記交付物為未完成" : "標記交付物為完成"}
            className={
              "flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition " +
              (deliverable.done
                ? "border-sage-dark bg-sage-dark text-cream"
                : "border-clay text-transparent hover:border-sage-dark")
            }
          >
            ✓
          </button>
        </form>

        <span
          className={
            "min-w-0 flex-1 truncate text-xs " +
            (deliverable.done ? "text-muted line-through" : "text-ink")
          }
        >
          {deliverable.title}
        </span>

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-sage-dark hover:underline"
          >
            連結
          </a>
        )}
        {deliverable.url && !href && (
          <span className="shrink-0 truncate text-xs text-muted" title={deliverable.url}>
            {deliverable.url}
          </span>
        )}
        {deliverable.note && (
          <span className="max-w-[40%] shrink-0 truncate text-xs text-muted" title={deliverable.note}>
            備註：{deliverable.note}
          </span>
        )}

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 text-xs text-sage-dark hover:underline"
        >
          {editing ? "收起" : "編輯"}
        </button>

        <form action={deleteDeliverableAction}>
          <input type="hidden" name="id" value={deliverable.id} />
          <button type="submit" className="shrink-0 text-xs text-muted hover:text-red-600">
            刪除
          </button>
        </form>
      </div>

      {editing && (
        <form
          action={updateDeliverableAction}
          className="mt-1 mb-1 ml-6 grid gap-1.5 rounded bg-sand/50 p-2 sm:grid-cols-[1fr_1fr_1fr]"
        >
          <input type="hidden" name="id" value={deliverable.id} />
          <label className="block">
            <span className="mb-0.5 block text-[10px] text-muted">內容</span>
            <input
              name="title"
              defaultValue={deliverable.title}
              onBlur={(e) => e.currentTarget.form?.requestSubmit()}
              className="w-full rounded border border-clay bg-white px-1.5 py-1 text-xs text-ink outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-0.5 block text-[10px] text-muted">連結（貼上網址）</span>
            <input
              name="url"
              defaultValue={deliverable.url ?? ""}
              placeholder="https://..."
              onBlur={(e) => e.currentTarget.form?.requestSubmit()}
              className="w-full rounded border border-clay bg-white px-1.5 py-1 text-xs text-ink outline-none placeholder:text-muted/60"
            />
          </label>
          <label className="block">
            <span className="mb-0.5 block text-[10px] text-muted">備註</span>
            <input
              name="note"
              defaultValue={deliverable.note ?? ""}
              placeholder="補充說明…"
              onBlur={(e) => e.currentTarget.form?.requestSubmit()}
              className="w-full rounded border border-clay bg-white px-1.5 py-1 text-xs text-ink outline-none placeholder:text-muted/60"
            />
          </label>
        </form>
      )}
    </div>
  );
}

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
        <DeliverableRow key={d.id} deliverable={d} />
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
          placeholder="新增交付物…"
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          // 打完字直接點別的地方（例如任務的「儲存」）時也會存起來，避免輸入的內容被丟掉。
          // 點「新增」鈕時交給按鈕自己送出，不然會送出兩次。
          onBlur={(e) => {
            const next = e.relatedTarget as HTMLElement | null;
            if (next?.getAttribute("type") === "submit") return;
            if (e.currentTarget.value.trim()) e.currentTarget.form?.requestSubmit();
          }}
          className="flex-1 border-0 bg-transparent py-0.5 text-xs text-ink outline-none placeholder:text-muted/60"
        />
        <button
          type="submit"
          className="shrink-0 rounded border border-clay px-2 py-0.5 text-xs text-sage-dark hover:bg-sand"
        >
          新增
        </button>
      </form>
    </div>
  );
}
