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

const chip = "rounded-lg px-3 py-1.5 text-sm transition whitespace-nowrap";

/** 頂部導覽列：左邊系統名稱，右邊一排淺灰小按鈕，下方一條細線 */
export function AppHeader({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-clay bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-gold px-3 py-1.5 font-display text-base font-semibold tracking-[-0.03em] text-ink"
        >
          RPM 系統
        </Link>

        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  chip + " " + (active ? "bg-ink text-white" : "bg-gold text-ink hover:bg-clay")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-1 hidden h-5 w-px bg-clay sm:block" aria-hidden />
          <span className="hidden text-sm text-muted sm:block">{name}</span>
          <form action={logoutAction}>
            <button type="submit" className={chip + " text-muted hover:bg-gold hover:text-ink"}>
              登出
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
