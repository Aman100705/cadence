"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UoMType } from "@prisma/client";

export async function createGoalAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) throw new Error("No active cycle");

  // Get or create draft sheet
  let sheet = await prisma.goalSheet.findFirst({
    where: { ownerId: userId, cycleId: cycle.id },
  });

  if (!sheet) {
    sheet = await prisma.goalSheet.create({
      data: { ownerId: userId, cycleId: cycle.id, status: "DRAFT" },
    });
  }

  if (sheet.status === "APPROVED") {
    throw new Error("Sheet is locked. Contact admin to unlock.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thrustArea = String(formData.get("thrustArea") ?? "");
  const uomType = String(formData.get("uomType") ?? "") as UoMType;
  const uomUnit = String(formData.get("uomUnit") ?? "").trim();
  const targetValueRaw = String(formData.get("targetValue") ?? "");
  const targetDateRaw = String(formData.get("targetDate") ?? "");
  const weightage = Math.round(Number(formData.get("weightage") ?? 0));

  // Validation
  if (!title || title.length < 5) throw new Error("Title must be at least 5 characters");
  if (!thrustArea) throw new Error("Thrust area is required");
  if (!uomType) throw new Error("Unit of measurement is required");
  if (weightage < 10 || weightage > 100) throw new Error("Weightage must be 10-100");

  // Count existing goals
  const existingCount = await prisma.goal.count({ where: { sheetId: sheet.id } });
  if (existingCount >= 8) throw new Error("Maximum 8 goals per sheet");

  // Validate weightage total
  const existing = await prisma.goal.findMany({ where: { sheetId: sheet.id } });
  const currentTotal = existing.reduce((s, g) => s + g.weightage, 0);
  if (currentTotal + weightage > 100) {
    throw new Error(`Total weightage exceeds 100% (current ${currentTotal}%, adding ${weightage}%)`);
  }

  await prisma.goal.create({
    data: {
      sheetId: sheet.id,
      ownerId: userId,
      title,
      description: description || null,
      thrustArea,
      uomType,
      uomUnit: uomUnit || null,
      targetValue: targetValueRaw ? Number(targetValueRaw) : null,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
      weightage,
      status: "NOT_STARTED",
    },
  });

  revalidatePath("/dashboard/goals");
  redirect("/dashboard/goals");
}

export async function submitSheetAction(sheetId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sheet = await prisma.goalSheet.findFirst({
    where: { id: sheetId, ownerId: session.user.id },
    include: { goals: true },
  });
  if (!sheet) throw new Error("Sheet not found");
  if (sheet.status === "APPROVED") throw new Error("Sheet already approved");

  const total = sheet.goals.reduce((s, g) => s + g.weightage, 0);
  if (total !== 100) throw new Error(`Weightage must equal 100% (currently ${total}%)`);
  if (sheet.goals.length === 0) throw new Error("Add at least one goal");
  if (sheet.goals.length > 8) throw new Error("Maximum 8 goals allowed");

  await prisma.goalSheet.update({
    where: { id: sheetId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CHECKIN_SUBMITTED",
      entityType: "GoalSheet",
      entityId: sheetId,
      note: `Submitted ${sheet.goals.length} goals for approval`,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
  redirect("/dashboard/goals");
}
