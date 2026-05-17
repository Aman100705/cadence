import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, ArrowRight } from "lucide-react";
import { computeSheetScore } from "@/lib/scoring";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  const members = await prisma.user.findMany({
    where:
      role === "MANAGER"
        ? { managerId: session.user.id }
        : role === "ADMIN"
        ? {}
        : { id: session.user.id },
    include: {
      goalSheets: {
        where: { cycleId: cycle?.id },
        include: { goals: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-text-strong">
            {role === "ADMIN" ? "All Users" : "Team"}
          </span>
        </div>
        <span className="ml-auto rounded-full border border-ink-5 bg-ink-1 px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-[0.15em] text-text">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </header>

      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
            {role === "ADMIN" ? "All Users" : "Direct Reports"}
          </h1>
          <p className="mt-1.5 text-sm text-text">
            {role === "ADMIN"
              ? "Org-wide view of users and their current sheet status."
              : "Your team's goal sheets at a glance."}
          </p>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-5 bg-ink-1 px-6 py-20 text-center">
            <Users className="h-8 w-8 text-text-soft" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-text">No team members found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink-4 bg-ink-1">
            <div className="grid grid-cols-12 gap-3 border-b border-ink-4 bg-ink-2/50 px-5 py-3 font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Goals</div>
              <div className="col-span-2 text-right">Progress</div>
            </div>
            {members.map((m) => {
              const sheet = m.goalSheets[0];
              const score = sheet ? computeSheetScore(sheet.goals) : 0;
              return (
                <div
                  key={m.id}
                  className="grid grid-cols-12 items-center gap-3 border-b border-ink-4 px-5 py-3 transition last:border-0 hover:bg-ink-2"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                      {m.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-strong">
                        {m.name}
                      </p>
                      <p className="font-mono-data text-[10px] text-text-soft">
                        {m.title ?? m.role}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-text">
                    {m.department ?? "—"}
                  </div>
                  <div className="col-span-2">
                    {sheet ? (
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.12em] ${
                          sheet.status === "APPROVED"
                            ? "border-success/40 bg-success/10 text-success"
                            : sheet.status === "SUBMITTED"
                            ? "border-info/40 bg-info/10 text-info"
                            : sheet.status === "RETURNED"
                            ? "border-warning/40 bg-warning/10 text-warning"
                            : "border-ink-5 bg-ink-2 text-text-soft"
                        }`}
                      >
                        {sheet.status}
                      </span>
                    ) : (
                      <span className="font-mono-data text-[10px] text-text-faint">
                        no sheet
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 font-mono-data text-xs text-text">
                    {sheet ? `${sheet.goals.length} goals` : "—"}
                  </div>
                  <div className="col-span-2 text-right font-mono-data text-sm font-medium text-text-strong">
                    {sheet ? `${score}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
