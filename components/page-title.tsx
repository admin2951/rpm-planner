/**
 * 頁面標題：上面一行大字英文（裝飾用），下面是橘色的中文標題。
 * 英文只是視覺，讀螢幕的人只會聽到中文標題。
 */
export function PageTitle({ en, children }: { en: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        aria-hidden
        className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-ink sm:text-6xl"
      >
        {en}
      </p>
      <h1 className="mt-2 text-sm font-bold tracking-[0.12em] text-sage-dark">{children}</h1>
    </div>
  );
}
