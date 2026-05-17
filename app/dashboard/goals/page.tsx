import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus, Lock, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { computeSheetScore, UOM_LABELS } from "@/lib/scoring";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  const sheet = await prisma.goalSheet.findFirst({
    where: { ownerId: userId, cycleId: cycle?.id },
    include: { goals: { orderBy: { weightage: "desc" } } },
  });

  return (
    <div className="h-screen overflow-y-auto">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-text-strong">My Goals</span>
        </div>
        {sheet && (
          <span className={`ml-auto rounded-full border px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-[0.15em] ${sheetStatusClasses(sheet.status)}`}>
            <span className="inline-flex items-center gap-1.5">
              {sheetStatusIcon(sheet.status)}
              <span>{sheet.status}</span>
            </span>
          </span>
        )}
      </header>

      <div className="px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
              Goal Sheet · {cycle?.name}
            </h1>
            <p className="mt-1.5 text-sm text-text">
              {sheet
                ? `${sheet.goals.length} goals · ${sheet.goals.reduce((s, g) => s + g.weightage, 0)}% weighted`
                : "No sheet for this cycle yet."}
            </p>
          </div>
          {(!sheet || sheet.status === "DRAFT" || sheet.status === "RETURNED") && (
            <Link
              href="/dashboard/goals/new"
              className="group inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>Add goal</span>
            </Link>
          )}
        </div>

        {!sheet || sheet.goals.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-5 bg-ink-1 px-6 py-20 text-center">
            <h3 className="font-display text-lg font-medium text-text-strong">
              No goals yet
            </h3>
            <p className="mt-2 max-w-md text-sm text-text">
              Start by adding your first goal. Use the AI Coach to refine drafts into SMART goals before submitting.
            </p>
            <Link
              href="/dashboard/goals/new"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>Add first goal</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sheet.goals.map((goal, i) => (
              <div
                key={goal.id}
                className="group rounded-xl border border-ink-4 bg-ink-1 p-5 transition hover:border-ink-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                        {String(i + 1).padStart(2, "0")} · {goal.thrustArea}
                      </span>
                      <span className="font-mono-data text-[10px] text-text-faint">·</span>
                      <span className="rounded border border-ink-5 bg-ink-2 px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.12em] text-text-soft">
                        {goal.weightage}%
                      </span>
                      {goal.isLocked && (
                        <Lock className="h-3 w-3 text-text-soft" strokeWidth={2} />
                      )}
                    </div>
                    <h3 className="mt-2 text-[15px] font-medium text-text-strong">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="mt-1 text-sm text-text">{goal.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-text-soft">
                      <span className="font-mono-data">
                        {UOM_LABELS[goal.uomType]}
                      </span>
                      <span>·</span>
                      <span>
                        Target:{" "}
                        <span className="text-text">
                          {goal.targetValue
                            ? `${goal.targetValue}${goal.uomUnit ? ` ${goal.uomUnit}` : ""}`
                            : goal.targetDate
                            ? new Date(goal.targetDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </span>
                      {goal.actualValue != null && (
                        <>
                          <span>·</span>
                          <span>
                            Actual:{" "}
                            <span className="text-text">
                              {String(goal.actualValue)}
                              {goal.uomUnit ? ` ${goal.uomUnit}` : ""}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-4">
                      <span className="font-mono-data text-sm font-medium text-text-strong">
                        {Math.round(goal.progressPct ?? 0)}%
                      </span>
                    </div>
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.12em] ${goalStatusClasses(goal.status)}`}
                    >
                      {goal.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit footer */}
            {(sheet.status === "DRAFT" || sheet.status === "RETURNED") && (
              <SubmitSheetCard sheet={sheet} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitSheetCard({ sheet }: { sheet: { id: string; goals: { weightage: number }[] } }) {
  const totalWeightage = sheet.goals.reduce((s, g) => s + g.weightage, 0);
  const isValid = totalWeightage === 100 && sheet.goals.length > 0 && sheet.goals.length <= 8;

  return (
    <div className="mt-6 rounded-xl border border-ink-4 bg-ink-1 p-5">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
        Submission Check
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <ValidationItem
          label="Total weightage = 100%"
          ok={totalWeightage === 100}
          actual={`${totalWeightage}%`}
        />
        <ValidationItem
          label="Min 1 goal"
          ok={sheet.goals.length >= 1}
          actual={`${sheet.goals.length} goals`}
        />
        <ValidationItem
          label="Max 8 goals"
          ok={sheet.goals.length <= 8}
          actual={`${sheet.goals.length} goals`}
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <form action={`/api/sheet/${sheet.id}/submit`} method="POST">
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit for approval →
          </button>
        </form>
      </div>
    </div>
  );
}

function ValidationItem({ label, ok, actual }: { label: string; ok: boolean; actual: string }) {
  return (
    <div className={`rounded-md border p-3 ${ok ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
      <div className="flex items-center gap-1.5">
        {ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-warning" strokeWidth={2.5} />
        )}
        <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text">
          {label}
        </span>
      </div>
      <p className={`mt-1 text-xs ${ok ? "text-success" : "text-warning"}`}>{actual}</p>
    </div>
  );
}

function sheetStatusClasses(status: string) {
  switch (status) {
    case "APPROVED":
      return "border-success/40 bg-success/10 text-success";
    case "SUBMITTED":
      return "border-info/40 bg-info/10 text-info";
    case "RETURNED":
      return "border-warning/40 bg-warning/10 text-warning";
    default:
      return "border-ink-5 bg-ink-2 text-text-soft";
  }
}

function sheetStatusIcon(status: string) {
  switch (status) {
    case "APPROVED":
      return <Lock className="h-3 w-3" strokeWidth={2.5} />;
    case "SUBMITTED":
      return <Clock className="h-3 w-3" strokeWidth={2.5} />;
    default:
      return <Clock className="h-3 w-3" strokeWidth={2.5} />;
  }
}

function goalStatusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "border-success/40 bg-success/10 text-success";
    case "ON_TRACK":
      return "border-info/40 bg-info/10 text-info";
    default:
      return "border-ink-5 bg-ink-2 text-text-soft";
  }
}
