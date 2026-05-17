import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Check, RotateCcw, Lock } from "lucide-react";
import { UOM_LABELS } from "@/lib/scoring";
import { approveSheetAction, returnSheetAction } from "./actions";

export default async function ApprovalDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "MANAGER") redirect("/dashboard");

  const sheet = await prisma.goalSheet.findFirst({
    where: { id, owner: { managerId: session.user.id } },
    include: { owner: true, goals: { orderBy: { weightage: "desc" } }, cycle: true },
  });
  if (!sheet) notFound();

  return (
    <div className="h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <Link
          href="/dashboard/approvals"
          className="flex items-center gap-1.5 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft transition hover:text-text-strong"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} />
          <span>Back to queue</span>
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Owner header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-semibold text-white">
            {sheet.owner.name[0]}
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
              {sheet.owner.name}
            </h1>
            <p className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
              {sheet.owner.title} · {sheet.owner.department}
            </p>
          </div>
          <div className="ml-auto rounded-full border border-info/40 bg-info/10 px-3 py-1 font-mono-data text-[10px] uppercase tracking-[0.15em] text-info">
            {sheet.status}
          </div>
        </div>

        {/* Goals list (read-only review for now) */}
        <div className="space-y-3">
          {sheet.goals.map((goal, i) => (
            <div key={goal.id} className="rounded-xl border border-ink-4 bg-ink-1 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-ink-2 font-mono-data text-xs text-text-soft">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                      {goal.thrustArea}
                    </span>
                    <span className="rounded border border-ink-5 bg-ink-2 px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.12em] text-text-soft">
                      {goal.weightage}%
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-text-strong">{goal.title}</h3>
                  {goal.description && (
                    <p className="mt-1 text-sm text-text">{goal.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 font-mono-data text-[11px] text-text-soft">
                    <span>{UOM_LABELS[goal.uomType]}</span>
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action footer */}
        <div className="mt-8 rounded-xl border border-ink-4 bg-ink-1 p-5">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
            Manager Decision
          </p>
          <p className="mt-2 text-sm text-text">
            Approving will lock all goals. Returning will send back to{" "}
            {sheet.owner.name.split(" ")[0]} for rework.
          </p>
          <div className="mt-5 flex gap-2">
            <form action={approveSheetAction}>
              <input type="hidden" name="sheetId" value={sheet.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-ink-0 transition hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Approve & Lock
              </button>
            </form>
            <form action={returnSheetAction}>
              <input type="hidden" name="sheetId" value={sheet.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning/5 px-4 py-2 text-sm font-medium text-warning transition hover:bg-warning/10"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
                Return for rework
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
