-- GoyTracker — seed: muscle groups, global exercises, global templates.
-- Idempotent (uses ON CONFLICT). Safe to re-run.

-- ============================================================
-- muscle_groups
-- ============================================================
insert into public.muscle_groups (id, name) values
  (1, 'chest'),
  (2, 'back'),
  (3, 'legs'),
  (4, 'shoulders'),
  (5, 'arms'),
  (6, 'core')
on conflict (id) do nothing;

-- ============================================================
-- exercises (global catalog, owner_id null)
-- Use deterministic UUIDs so seed is idempotent.
-- ============================================================
do $$
declare
  ex_data record;
begin
  for ex_data in
    select * from (values
      -- chest
      ('11111111-0000-0000-0000-000000000001'::uuid, 'Barbell Bench Press',     1, 'barbell'),
      ('11111111-0000-0000-0000-000000000002'::uuid, 'Incline Barbell Press',   1, 'barbell'),
      ('11111111-0000-0000-0000-000000000003'::uuid, 'Dumbbell Bench Press',    1, 'dumbbell'),
      ('11111111-0000-0000-0000-000000000004'::uuid, 'Incline Dumbbell Press',  1, 'dumbbell'),
      ('11111111-0000-0000-0000-000000000005'::uuid, 'Cable Fly',               1, 'cable'),
      ('11111111-0000-0000-0000-000000000006'::uuid, 'Push-up',                 1, 'bodyweight'),
      ('11111111-0000-0000-0000-000000000007'::uuid, 'Dip',                     1, 'bodyweight'),
      ('11111111-0000-0000-0000-000000000008'::uuid, 'Machine Chest Press',     1, 'machine'),
      ('11111111-0000-0000-0000-000000000009'::uuid, 'Pec Deck',                1, 'machine'),
      -- back
      ('22222222-0000-0000-0000-000000000001'::uuid, 'Deadlift',                2, 'barbell'),
      ('22222222-0000-0000-0000-000000000002'::uuid, 'Pull-up',                 2, 'bodyweight'),
      ('22222222-0000-0000-0000-000000000003'::uuid, 'Chin-up',                 2, 'bodyweight'),
      ('22222222-0000-0000-0000-000000000004'::uuid, 'Barbell Row',             2, 'barbell'),
      ('22222222-0000-0000-0000-000000000005'::uuid, 'Pendlay Row',             2, 'barbell'),
      ('22222222-0000-0000-0000-000000000006'::uuid, 'Dumbbell Row',            2, 'dumbbell'),
      ('22222222-0000-0000-0000-000000000007'::uuid, 'Lat Pulldown',            2, 'cable'),
      ('22222222-0000-0000-0000-000000000008'::uuid, 'Seated Cable Row',        2, 'cable'),
      ('22222222-0000-0000-0000-000000000009'::uuid, 'T-Bar Row',               2, 'machine'),
      ('22222222-0000-0000-0000-00000000000a'::uuid, 'Face Pull',               2, 'cable'),
      ('22222222-0000-0000-0000-00000000000b'::uuid, 'Rack Pull',               2, 'barbell'),
      -- legs
      ('33333333-0000-0000-0000-000000000001'::uuid, 'Back Squat',              3, 'barbell'),
      ('33333333-0000-0000-0000-000000000002'::uuid, 'Front Squat',             3, 'barbell'),
      ('33333333-0000-0000-0000-000000000003'::uuid, 'Romanian Deadlift',       3, 'barbell'),
      ('33333333-0000-0000-0000-000000000004'::uuid, 'Bulgarian Split Squat',   3, 'dumbbell'),
      ('33333333-0000-0000-0000-000000000005'::uuid, 'Walking Lunge',           3, 'dumbbell'),
      ('33333333-0000-0000-0000-000000000006'::uuid, 'Leg Press',               3, 'machine'),
      ('33333333-0000-0000-0000-000000000007'::uuid, 'Leg Extension',           3, 'machine'),
      ('33333333-0000-0000-0000-000000000008'::uuid, 'Leg Curl',                3, 'machine'),
      ('33333333-0000-0000-0000-000000000009'::uuid, 'Hip Thrust',              3, 'barbell'),
      ('33333333-0000-0000-0000-00000000000a'::uuid, 'Standing Calf Raise',     3, 'machine'),
      ('33333333-0000-0000-0000-00000000000b'::uuid, 'Seated Calf Raise',       3, 'machine'),
      ('33333333-0000-0000-0000-00000000000c'::uuid, 'Goblet Squat',            3, 'dumbbell'),
      -- shoulders
      ('44444444-0000-0000-0000-000000000001'::uuid, 'Overhead Press',          4, 'barbell'),
      ('44444444-0000-0000-0000-000000000002'::uuid, 'Seated Dumbbell Press',   4, 'dumbbell'),
      ('44444444-0000-0000-0000-000000000003'::uuid, 'Arnold Press',            4, 'dumbbell'),
      ('44444444-0000-0000-0000-000000000004'::uuid, 'Dumbbell Lateral Raise',  4, 'dumbbell'),
      ('44444444-0000-0000-0000-000000000005'::uuid, 'Cable Lateral Raise',     4, 'cable'),
      ('44444444-0000-0000-0000-000000000006'::uuid, 'Rear Delt Fly',           4, 'dumbbell'),
      ('44444444-0000-0000-0000-000000000007'::uuid, 'Upright Row',             4, 'barbell'),
      ('44444444-0000-0000-0000-000000000008'::uuid, 'Machine Shoulder Press',  4, 'machine'),
      -- arms
      ('55555555-0000-0000-0000-000000000001'::uuid, 'Barbell Curl',            5, 'barbell'),
      ('55555555-0000-0000-0000-000000000002'::uuid, 'Dumbbell Curl',           5, 'dumbbell'),
      ('55555555-0000-0000-0000-000000000003'::uuid, 'Hammer Curl',             5, 'dumbbell'),
      ('55555555-0000-0000-0000-000000000004'::uuid, 'Preacher Curl',           5, 'barbell'),
      ('55555555-0000-0000-0000-000000000005'::uuid, 'Cable Curl',              5, 'cable'),
      ('55555555-0000-0000-0000-000000000006'::uuid, 'Close-Grip Bench Press',  5, 'barbell'),
      ('55555555-0000-0000-0000-000000000007'::uuid, 'Triceps Pushdown',        5, 'cable'),
      ('55555555-0000-0000-0000-000000000008'::uuid, 'Overhead Triceps Ext.',   5, 'dumbbell'),
      ('55555555-0000-0000-0000-000000000009'::uuid, 'Skull Crusher',           5, 'barbell'),
      ('55555555-0000-0000-0000-00000000000a'::uuid, 'Rope Pushdown',           5, 'cable'),
      -- core
      ('66666666-0000-0000-0000-000000000001'::uuid, 'Plank',                   6, 'bodyweight'),
      ('66666666-0000-0000-0000-000000000002'::uuid, 'Hanging Leg Raise',       6, 'bodyweight'),
      ('66666666-0000-0000-0000-000000000003'::uuid, 'Cable Crunch',            6, 'cable'),
      ('66666666-0000-0000-0000-000000000004'::uuid, 'Ab Wheel Rollout',        6, 'bodyweight'),
      ('66666666-0000-0000-0000-000000000005'::uuid, 'Russian Twist',           6, 'dumbbell'),
      ('66666666-0000-0000-0000-000000000006'::uuid, 'Sit-up',                  6, 'bodyweight')
    ) as t(id, name, muscle, equip)
  loop
    insert into public.exercises (id, name, primary_muscle_id, equipment, owner_id)
    values (ex_data.id, ex_data.name, ex_data.muscle, ex_data.equip, null)
    on conflict (id) do nothing;
  end loop;
