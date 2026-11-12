/**
 * 區塊標題：上方一條細線，左邊一個小方塊（有件數就放件數，沒有就放圓點），右邊大字標題。
 * 件數為 0 時方塊改成淡色外框，跟有內容的區塊做出區別。
 */
export function SectionTitle({
  title,
  count,
  tone,
  children,
}: {
  title: React.ReactNode;
  count?: number;
  tone?: "danger";
  children?: React.ReactNode;
}) {
  const empty = count === 0;
  const danger = tone === "danger" && !empty;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-clay pt-6">
      <span
        className={
          "flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-display text-xs font-medium " +
          (empty
            ? "border border-clay text-muted"
            : danger
              ? "bg-red-600 text-white"
              : "bg-ink text-white")
        }
      >
        {count ?? <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />}
      </span>
      <h2
        className={
          "font-display text-2xl font-medium tracking-[-0.02em] " +
          (empty ? "text-muted" : danger ? "text-red-600" : "text-ink")
        }
      >
        {title}
      </h2>
      {children && <span className="text-sm text-muted">{children}</span>}
    </div>
  );
}
