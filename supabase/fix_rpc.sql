-- Hotfix: get_seed_leaderboard threw PG 42702 (column "time_seconds" ambiguous)
-- because the function's OUT parameter shares the name with the table column.
-- Qualify the inner subquery columns with the table alias (gr.*). Idempotent.
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
