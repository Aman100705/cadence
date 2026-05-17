"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { computeProgress } from "@/lib/scoring";
import type { GoalStatus, CheckInPeriod } from "@prisma/client";

export async function logActualAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goalId = String(formData.get("goalId") ?? "");
  const actualValueRaw = String(formData.get("actualValue") ?? "");
  const actualDateRaw = String(formData.get("actualDate") ?? "");
  const status = String(formData.get("status") ?? "NOT_STARTED") as GoalStatus;
  const employeeNote = String(formData.get("employeeNote") ?? "").trim();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, ownerId: session.user.id },
  });
  if (!goal) throw new Error("Goal not found");

  const actualValue = actualValueRaw ? Number(actualValueRaw) : null;
  const actualDate = actualDateRaw ? new Date(actualDateRaw) : null;

  // Compute progress
  const progressPct = computeProgress({
    uomType: goal.uomType,
    targetValue: goal.targetValue ? Number(goal.targetValue) : null,
    actualValue,
    targetDate: goal.targetDate,
    actualDate,
  });

  // Get active cycle for period determination
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const period: CheckInPeriod =
    cycle?.currentPhase === "Q1_CHECKIN" ? "Q1"
    : cycle?.currentPhase === "Q2_CHECKIN" ? "Q2"
    : cycle?.currentPhase === "Q3_CHECKIN" ? "Q3"
    : "Q4_FINAL";

  // Update goal + upsert check-in record
  await prisma.$transaction([
    prisma.goal.update({
      where: { id: goalId },
      data: {
        actualValue,
        actualDate,
        status,
        progressPct,
      },
    }),
    prisma.checkIn.upsert({
      where: {
        goalId_period: { goalId, period },
      },
      create: {
        goalId,
        period,
        actualValue,
        actualDate,
        status,
        employeeNote: employeeNote || null,
        progressPct,
      },
      update: {
        actualValue,
        actualDate,
        status,
        employeeNote: employeeNote || null,
        progressPct,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CHECKIN_SUBMITTED",
        entityType: "Goal",
        entityId: goalId,
        note: `${period} check-in updated · ${progressPct}% progress`,
      },
    }),
  ]);

  revalidatePath("/dashboard/checkins");
  revalidatePath("/dashboard");
}
