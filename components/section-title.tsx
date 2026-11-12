/**
 * 區塊標題：上方一條細黑線，標題右上角帶兩位數編號（件數），例如「這週 ⁰⁴」。
 * 件數為 0 時整行變淡。
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
    <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-ink pt-3">
      <h2
        className={
          "text-2xl tracking-[-0.03em] " +
          (empty ? "text-muted" : danger ? "text-red-700" : "text-ink")
        }
      >
        {title}
        {count !== undefined && (
          <span className="index">{String(count).padStart(2, "0")}</span>
        )}
      </h2>
      {children && <span className="text-sm text-muted">{children}</span>}
    </div>
  );
}
