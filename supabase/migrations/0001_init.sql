-- GoyTracker — initial schema
-- Tables, indexes, RLS policies, profile auto-create trigger.

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bodyweight_kg numeric(5,2),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. muscle_groups (reference)
-- ============================================================
create table public.muscle_groups (
  id smallint primary key,
  name text not null unique
);

alter table public.muscle_groups enable row level security;
create policy "muscle_groups_select_all" on public.muscle_groups
  for select using (true);

-- ============================================================
-- 3. exercises (global catalog + user custom)
-- ============================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_muscle_id smallint references public.muscle_groups(id),
  secondary_muscle_ids smallint[],
  equipment text,
  is_unilateral boolean not null default false,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index exercises_primary_muscle_idx on public.exercises(primary_muscle_id);
create index exercises_owner_idx on public.exercises(owner_id);

alter table public.exercises enable row level security;

create policy "exercises_select_global_or_own" on public.exercises
  for select using (owner_id is null or auth.uid() = owner_id);
create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = owner_id);
create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = owner_id);
create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = owner_id);

-- ============================================================
-- 4. routine_templates
-- ============================================================
create table public.routine_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index routine_templates_owner_idx on public.routine_templates(owner_id);

alter table public.routine_templates enable row level security;

create policy "templates_select_global_or_own" on public.routine_templates
  for select using (owner_id is null or auth.uid() = owner_id);
create policy "templates_insert_own" on public.routine_templates
  for insert with check (auth.uid() = owner_id);
create policy "templates_update_own" on public.routine_templates
  for update using (auth.uid() = owner_id);
create policy "templates_delete_own" on public.routine_templates
  for delete using (auth.uid() = owner_id);

create table public.routine_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.routine_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  order_index smallint not null,
  target_sets smallint,
  target_reps_min smallint,
  target_reps_max smallint,
  rest_seconds smallint default 90
);
create index rte_template_idx on public.routine_template_exercises(template_id, order_index);

alter table public.routine_template_exercises enable row level security;

create policy "rte_select_via_template" on public.routine_template_exercises
  for select using (
    exists (
      select 1 from public.routine_templates t
      where t.id = template_id
        and (t.owner_id is null or t.owner_id = auth.uid())
    )
  );
create policy "rte_write_via_own_template" on public.routine_template_exercises
  for all using (
    exists (
      select 1 from public.routine_templates t
      where t.id = template_id and t.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.routine_templates t
      where t.id = template_id and t.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 5. workout_sessions
-- ============================================================
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.routine_templates(id) on delete set null,
  name text,
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index sessions_user_started_idx on public.workout_sessions(user_id, started_at desc);

alter table public.workout_sessions enable row level security;
create policy "sessions_own" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 6. session_exercises
-- ============================================================
create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  order_index smallint not null,
  notes text
);
create index se_session_idx on public.session_exercises(session_id, order_index);

alter table public.session_exercises enable row level security;

create policy "se_via_own_session" on public.session_exercises
  for all using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. sets
-- ============================================================
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_index smallint not null,
  reps smallint not null check (reps >= 0),
  weight_kg numeric(6,2) not null check (weight_kg >= 0),
  rpe numeric(3,1) check (rpe is null or (rpe >= 1 and rpe <= 10)),
  is_warmup boolean not null default false,
  completed_at timestamptz not null default now()
);
create index sets_se_idx on public.sets(session_exercise_id, set_index);

alter table public.sets enable row level security;

create policy "sets_via_own_session" on public.sets
  for all using (
    exists (
      select 1
      from public.session_exercises se
      join public.workout_sessions s on s.id = se.session_id
      where se.id = session_exercise_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.session_exercises se
      join public.workout_sessions s on s.id = se.session_id
      where se.id = session_exercise_id and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. personal_records (materialized cache, optional)
-- ============================================================
create table public.personal_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  best_1rm_kg numeric(6,2),
  best_weight_kg numeric(6,2),
  best_volume_kg numeric(8,2),
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

alter table public.personal_records enable row level security;
create policy "pr_own" on public.personal_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
