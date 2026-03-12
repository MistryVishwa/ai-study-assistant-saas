# EduPilot – AI Study Assistant

Modern SaaS dashboard for students: authentication, AI tutor (Gemini), notes/quiz/flashcards generators, study planner, progress analytics, and a simple marketplace.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Supabase (Auth + Postgres + Storage)
- Google AI Studio Gemini API
- Recharts (analytics)
- Zustand (state)

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Copy `.env.example` → `.env.local` and add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (server-only; do NOT prefix with `NEXT_PUBLIC_`)

3) Create Supabase database schema

Apply migrations in `supabase/migrations/` to your Supabase project.

4) Create Supabase Storage buckets (public)

- `avatars` (for profile pictures)
- `materials` (for marketplace uploads)

5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/login`, `/register`, `/forgot-password`, `/reset-password` (Supabase Auth)
- `/dashboard` (widgets + analytics)
- `/tutor` (Gemini chat, Markdown answers)
- `/notes` (PDF/text → notes via Gemini, save to DB)
- `/quizzes` (generate quiz, score + save)
- `/flashcards` (generate + spaced repetition)
- `/planner` (calendar + AI schedule generation + save tasks)
- `/progress` (charts + daily logging)
- `/marketplace` (upload/list materials)
- `/profile`, `/settings`

## Gemini endpoints

- `POST /api/ai/tutor`
- `POST /api/ai/notes`
- `POST /api/ai/quiz`
- `POST /api/ai/flashcards`
- `POST /api/ai/planner`

