# Supabase setup

## Pasos para aplicar el schema

1. Crear proyecto free tier en https://supabase.com (region cercana).
2. Copiar `Project URL` y `anon public key` desde **Settings → API**.
3. Crear `.env.local` en raíz copiando `.env.local.example` y rellenar valores.
4. Aplicar migrations en el SQL Editor de Supabase (Dashboard → SQL):
   - Ejecutar `migrations/0001_init.sql` primero.
   - Ejecutar `migrations/0002_seed_exercises.sql` después.
5. (Opcional) Regenerar types tipados:
   ```bash
   npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
   ```

## Auth setup

En Dashboard → Authentication → Providers:
- Email: activado, "Confirm email" puede desactivarse para desarrollo local.

El trigger `on_auth_user_created` (en `0001_init.sql`) crea automáticamente la fila en `profiles` cuando un usuario se registra.

## Verificación

- Tabla `muscle_groups` debe tener 6 filas.
- Tabla `exercises` debe tener ~60 filas con `owner_id IS NULL`.
- Tabla `routine_templates` debe tener 7 filas (PPL × 3, Upper, Lower, 5x5 × 2).
- Tabla `routine_template_exercises` debe tener ~30 filas.
- Tras hacer signup, `profiles` debe tener una fila para el nuevo `user.id`.
