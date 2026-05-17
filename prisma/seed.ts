import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Cadence database...");

  // ----- Clean slate -----
  await prisma.aiSuggestion.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ----- Users -----
  const admin = await prisma.user.create({
    data: {
      email: "admin@cadence.com",
      name: "Priya Sharma",
      passwordHash: await hash("admin123"),
      role: "ADMIN",
      department: "Human Resources",
      title: "HR Director",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@cadence.com",
      name: "Rajesh Kumar",
      passwordHash: await hash("manager123"),
      role: "MANAGER",
      department: "Engineering",
      title: "Engineering Manager",
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: "employee@cadence.com",
      name: "Aman Patel",
      passwordHash: await hash("employee123"),
      role: "EMPLOYEE",
      department: "Engineering",
      title: "Software Engineer",
      managerId: manager.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: "sneha@cadence.com",
      name: "Sneha Reddy",
      passwordHash: await hash("employee123"),
      role: "EMPLOYEE",
      department: "Engineering",
      title: "Senior Software Engineer",
      managerId: manager.id,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: "arjun@cadence.com",
      name: "Arjun Mehta",
      passwordHash: await hash("employee123"),
      role: "EMPLOYEE",
      department: "Engineering",
      title: "Software Engineer",
      managerId: manager.id,
    },
  });

  console.log("✅ Users created");

  // ----- Cycle -----
  const cycle = await prisma.cycle.create({
    data: {
      name: "FY 2026",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      currentPhase: "Q1_CHECKIN",
      isActive: true,
    },
  });

  console.log("✅ Cycle created");

  // ----- Employee 1 (Aman) — APPROVED sheet with Q1 check-in data -----
  const sheet1 = await prisma.goalSheet.create({
    data: {
      ownerId: employee1.id,
      cycleId: cycle.id,
      status: "APPROVED",
      submittedAt: new Date("2026-04-15"),
      approvedAt: new Date("2026-04-18"),
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        sheetId: sheet1.id,
        ownerId: employee1.id,
        approvedById: manager.id,
        thrustArea: "Innovation",
        title: "Ship 3 new product features to production",
        description: "Lead engineering for major feature releases in Q1-Q2.",
        uomType: "NUMERIC_MIN",
        uomUnit: "features",
        targetValue: 3,
        weightage: 30,
        status: "ON_TRACK",
        actualValue: 1,
        progressPct: 33,
        isLocked: true,
        lockedAt: new Date("2026-04-18"),
      },
      {
        sheetId: sheet1.id,
        ownerId: employee1.id,
        approvedById: manager.id,
        thrustArea: "Quality",
        title: "Reduce mean time to recovery (MTTR) for production incidents",
        description: "Improve incident response runbooks and on-call processes.",
        uomType: "NUMERIC_MAX",
        uomUnit: "minutes",
        targetValue: 30,
        weightage: 25,
        status: "ON_TRACK",
        actualValue: 42,
        progressPct: 71.4,
        isLocked: true,
        lockedAt: new Date("2026-04-18"),
      },
      {
        sheetId: sheet1.id,
        ownerId: employee1.id,
        approvedById: manager.id,
        thrustArea: "People",
        title: "Mentor two junior engineers through onboarding",
        description: "Pair programming, code reviews, and weekly 1:1s.",
        uomType: "NUMERIC_MIN",
        uomUnit: "engineers",
        targetValue: 2,
        weightage: 20,
        status: "ON_TRACK",
        actualValue: 1,
        progressPct: 50,
        isLocked: true,
        lockedAt: new Date("2026-04-18"),
      },
      {
        sheetId: sheet1.id,
        ownerId: employee1.id,
        approvedById: manager.id,
        thrustArea: "Quality",
        title: "Achieve zero P0 incidents owned by my team",
        description: "Through proactive testing and code review.",
        uomType: "ZERO",
        uomUnit: "incidents",
        targetValue: 0,
        weightage: 15,
        status: "ON_TRACK",
        actualValue: 0,
        progressPct: 100,
        isLocked: true,
        lockedAt: new Date("2026-04-18"),
      },
      {
        sheetId: sheet1.id,
        ownerId: employee1.id,
        approvedById: manager.id,
        thrustArea: "Innovation",
        title: "Complete AWS Solutions Architect certification",
        description: "Pass the AWS SAA-C03 exam by Q3.",
        uomType: "TIMELINE",
        uomUnit: "completion",
        targetDate: new Date("2026-12-31"),
        weightage: 10,
        status: "NOT_STARTED",
        progressPct: 0,
        isLocked: true,
        lockedAt: new Date("2026-04-18"),
      },
    ],
  });

  console.log("✅ Aman's goal sheet created (APPROVED, Q1 in progress)");

  // ----- Employee 2 (Sneha) — SUBMITTED sheet pending approval -----
  const sheet2 = await prisma.goalSheet.create({
    data: {
      ownerId: employee2.id,
      cycleId: cycle.id,
      status: "SUBMITTED",
      submittedAt: new Date("2026-05-10"),
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        sheetId: sheet2.id,
        ownerId: employee2.id,
        thrustArea: "Innovation",
        title: "Architect and ship new authentication microservice",
        description: "Replace legacy auth with OAuth 2.0 + SSO support.",
        uomType: "TIMELINE",
        uomUnit: "ship date",
        targetDate: new Date("2026-09-30"),
        weightage: 40,
        status: "NOT_STARTED",
      },
      {
        sheetId: sheet2.id,
        ownerId: employee2.id,
        thrustArea: "Quality",
        title: "Increase test coverage of core services to 80%+",
        description: "Add integration tests and contract tests across services.",
        uomType: "PERCENT_MIN",
        uomUnit: "%",
        targetValue: 80,
        weightage: 30,
        status: "NOT_STARTED",
      },
      {
        sheetId: sheet2.id,
        ownerId: employee2.id,
        thrustArea: "Revenue",
        title: "Reduce API p95 latency for checkout flow",
        description: "Optimize hot path and add edge caching.",
        uomType: "NUMERIC_MAX",
        uomUnit: "ms",
        targetValue: 200,
        weightage: 30,
        status: "NOT_STARTED",
      },
    ],
  });

  console.log("✅ Sneha's goal sheet created (SUBMITTED, awaiting approval)");

  // ----- Employee 3 (Arjun) — DRAFT, not yet submitted -----
  const sheet3 = await prisma.goalSheet.create({
    data: {
      ownerId: employee3.id,
      cycleId: cycle.id,
      status: "DRAFT",
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        sheetId: sheet3.id,
        ownerId: employee3.id,
        thrustArea: "Innovation",
        title: "Build internal dev tools dashboard",
        description: "",
        uomType: "TIMELINE",
        targetDate: new Date("2026-08-31"),
        weightage: 50,
        status: "NOT_STARTED",
      },
      {
        sheetId: sheet3.id,
        ownerId: employee3.id,
        thrustArea: "Quality",
        title: "Migrate legacy services to TypeScript",
        description: "",
        uomType: "NUMERIC_MIN",
        uomUnit: "services",
        targetValue: 5,
        weightage: 50,
        status: "NOT_STARTED",
      },
    ],
  });

  console.log("✅ Arjun's goal sheet created (DRAFT)");

  // ----- A few audit log entries to make Admin view feel alive -----
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: manager.id,
        action: "SHEET_APPROVED",
        entityType: "GoalSheet",
        entityId: sheet1.id,
        note: "All weightages valid; targets aligned with department OKRs.",
        createdAt: new Date("2026-04-18T10:30:00Z"),
      },
      {
        actorId: employee1.id,
        action: "CHECKIN_SUBMITTED",
        entityType: "GoalSheet",
        entityId: sheet1.id,
        note: "Q1 check-in submitted with all 5 goals updated.",
        createdAt: new Date("2026-07-12T14:00:00Z"),
      },
      {
        actorId: manager.id,
        action: "CHECKIN_REVIEWED",
        entityType: "GoalSheet",
        entityId: sheet1.id,
        note: "Q1 review completed. On track overall.",
        createdAt: new Date("2026-07-14T11:00:00Z"),
      },
    ],
  });

  console.log("✅ Audit log seeded");

  console.log("\n🎉 Seed complete!\n");
  console.log("Demo credentials:");
  console.log("  👤 Employee: employee@cadence.com / employee123 (Aman Patel)");
  console.log("  👔 Manager:  manager@cadence.com  / manager123  (Rajesh Kumar)");
  console.log("  🔧 Admin:    admin@cadence.com    / admin123    (Priya Sharma)");
  console.log("\nAlso: sneha@cadence.com, arjun@cadence.com (both employee123)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
