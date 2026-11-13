"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "總覽" },
  { href: "/results", label: "RPM" },
  { href: "/tasks", label: "待辦事項" },
  { href: "/log", label: "工作紀錄" },
  { href: "/today", label: "今日" },
];

/** 頂部：左邊字標（大字 RPM + 兩行小字），右邊純文字導覽、細直線、細框按鈕 */
export function AppHeader({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="RPM 系統首頁">
          <span className="display text-[28px] font-bold tracking-[0.01em] text-ink">RPM</span>
          <span className="text-[10px] font-bold leading-[1.25] tracking-[0.06em] text-ink">
            成果・理由
            <br />
            行動計畫
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "border-b-2 pb-0.5 transition " +
                  (active ? "border-sage text-ink" : "border-transparent text-ink hover:border-ink")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <span className="hidden h-6 w-px bg-muted/50 sm:block" aria-hidden />
          <span className="font-medium text-muted">{name}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 border border-ink px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-ink hover:text-white"
            >
              登出 <span aria-hidden>→</span>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
