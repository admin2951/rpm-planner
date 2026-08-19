"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { Priority, TaskStatus } from "@prisma/client";
import type { ActionState } from "./auth";

function revalidateAll(resultId?: string | null) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath("/results");
  if (resultId) revalidatePath(`/results/${resultId}`);
}

/** 快速新增：自由捕捉一筆想法/代辦，不需要先掛好結構 */
export async function createQuickTaskAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "請輸入內容" };

  await prisma.task.create({
    data: { title },
  });

  revalidateAll();
  return { message: "已新增" };
}

export async function createTaskAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "請輸入標題" };

  const resultId = String(formData.get("resultId") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const priority = String(formData.get("priority") || "SHOULD") as Priority;
  const dueDateRaw = String(formData.get("dueDate") || "").trim();

  await prisma.task.create({
    data: {
      title,
      resultId,
      notes,
      priority,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidateAll(resultId);
  return { message: "已新增行動項目" };
}

export async function updateTaskAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!id || !title) return { error: "請輸入標題" };

  const resultId = String(formData.get("resultId") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const priority = String(formData.get("priority") || "SHOULD") as Priority;
  const status = String(formData.get("status") || "TODO") as TaskStatus;
  const dueDateRaw = String(formData.get("dueDate") || "").trim();

  const row = await prisma.task.findUnique({ where: { id } });
  if (!row) return { error: "找不到項目" };

  await prisma.task.update({
    where: { id },
    data: {
      title,
      resultId,
      notes,
      priority,
      status,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      completedAt:
        status === "DONE" ? (row.completedAt ?? new Date()) : null,
    },
  });

  revalidateAll(resultId || row.resultId);
  return { message: "已儲存" };
}

/** 表格逐格自動儲存：任務內容／狀態／截止日／備註，其中任一欄位一起送出即可 */
export async function quickUpdateTaskAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const row = await prisma.task.findUnique({ where: { id } });
  if (!row) return;

  const title = String(formData.get("title") ?? row.title).trim() || row.title;
  const notes = String(formData.get("notes") ?? row.notes ?? "").trim() || null;
  const status = String(formData.get("status") || row.status) as TaskStatus;
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();

  await prisma.task.update({
    where: { id },
    data: {
      title,
      notes,
      status,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      completedAt: status === "DONE" ? (row.completedAt ?? new Date()) : null,
    },
  });

  revalidateAll(row.resultId);
}

export async function toggleTaskDoneAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const row = await prisma.task.findUnique({ where: { id } });
  if (!row) return;

  const isDone = row.status === "DONE";
  await prisma.task.update({
    where: { id },
    data: isDone
      ? { status: "TODO", completedAt: null }
      : { status: "DONE", completedAt: new Date() },
  });

  revalidateAll(row.resultId);
}

export async function deleteTaskAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const row = await prisma.task.findUnique({ where: { id } });
  await prisma.task.delete({ where: { id } });
  revalidateAll(row?.resultId);
}
