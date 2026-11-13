/**
 * 區塊標題：粗體標題，旁邊一個藍綠小標籤放件數（例如「4 件」），右側放附註，下方一條細線。
 * 件數為 0 時標籤改成灰色外框；警示區塊有件數時標籤改紅。
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
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink pb-2.5 pt-4">
      <h2 className={"text-lg " + (empty ? "text-muted" : "text-ink")}>{title}</h2>
      {count !== undefined && (
        <span
          className={
            "px-1.5 py-0.5 text-[11px] font-bold leading-none " +
            (empty
              ? "border border-clay text-muted"
              : danger
                ? "bg-red-600 text-white"
                : "bg-sage text-white")
          }
        >
          {count} 件
        </span>
      )}
      {children && <span className="text-xs font-medium text-muted">{children}</span>}
    </div>
  );
}
