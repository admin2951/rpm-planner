/**
 * 頁面標題：英文大字 —— 鋼藍中文。
 * 英文只是視覺，讀螢幕的人只會聽到中文標題。
 */
export function PageTitle({ en, children }: { en: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3 pb-6 pt-2">
      <span aria-hidden className="display text-6xl text-ink sm:text-7xl">
        {en}
      </span>
      <span aria-hidden className="mb-[0.55rem] hidden h-[3px] w-20 bg-ink sm:block" />
      <h1 className="font-display text-4xl font-semibold leading-none tracking-[-0.05em] text-sage sm:text-5xl">
        {children}
      </h1>
    </div>
  );
}
