"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
  X,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { THRUST_AREAS, UOM_LABELS, UOM_HINTS } from "@/lib/scoring";
import { createGoalAction } from "./actions";

const UOM_TYPES = Object.keys(UOM_LABELS) as Array<keyof typeof UOM_LABELS>;

type CoachResult = {
  suggestion: string;
  rationale: string;
  smartScore: number;
  tips: string[];
};

export default function NewGoalPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thrustArea, setThrustArea] = useState("Innovation");
  const [uomType, setUomType] = useState<keyof typeof UOM_LABELS>("NUMERIC_MIN");
  const [uomUnit, setUomUnit] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weightage, setWeightage] = useState(20);

  // AI Coach state
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachResult, setCoachResult] = useState<CoachResult | null>(null);

  const isTimelineUom = uomType === "TIMELINE";

  async function askCoach() {
    if (title.trim().length < 5) {
      toast.error("Write at least 5 characters first");
      return;
    }
    setCoachLoading(true);
    setCoachOpen(true);
    setCoachResult(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, thrustArea, uomType, targetValue }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Coach unavailable");
      }
      const data = await res.json();
      setCoachResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI Coach failed");
      setCoachOpen(false);
    } finally {
      setCoachLoading(false);
    }
  }

  function applySuggestion() {
    if (!coachResult) return;
    setTitle(coachResult.suggestion);
    setCoachOpen(false);
    toast.success("Suggestion applied");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("thrustArea", thrustArea);
    fd.set("uomType", uomType);
    fd.set("uomUnit", uomUnit);
    if (!isTimelineUom) fd.set("targetValue", targetValue);
    if (isTimelineUom) fd.set("targetDate", targetDate);
    fd.set("weightage", weightage.toString());

    startTransition(async () => {
      try {
        await createGoalAction(fd);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <div className="h-screen overflow-y-auto">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-ink-4 bg-ink-0/80 px-6 backdrop-blur-md">
        <Link
          href="/dashboard/goals"
          className="flex items-center gap-1.5 font-mono-data text-[11px] uppercase tracking-[0.15em] text-text-soft transition hover:text-text-strong"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} />
          <span>Back to goals</span>
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-medium tracking-tight text-text-strong">
            Add a new goal
          </h1>
          <p className="mt-1.5 text-sm text-text">
            Stuck on the wording? Use the AI Goal Coach to refine vague drafts into SMART goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Goal title with AI Coach button */}
          <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
            <div className="flex items-center justify-between">
              <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Goal title <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                onClick={askCoach}
                disabled={coachLoading || title.length < 5}
                className="group inline-flex items-center gap-1.5 rounded-md border border-brand-500/40 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-300 transition hover:border-brand-500 hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {coachLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                )}
                <span>{coachLoading ? "Coaching…" : "Ask AI Coach"}</span>
              </button>
            </div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Improve checkout conversion by 15% by Q3"
              rows={2}
              className="focus-ring mt-3 w-full resize-none rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
              required
            />
            <p className="mt-2 text-[11px] text-text-soft">
              {title.length} / 200 characters · be specific and measurable
            </p>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
            <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context, success criteria, dependencies…"
              rows={3}
              className="focus-ring mt-3 w-full resize-none rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
            />
          </div>

          {/* Thrust area + UoM type */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
              <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Thrust area <span className="text-danger">*</span>
              </label>
              <select
                value={thrustArea}
                onChange={(e) => setThrustArea(e.target.value)}
                className="focus-ring mt-3 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong transition focus:border-brand-500"
              >
                {THRUST_AREAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
              <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Unit of measurement <span className="text-danger">*</span>
              </label>
              <select
                value={uomType}
                onChange={(e) => setUomType(e.target.value as keyof typeof UOM_LABELS)}
                className="focus-ring mt-3 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong transition focus:border-brand-500"
              >
                {UOM_TYPES.map((u) => (
                  <option key={u} value={u}>
                    {UOM_LABELS[u]}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-text-soft">{UOM_HINTS[uomType]}</p>
            </div>
          </div>

          {/* Target + weightage */}
          <div className="grid gap-5 md:grid-cols-3">
            {isTimelineUom ? (
              <div className="rounded-xl border border-ink-4 bg-ink-1 p-5 md:col-span-2">
                <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                  Target date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="focus-ring mt-3 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong transition focus:border-brand-500"
                  required
                />
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
                  <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                    Target value
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g., 100"
                    className="focus-ring mt-3 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
                  />
                </div>
                <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
                  <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={uomUnit}
                    onChange={(e) => setUomUnit(e.target.value)}
                    placeholder="e.g., %, INR Cr, days"
                    className="focus-ring mt-3 w-full rounded-md border border-ink-4 bg-ink-0 px-3 py-2 text-sm text-text-strong placeholder:text-text-faint transition focus:border-brand-500"
                  />
                </div>
              </>
            )}

            <div className="rounded-xl border border-ink-4 bg-ink-1 p-5">
              <label className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                Weightage <span className="text-danger">*</span>
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={weightage}
                  onChange={(e) => setWeightage(Number(e.target.value))}
                  className="flex-1 accent-brand-500"
                />
                <span className="font-mono-data text-sm font-medium text-brand-400 tabular-nums">
                  {weightage}%
                </span>
              </div>
              <p className="mt-2 text-[11px] text-text-soft">min 10% · total must = 100%</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t border-ink-4 pt-5">
            <Link
              href="/dashboard/goals"
              className="rounded-md border border-ink-5 bg-ink-1 px-4 py-2 text-sm text-text-strong transition hover:bg-ink-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <span>Save goal</span>
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ===== AI COACH MODAL ===== */}
      <AnimatePresence>
        {coachOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/80 backdrop-blur-sm px-4"
            onClick={() => !coachLoading && setCoachOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-brand-500/30 bg-ink-1 shadow-2xl shadow-brand-700/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-ink-4 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/20">
                    <Sparkles className="h-4 w-4 text-brand-400" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-strong">AI Goal Coach</h3>
                    <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-text-soft">
                      Powered by Gemini
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCoachOpen(false)}
                  disabled={coachLoading}
                  className="rounded-md p-1 text-text-soft transition hover:bg-ink-2 hover:text-text-strong disabled:opacity-50"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {coachLoading ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="relative h-10 w-10">
                      <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20">
                        <Sparkles className="h-5 w-5 text-brand-400" strokeWidth={2} />
                      </div>
                    </div>
                    <p className="mt-6 text-sm text-text">
                      Reviewing your goal…
                    </p>
                    <p className="mt-1 font-mono-data text-[11px] text-text-soft">
                      Applying SMART framework
                    </p>
                  </div>
                ) : coachResult ? (
                  <>
                    {/* Original */}
                    <div>
                      <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                        Your draft
                      </p>
                      <p className="mt-2 rounded-md border border-ink-4 bg-ink-0 p-3 text-sm text-text">
                        {title}
                      </p>
                    </div>

                    {/* SMART Score */}
                    <div className="mt-5 flex items-center gap-3 rounded-lg border border-ink-4 bg-ink-0 px-4 py-3">
                      <TrendingUp className="h-4 w-4 text-brand-400" strokeWidth={2} />
                      <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                        SMART score
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${coachResult.smartScore * 10}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
                          />
                        </div>
                        <span className="font-mono-data text-sm font-medium text-text-strong tabular-nums">
                          {coachResult.smartScore}/10
                        </span>
                      </div>
                    </div>

                    {/* Suggestion */}
                    <div className="mt-5">
                      <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-brand-400">
                        ✨ Coached version
                      </p>
                      <p className="mt-2 rounded-md border border-brand-500/40 bg-brand-500/5 p-3 text-sm text-text-strong">
                        {coachResult.suggestion}
                      </p>
                      <p className="mt-2 text-[11px] italic text-text-soft">
                        {coachResult.rationale}
                      </p>
                    </div>

                    {/* Tips */}
                    {coachResult.tips.length > 0 && (
                      <div className="mt-5">
                        <p className="flex items-center gap-1.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-text-soft">
                          <Lightbulb className="h-3 w-3" strokeWidth={2} />
                          Coaching tips
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {coachResult.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text">
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-brand-400" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Footer */}
              {coachResult && (
                <div className="flex items-center justify-end gap-2 border-t border-ink-4 bg-ink-2/50 px-6 py-3">
                  <button
                    type="button"
                    onClick={() => setCoachOpen(false)}
                    className="rounded-md px-3 py-1.5 text-xs text-text transition hover:bg-ink-2 hover:text-text-strong"
                  >
                    Keep mine
                  </button>
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    Apply suggestion
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
