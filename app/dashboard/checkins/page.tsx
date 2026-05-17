import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Lock, TrendingUp } from "lucide-react";
import { UOM_LABELS, computeProgress } from "@/lib/scoring";
import { logActualAction } from "./actions";

export default async function CheckinsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  const sheet = await prisma.goalSheet.findFirst({
    where: { ownerId: userId, cycleId: cycle?.id, status: "APPROVED" },
    include: { goals: { orderBy: { weightage: "desc" } } },
  });

  return (
    <div className="h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-text-strong">Check-ins</span>
        </div>
        <span className="ml-auto rounded-full border border-brand-500/40 bg-brand-500/10 px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-[0.15em] text-brand-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 pulse-brand" />
            <span>{cycle?.currentPhase.replace("_", " ")}</span>
          </span>
        </span>
      </header>

      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
            Quarterly Check-in
          </h1>
          <p className="mt-1.5 text-sm text-text">
            Update your actual progress against planned targets. Progress percentages compute automatically based on the UoM type.
          </p>
        </div>

        {!sheet ? (
          <div className="rounded-xl border border-dashed border-ink-5 bg-ink-1 px-6 py-20 text-center">
            <p className="text-text">
              You don&apos;t have an approved goal sheet yet. Submit and get approval first.
            </p>
            <Link
              href="/dashboard/goals"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Go to my goals →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sheet.goals.map((goal, i) => (
              <CheckinRow key={goal.id} goal={goal} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckinRow({
  goal,
  index,
}: {
  goal: {
    id: string;
    title: string;
    thrustArea: string;
    weightage: number;
    uomType: any;
    uomUnit: string | null;
    targetValue: any;
    targetDate: Date | null;
    actualValue: any;
    actualDate: Date | null;
    status: string;
    progressPct: number | null;
    isLocked: boolean;
  };
  index: number;
}) {
  const isTimeline = goal.uomType === "TIMELINE";

  return (
    <form
      action={logActualAction}
      className="rounded-xl border border-ink-4 bg-ink-1 p-5"
    >
      <input type="hidden" name="goalId" value={goal.id} />

      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-ink-2 font-mono-data text-xs text-text-soft">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
              {goal.thrustArea}
            </span>
            <span className="rounded border border-ink-5 bg-ink-2 px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.12em] text-text-soft">
              {goal.weightage}%
            </span>
            {goal.isLocked && (
              <Lock className="h-3 w-3 text-text-soft" strokeWidth={2} />
            )}
          </div>
          <h3 className="mt-2 font-medium text-text-strong">{goal.title}</h3>
          <p className="mt-1 font-mono-data text-[11px] text-text-soft">
            Target:{" "}
            {goal.targetValue
              ? `${goal.targetValue}${goal.uomUnit ? ` ${goal.uomUnit}` : ""}`
              : goal.targetDate
              ? new Date(goal.targetDate).toLocaleDateString()
              : "—"}
            {" · "}
            {UOM_LABELS[goal.uomType as keyof typeof UOM_LABELS]}
          </p>

          {/* Inputs */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {isTimeline ? (
              <div>
                <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                  Actual completion date
                </label>
                <input
                  type="date"
                  name="actualDate"
                  defaultValue={
                    goal.actualDate
                      ? new Date(goal.actualDate).toISOString().slice(0, 10)
                      : ""
                  }
                  className="focus-ring mt-1.5 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong transition focus:border-brand-500"
                />
              </div>
            ) : (
              <div>
                <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                  Actual value
                </label>
                <input
                  type="number"
                  step="any"
                  name="actualValue"
                  defaultValue={goal.actualValue ? String(goal.actualValue) : ""}
                  className="focus-ring mt-1.5 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong transition focus:border-brand-500"
                />
              </div>
            )}

            <div>
              <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Status
              </label>
              <select
                name="status"
                defaultValue={goal.status}
                className="focus-ring mt-1.5 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong transition focus:border-brand-500"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="ON_TRACK">On Track</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Note (optional)
              </label>
              <input
                type="text"
                name="employeeNote"
                placeholder="Brief comment…"
                className="focus-ring mt-1.5 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Progress + save */}
        <div className="flex w-32 flex-col items-end gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink-4">
            <span className="font-mono-data text-sm font-semibold text-text-strong">
              {Math.round(goal.progressPct ?? 0)}%
            </span>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
          >
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
