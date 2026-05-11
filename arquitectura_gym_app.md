# Arquitectura — GoyTracker App

App web tipo Strong/Hevy para registrar entrenamientos, analizar progreso y visualizar estadísticas. Diseñada para hosting **100% gratuito**.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos / UI | Tailwind CSS + Shadcn/ui |
| Visualización | Recharts |
| Estado global | Zustand |
| Routing | React Router v6 |
| Persistencia local | Dexie.js (IndexedDB) |
| Backend / DB / Auth | Supabase (PostgreSQL + Auth + Row-Level Security) |
| PWA | vite-plugin-pwa (Workbox) |
| Hosting | Vercel (Frontend) + Supabase (Backend) |

## Decisiones Clave Confirmadas

- **PWA offline-first**: el gimnasio suele tener mala señal. Service Worker + IndexedDB con sync queue a Supabase.
- **Unidades: solo kg** (simplifica modelo, evita conversiones).
- **Templates predefinidos**: seed inicial con PPL, Upper/Lower, 5x5 + permite custom.
- **Timer de descanso con notificación**: feature core, configurable por ejercicio.

---

## 1. Estructura de Carpetas

```
GoyTrackerApp/
├── public/
│   ├── manifest.webmanifest          # PWA manifest
│   ├── icons/                        # PWA icons (192, 512)
│   └── sw.js                         # Service Worker (Workbox generado)
├── src/
│   ├── main.tsx                      # Entry, registra SW
│   ├── App.tsx                       # Router shell
│   ├── routes/                       # React Router v6
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── workout/
│   │   │   ├── ActiveSession.tsx     # Tracker en vivo
│   │   │   └── RestTimer.tsx
│   │   ├── library/
│   │   │   ├── Exercises.tsx         # Biblioteca filtrada por músculo
│   │   │   └── Templates.tsx         # Rutinas predefinidas + custom
│   │   ├── history/
│   │   │   ├── CalendarView.tsx
│   │   │   └── SessionDetail.tsx
│   │   ├── analytics/
│   │   │   ├── Dashboard.tsx         # Recharts: 1RM, volumen, frecuencia
│   │   │   └── ExerciseProgress.tsx
│   │   └── settings/
│   │       └── Profile.tsx
│   ├── components/
│   │   ├── ui/                       # Shadcn primitives (button, dialog, ...)
│   │   ├── workout/                  # SetRow, ExerciseCard, RestTimer
│   │   ├── charts/                   # OneRMChart, VolumeChart, FrequencyHeatmap
│   │   └── layout/                   # AppShell, BottomNav, TopBar
│   ├── lib/
│   │   ├── supabase.ts               # Client + types
│   │   ├── db/                       # Dexie wrapper (IndexedDB)
│   │   │   ├── schema.ts
│   │   │   └── sync.ts               # Sync queue offline → Supabase
│   │   ├── calc/                     # Lógica pura
│   │   │   ├── oneRM.ts              # Epley: w * (1 + reps/30)
│   │   │   └── volume.ts             # Σ(sets × reps × weight)
│   │   └── utils.ts                  # cn(), formatters
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useActiveSession.ts       # Zustand store sesión activa
│   │   ├── useSync.ts                # Estado sync (online/queue)
│   │   └── useRestTimer.ts           # Timer + Notification API
│   ├── stores/                       # Zustand
│   │   ├── sessionStore.ts
│   │   └── prefsStore.ts
│   ├── types/
│   │   └── database.ts               # Tipos generados por `supabase gen types`
│   └── styles/
│       └── globals.css               # Tailwind base + shadcn vars
├── supabase/
│   ├── migrations/                   # SQL migrations versionados
│   │   ├── 0001_init.sql
│   │   └── 0002_seed_exercises.sql
│   └── seed.sql                      # Ejercicios + templates iniciales
├── arquitectura_gym_app.md           # ESTE documento
├── vite.config.ts                    # vite-plugin-pwa
├── tailwind.config.ts
├── components.json                   # Shadcn config
├── tsconfig.json
├── package.json
└── .env.local                        # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## 2. Esquema de Base de Datos (Supabase / PostgreSQL)

Usa `auth.users` nativo de Supabase. **Row-Level Security (RLS) activado** en todas las tablas user-owned.

### Diagrama relacional (resumen)

```
auth.users ──┬── profiles (1:1)
             ├── exercises (1:N, custom)
             ├── routine_templates (1:N, custom)
             ├── workout_sessions (1:N)
             │       └── session_exercises (1:N)
             │               └── sets (1:N)
             └── personal_records (1:N)

