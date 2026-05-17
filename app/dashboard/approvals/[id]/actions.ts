"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approveSheetAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const sheetId = String(formData.get("sheetId") ?? "");
  const sheet = await prisma.goalSheet.findFirst({
    where: { id: sheetId, owner: { managerId: session.user.id } },
    include: { goals: true },
  });
  if (!sheet) throw new Error("Sheet not found or you are not the manager");
  if (sheet.status !== "SUBMITTED") throw new Error("Sheet not in submitted state");

  const now = new Date();

  await prisma.$transaction([
    prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: "APPROVED", approvedAt: now },
    }),
    prisma.goal.updateMany({
      where: { sheetId },
      data: {
        isLocked: true,
        lockedAt: now,
        approvedById: session.user.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SHEET_APPROVED",
        entityType: "GoalSheet",
        entityId: sheetId,
        note: `Approved ${sheet.goals.length} goals; sheet locked.`,
      },
    }),
  ]);

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard");
  redirect("/dashboard/approvals");
}

export async function returnSheetAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }

  const sheetId = String(formData.get("sheetId") ?? "");
  const sheet = await prisma.goalSheet.findFirst({
    where: { id: sheetId, owner: { managerId: session.user.id } },
  });
  if (!sheet) throw new Error("Sheet not found");

  await prisma.$transaction([
    prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: "RETURNED" },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SHEET_RETURNED",
        entityType: "GoalSheet",
        entityId: sheetId,
        note: "Returned to employee for rework.",
      },
    }),
  ]);

  revalidatePath("/dashboard/approvals");
  redirect("/dashboard/approvals");
}
