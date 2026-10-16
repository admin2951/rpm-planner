"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  dateKeyToUtcDay,
  parseMinutes,
  DAY_START_MIN,
  TIME_STEP_MIN,
} from "@/lib/date";

function revalidateLog() {
  revalidatePath("/log");
  revalidatePath("/today");
}

/** 讀出表單裡的起訖時間；結束時間若早於或等於開始時間，就往後補一個最小刻度 */
function readRange(formData: FormData, fallbackStart: number) {
  const start = parseMinutes(String(formData.get("start") || "")) ?? fallbackStart;
  const parsedEnd = parseMinutes(String(formData.get("end") || ""));
  const end =
    parsedEnd !== null && parsedEnd > start ? parsedEnd : start + TIME_STEP_MIN;
  return { start, end: Math.min(end, 24 * 60) };
}

export async function createWorkLogAction(formData: FormData) {
  await requireUser();
  const dateKey = String(formData.get("date") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!dateKey || !content) return;

  const { start, end } = readRange(formData, DAY_START_MIN);
  const note = String(formData.get("note") || "").trim() || null;

  await prisma.workLog.create({
    data: {
      date: dateKeyToUtcDay(dateKey),
      startMin: start,
      endMin: end,
      content,
      note,
    },
  });

  revalidateLog();
}

/** 逐格自動儲存：時間、內容、備註都能改 */
export async function updateWorkLogAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const row = await prisma.workLog.findUnique({ where: { id } });
  if (!row) return;

  const { start, end } = readRange(formData, row.startMin);
  const content =
    String(formData.get("content") ?? row.content).trim() || row.content;
  const note = String(formData.get("note") ?? row.note ?? "").trim() || null;

  await prisma.workLog.update({
    where: { id },
    data: { startMin: start, endMin: end, content, note },
  });

  revalidateLog();
}

export async function deleteWorkLogAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.workLog.delete({ where: { id } }).catch(() => null);
  revalidateLog();
}

/** 把某一天的紀錄整批複製到另一天（例如固定班表） */
export async function copyWorkLogsAction(formData: FormData) {
  await requireUser();
  const fromKey = String(formData.get("from") || "").trim();
  const toKey = String(formData.get("to") || "").trim();
  if (!fromKey || !toKey) return;

  const source = await prisma.workLog.findMany({
    where: { date: dateKeyToUtcDay(fromKey) },
    orderBy: { startMin: "asc" },
  });
  if (source.length === 0) return;

  await prisma.workLog.createMany({
    data: source.map((r) => ({
      date: dateKeyToUtcDay(toKey),
      startMin: r.startMin,
      endMin: r.endMin,
      content: r.content,
      note: r.note,
    })),
  });

  revalidateLog();
}
