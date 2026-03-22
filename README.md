# PathwayIQ 🚀

> **From Resume to Ready — In Minutes**

AI-powered career intelligence that learns you, not the other way around. PathwayIQ analyzes your resume against any job description, identifies your exact skill gaps, generates a personalized interactive learning roadmap, and delivers curated free resources — all in under 30 seconds.

<div align="center">

![PathwayIQ Banner](https://img.shields.io/badge/PathwayIQ-From%20Resume%20to%20Ready-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PC9zdmc+)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=flat-square&logo=supabase)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## ✨ Features

- **🤖 AI Skill Extraction** — Automatically parses resume PDFs client-side and extracts every technical and soft skill
- **🎯 Precision Gap Analysis** — Compares your profile against job requirements using Groq's LLaMA 3.3 70B model
- **🗺️ Personalized Learning Roadmap** — Interactive React Flow visualization with ordered, priority-ranked learning nodes
- **📊 Readiness Score** — Visual circular gauge (0–100%) with color-coded status (Developing / Ready / Expert)
- **✅ Progress Tracking** — Mark modules complete, persisted to Supabase in real-time
- **📧 Email Notifications** — Branded HTML email sent via Resend after each analysis
- **🔐 Protected Routes** — Full Supabase Auth (email + password) with JWT session management
- **🌑 Dark Mode** — Default dark UI with glassmorphism cards and violet accent system

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Core SPA framework |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + accessible UI primitives |
| **Auth + DB + Storage** | Supabase | PostgreSQL, Auth, File Storage, Edge Functions |
| **AI Processing** | Groq API (llama-3.3-70b-versatile) | Ultra-fast LLM inference via Edge Function |
| **PDF Parsing** | pdfjs-dist v4 | Client-side text extraction — no server upload |
| **Roadmap Viz** | React Flow | Interactive node-based roadmap canvas |
| **Charts** | Recharts | Radar chart for skills comparison |
| **Global State** | Zustand | Lightweight auth + analyses state management |
| **Animations** | Framer Motion | Page transitions and UI micro-animations |
| **Email** | Resend API | Transactional HTML email delivery |
| **Deployment** | Vercel + Supabase Cloud | Fully serverless, global edge network |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Groq API key ([console.groq.com](https://console.groq.com) — free)
- Resend API key ([resend.com](https://resend.com) — free, 100 emails/day)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/pathwayiq.git
cd pathwayiq
npm install
```

---

### 2. Environment Variables

Create your `.env` file in the project root:

```env
# Supabase — get from Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Groq — get from console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Resend — get from resend.com/api-keys
RESEND_API_KEY=your_resend_api_key_here
```

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

### 3. Supabase Setup

#### Step 1 — Create Database Tables

Open your Supabase project → **SQL Editor** → **New Query** → paste and run:

```sql
-- ── Analyses table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analyses (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title        text        NOT NULL,
  readiness_score  integer     NOT NULL,
  candidate_skills jsonb       DEFAULT '[]',
  required_skills  jsonb       DEFAULT '[]',
  skill_gaps       jsonb       DEFAULT '[]',
  learning_pathway jsonb       DEFAULT '[]',
  reasoning_trace  text,
  created_at       timestamptz DEFAULT now()
);

-- ── Roadmap progress table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid        REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id     text        NOT NULL,
  completed   boolean     DEFAULT false,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(analysis_id, user_id, node_id)
);

-- ── Enable Row Level Security ───────────────────────────────────────────────
ALTER TABLE public.analyses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ───────────────────────────────────────────────────────────
CREATE POLICY "Users can manage their own analyses"
  ON public.analyses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON public.roadmap_progress FOR ALL USING (auth.uid() = user_id);
```

#### Step 2 — Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `resumes` | Set to **Private**
4. Go to **Policies** → add policy: allow authenticated users to `INSERT` and `SELECT` their own files

#### Step 3 — Deploy Edge Functions

```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Login (opens browser — no password needed)
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set API key secrets (required — Edge Functions can't read .env)
supabase secrets set GROQ_API_KEY=your_groq_key
supabase secrets set RESEND_API_KEY=your_resend_key

# Deploy both functions
supabase functions deploy analyze-gaps --no-verify-jwt
supabase functions deploy send-result-email
```

---

### 4. Fix PDF Worker (Required)

Open `src/lib/pdfParser.ts` and ensure the worker uses the CDN URL:

```ts
import * as pdfjsLib from 'pdfjs-dist'

// ✅ Use unpkg CDN — avoids Vite bundling issues with pdfjs-dist v4
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
```

---

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — use **Safari** for full roadmap support while the cross-browser fix is pending.

---

## 🌍 Deployment (Vercel)

```bash
# Build locally to catch errors first
npm run build
```

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select your repo
3. Add environment variables in Vercel Dashboard → **Settings → Environment Variables:**

| Variable | Required |
|---|---|
| `VITE_SUPABASE_URL` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes |

4. Click **Deploy** — Vercel auto-detects Vite and sets the correct build command

> Edge Functions run on Supabase's global infrastructure — no additional Vercel config needed.

---

## 🗄 Database Schema

### `analyses`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key — auto-generated |
| `user_id` | uuid | FK → auth.users |
| `job_title` | text | Extracted from job description |
| `readiness_score` | integer | Match percentage (0–100) |
| `candidate_skills` | jsonb | `[{ skill, level }]` |
| `required_skills` | jsonb | `[{ skill, level }]` |
| `skill_gaps` | jsonb | `[{ skill, priority, reason }]` |
| `learning_pathway` | jsonb | `[{ id, topic, estimatedTime, resources, reason }]` |
| `reasoning_trace` | text | AI methodology explanation |
| `created_at` | timestamptz | Auto-set on insert |

### `roadmap_progress`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `analysis_id` | uuid | FK → analyses |
| `user_id` | uuid | FK → auth.users |
| `node_id` | text | ReactFlow node identifier |
| `completed` | boolean | Whether user completed this node |
| `updated_at` | timestamptz | Auto-set on update |

---

## 🏗 Architecture Overview

```
User Browser
    │
    ├── React 18 + Vite (SPA)
    │     ├── pdfjs-dist       → Client-side PDF text extraction
    │     ├── React Flow        → Interactive roadmap visualization
    │     ├── Recharts          → Skill comparison radar chart
    │     ├── Zustand           → Auth + analyses global state
    │     └── Framer Motion     → Animations & transitions
    │
    └── Supabase Cloud
          ├── Auth              → JWT email/password sessions
          ├── PostgreSQL        → analyses + roadmap_progress tables
          ├── Storage           → Resume PDF files (private bucket)
          └── Edge Functions (Deno)
                ├── analyze-gaps        → Groq API (llama-3.3-70b-versatile)
                └── send-result-email   → Resend API (HTML email)
```

### How the AI Analysis Pipeline Works

```
1. PDF Upload      → pdfjs-dist extracts text client-side (no raw PDF sent to AI)
        ↓
2. Edge Function   → resumeText + jdText sent to analyze-gaps Supabase function
        ↓
3. Groq API        → llama-3.3-70b-versatile processes with structured system prompt
        ↓
4. JSON Response   → Validated: job_title, score, skills, gaps, learning_pathway
        ↓
5. Supabase DB     → Saved to analyses table with RLS protection
        ↓
6. Email (async)   → send-result-email triggered non-blocking via Resend
        ↓
7. Redirect        → User navigated to /results/:id → /roadmap/:id
```

---

## 📁 Project Structure

```
pathwayiq/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (Button, Input, Badge, Toast...)
│   │   ├── layout/              # Navbar, PageWrapper, ProtectedRoute
│   │   ├── analysis/            # ScoreCircle, SkillRadar, AnalysisCard, BrainAnimation
│   │   └── roadmap/             # NodeDrawer (slide-over with resources)
│   ├── pages/
│   │   ├── LandingPage.tsx      # Public marketing homepage
│   │   ├── LoginPage.tsx        # Email/password login
│   │   ├── SignupPage.tsx       # New user registration
│   │   ├── DashboardPage.tsx    # Analysis history + stats
│   │   ├── AnalyzePage.tsx      # PDF upload + JD input + analyze flow
│   │   ├── ResultsPage.tsx      # Score, radar chart, skill gaps
│   │   ├── RoadmapPage.tsx      # ReactFlow interactive roadmap
│   │   ├── ProfilePage.tsx      # User profile management
│   │   └── NotFoundPage.tsx     # 404 error page
│   ├── store/
│   │   ├── authStore.ts         # Zustand auth state + Supabase session sync
│   │   └── analysesStore.ts     # Zustand analyses cache
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client + TypeScript types
│   │   ├── pdfParser.ts         # pdfjs-dist text extraction
│   │   └── utils.ts             # cn() helper + utilities
│   ├── hooks/
│   │   └── useToast.ts          # Toast notification hook
│   ├── App.tsx                  # Router + route definitions
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind base + custom CSS variables
├── supabase/
│   └── functions/
│       ├── analyze-gaps/
│       │   └── index.ts         # Groq AI analysis edge function
│       └── send-result-email/
│           └── index.ts         # Resend email edge function
├── public/
│   └── favicon.svg
├── .env                         # Local secrets (not committed)
├── .gitignore
├── vercel.json                  # Vercel SPA routing config
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 📄 Environment Variables Reference

| Variable | Used In | Description |
|----------|---------|-------------|
| `VITE_SUPABASE_URL` | Frontend | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key — **never expose to frontend** |
| `GROQ_API_KEY` | Edge Function | Groq API key for LLM inference |
| `RESEND_API_KEY` | Edge Function | Resend API key for email delivery |

> 🔐 `GROQ_API_KEY` and `RESEND_API_KEY` must be set as **Supabase secrets**, not in `.env`.
> They run on Deno and cannot access your local environment file.

---

## 🔑 Getting API Keys

| Service | URL | Free Tier |
|---------|-----|-----------|
| **Groq** | [console.groq.com](https://console.groq.com) | Free — very generous rate limits |
| **Resend** | [resend.com](https://resend.com) | Free — 100 emails/day |
| **Supabase** | [supabase.com](https://supabase.com) | Free — 500MB DB, 1GB storage |

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Analysis failed — Edge Function returned non-2xx` | GROQ_API_KEY not set as secret | Run `supabase secrets set GROQ_API_KEY=...` then redeploy |
| `PDF worker 404 error` | Vite can't bundle pdfjs worker | Use unpkg CDN URL in `pdfParser.ts` (see step 4) |
| `401 Unauthorized on Edge Function` | JWT verification rejecting requests | Deploy with `--no-verify-jwt` flag |
| `supabase: command not found` | Supabase CLI not installed | Run `brew install supabase/tap/supabase` |
| `Access token not provided` | Not logged into CLI | Run `supabase login` first |
| Roadmap not visible in Chrome/Firefox | ReactFlow container dimension issue | Use Safari (full support) or resize window — permanent fix in progress |
| `analyses insert failed` | RLS policy missing or table not created | Run the SQL setup script in Supabase SQL Editor |

---

## 📧 Email Setup

Emails are sent from `onboarding@resend.dev` (Resend's test domain — works without a custom domain).

To use your own domain:
1. Add your domain in the [Resend dashboard](https://resend.com)
2. Verify DNS records
3. Update the `from` field in `supabase/functions/send-result-email/index.ts`

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📝 License

MIT — free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ using React · TypeScript · Supabase · Groq AI**

[⭐ Star this repo](https://github.com/yourusername/pathwayiq) · [🐛 Report a bug](https://github.com/yourusername/pathwayiq/issues) · [💡 Request a feature](https://github.com/yourusername/pathwayiq/issues)

</div>
