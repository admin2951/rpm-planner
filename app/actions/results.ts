"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { ResultStatus } from "@prisma/client";
import type { ActionState } from "./auth";

function revalidateAll(id?: string) {
  revalidatePath("/results");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/results/${id}`);
}

export async function createResultAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "請輸入成果標題" };

  const purpose = String(formData.get("purpose") || "").trim() || null;
  const targetDateRaw = String(formData.get("targetDate") || "").trim();

  const result = await prisma.result.create({
    data: {
      title,
      purpose,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
    },
  });

  const actionLines = String(formData.get("actions") || "")
    .split("\n")
    .map((l) =>
      l
        .replace(/^[\s]*[-*•‣▪●○□☐]+\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^\[[ xX]?\]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  if (actionLines.length > 0) {
    await prisma.task.createMany({
      data: actionLines.map((title, i) => ({
        title,
        resultId: result.id,
        order: i,
      })),
    });
  }

  revalidateAll(result.id);
  return { message: "已新增 RPM 條目" };
}

export async function updateResultAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!id || !title) return { error: "請輸入成果標題" };

  const purpose = String(formData.get("purpose") || "").trim() || null;
  const targetDateRaw = String(formData.get("targetDate") || "").trim();
  const status = String(formData.get("status") || "ACTIVE") as ResultStatus;

  await prisma.result.update({
    where: { id },
    data: {
      title,
      purpose,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
      status,
    },
  });

  revalidateAll(id);
  return { message: "已儲存成果" };
}

/**
 * 批次匯入：貼上的文字每一行變成一筆 RPM 條目（R），
 * 自動去掉開頭的項目符號／編號。可選填共用的截止日期，套用到整批。
 */
export async function importResultsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const text = String(formData.get("text") || "");
  const targetDateRaw = String(formData.get("targetDate") || "").trim();
  const targetDate = targetDateRaw ? new Date(targetDateRaw) : null;

  const lines = text
    .split("\n")
    .map((l) =>
      l
        .replace(/^[\s]*[-*•‣▪●○□☐]+\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^\[[ xX]?\]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  if (lines.length === 0) {
    return { error: "沒有可匯入的內容，請貼上至少一行" };
  }

  await prisma.result.createMany({
    data: lines.map((title) => ({ title, targetDate })),
  });

  revalidateAll();
  return { message: `已匯入 ${lines.length} 筆 RPM 條目` };
}

export async function deleteResultAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;
  // 底下的 Task 不會被刪除，會自動變回未掛成果的自由代辦
  await prisma.result.delete({ where: { id } });
  revalidateAll();
}