routine_templates ── routine_template_exercises ── exercises
muscle_groups ── exercises (N:1 primary, N:M secondary via array)
```

### SQL DDL

```sql
-- 2.1 Perfil de usuario (extiende auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bodyweight_kg numeric(5,2),
  created_at timestamptz default now()
);

-- 2.2 Grupos musculares (enum reference)
create table muscle_groups (
  id smallint primary key,
  name text not null unique          -- chest, back, legs, shoulders, arms, core
);

-- 2.3 Ejercicios (catálogo global + custom por usuario)
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_muscle_id smallint references muscle_groups(id),
  secondary_muscle_ids smallint[],
  equipment text,                    -- barbell, dumbbell, machine, bodyweight, cable
  is_unilateral boolean default false,
  owner_id uuid references auth.users(id), -- null = global, !null = custom
  created_at timestamptz default now()
);
create index on exercises(primary_muscle_id);
create index on exercises(owner_id);

-- 2.4 Templates de rutina (PPL, 5x5, etc + custom)
create table routine_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users(id), -- null = seed global
  created_at timestamptz default now()
);

create table routine_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references routine_templates(id) on delete cascade,
  exercise_id uuid references exercises(id),
  order_index smallint not null,
  target_sets smallint,
  target_reps_min smallint,
  target_reps_max smallint,
  rest_seconds smallint default 90
);
create index on routine_template_exercises(template_id, order_index);

-- 2.5 Sesión de entrenamiento (workout)
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references routine_templates(id), -- nullable (freestyle)
  name text,
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text,
  created_at timestamptz default now()
);
create index on workout_sessions(user_id, started_at desc);

-- 2.6 Ejercicio dentro de una sesión
create table session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index smallint not null,
  notes text
);
create index on session_exercises(session_id, order_index);

-- 2.7 Series individuales (la unidad atómica de tracking)
create table sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references session_exercises(id) on delete cascade,
  set_index smallint not null,       -- 1, 2, 3...
  reps smallint not null,
  weight_kg numeric(6,2) not null,
  rpe numeric(3,1),                  -- 5.0 - 10.0
  is_warmup boolean default false,
  completed_at timestamptz default now()
);
create index on sets(session_exercise_id, set_index);

