"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/dashboard", label: "總覽", icon: "◈" },
  { href: "/results", label: "RPM", icon: "✦" },
  { href: "/tasks", label: "待辦事項", icon: "☑" },
  { href: "/log", label: "工作紀錄", icon: "◷" },
  { href: "/today", label: "今日", icon: "☀" },
];

export function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-clay/60 bg-white">
      <div className="flex flex-col gap-1 px-6 py-7">
        <p className="flex items-center gap-2 font-serif text-xl font-medium tracking-wide text-moss">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden />
          RPM系統
        </p>
        <p className="text-xs font-light tracking-wide text-muted">
          R 成果・P 理由・M 行動計畫
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition " +
                (active
                  ? "bg-sage-dark font-medium text-cream"
                  : "text-ink hover:bg-sand")
              }
            >
              <span
                className={
                  "w-5 text-center " + (active ? "text-sage" : "text-muted")
                }
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-clay/60 p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-ink">{name}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg border border-clay px-3 py-2 text-sm text-muted transition hover:border-sage-dark/40 hover:bg-sand hover:text-ink"
          >
            登出
          </button>
        </form>
      </div>
    </aside>
  );
}
