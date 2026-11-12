/**
 * 頁面標題：一行「● 大寫英文小標」，下面接大字標題，底下一條細線。
 */
export function PageTitle({ en, children }: { en: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-clay pb-6">
      <p className="flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.06em] text-ink">
        <span className="h-2 w-2 rounded-full bg-ink" aria-hidden />
        {en}
      </p>
      <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
        {children}
      </h1>
    </div>
  );
}
