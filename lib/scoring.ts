/**
 * Cadence — Goal Scoring Engine
 * Per BRD: 4 UoM type families, each with its own formula.
 */

import type { UoMType, GoalStatus } from "@prisma/client";

export const UOM_LABELS: Record<UoMType, string> = {
  NUMERIC_MIN: "Numeric — Higher is Better",
  NUMERIC_MAX: "Numeric — Lower is Better",
  PERCENT_MIN: "Percentage — Higher is Better",
  PERCENT_MAX: "Percentage — Lower is Better",
  TIMELINE: "Timeline — Date Completion",
  ZERO: "Zero-Based — Zero is Success",
};

export const UOM_HINTS: Record<UoMType, string> = {
  NUMERIC_MIN: "e.g., Sales Revenue, Leads Closed, Features Shipped",
  NUMERIC_MAX: "e.g., TAT, Bug Count, Cost",
  PERCENT_MIN: "e.g., Coverage %, Satisfaction Score",
  PERCENT_MAX: "e.g., Error Rate, Churn %",
  TIMELINE: "e.g., Certification deadline, Project launch date",
  ZERO: "e.g., Safety Incidents, Compliance Violations",
};

export const THRUST_AREAS = [
  "Revenue",
  "Innovation",
  "Quality",
  "People",
  "Customer",
  "Operations",
] as const;

/**
 * Compute progress percentage (0..100) given UoM type, target, and achievement.
 */
export function computeProgress(args: {
  uomType: UoMType;
  targetValue?: number | null;
  actualValue?: number | null;
  targetDate?: Date | null;
  actualDate?: Date | null;
}): number {
  const { uomType, targetValue, actualValue, targetDate, actualDate } = args;

  switch (uomType) {
    case "NUMERIC_MIN":
    case "PERCENT_MIN": {
      if (!targetValue || actualValue == null) return 0;
      return clamp((actualValue / targetValue) * 100);
    }
    case "NUMERIC_MAX":
    case "PERCENT_MAX": {
      if (!targetValue || !actualValue) return 0;
      return clamp((targetValue / actualValue) * 100);
    }
    case "TIMELINE": {
      if (!targetDate || !actualDate) return 0;
      return new Date(actualDate) <= new Date(targetDate) ? 100 : 0;
    }
    case "ZERO": {
      if (actualValue == null) return 0;
      return Number(actualValue) === 0 ? 100 : 0;
    }
    default:
      return 0;
  }
}

function clamp(n: number) {
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n * 10) / 10));
}

/**
 * Weighted overall score for a sheet.
 */
export function computeSheetScore(
  goals: { weightage: number; progressPct?: number | null }[]
): number {
  if (goals.length === 0) return 0;
  const total = goals.reduce((sum, g) => {
    return sum + (g.progressPct ?? 0) * (g.weightage / 100);
  }, 0);
  return Math.round(total * 10) / 10;
}

/**
 * Status to color mapping.
 */
export function statusColor(status: GoalStatus | string) {
  switch (status) {
    case "COMPLETED":
      return "text-success";
    case "ON_TRACK":
      return "text-info";
    case "NOT_STARTED":
    default:
      return "text-text-soft";
  }
}

export function statusBg(status: GoalStatus | string) {
  switch (status) {
    case "COMPLETED":
      return "bg-success/10 border-success/40 text-success";
    case "ON_TRACK":
      return "bg-info/10 border-info/40 text-info";
    case "NOT_STARTED":
    default:
      return "bg-ink-2 border-ink-5 text-text-soft";
  }
}

export function progressColor(pct: number): string {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#3b82f6";
  if (pct >= 25) return "#f59e0b";
  return "#ef4444";
}
