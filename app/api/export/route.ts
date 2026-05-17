import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  // Fetch scope by role
  const sheets = await prisma.goalSheet.findMany({
    where:
      role === "ADMIN"
        ? {}
        : role === "MANAGER"
        ? { owner: { managerId: session.user.id } }
        : { ownerId: session.user.id },
    include: {
      owner: true,
      goals: true,
      cycle: true,
    },
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = "Cadence";
  wb.created = new Date();

  // ----- Sheet 1: Goals Overview -----
  const ws1 = wb.addWorksheet("Goals Overview");
  ws1.columns = [
    { header: "Employee", key: "employee", width: 22 },
    { header: "Email", key: "email", width: 28 },
    { header: "Department", key: "department", width: 18 },
    { header: "Cycle", key: "cycle", width: 12 },
    { header: "Sheet Status", key: "status", width: 14 },
    { header: "Goal Title", key: "title", width: 50 },
    { header: "Thrust Area", key: "thrust", width: 14 },
    { header: "UoM Type", key: "uom", width: 16 },
    { header: "Weightage %", key: "weightage", width: 12 },
    { header: "Planned Target", key: "target", width: 16 },
    { header: "Actual Achievement", key: "actual", width: 18 },
    { header: "Progress %", key: "progress", width: 12 },
    { header: "Status", key: "goalStatus", width: 14 },
  ];

  // Style header row
  ws1.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws1.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366F1" },
  };

  for (const sheet of sheets) {
    for (const goal of sheet.goals) {
      ws1.addRow({
        employee: sheet.owner.name,
        email: sheet.owner.email,
        department: sheet.owner.department ?? "—",
        cycle: sheet.cycle.name,
        status: sheet.status,
        title: goal.title,
        thrust: goal.thrustArea,
        uom: goal.uomType,
        weightage: goal.weightage,
        target:
          goal.targetValue != null
            ? `${goal.targetValue}${goal.uomUnit ? ` ${goal.uomUnit}` : ""}`
            : goal.targetDate
            ? new Date(goal.targetDate).toLocaleDateString()
            : "—",
        actual:
          goal.actualValue != null
            ? `${goal.actualValue}${goal.uomUnit ? ` ${goal.uomUnit}` : ""}`
            : goal.actualDate
            ? new Date(goal.actualDate).toLocaleDateString()
            : "—",
        progress: goal.progressPct != null ? `${goal.progressPct}%` : "—",
        goalStatus: goal.status,
      });
    }
  }

  // ----- Sheet 2: Sheet Summary -----
  const ws2 = wb.addWorksheet("Sheet Summary");
  ws2.columns = [
    { header: "Employee", key: "employee", width: 22 },
    { header: "Total Goals", key: "count", width: 12 },
    { header: "Total Weightage", key: "weightTotal", width: 16 },
    { header: "Avg Progress", key: "avgProgress", width: 14 },
    { header: "Submitted", key: "submitted", width: 14 },
    { header: "Approved", key: "approved", width: 14 },
  ];
  ws2.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws2.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366F1" },
  };

  for (const sheet of sheets) {
    const totalWeight = sheet.goals.reduce((s, g) => s + g.weightage, 0);
    const avgProgress =
      sheet.goals.length > 0
        ? Math.round(
            (sheet.goals.reduce((s, g) => s + (g.progressPct ?? 0), 0) /
              sheet.goals.length) *
              10
          ) / 10
        : 0;
    ws2.addRow({
      employee: sheet.owner.name,
      count: sheet.goals.length,
      weightTotal: `${totalWeight}%`,
      avgProgress: `${avgProgress}%`,
      submitted: sheet.submittedAt
        ? sheet.submittedAt.toLocaleDateString()
        : "—",
      approved: sheet.approvedAt ? sheet.approvedAt.toLocaleDateString() : "—",
    });
  }

  // ----- Generate -----
  const buffer = await wb.xlsx.writeBuffer();

  const filename = `cadence-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