-- 2.8 Personal records (cache materializada — opcional, calculable on-the-fly)
create table personal_records (
  user_id uuid references auth.users(id) on delete cascade,
  exercise_id uuid references exercises(id),
  best_1rm_kg numeric(6,2),
  best_weight_kg numeric(6,2),
  best_volume_kg numeric(8,2),       -- mejor volumen single-session
  updated_at timestamptz default now(),
  primary key (user_id, exercise_id)
);
```

### RLS Policies (resumen)

| Tabla | Lectura | Escritura |
|---|---|---|
| `profiles`, `workout_sessions`, `session_exercises`, `sets`, `personal_records` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `exercises`, `routine_templates` | `owner_id is null OR owner_id = auth.uid()` | `owner_id = auth.uid()` |
| `routine_template_exercises` | join via parent template (mismo criterio que template) | mismo |
| `muscle_groups` | público (lectura) | solo service role |

### Cálculos derivados (no almacenados)

| Métrica | Fórmula | Ubicación |
|---|---|---|
| 1RM estimado | Epley: `weight * (1 + reps/30)` | `src/lib/calc/oneRM.ts` |
| Volumen serie | `reps * weight_kg` | `src/lib/calc/volume.ts` |
| Volumen sesión | Σ volumen series no-warmup | agregación cliente |
| Volumen semanal | Σ volumen sesiones por week | SQL view o Recharts agg |
| Frecuencia | count(sesiones) por week por muscle_group | SQL view |

---

## 3. Estrategia Offline-First (PWA)

- **vite-plugin-pwa** con Workbox: precache del shell + runtime cache para Supabase GET.
- **Dexie.js** (IndexedDB wrapper) espeja tablas locales: `sessions`, `session_exercises`, `sets`, `exercises` (catálogo).
- **Sync queue**: mutations offline encoladas con `op_id` (uuid local) + `pending=true`. Al recuperar red, `lib/db/sync.ts` flushea en orden a Supabase, marca `synced=true`.
- **Conflict resolution**: last-write-wins por `updated_at` (suficiente para datos single-user).
- **Auth offline**: cache de session JWT en localStorage; UI funciona en read-only si JWT expira sin red.

---

## 4. Plan de Desarrollo Paso a Paso

### Step 1 — Bootstrap proyecto
- `npm create vite@latest` (React + TS)
- Instalar deps: tailwind, shadcn init, recharts, @supabase/supabase-js, dexie, zustand, react-router-dom, vite-plugin-pwa, date-fns
- Configurar Tailwind + Shadcn (button, dialog, input, card, tabs, sheet, calendar)
- Setup ESLint + Prettier

### Step 2 — Supabase setup
- Crear proyecto Supabase free tier
- Aplicar migration `0001_init.sql` (todas las tablas + RLS)
- Seed `0002_seed_exercises.sql`: ~60 ejercicios comunes + 3 templates (PPL, Upper/Lower, 5x5)
- Generar types: `supabase gen types typescript`
- `.env.local` con URL + anon key

### Step 3 — Auth flow
- Páginas Login/Signup con Supabase Auth (email + password)
- `useAuth` hook + `ProtectedRoute` wrapper
- AppShell con BottomNav (móvil-first): Workout, Library, History, Analytics

### Step 4 — Biblioteca de ejercicios
- Query a `exercises` con filtro por `muscle_group`
- Search bar + chips de grupo muscular
- Modal "crear ejercicio custom" (owner_id = user)

### Step 5 — Active workout tracker (core)
- Zustand `sessionStore`: sesión en curso en memoria + persist a IndexedDB
- UI: lista de ejercicios → cada uno con tabla de series (reps, weight, RPE, ✓ check)
- Botón "+ Add set" autocompleta desde última serie
- Botón "+ Add exercise" abre sheet con biblioteca
- Botón "Finish workout" → escribe a Supabase (o queue offline)

### Step 6 — Rest timer
- Componente flotante al marcar serie completa
- Configurable por ejercicio (default 90s, hereda de template)
- `Notification API` al terminar (con fallback a sonido si permiso denegado)

### Step 7 — Templates de rutina
- Listado de templates (globales + custom)
- "Start from template" → crea `workout_session` con `template_id` y precarga `session_exercises`
- Editor de templates custom

### Step 8 — Historial
- CalendarView (Shadcn calendar): días con sesión marcados
- ListView: paginated, agrupado por semana
- SessionDetail: vista read-only de sesión pasada con botón "Repeat workout"

### Step 9 — Analytics dashboard
- **OneRMChart**: line chart, 1RM estimado por ejercicio seleccionado, últimos 90 días
- **VolumeChart**: bar chart, volumen total por semana (últimas 12 semanas)
- **FrequencyHeatmap**: grid GitHub-style, sesiones por día (último año)
- **MuscleGroupBalance**: pie/radar, % volumen por grupo muscular últimas 4 semanas
- Cálculos en cliente desde data local + Supabase

### Step 10 — PWA + Offline
- `vite-plugin-pwa` config (manifest, icons, Workbox)
- Dexie schema espejo + sync engine
- Wrapper de mutations: try Supabase → fallback queue
- Indicador de status (online/offline/syncing) en TopBar
- Test: avión mode, registrar workout, reconectar, verificar sync

### Step 11 — Deploy
- Push a GitHub
- Vercel: import repo, env vars `VITE_SUPABASE_*`
- Verificar PWA installable en móvil
- Test end-to-end: signup → workout → offline → sync → analytics

---

## 5. Costo $0 — Hosting Gratuito

| Servicio | Free tier | Suficiente para MVP |
|---|---|---|
| Vercel | 100GB bandwidth/mes, builds ilimitados | Sí |
| Supabase | 500MB DB, 50k MAU, 5GB bandwidth | Sí (single-user) |
| Dominio | `*.vercel.app` | Sí |

---

## 6. Verificación End-to-End

1. `npm run dev` → app levanta en localhost
2. Signup nuevo user → confirmar email Supabase → login
3. Crear workout desde template PPL → registrar 3 ejercicios × 3 sets → finish
4. **Modo avión**: registrar 2do workout → verificar TopBar status "offline, 1 pending"
5. Reconectar → verificar sync, datos en Supabase dashboard
6. Analytics: gráfico 1RM muestra progresión, volumen semanal correcto
7. Calendar: días marcados correctamente
8. Lighthouse PWA score ≥ 90, "Installable" check
9. Deploy Vercel → mismo flujo en prod URL
