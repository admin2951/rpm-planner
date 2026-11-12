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

/** 頂部：左邊超大的 RPM 字標，右邊一排文字連結，每個右上角帶編號 */
export function AppHeader({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-4 px-6 pb-5 pt-6">
        <Link href="/dashboard" className="display text-6xl text-ink sm:text-7xl" aria-label="RPM 系統首頁">
          RPM
        </Link>

        <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[15px]">
          {NAV.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "transition " +
                  (active
                    ? "text-sage underline decoration-1 underline-offset-[6px]"
                    : "text-ink hover:text-sage")
                }
              >
                {item.label}
                <span className="index">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            );
          })}
          <span className="text-muted">／</span>
          <span className="text-muted">{name}</span>
          <form action={logoutAction}>
            <button type="submit" className="text-ink underline decoration-1 underline-offset-[6px] hover:text-sage">
              登出
            </button>
          </form>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-ink" />
      </div>
    </header>
  );
}
