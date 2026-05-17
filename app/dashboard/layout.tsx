import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Target,
  LayoutDashboard,
  ListTodo,
  CheckSquare,
  Users,
  ShieldCheck,
  Sparkles,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV = {
  EMPLOYEE: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/goals", label: "My Goals", icon: ListTodo },
    { href: "/dashboard/checkins", label: "Check-ins", icon: CheckSquare },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/goals", label: "My Goals", icon: ListTodo },
    { href: "/dashboard/team", label: "Team", icon: Users },
    { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/team", label: "All Users", icon: Users },
    { href: "/dashboard/audit", label: "Audit Trail", icon: ShieldCheck },
  ],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const navItems = NAV[role];

  return (
    <div className="flex min-h-screen bg-ink-0">
      {/* ===== Sidebar ===== */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-ink-4 bg-ink-1 md:flex md:flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-ink-4 px-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
            <Target className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[14px] font-semibold tracking-tight text-text-strong">
            Cadence
          </span>
          <span className="ml-auto rounded border border-ink-5 px-1.5 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.15em] text-text-soft">
            {role}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-4">
          <p className="px-2 pb-2 font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-faint">
            Workspace
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-text transition hover:bg-ink-2 hover:text-text-strong"
            >
              <item.icon
                className="h-3.5 w-3.5 text-text-soft group-hover:text-text"
                strokeWidth={2}
              />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User card */}
        <div className="border-t border-ink-4 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-md bg-ink-2 px-2 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
              {session.user.name?.[0] ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-text-strong">
                {session.user.name}
              </p>
              <p className="truncate font-mono-data text-[10px] text-text-soft">
                {session.user.email}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-text-soft transition hover:bg-ink-2 hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
