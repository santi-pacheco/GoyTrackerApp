-- GoyTracker — leaderboard / social compare functions.
-- Uses SECURITY DEFINER to aggregate across all users while keeping
-- per-row RLS intact. Functions return only curated, non-sensitive columns.

-- ============================================================
-- 1. Volume leaderboard
--    Total non-warmup volume + session count per user in last N days.
-- ============================================================
create or replace function public.leaderboard_volume(period_days int default 30)
returns table (
  user_id uuid,
  display_name text,
  total_volume_kg numeric,
  session_count int
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    coalesce(p.display_name, 'User') as display_name,
    coalesce(sum(case when s.is_warmup then 0 else s.reps * s.weight_kg end), 0)::numeric as total_volume_kg,
    count(distinct ws.id)::int as session_count
  from public.profiles p
  left join public.workout_sessions ws
    on ws.user_id = p.id
   and ws.started_at >= now() - (period_days || ' days')::interval
  left join public.session_exercises se on se.session_id = ws.id
  left join public.sets s on s.session_exercise_id = se.id
  group by p.id, p.display_name
  order by total_volume_kg desc, session_count desc;
$$;

revoke all on function public.leaderboard_volume(int) from public;
grant execute on function public.leaderboard_volume(int) to authenticated;

-- ============================================================
-- 2. Frequency leaderboard
--    Distinct training days + sessions + streak in last N days.
-- ============================================================
create or replace function public.leaderboard_frequency(period_days int default 30)
returns table (
  user_id uuid,
  display_name text,
  training_days int,
  session_count int,
  total_sets int
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    coalesce(p.display_name, 'User') as display_name,
    count(distinct date(ws.started_at))::int as training_days,
    count(distinct ws.id)::int as session_count,
    coalesce(sum(case when s.is_warmup then 0 else 1 end), 0)::int as total_sets
  from public.profiles p
  left join public.workout_sessions ws
    on ws.user_id = p.id
   and ws.started_at >= now() - (period_days || ' days')::interval
  left join public.session_exercises se on se.session_id = ws.id
  left join public.sets s on s.session_exercise_id = se.id
  group by p.id, p.display_name
  order by training_days desc, session_count desc;
$$;

revoke all on function public.leaderboard_frequency(int) from public;
grant execute on function public.leaderboard_frequency(int) to authenticated;

-- ============================================================
-- 3. 1RM leaderboard by exercise (Epley estimate)
-- ============================================================
create or replace function public.leaderboard_pr_by_exercise(p_exercise_id uuid)
returns table (
  user_id uuid,
  display_name text,
  best_1rm_kg numeric,
  best_weight_kg numeric,
  best_reps int
)
language sql
security definer
set search_path = public
as $$
  with bests as (
    select distinct on (ws.user_id)
      ws.user_id,
      s.weight_kg,
      s.reps,
      (s.weight_kg * (1 + s.reps::numeric / 30)) as est_1rm
    from public.sets s
    join public.session_exercises se on se.id = s.session_exercise_id
    join public.workout_sessions ws on ws.id = se.session_id
    where se.exercise_id = p_exercise_id
      and not s.is_warmup
      and s.reps > 0
    order by ws.user_id, (s.weight_kg * (1 + s.reps::numeric / 30)) desc
  )
  select
    p.id as user_id,
    coalesce(p.display_name, 'User') as display_name,
    coalesce(round(b.est_1rm, 1), 0)::numeric as best_1rm_kg,
    coalesce(b.weight_kg, 0)::numeric as best_weight_kg,
    coalesce(b.reps, 0)::int as best_reps
  from public.profiles p
  left join bests b on b.user_id = p.id
  order by best_1rm_kg desc nulls last;
$$;

revoke all on function public.leaderboard_pr_by_exercise(uuid) from public;
grant execute on function public.leaderboard_pr_by_exercise(uuid) to authenticated;

-- ============================================================
-- 4. Per-user stats (for compare view)
-- ============================================================
create or replace function public.user_stats(p_user_id uuid, period_days int default 30)
returns table (
  user_id uuid,
  display_name text,
  total_volume_kg numeric,
  session_count int,
  total_sets int,
  training_days int,
  avg_volume_per_session numeric
)
language sql
security definer
set search_path = public
as $$
  with agg as (
    select
      count(distinct ws.id)::int as session_count,
      count(distinct date(ws.started_at))::int as training_days,
      coalesce(sum(case when s.is_warmup then 0 else s.reps * s.weight_kg end), 0)::numeric as total_volume_kg,
      coalesce(sum(case when s.is_warmup then 0 else 1 end), 0)::int as total_sets
    from public.workout_sessions ws
    left join public.session_exercises se on se.session_id = ws.id
    left join public.sets s on s.session_exercise_id = se.id
    where ws.user_id = p_user_id
      and ws.started_at >= now() - (period_days || ' days')::interval
  )
  select
    p_user_id as user_id,
    coalesce(p.display_name, 'User') as display_name,
    a.total_volume_kg,
    a.session_count,
    a.total_sets,
    a.training_days,
    case when a.session_count > 0 then round(a.total_volume_kg / a.session_count, 1) else 0 end as avg_volume_per_session
  from agg a
  left join public.profiles p on p.id = p_user_id;
$$;

revoke all on function public.user_stats(uuid, int) from public;
grant execute on function public.user_stats(uuid, int) to authenticated;

-- ============================================================
-- 5. Weekly volume trend per user (for chart compare)
-- ============================================================
create or replace function public.user_weekly_volume(p_user_id uuid, weeks int default 12)
returns table (
  week_start date,
  total_volume_kg numeric
)
language sql
security definer
set search_path = public
as $$
  select
    date_trunc('week', ws.started_at)::date as week_start,
    coalesce(sum(case when s.is_warmup then 0 else s.reps * s.weight_kg end), 0)::numeric as total_volume_kg
  from public.workout_sessions ws
  left join public.session_exercises se on se.session_id = ws.id
  left join public.sets s on s.session_exercise_id = se.id
  where ws.user_id = p_user_id
    and ws.started_at >= date_trunc('week', now()) - (weeks || ' weeks')::interval
  group by week_start
  order by week_start;
$$;

revoke all on function public.user_weekly_volume(uuid, int) from public;
grant execute on function public.user_weekly_volume(uuid, int) to authenticated;
