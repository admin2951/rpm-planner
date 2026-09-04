"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function revalidateForTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { resultId: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath("/tasks");
  if (task?.resultId) revalidatePath(`/results/${task.resultId}`);
}

export async function createDeliverableAction(formData: FormData) {
  await requireUser();
  const taskId = String(formData.get("taskId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!taskId || !title) return;

  const count = await prisma.deliverable.count({ where: { taskId } });
  await prisma.deliverable.create({
    data: { taskId, title, order: count },
  });

  await revalidateForTask(taskId);
}

export async function toggleDeliverableAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const row = await prisma.deliverable.findUnique({ where: { id } });
  if (!row) return;

  await prisma.deliverable.update({
    where: { id },
    data: { done: !row.done },
  });

  await revalidateForTask(row.taskId);
}

export async function deleteDeliverableAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const row = await prisma.deliverable.findUnique({ where: { id } });
  if (!row) return;

  await prisma.deliverable.delete({ where: { id } });
  await revalidateForTask(row.taskId);
}
