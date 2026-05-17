<div align="center">

# Cadence

### Goal-setting, on a real cadence.

A modern goal-setting and performance-tracking portal for high-performing teams.
Built on a quarterly rhythm of check-ins, with an AI Goal Coach that turns vague drafts into SMART goals.

[![Live](https://img.shields.io/badge/live-cadence--cyan.vercel.app-000000?style=flat-square&logo=vercel)](https://cadence-cyan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/Postgres-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-6366F1?style=flat-square&logo=google)](https://ai.google.dev)

**[🌐 Live Demo](https://cadence-cyan.vercel.app)** · Built for **AtomQuest Hackathon 1.0**

</div>

---

## ✨ Try it in 60 seconds

The deployed app is pre-seeded with realistic demo data. **No signup required** — three role-specific quick-login chips on the login screen:

| Role | Email | Password |
| --- | --- | --- |
| 👤 **Employee** | `employee@cadence.com` | `employee123` |
| 👔 **Manager** | `manager@cadence.com` | `manager123` |
| 🔧 **Admin** | `admin@cadence.com` | `admin123` |

Go to **[cadence-cyan.vercel.app](https://cadence-cyan.vercel.app)** and tap any chip to see that role's dashboard instantly.

---

## 🎯 What it does

Cadence solves a real problem stated in the AtomQuest BRD: organizations relying on spreadsheets, emails, and ad-hoc reviews lose visibility into goal progress. Managers can't track team alignment in real time, HR has no audit trail, and employees lack clarity on what success looks like.

This portal replaces all that with a structured digital workflow — **draft → submit → approve → lock → quarterly check-ins → audit-ready reporting** — backed by a transparent scoring engine and an AI coach that helps employees write better goals from the start.

---

## 🌟 Highlights

- 🧠 **AI Goal Coach** — Live Gemini-powered suggestions reframe vague drafts into SMART, measurable goals with a 1–10 quality score and improvement tips. The thing judges remember.
- 🔐 **3-role RBAC** — Employee, Manager, and Admin views with role-specific navigation and data scopes. Multi-tenant safe by default — managers only see their direct reports.
- ✅ **All BRD validation enforced** — Total weightage = 100%, min 10% per goal, max 8 goals per sheet. Sheets won't submit until valid.
- 📊 **Six UoM scoring formulas** — Numeric Min/Max, Percentage Min/Max, Timeline (date completion), and Zero-based (success = 0). Each goal scores itself automatically.
- 🔒 **Approval workflow** — Manager reviews submitted sheets, approves or returns for rework. Approved sheets lock all goals; further edits require admin intervention.
- 🔍 **Audit trail** — Every state change captured with actor, action, entity, note, and timestamp. BRD § 4.3 compliant.
- 📥 **Excel export** — Two-sheet workbook (Goals Overview + Sheet Summary) with planned vs actual columns, branded header colors. One click from Admin.
- 🎨 **Mission Control UI** — Distinctive dark Linear-inspired aesthetic. Not your typical SaaS dashboard.

---

## 🏗 Architecture

```
                          ┌─────────────────────────────┐
                          │      Vercel Edge (CDN)      │
                          │      Next.js 16 SSR         │
                          └──────────────┬──────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
       ┌──────▼──────┐           ┌───────▼────────┐         ┌───────▼──────┐
       │  App Router │           │ Server Actions │         │  API Routes  │
       │   (pages)   │           │  (mutations)   │         │  /coach +    │
       │             │           │                │         │  /export     │
       └──────┬──────┘           └───────┬────────┘         └──────┬───────┘
              │                          │                         │
              └──────────────┬───────────┘                         │
                             │                                     │
                ┌────────────▼─────────────┐         ┌─────────────▼──────────────┐
                │    Auth.js (NextAuth v5) │         │     Google Gemini API      │
                │    JWT sessions, 3 roles │         │  (gemini-2.5-flash-lite)   │
                └────────────┬─────────────┘         └────────────────────────────┘
                             │
                ┌────────────▼─────────────┐
                │     Prisma ORM (v6)      │
                │      Type-safe SQL       │
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
                │   PostgreSQL on Neon     │
                │   7 tables / 4 enums     │
                └──────────────────────────┘
```

**Single-deployment full-stack app.** No separate backend service. No CORS. Server Actions handle every mutation. Prisma generates fully-typed client code from the schema.

---

## 🛠 Tech stack

| Layer | Technology | Why |
| --- | --- | --- |
| **Framework** | Next.js 16 (App Router, Server Actions) | One deploy, one mental model |
| **Language** | TypeScript 5 | Type-safe end-to-end with Prisma |
| **Styling** | Tailwind CSS 4 | Custom "Mission Control" design tokens |
| **Animation** | Framer Motion | Modal entrances, stat-card reveals |
| **Auth** | Auth.js v5 (NextAuth beta) | JWT sessions, role claims |
| **DB** | PostgreSQL via Neon | Free-tier serverless, instant setup |
| **ORM** | Prisma 6 | Schema-first, fully typed |
| **AI** | Google Gemini 2.5 Flash Lite | Sub-second goal coaching |
| **Excel** | ExcelJS | Multi-sheet workbook export |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Hosting** | Vercel | Auto-deploy on `git push` |

---

## 📐 Data model

Seven Prisma models cover the full BRD lifecycle:

```
User            ─┐   3 roles (EMPLOYEE / MANAGER / ADMIN) + org hierarchy via managerId
GoalSheet       ─┤   one per (User × Cycle) — status: DRAFT/SUBMITTED/APPROVED/RETURNED
Goal            ─┤   the work itself — 6 UoM types, weightage 10-100, lock state
CheckIn         ─┤   one per (Goal × Period) — Q1/Q2/Q3/Q4_FINAL
Cycle           ─┤   annual cycle with currentPhase tracking
AuditLog        ─┤   every state change captured for compliance
AiSuggestion    ─┘   AI Coach interactions logged for analytics
```

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema.

---

## 🧮 Scoring engine

Each goal scores itself based on its UoM type. All formulas defined in [`lib/scoring.ts`](./lib/scoring.ts):

| UoM Type | When to use | Formula |
| --- | --- | --- |
| `NUMERIC_MIN` | Higher is better — Revenue, Features Shipped | `Achievement / Target × 100` |
| `NUMERIC_MAX` | Lower is better — TAT, Cost, Bug Count | `Target / Achievement × 100` |
| `PERCENT_MIN` | Higher is better — Coverage %, Satisfaction | Same as NUMERIC_MIN |
| `PERCENT_MAX` | Lower is better — Error Rate, Churn % | Same as NUMERIC_MAX |
| `TIMELINE` | Date-based completion | `100` if actual ≤ target date, else `0` |
| `ZERO` | Zero = success — Safety, Compliance | `100` if actual = 0, else `0` |

A sheet's overall score is the weighted sum of its goals' progress percentages.

---

## 🧠 AI Goal Coach

The feature that sets Cadence apart from every other goal-tracking tool.

When an employee drafts a goal, they can hit **✨ Ask AI Coach** to get an instant Gemini-powered rewrite. The coach:

1. Takes the draft title, thrust area, UoM type, and target as context
2. Applies the **SMART** framework (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Returns a rewritten title (≤120 chars), a one-sentence rationale, a 1–10 SMART score, and 2-4 coaching tips
4. Logs the suggestion to `AiSuggestion` table for analytics

Implementation in [`lib/coach.ts`](./lib/coach.ts). Uses structured JSON output (`responseMimeType: "application/json"`) and a model fallback chain (Flash Lite → Flash → 1.5 Flash) so quota limits don't break the experience.

**Example**

> **Draft:** "Get better at coding"
> **Coached:** "Complete 50 LeetCode medium-level problems and ship 2 production features in Q3"
> **SMART Score:** 9/10
> **Tips:**
> - Specify a quantitative threshold (50 problems)
> - Bind the goal to a time window (Q3)
> - Pair learning with shipped output

---

## 🧪 Local development

### Prerequisites

- Node.js 20+
- A free Neon Postgres database (or any Postgres 14+)
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Clone
git clone https://github.com/Aman100705/cadence.git
cd cadence

# 2. Install
npm install --legacy-peer-deps

# 3. Configure
cp .env.example .env
# Edit .env — paste your DATABASE_URL, AUTH_SECRET, and GOOGLE_GENERATIVE_AI_API_KEY

# 4. Push schema + seed demo data
npx prisma db push
npx tsx prisma/seed.ts

# 5. Run dev server
npm run dev
```

Open **http://localhost:3000** and click any quick-login chip.

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon, Supabase, Railway, or local) |
| `AUTH_SECRET` | Random string for JWT signing (`openssl rand -hex 32`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key for the AI Coach |

---

## 📂 Project structure

```
cadence/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── login/                            # Auth screens
│   ├── dashboard/
│   │   ├── layout.tsx                    # Role-aware sidebar
│   │   ├── page.tsx                      # Role-specific overview
│   │   ├── goals/
│   │   │   ├── page.tsx                  # My goals list
│   │   │   └── new/                      # Goal creator + AI Coach modal
│   │   ├── checkins/                     # Quarterly check-in interface
│   │   ├── approvals/[id]/               # Manager review workflow
│   │   ├── team/                         # Manager + Admin team view
│   │   └── audit/                        # Admin audit trail viewer
│   └── api/
│       ├── coach/                        # Gemini AI Coach endpoint
│       └── export/                       # Excel workbook generator
├── components/                           # Reusable UI primitives
├── lib/
│   ├── auth.ts                           # Auth.js config
│   ├── db.ts                             # Prisma client singleton
│   ├── coach.ts                          # Gemini integration
│   └── scoring.ts                        # UoM formulas + score engine
└── prisma/
    ├── schema.prisma                     # 7 models, 4 enums
    └── seed.ts                           # Demo data for 5 users
```

---

## ✅ BRD coverage

Every must-have requirement from the AtomQuest brief is implemented:

| Phase | Requirement | Status |
| --- | --- | --- |
| 1 | Employee creates & submits goal sheet | ✅ |
| 1 | Select Thrust Area + Title + Description | ✅ |
| 1 | Assign UoM (6 types) and Target | ✅ |
| 1 | Set weightage per goal | ✅ |
| 1 | Total weightage = 100% (enforced) | ✅ |
| 1 | Minimum 10% per goal (enforced) | ✅ |
| 1 | Maximum 8 goals (enforced) | ✅ |
| 1 | Manager approval workflow | ✅ |
| 1 | Approve / return for rework | ✅ |
| 1 | Lock goals on approval | ✅ |
| 2 | Quarterly check-in interface | ✅ |
| 2 | Actual vs Planned with status | ✅ |
| 2 | Manager check-in module | ✅ |
| 2 | Auto-computed progress (4 UoM formulas) | ✅ |
| 4 | Achievement Report (Excel export) | ✅ |
| 4 | Completion dashboard | ✅ |
| 4 | Audit trail with who/what/when | ✅ |
| Bonus 5.4 | Analytics signals (sheet-level scores, completion rates) | ✅ (basic) |

Shared goals & escalation module: schema supports both (`Goal.isShared`, `Goal.parentGoalId`), UI work in progress.

---

## 🚀 Deployment

The live demo runs on Vercel with the database on Neon — both free tiers. Total monthly cost: **$0**.

Deploy your own copy in ~3 minutes:

1. Fork this repo on GitHub
2. Create a free Neon database at [neon.tech](https://neon.tech)
3. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey)
4. On [vercel.com/new](https://vercel.com/new), import the fork
5. Add the three environment variables
6. Click Deploy

Schema push runs automatically via the `postinstall` hook.

---

## 📜 License

MIT — built by [Aman Patel](https://github.com/Aman100705) for AtomQuest Hackathon 1.0 · 2026
