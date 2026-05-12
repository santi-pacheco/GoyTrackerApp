# GoyTracker

App web tipo Strong/Hevy para registrar entrenamientos de gimnasio, analizar progreso y visualizar estadísticas. Stack moderno, PWA offline-first, hosting 100 % gratuito.

Ver [`arquitectura_gym_app.md`](./arquitectura_gym_app.md) para arquitectura completa, esquema de DB y plan de desarrollo.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui + Radix primitives
- **Charts**: Recharts
- **Estado**: Zustand
- **Persistencia local**: Dexie (IndexedDB) + sync queue
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **PWA**: vite-plugin-pwa (Workbox)
- **Hosting**: Vercel

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en https://supabase.com (free tier).
2. En el SQL Editor del dashboard, ejecuta los archivos en orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_exercises.sql`
3. Copia `Project URL` y `anon public key` desde **Settings → API**.
4. Crea `.env.local` en la raíz copiando `.env.local.example`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

5. (Opcional) Regenera tipos:

```bash
npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
```

### 3. Levantar dev server

```bash
npm run dev
```

## Scripts

- `npm run dev` — Vite dev server con HMR
- `npm run build` — Build de producción (tsc + vite build)
- `npm run preview` — Preview del build
- `npm run lint` — ESLint

## Deploy a Vercel

1. Push del repo a GitHub.
2. En https://vercel.com → **New Project** → import del repo.
3. Vercel detecta Vite automáticamente. Override solo si necesario:
   - Build: `npm run build`
   - Output: `dist`
4. **Environment Variables**: añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Deploy.

`vercel.json` ya configura SPA rewrites y caching del Service Worker.

## PWA — instalación en móvil

Tras deploy:

1. Abre la URL de Vercel en Chrome móvil.
2. Menu → **Add to Home Screen**.
3. La app se instala como standalone con su propio icono.
4. **Offline**: al perder conexión, los workouts finalizados se encolan en IndexedDB (`Dexie`) y se sincronizan al volver online. El badge superior muestra el estado (`Sync` / `Offline · N pend.` / `Sync…`).

> Los iconos PWA están en SVG (`public/icons/icon.svg`) — funcionan en Chromium-based browsers. Para máxima compatibilidad iOS Safari, reemplaza por PNGs 192x192 y 512x512 y actualiza `vite.config.ts`.

## Android (Capacitor)

App empaquetada como APK Android usando [Capacitor](https://capacitorjs.com/). Reusa exactamente el mismo bundle de Vite — sin reescribir UI.

### Requisitos

- JDK 17 o 21 (`java --version`)
- [Android Studio](https://developer.android.com/studio) — instala SDK + emulator + build tools

### Workflow

Cada vez que cambies el código web:

```bash
npm run build           # compila Vite → dist/
npx cap sync android    # copia dist/ a android/app/src/main/assets/public/
```

### Generar APK

Opción A — Android Studio (recomendado primera vez):

```bash
npx cap open android    # abre proyecto en Studio
```

En Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. Output en `android/app/build/outputs/apk/debug/app-debug.apk`.

Opción B — CLI (si tienes SDK + gradle configurados):

```bash
cd android
./gradlew assembleDebug
```

### Instalar en teléfono

1. Activa **Opciones de desarrollador → Depuración USB** en el móvil.
2. Conecta por USB.
3. Desde Studio: botón Run ▶ con tu device seleccionado.
4. O instala APK manual: `adb install android/app/build/outputs/apk/debug/app-debug.apk`.

### App ID y nombre

Configurados en `capacitor.config.ts`:
- `appId`: `com.santipacheco.goytracker`
- `appName`: `GoyTracker`

Cambia ambos antes de release a Play Store.

### Limitaciones del MVP nativo

- Notificaciones de rest timer usan Notification API del WebView (puede no funcionar en background). Para notificaciones nativas reales instala `@capacitor/local-notifications`.
- Sin acceso a background sync nativo. La queue de Dexie sincroniza solo cuando la app está en foreground.

## Features (MVP)

- ✅ Auth (Supabase email + password)
- ✅ Biblioteca de ejercicios (60 globales + custom)
- ✅ Templates de rutina (PPL, Upper/Lower, 5x5 + custom)
- ✅ Tracker activo: series, reps, peso, RPE, warmup flag
- ✅ Timer de descanso configurable + Notification API + beep fallback
- ✅ Historial: vista calendario + lista por semana + detalle + repeat workout
- ✅ Analytics: 1RM Epley, volumen semanal, frecuencia heatmap, balance muscular
- ✅ PWA offline-first con sync queue

## Estructura

Ver `arquitectura_gym_app.md` sección 1.

## Verificación end-to-end

1. `npm run dev` → http://localhost:5173
2. Signup → email confirm (o desactivar en Supabase Auth settings durante dev)
3. Library → Templates → "Empezar" PPL Push Day
4. Tracker: añadir pesos/reps, marcar series, observar rest timer + notificación
5. Finalizar → verificar fila en `workout_sessions` de Supabase
6. **Modo avión**: registrar otro workout → badge "Offline · 1 pend."
7. Reconectar → badge cambia a "Sync…" → "Sync" → fila aparece en Supabase
8. History → calendar y lista muestran sesiones
9. Analytics → tras varias sesiones, los 4 gráficos pueblan
