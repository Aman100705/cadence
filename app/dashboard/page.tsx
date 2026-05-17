import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  ListTodo,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { computeSheetScore } from "@/lib/scoring";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const role = session.user.role;

  // ----- Fetch role-specific data -----
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  // For employee + manager — their own sheet
  const ownSheet = await prisma.goalSheet.findFirst({
    where: { ownerId: userId, cycleId: cycle?.id },
    include: { goals: true },
  });

  // For manager — pending approvals
  const pendingApprovals =
    role === "MANAGER"
      ? await prisma.goalSheet.count({
          where: {
            status: "SUBMITTED",
            owner: { managerId: userId },
          },
        })
      : 0;

  // For manager — direct reports count
  const teamCount =
    role === "MANAGER"
      ? await prisma.user.count({ where: { managerId: userId } })
      : 0;

  // For admin — org-wide stats
  const orgStats =
    role === "ADMIN"
      ? {
          users: await prisma.user.count(),
          activeSheets: await prisma.goalSheet.count({
            where: { status: { in: ["SUBMITTED", "APPROVED"] } },
          }),
          totalGoals: await prisma.goal.count(),
          auditEntries: await prisma.auditLog.count(),
        }
      : null;

  const overallScore = ownSheet ? computeSheetScore(ownSheet.goals) : 0;

  return (
    <div className="h-screen overflow-y-auto">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-text-strong">Overview</span>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-ink-5 bg-ink-1 px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-[0.15em] text-text">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 pulse-brand" />
          <span>{cycle?.name ?? "No active cycle"}</span>
          <span className="text-text-soft">·</span>
          <span>{cycle?.currentPhase.replace("_", " ")}</span>
        </span>
      </header>

      <div className="px-6 py-8">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-medium tracking-tight text-text-strong">
            Hello, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-text">
            Here&apos;s your performance snapshot for {cycle?.name ?? "this cycle"}.
          </p>
        </div>

        {/* ====== ROLE-SPECIFIC OVERVIEW ====== */}
        {role === "EMPLOYEE" && (
          <EmployeeOverview sheet={ownSheet} overallScore={overallScore} />
        )}

        {role === "MANAGER" && (
          <ManagerOverview
            ownSheet={ownSheet}
            overallScore={overallScore}
            pendingApprovals={pendingApprovals}
            teamCount={teamCount}
          />
        )}

        {role === "ADMIN" && orgStats && <AdminOverview stats={orgStats} cycle={cycle} />}
      </div>
    </div>
  );
}