end$$;

-- ============================================================
-- routine_templates (global, owner_id null)
-- ============================================================
insert into public.routine_templates (id, name, description, owner_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PPL — Push Day',  'Push: chest, shoulders, triceps.',  null),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'PPL — Pull Day',  'Pull: back, rear delts, biceps.',   null),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'PPL — Leg Day',   'Legs: quads, hamstrings, glutes.',  null),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Upper Body',      'Upper: chest, back, shoulders, arms.', null),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Lower Body',      'Lower: quads, hamstrings, glutes, calves.', null),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'StrongLifts 5x5 A','Squat 5x5, Bench 5x5, Row 5x5.',   null),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'StrongLifts 5x5 B','Squat 5x5, OHP 5x5, Deadlift 1x5.',null)
on conflict (id) do nothing;

-- Template exercises (template_id, exercise_id, order_index, sets, reps_min, reps_max, rest)
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      -- Push Day
      ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 1, 4, 6,  8,  120),  -- Bench
      ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '44444444-0000-0000-0000-000000000001'::uuid, 2, 3, 6,  10, 120),  -- OHP
      ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000004'::uuid, 3, 3, 8,  12, 90),   -- Incline DB
      ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '44444444-0000-0000-0000-000000000004'::uuid, 4, 3, 10, 15, 60),   -- Lat raise
      ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '55555555-0000-0000-0000-000000000007'::uuid, 5, 3, 10, 15, 60),   -- Pushdown
      ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '55555555-0000-0000-0000-000000000008'::uuid, 6, 3, 10, 12, 60),   -- OH Tri ext
      -- Pull Day
      ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 1, 3, 3,  5,  180),  -- Deadlift
      ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000002'::uuid, 2, 4, 5,  10, 120),  -- Pull-up
      ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-000000000004'::uuid, 3, 3, 6,  10, 120),  -- Barbell Row
      ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '22222222-0000-0000-0000-00000000000a'::uuid, 4, 3, 12, 15, 60),   -- Face Pull
      ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '55555555-0000-0000-0000-000000000001'::uuid, 5, 3, 8,  12, 90),    -- Barbell Curl
      ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, '55555555-0000-0000-0000-000000000003'::uuid, 6, 3, 10, 12, 60),   -- Hammer Curl
      -- Leg Day
      ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, '33333333-0000-0000-0000-000000000001'::uuid, 1, 4, 5,  8,  180),  -- Squat
      ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, '33333333-0000-0000-0000-000000000003'::uuid, 2, 3, 6,  10, 120),  -- RDL
      ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, '33333333-0000-0000-0000-000000000006'::uuid, 3, 3, 10, 12, 120),  -- Leg Press
      ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, '33333333-0000-0000-0000-000000000008'::uuid, 4, 3, 10, 15, 60),   -- Leg Curl
      ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, '33333333-0000-0000-0000-00000000000a'::uuid, 5, 4, 12, 20, 45),   -- Calf Raise
      -- Upper Body
      ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 1, 4, 6,  8,  120),
      ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, '22222222-0000-0000-0000-000000000004'::uuid, 2, 4, 6,  8,  120),
      ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, '44444444-0000-0000-0000-000000000002'::uuid, 3, 3, 8,  12, 90),
      ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, '22222222-0000-0000-0000-000000000007'::uuid, 4, 3, 8,  12, 90),
      ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, '55555555-0000-0000-0000-000000000002'::uuid, 5, 3, 10, 12, 60),
      ('aaaaaaaa-0000-0000-0000-000000000004'::uuid, '55555555-0000-0000-0000-000000000007'::uuid, 6, 3, 10, 12, 60),
      -- Lower Body
      ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, '33333333-0000-0000-0000-000000000001'::uuid, 1, 4, 5,  8,  180),
      ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, '33333333-0000-0000-0000-000000000003'::uuid, 2, 3, 6,  10, 120),
      ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, '33333333-0000-0000-0000-000000000009'::uuid, 3, 3, 8,  12, 90),
      ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, '33333333-0000-0000-0000-000000000007'::uuid, 4, 3, 10, 15, 60),
      ('aaaaaaaa-0000-0000-0000-000000000005'::uuid, '33333333-0000-0000-0000-00000000000a'::uuid, 5, 4, 12, 20, 45),
      -- 5x5 A
      ('aaaaaaaa-0000-0000-0000-000000000006'::uuid, '33333333-0000-0000-0000-000000000001'::uuid, 1, 5, 5,  5,  180),
      ('aaaaaaaa-0000-0000-0000-000000000006'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, 2, 5, 5,  5,  180),
      ('aaaaaaaa-0000-0000-0000-000000000006'::uuid, '22222222-0000-0000-0000-000000000004'::uuid, 3, 5, 5,  5,  180),
      -- 5x5 B
      ('aaaaaaaa-0000-0000-0000-000000000007'::uuid, '33333333-0000-0000-0000-000000000001'::uuid, 1, 5, 5,  5,  180),
      ('aaaaaaaa-0000-0000-0000-000000000007'::uuid, '44444444-0000-0000-0000-000000000001'::uuid, 2, 5, 5,  5,  180),
      ('aaaaaaaa-0000-0000-0000-000000000007'::uuid, '22222222-0000-0000-0000-000000000001'::uuid, 3, 1, 5,  5,  180)
    ) as t(template_id, exercise_id, ord, sets, reps_min, reps_max, rest)
  loop
    insert into public.routine_template_exercises
      (template_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, rest_seconds)
    values
      (rec.template_id, rec.exercise_id, rec.ord, rec.sets, rec.reps_min, rec.reps_max, rec.rest)
    on conflict do nothing;
  end loop;
end$$;
