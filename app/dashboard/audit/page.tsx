import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Download, ShieldCheck, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: true },
  });

  return (
    <div className="h-screen overflow-y-auto">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-text-strong">Audit Trail</span>
        </div>
        <a
          href="/api/export"
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
        >
          <Download className="h-3 w-3" strokeWidth={2.5} />
          Export Excel
        </a>
      </header>

      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
            Audit Trail
          </h1>
          <p className="mt-1.5 text-sm text-text">
            Every change captured · who, what, and when. Required by BRD § 4.3.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-5 bg-ink-1 px-6 py-20 text-center">
            <ShieldCheck className="h-8 w-8 text-text-soft" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-text">No audit entries yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink-4 bg-ink-1">
            <div className="grid grid-cols-12 gap-3 border-b border-ink-4 bg-ink-2/50 px-5 py-3 font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
              <div className="col-span-3">Actor</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-2">Entity</div>
              <div className="col-span-3">Note</div>
              <div className="col-span-2 text-right">When</div>
            </div>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 items-center gap-3 border-b border-ink-4 px-5 py-3 transition last:border-0 hover:bg-ink-2"
              >
                <div className="col-span-3 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-semibold text-white">
                    {entry.actor.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text-strong">
                      {entry.actor.name}
                    </p>
                    <p className="font-mono-data text-[10px] text-text-soft">
                      {entry.actor.role}
                    </p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="rounded border border-ink-5 bg-ink-2 px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.12em] text-brand-300">
                    {entry.action.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="col-span-2 font-mono-data text-[10px] text-text-soft">
                  {entry.entityType}
                </div>
                <div className="col-span-3 truncate text-xs text-text">
                  {entry.note ?? "—"}
                </div>
                <div className="col-span-2 text-right font-mono-data text-[10px] text-text-soft">
                  {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