// ============================================================
// Employee Overview
// ============================================================
function EmployeeOverview({
  sheet,
  overallScore,
}: {
  sheet: { id: string; status: string; goals: { progressPct: number | null }[] } | null;
  overallScore: number;
}) {
  if (!sheet) {
    return (
      <EmptyState
        title="You don't have a goal sheet yet"
        body="Get started by creating your first goal sheet for this cycle. Use the AI Coach to write SMARTer goals."
        cta={{ href: "/dashboard/goals/new", label: "Create goal sheet" }}
      />
    );
  }

  const completed = sheet.goals.filter((g) => (g.progressPct ?? 0) >= 100).length;
  const onTrack = sheet.goals.filter((g) => {
    const p = g.progressPct ?? 0;
    return p > 0 && p < 100;
  }).length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Overall progress"
          value={`${overallScore}%`}
          sub="weighted across all goals"
          accent="brand"
        />
        <StatCard
          label="Sheet status"
          value={sheet.status.toLowerCase()}
          sub={sheet.status === "APPROVED" ? "locked & active" : "pending"}
        />
        <StatCard label="Total goals" value={sheet.goals.length.toString()} sub="this cycle" />
        <StatCard
          label="Completed"
          value={`${completed} / ${sheet.goals.length}`}
          sub={`${onTrack} on track`}
          accent="success"
        />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/dashboard/goals"
          className="group inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <span>View my goals</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </Link>
        <Link
          href="/dashboard/checkins"
          className="inline-flex items-center gap-2 rounded-md border border-ink-5 bg-ink-1 px-4 py-2 text-sm text-text-strong transition hover:bg-ink-2"
        >
          <span>Log Q1 check-in</span>
        </Link>
      </div>

      {/* AI Coach Promo */}
      <div className="mt-12 overflow-hidden rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-700/10 via-ink-1 to-ink-1 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20">
            <Sparkles className="h-5 w-5 text-brand-400" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-text-strong">
              AI Goal Coach is live
            </h3>
            <p className="mt-1 text-sm text-text">
              Writing your next goal? Let the coach turn vague drafts into SMART, measurable goals — instantly.
            </p>
            <Link
              href="/dashboard/goals/new"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 transition hover:text-brand-300"
            >
              Try it now
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Manager Overview
// ============================================================
function ManagerOverview({
  ownSheet,
  overallScore,
  pendingApprovals,
  teamCount,
}: {
  ownSheet: { goals: { progressPct: number | null }[] } | null;
  overallScore: number;
  pendingApprovals: number;
  teamCount: number;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Pending approvals"
          value={pendingApprovals.toString()}
          sub={pendingApprovals > 0 ? "awaiting your review" : "all caught up"}
          accent={pendingApprovals > 0 ? "warning" : "success"}
        />
        <StatCard label="Direct reports" value={teamCount.toString()} sub="team members" />
        <StatCard
          label="Your progress"
          value={`${overallScore}%`}
          sub="weighted score"
          accent="brand"
        />
        <StatCard
          label="Goals owned"
          value={(ownSheet?.goals.length ?? 0).toString()}
          sub="this cycle"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {pendingApprovals > 0 && (
          <Link
            href="/dashboard/approvals"
            className="group inline-flex items-center gap-2 rounded-md bg-warning px-4 py-2 text-sm font-medium text-ink-0 transition hover:opacity-90"
          >
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Review {pendingApprovals} sheets</span>
          </Link>
        )}
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 rounded-md border border-ink-5 bg-ink-1 px-4 py-2 text-sm text-text-strong transition hover:bg-ink-2"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={2} />
          <span>View team</span>
        </Link>
      </div>
    </>
  );
}

// ============================================================
// Admin Overview
// ============================================================
function AdminOverview({
  stats,
  cycle,
}: {
  stats: { users: number; activeSheets: number; totalGoals: number; auditEntries: number };
  cycle: { name: string; currentPhase: string } | null;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Org members" value={stats.users.toString()} sub="active users" />
        <StatCard
          label="Active sheets"
          value={stats.activeSheets.toString()}
          sub="submitted + approved"
          accent="brand"
        />
        <StatCard label="Total goals" value={stats.totalGoals.toString()} sub="across all users" />
        <StatCard
          label="Audit entries"
          value={stats.auditEntries.toString()}
          sub="lifetime"
          accent="success"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/audit"
          className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>View audit trail</span>
        </Link>
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 rounded-md border border-ink-5 bg-ink-1 px-4 py-2 text-sm text-text-strong transition hover:bg-ink-2"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Manage users</span>
        </Link>
      </div>

      {cycle && (
        <div className="mt-12 rounded-xl border border-ink-4 bg-ink-1 p-6">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
            Cycle Configuration
          </p>
          <h3 className="mt-2 text-lg font-medium text-text-strong">{cycle.name}</h3>
          <p className="mt-1 text-sm text-text">
            Current phase:{" "}
            <span className="font-mono-data text-brand-400">
              {cycle.currentPhase.replace("_", " ")}
            </span>
          </p>
        </div>
      )}
    </>
  );
}

// ============================================================
// Reusable components
// ============================================================

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "brand" | "success" | "warning";
}) {
  const accentClass =
    accent === "brand"
      ? "text-brand-400"
      : accent === "success"
      ? "text-success"
      : accent === "warning"
      ? "text-warning"
      : "text-text-strong";
  return (
    <div className="rounded-xl border border-ink-4 bg-ink-1 p-5 transition hover:border-ink-5">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
        {label}
      </p>
      <p className={`mt-3 font-display text-2xl font-medium capitalize ${accentClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-soft">{sub}</p>
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-5 bg-ink-1 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-2">
        <ListTodo className="h-5 w-5 text-text-soft" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-display text-lg font-medium text-text-strong">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-text">{body}</p>
      <Link
        href={cta.href}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        <span>{cta.label}</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
