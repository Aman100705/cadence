"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Target,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Lock,
  Workflow,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      {/* Ambient grid background */}
      <div className="pointer-events-none fixed inset-0 bg-grid-dots opacity-100" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.4) 0%, transparent 60%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
              <Target className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight text-text-strong">
              Cadence
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm text-text transition hover:text-text-strong"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="group flex items-center gap-1.5 rounded-md bg-brand-500 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Launch app
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-24 pb-32 md:pt-32 md:pb-40">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/80 bg-ink-1/50 px-3 py-1 backdrop-blur-sm"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-brand-500 pulse-brand" />
            <span className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-text">
              AtomQuest Hackathon · v1.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display max-w-4xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl"
          >
            <span className="text-gradient">Goal-setting,</span>
            <br />
            <span className="text-text-strong">on a real cadence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-7 max-w-2xl text-lg leading-relaxed text-text"
          >
            A modern goal-setting and tracking portal for high-performing teams.
            Built on a quarterly rhythm of check-ins, with an AI Goal Coach that
            helps employees write SMARTer goals from the start.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-md bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <span>Launch app</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
            <a
              href="#features"
              className="rounded-md border border-ink-5 bg-ink-1 px-5 py-3 text-sm text-text-strong transition hover:bg-ink-2"
            >
              See how it works
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 gap-4 border-t border-border/60 pt-10 md:grid-cols-4"
          >
            {[
              { label: "User roles", value: "3", sub: "Employee / Manager / Admin" },
              { label: "UoM types", value: "6", sub: "Including timeline & zero-based" },
              { label: "Check-in cycles", value: "4", sub: "Quarterly rhythm" },
              { label: "AI coaching", value: "Live", sub: "Gemini-powered" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                  {s.label}
                </p>
                <p className="mt-2 font-display text-3xl font-medium text-text-strong">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-text">{s.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-border/60 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex items-center gap-3">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-text-soft">
              02 / Capabilities
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <h2 className="font-display max-w-2xl text-3xl font-medium tracking-tight text-text-strong md:text-4xl">
            Every requirement, end to end.{" "}
            <span className="text-text-soft">Plus the parts that delight.</span>
          </h2>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Workflow,
                title: "Approval workflow",
                body: "Employees draft goal sheets, managers approve inline, sheets lock automatically. Returned goals re-enter the queue with comments.",
              },
              {
                icon: TrendingUp,
                title: "Quarterly check-ins",
                body: "Q1, Q2, Q3, Q4-Final windows enforced. Employees log actuals, managers comment, progress auto-computed across 6 UoM types.",
              },
              {
                icon: Sparkles,
                title: "AI Goal Coach",
                body: "Live Gemini suggestions reframe weak goals into SMART ones. Score quality 1-10 before submission. The thing other portals don't have.",
                wow: true,
              },
              {
                icon: ShieldCheck,
                title: "Audit trail",
                body: "Every change after the lock date captured with who / what / when. Admin can view full history per goal and export.",
              },
              {
                icon: Lock,
                title: "Shared goals",
                body: "Departmental KPIs pushed to multiple employees. Weightage editable per recipient; targets sync from the primary owner.",
              },
              {
                icon: Target,
                title: "Validation, enforced",
                body: "Total weightage = 100%, min 10% per goal, max 8 goals per sheet — all enforced before submission. No invalid sheets reach managers.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`group relative rounded-xl border bg-ink-1 p-6 transition ${
                  f.wow
                    ? "border-brand-500/40 ring-1 ring-brand-500/20"
                    : "border-border hover:border-ink-5"
                }`}
              >
                {f.wow && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-brand-500/40 bg-brand-500/10 px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.15em] text-brand-300">
                    <span className="h-1 w-1 rounded-full bg-brand-400 pulse-brand" />
                    New
                  </span>
                )}
                <f.icon className="h-5 w-5 text-text group-hover:text-brand-400 transition" strokeWidth={1.5} />
                <h3 className="mt-5 font-medium text-text-strong">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 border-t border-border/60 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight text-text-strong md:text-4xl">
            Try the demo in 60 seconds.
          </h2>
          <p className="mt-4 text-text">
            Three pre-seeded user roles. No signup. Just{" "}
            <span className="font-mono-data text-text-strong">employee@cadence.com</span>{" "}
            to start.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <span>Launch app</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-text-soft">
          <span>Built for AtomQuest Hackathon 1.0 · 2026</span>
          <span className="font-mono-data">cadence.app</span>
        </div>
      </footer>
    </main>
  );
}
