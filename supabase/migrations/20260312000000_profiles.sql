-- Profiles table + automatic profile creation on signup
-- Safe for production SaaS patterns (RLS + trigger).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  learning_goal text,
  avatar_url text,
  created_at timestamptz not null default now(),
  plan text not null default 'free' check (plan in ('free','pro')),
  role text not null default 'student' check (role in ('student','admin'))
);

alter table public.profiles enable row level security;

-- Read own profile
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_own'
  ) then
    create policy profiles_select_own
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;
end $$;

-- Insert own profile (usually via trigger; kept for completeness)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own'
  ) then
    create policy profiles_insert_own
      on public.profiles
      for insert
      with check (auth.uid() = id);
  end if;
end $$;

-- Update own profile
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own'
  ) then
    create policy profiles_update_own
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, learning_goal, avatar_url, plan, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    new.email,
    coalesce(new.raw_user_meta_data->>'learning_goal', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'free',
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

