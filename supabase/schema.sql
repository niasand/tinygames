-- Tango Unlimited backend schema
-- Run this once in: Supabase Dashboard → SQL Editor
-- Creates: profiles, game_records, RLS policies, new-user trigger, leaderboard RPC

-- ============ 1. profiles (leaderboard nicknames) ============
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- No insert policy: profiles are created only by the trigger below (prevents forgery).

-- ============ 2. game_records (one row per completed board) ============
create table if not exists public.game_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  seed         text not null,
  time_seconds double precision not null check (time_seconds > 0),
  flawless     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists game_records_seed_time_idx
  on public.game_records (seed, time_seconds asc);
create index if not exists game_records_user_created_idx
  on public.game_records (user_id, created_at desc);

alter table public.game_records enable row level security;

create policy "records_insert_own"
  on public.game_records for insert
  to authenticated with check (user_id = auth.uid());

create policy "records_select_own"
  on public.game_records for select
  to authenticated using (user_id = auth.uid());
-- No update / delete policy: records are immutable once written.

-- ============ 3. Auto-create profile on signup ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    -- default nickname = email local-part; user can change it later
    split_part(coalesce(new.email, 'player'), '@', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ 4. Leaderboard RPC (security definer bypasses RLS) ============
-- Returns aggregated, non-sensitive fields only (no emails).
-- Anonymous viewers allowed: auth.uid() is null → is_current_user all false.
create or replace function public.get_seed_leaderboard(p_seed text, p_limit int default 20)
returns table (
  rank            bigint,
  nickname        text,
  time_seconds    double precision,
  flawless        boolean,
  is_current_user boolean
)
language plpgsql
security definer set search_path = public
as $$
declare
  current_uid uuid := auth.uid();
begin
  return query
  select
    row_number() over (order by r.time_seconds asc) as rank,
    p.nickname,
    r.time_seconds,
    r.flawless,
    (r.user_id = current_uid) as is_current_user
  from (
    -- each user's single best time on this seed.
    -- Columns are table-qualified (gr.*) because the function's OUT parameter
    -- is also named "time_seconds"; a bare "time_seconds" would be ambiguous
    -- between the OUT-parameter variable and the table column (PG error 42702).
    select distinct on (gr.user_id) gr.user_id, gr.time_seconds, gr.flawless
    from public.game_records gr
    where gr.seed = p_seed
    order by gr.user_id, gr.time_seconds asc
  ) r
  join public.profiles p on p.id = r.user_id
  order by r.time_seconds asc
  limit greatest(1, least(p_limit, 100));
end;
$$;
