# PathwayIQ 🚀

> **From Resume to Ready — In Minutes**

AI-powered onboarding that learns you, not the other way around. PathwayIQ analyzes your resume against a job description, identifies your exact skill gaps, and generates a personalized, interactive learning roadmap.

---

## ✨ Features

- **AI Skill Extraction** — Automatically parses resume PDFs client-side and extracts every skill
- **Precision Gap Analysis** — Compares your skills against job requirements using Groq (LLaMA 3 70B)
- **Personalized Learning Roadmap** — Interactive React Flow visualization with ordered learning nodes
- **Readiness Score** — Visual circular gauge (0–100%) with color-coded status
- **Progress Tracking** — Mark modules complete, persisted to Supabase
- **Email Notifications** — Branded HTML email sent via Resend after each analysis
- **Protected Routes** — Full Supabase Auth (email + password)
- **Dark Mode** — Default dark UI with glassmorphism cards and violet accent

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| Auth + DB + Storage | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| AI Processing | Groq API (llama3-70b-8192) via Edge Function |
| PDF Parsing | pdfjs-dist (client-side, no server upload needed) |
| Roadmap Viz | React Flow |
| Charts | Recharts (Radar chart) |
| Global State | Zustand |
| Animations | Framer Motion |
| Email | Resend API |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/pathwayiq.git
cd pathwayiq
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GROQ_API_KEY=your_groq_api_key_here
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Supabase Setup

#### Create tables in your Supabase SQL editor:

```sql
-- Analyses table
CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title text,
  readiness_score integer,
  candidate_skills jsonb,
  required_skills jsonb,
  skill_gaps jsonb,
  learning_pathway jsonb,
  reasoning_trace jsonb,
  created_at timestamp DEFAULT now()
);

-- Roadmap progress table
CREATE TABLE roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES analyses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id text,
  completed boolean DEFAULT false,
  updated_at timestamp DEFAULT now(),
  UNIQUE(analysis_id, user_id, node_id)
);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own analyses"
  ON analyses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON roadmap_progress FOR ALL USING (auth.uid() = user_id);
```

#### Create Storage bucket:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `resumes`
3. Set it to **Private**
4. Add a policy: allow authenticated users to insert/select their own files

#### Deploy Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set GROQ_API_KEY=your_groq_key
supabase secrets set RESEND_API_KEY=your_resend_key

# Deploy functions
supabase functions deploy analyze-gaps
supabase functions deploy send-result-email
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌍 Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

Edge Functions run on Supabase's infrastructure — no additional Vercel configuration needed.

---

## 🗄 Database Schema

### `analyses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to auth.users |
| `job_title` | text | Extracted from JD |
| `readiness_score` | integer | 0–100 |
| `candidate_skills` | jsonb | `[{skill, level}]` |
| `required_skills` | jsonb | `[{skill, level}]` |
| `skill_gaps` | jsonb | `[{skill, priority, reason}]` |
| `learning_pathway` | jsonb | `[{id, topic, estimatedTime, resources, reason}]` |
| `reasoning_trace` | jsonb | AI explanation string |
| `created_at` | timestamp | Auto-set |

### `roadmap_progress`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `analysis_id` | uuid | FK to analyses |
| `user_id` | uuid | FK to auth.users |
| `node_id` | text | React Flow node ID |
| `completed` | boolean | Completion status |
| `updated_at` | timestamp | Auto-set |

---

## 🏗 Architecture Overview

```
User Browser
    │
    ├── React + Vite (SPA)
    │     ├── pdfjs-dist (client-side PDF parsing)
    │     ├── React Flow (roadmap visualization)
    │     ├── Recharts (skill radar)
    │     ├── Zustand (global state)
    │     └── Framer Motion (animations)
    │
    └── Supabase
          ├── Auth (email/password)
          ├── PostgreSQL (analyses, roadmap_progress)
          ├── Storage (resume PDFs)
          └── Edge Functions (Deno)
                ├── analyze-gaps → Groq API (LLaMA 3 70B)
                └── send-result-email → Resend API
```

### How the Adaptive Gap Logic Works

1. **Resume Parsing** — The PDF is parsed entirely client-side using `pdfjs-dist`. No raw PDF is sent to the AI.
2. **Skill Extraction** — The extracted resume text is sent to the `analyze-gaps` Edge Function along with the job description.
3. **AI Analysis** — Groq's LLaMA 3 70B model receives both texts with a structured system prompt that demands strict JSON output. It extracts candidate skills, required skills, computes a readiness score, identifies gaps with priority ratings, and builds an ordered learning pathway.
4. **Validation** — The Edge Function validates the JSON structure before saving to Supabase.
5. **Roadmap Generation** — Learning nodes are ordered by priority and dependency. Each node contains curated free resources (official docs, YouTube, Coursera, etc.)
6. **Progress Tracking** — Completion state is persisted per-user per-node in `roadmap_progress` using Supabase's UPSERT with a unique constraint.

---

## 📁 Project Structure

```
pathwayiq/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── layout/       # Navbar, PageWrapper, ProtectedRoute
│   │   ├── analysis/     # ScoreCircle, SkillRadar, AnalysisCard, BrainAnimation
│   │   └── roadmap/      # NodeDrawer
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AnalyzePage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── RoadmapPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   └── analysesStore.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── pdfParser.ts
│   ├── hooks/
│   │   └── useToast.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── functions/
│       ├── analyze-gaps/index.ts
│       └── send-result-email/index.ts
├── .env.example
├── vercel.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 📄 Environment Variables Reference

| Variable | Where Used | Description |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | Frontend | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only | Service role key (never expose to frontend) |
| `GROQ_API_KEY` | Edge Function | Groq API key for LLaMA 3 inference |
| `RESEND_API_KEY` | Edge Function | Resend API key for email delivery |

---

## 📧 Email Setup

Emails are sent from `onboarding@resend.dev` (Resend's test domain, works without custom domain setup).

To use your own domain:
1. Add your domain in [Resend dashboard](https://resend.com)
2. Update the `from` field in `supabase/functions/send-result-email/index.ts`

---

## 🔑 API Keys

- **Groq**: Get a free key at [console.groq.com](https://console.groq.com)
- **Resend**: Get a free key at [resend.com](https://resend.com) (100 emails/day free)
- **Supabase**: Create a project at [supabase.com](https://supabase.com) (free tier available)

---

## 📝 License

MIT — free to use, modify, and distribute.
