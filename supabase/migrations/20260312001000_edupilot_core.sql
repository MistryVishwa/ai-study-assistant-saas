-- EduPilot core schema (requested tables) + RLS

-- Ensure UUID generator exists (Supabase typically has pgcrypto)
create extension if not exists "pgcrypto";

-- Requested `users` table: expose a safe projection from `profiles`
-- (keeps `profiles` as the source-of-truth for auth-linked user records)
drop view if exists public.users;
create view public.users as
select
  p.id,
  p.email,
  p.full_name as name,
  p.avatar_url as avatar,
  p.created_at
from public.profiles p;

-- Study plans / tasks
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  task text not null,
  date date not null,
  status text not null default 'pending' check (status in ('pending','done','skipped')),
  created_at timestamptz not null default now()
);

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Flashcards (+ minimal SRS fields)
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  mastered boolean not null default false,
  due_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- Quizzes (store score + optional payload)
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null default 0,
  quiz jsonb,
  created_at timestamptz not null default now()
);

-- Progress snapshots (used for analytics)
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_hours numeric not null default 0,
  topics_completed integer not null default 0,
  quiz_score numeric not null default 0,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Marketplace materials
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_url text not null,
  rating numeric not null default 0,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.study_plans enable row level security;
alter table public.notes enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.progress enable row level security;
alter table public.materials enable row level security;

-- Helpers to create policies idempotently
do $$
begin
  -- study_plans
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='study_plans' and policyname='study_plans_select_own') then
    create policy study_plans_select_own on public.study_plans for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='study_plans' and policyname='study_plans_insert_own') then
    create policy study_plans_insert_own on public.study_plans for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='study_plans' and policyname='study_plans_update_own') then
    create policy study_plans_update_own on public.study_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='study_plans' and policyname='study_plans_delete_own') then
    create policy study_plans_delete_own on public.study_plans for delete using (auth.uid() = user_id);
  end if;

  -- notes
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notes' and policyname='notes_select_own') then
    create policy notes_select_own on public.notes for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notes' and policyname='notes_insert_own') then
    create policy notes_insert_own on public.notes for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notes' and policyname='notes_update_own') then
    create policy notes_update_own on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notes' and policyname='notes_delete_own') then
    create policy notes_delete_own on public.notes for delete using (auth.uid() = user_id);
  end if;

  -- flashcards
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='flashcards' and policyname='flashcards_select_own') then
    create policy flashcards_select_own on public.flashcards for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='flashcards' and policyname='flashcards_insert_own') then
    create policy flashcards_insert_own on public.flashcards for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='flashcards' and policyname='flashcards_update_own') then
    create policy flashcards_update_own on public.flashcards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='flashcards' and policyname='flashcards_delete_own') then
    create policy flashcards_delete_own on public.flashcards for delete using (auth.uid() = user_id);
  end if;

  -- quizzes
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quizzes' and policyname='quizzes_select_own') then
    create policy quizzes_select_own on public.quizzes for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quizzes' and policyname='quizzes_insert_own') then
    create policy quizzes_insert_own on public.quizzes for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quizzes' and policyname='quizzes_delete_own') then
    create policy quizzes_delete_own on public.quizzes for delete using (auth.uid() = user_id);
  end if;

  -- progress
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='progress' and policyname='progress_select_own') then
    create policy progress_select_own on public.progress for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='progress' and policyname='progress_upsert_own') then
    create policy progress_upsert_own on public.progress for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='progress' and policyname='progress_update_own') then
    create policy progress_update_own on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  -- materials
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_select_all') then
    create policy materials_select_all on public.materials for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_insert_own') then
    create policy materials_insert_own on public.materials for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_update_own') then
    create policy materials_update_own on public.materials for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='materials' and policyname='materials_delete_own') then
    create policy materials_delete_own on public.materials for delete using (auth.uid() = user_id);
  end if;
end $$;

