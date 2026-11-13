/**
 * 頁面標題：英文大字（Montserrat 全大寫），下面小字中文標題。
 * 英文只是視覺，讀螢幕的人只會聽到中文標題。
 */
export function PageTitle({ en, children }: { en: string; children: React.ReactNode }) {
  return (
    <div className="pb-4 pt-4">
      <p aria-hidden className="display text-5xl text-ink sm:text-6xl">
        {en}
      </p>
      <h1 className="mt-4 flex items-center gap-3 text-sm text-ink">
        <span className="h-px w-8 bg-ink" aria-hidden />
        {children}
      </h1>
    </div>
  );
}
