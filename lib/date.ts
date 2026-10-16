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

/* ── 工作時程紀錄用：以「從當天午夜起算的分鐘數」表示時間 ───────── */

/** 預設的一天工作區間：09:30 – 21:30 */
export const DAY_START_MIN = 9 * 60 + 30;
export const DAY_END_MIN = 21 * 60 + 30;

/** 570 → "09:30" */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "09:30" → 570；格式不對回傳 null */
export function parseMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
}

/** 下拉選單用的時間選項（預設 06:00–23:30，每 30 分鐘一格） */
export function timeOptions(
  from = 6 * 60,
  to = 23 * 60 + 30,
  step = 30
): string[] {
  const out: string[] = [];
  for (let m = from; m <= to; m += step) out.push(formatMinutes(m));
  return out;
}

/** 把分鐘數換成「X 小時 Y 分」 */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} 分`;
  if (m === 0) return `${h} 小時`;
  return `${h} 小時 ${m} 分`;
}
