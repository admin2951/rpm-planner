/** 統一以「本機時區的當地日期」為單位，忽略時分秒 */

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function startOfDay(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function endOfDay(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const d = startOfDay(dateKey);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
}

export function formatDateLabel(dateKey: string): string {
  const d = startOfDay(dateKey);
  return d.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function formatShortDate(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
}

/** 距離某個日期還有幾天（今天=0，已過去為負數） */
export function daysUntil(date: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatDeadline(date: Date): string {
  const days = daysUntil(date);
  if (days === 0) return "今天截止";
  if (days > 0) return `還有 ${days} 天`;
  return `已逾期 ${Math.abs(days)} 天`;
}

/** 本週的最後一天（週一為一週開始），23:59:59 */
export function endOfWeek(base: Date): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const dow = (d.getDay() + 6) % 7; // 週一 = 0
  d.setDate(d.getDate() + (6 - dow));
  d.setHours(23, 59, 59, 999);
  return d;
}

/** 本月的最後一天，23:59:59 */
export function endOfMonth(base: Date): Date {
  return new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** 該週週一（以傳入日期所在的週為準） */
export function startOfWeek(base: Date): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const dow = (d.getDay() + 6) % 7; // 週一 = 0
  d.setDate(d.getDate() - dow);
  return d;
}

export function currentWeekKey(): string {
  return toDateKey(startOfWeek(new Date()));
}

export function shiftWeekKey(weekKey: string, deltaWeeks: number): string {
  const d = startOfDay(weekKey);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return toDateKey(d);
}

/** weekKey 為該週週一的日期字串，回傳整週（週一 00:00 到週日 23:59:59）的範圍 */
export function weekRange(weekKey: string): { from: Date; to: Date } {
  const from = startOfDay(weekKey);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export function formatWeekLabel(weekKey: string): string {
  const { from, to } = weekRange(weekKey);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(from)} – ${fmt(to)}`;
}

export type DueBucket =
  | "OVERDUE"
  | "TODAY"
  | "THIS_WEEK"
  | "NEXT_WEEK"
  | "THIS_MONTH"
  | "LATER"
  | "NO_DATE";

/** 依截止日期分類到今天／本週／下週／這個月／之後／未定期 */
export function getDueBucket(dueDate: Date | null | undefined): DueBucket {
  if (!dueDate) return "NO_DATE";

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  if (dueDate < todayStart) return "OVERDUE";
  if (dueDate <= todayEnd) return "TODAY";

  const thisWeekEnd = endOfWeek(todayStart);
  if (dueDate <= thisWeekEnd) return "THIS_WEEK";

  const nextWeekEnd = new Date(thisWeekEnd);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  if (dueDate <= nextWeekEnd) return "NEXT_WEEK";

  const thisMonthEnd = endOfMonth(todayStart);
  if (dueDate <= thisMonthEnd) return "THIS_MONTH";

  return "LATER";
}
