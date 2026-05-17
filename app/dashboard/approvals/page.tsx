import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function ApprovalsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MANAGER") redirect("/dashboard");

  const userId = session.user.id;

  const pending = await prisma.goalSheet.findMany({
    where: {
      status: "SUBMITTED",
      owner: { managerId: userId },
    },
    include: {
      owner: true,
      goals: true,
      cycle: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-text-strong">Approvals</span>
        </div>
        <span className="ml-auto rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-[0.15em] text-warning">
          {pending.length} pending
        </span>
      </header>

      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
            Approval Queue
          </h1>
          <p className="mt-1.5 text-sm text-text">
            Review goal sheets submitted by your direct reports.
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-5 bg-ink-1 px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" strokeWidth={2} />
            </div>
            <h3 className="mt-5 font-display text-lg font-medium text-text-strong">
              All caught up
            </h3>
            <p className="mt-2 max-w-md text-sm text-text">
              No sheets awaiting your approval right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((sheet) => {
              const totalWeightage = sheet.goals.reduce((s, g) => s + g.weightage, 0);
              const submittedDays = sheet.submittedAt
                ? Math.floor((Date.now() - sheet.submittedAt.getTime()) / 86400000)
                : 0;
              return (
                <Link
                  key={sheet.id}
                  href={`/dashboard/approvals/${sheet.id}`}
                  className="group block rounded-xl border border-ink-4 bg-ink-1 p-5 transition hover:border-brand-500/60"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
                      {sheet.owner.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-strong">
                          {sheet.owner.name}
                        </h3>
                        <span className="font-mono-data text-[10px] text-text-soft">
                          · {sheet.owner.title ?? "Employee"}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 font-mono-data text-[11px] text-text-soft">
                        <span>{sheet.goals.length} goals</span>
                        <span>·</span>
                        <span>{totalWeightage}% weighted</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={2} />
                          {submittedDays}d ago
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-text-soft transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400"
                      strokeWidth={2}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
