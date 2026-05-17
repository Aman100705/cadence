"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, ArrowLeft, Loader2 } from "lucide-react";
import { loginAction } from "./actions";

const QUICK_LOGINS = [
  { label: "Employee", email: "employee@cadence.com", password: "employee123", role: "Aman Patel · SWE" },
  { label: "Manager", email: "manager@cadence.com", password: "manager123", role: "Rajesh Kumar · EM" },
  { label: "Admin", email: "admin@cadence.com", password: "admin123", role: "Priya Sharma · HR" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);

    startTransition(async () => {
      const result = await loginAction(fd);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function quickLogin(creds: { email: string; password: string }) {
    setEmail(creds.email);
    setPassword(creds.password);
    setError(null);
    const fd = new FormData();
    fd.set("email", creds.email);
    fd.set("password", creds.password);

    startTransition(async () => {
      const result = await loginAction(fd);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      {/* Ambient effects */}
      <div className="pointer-events-none fixed inset-0 bg-grid-dots opacity-80" />
      <div
        className="pointer-events-none fixed left-1/2 top-1/4 h-[400px] w-[800px] -translate-x-1/2 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.6) 0%, transparent 60%)",
        }}
      />

      {/* Back link */}
      <Link
        href="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-1.5 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft transition hover:text-text-strong"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={2} />
        <span>Home</span>
      </Link>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500">
                <Target className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-semibold tracking-tight text-text-strong">
                Cadence
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-border bg-ink-1/80 p-8 backdrop-blur-md">
            <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-text">
              Use a demo account below, or enter credentials manually.
            </p>

            {/* Quick login chips */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {QUICK_LOGINS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  disabled={isPending}
                  onClick={() => quickLogin(q)}
                  className="group flex flex-col items-center gap-1 rounded-md border border-border bg-bg px-2 py-3 text-center transition hover:border-brand-500/60 hover:bg-ink-2 disabled:opacity-50"
                >
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-brand-400 group-hover:text-brand-300">
                    {q.label}
                  </span>
                  <span className="text-[10px] leading-tight text-text-soft">
                    {q.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cadence.com"
                  className="focus-ring mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="focus-ring mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign in →</span>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-text-soft">
            Demo environment · No real authentication. Data resets on seed.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
