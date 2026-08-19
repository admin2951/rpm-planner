"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { startOfDay } from "@/lib/date";
import type { ActionState } from "./auth";

export async function upsertDailyNoteAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const dateKey = String(formData.get("date") || "").trim();
  if (!dateKey) return { error: "缺少日期" };

  const content = String(formData.get("content") || "");
  const date = startOfDay(dateKey);

  await prisma.dailyNote.upsert({
    where: { date },
    update: { content },
    create: { date, content },
  });

  revalidatePath("/today");
  return { message: "已儲存" };
}
