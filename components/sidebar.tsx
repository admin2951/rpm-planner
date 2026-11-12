"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "總覽", en: "Overview" },
  { href: "/results", label: "RPM", en: "Results" },
  { href: "/tasks", label: "待辦事項", en: "To Do" },
  { href: "/log", label: "工作紀錄", en: "Work Log" },
  { href: "/today", label: "今日", en: "Today" },
];

export function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-clay bg-cream">
      <div className="px-6 pb-8 pt-8">
        <p className="font-display text-4xl font-medium leading-none tracking-[-0.04em] text-ink">
          RPM
        </p>
        <p className="mt-2 text-xs font-bold tracking-[0.12em] text-sage-dark">
          成果・理由・行動計畫
        </p>
      </div>

      <nav className="flex-1 space-y-1 border-t border-ink/80 px-3 pt-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                "flex items-center justify-between rounded-full px-4 py-2.5 text-sm transition " +
                (active
                  ? "bg-white font-bold text-ink shadow-sm"
                  : "text-ink hover:bg-white/60")
              }
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " + (active ? "bg-sage" : "bg-transparent")
                  }
                  aria-hidden
                />
                {item.label}
              </span>
              <span
                aria-hidden
                className={
                  "font-display text-[11px] tracking-normal " +
                  (active ? "text-sage-dark" : "text-muted")
                }
              >
                {item.en}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-clay p-4">
        <p className="mb-3 px-2 text-sm font-medium text-ink">{name}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-full border border-clay bg-white px-3 py-2 text-sm text-muted transition hover:border-sage-dark/50 hover:text-ink"
          >
            登出
          </button>
        </form>
      </div>
    </aside>
  );
}
