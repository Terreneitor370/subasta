# Como trabajamos con Git

## Ramas

| Rama | Uso |
|---|---|
| `main` | Version estable para la demo. Solo recibe merges desde `develop`. |
| `develop` | Integracion diaria. Todas las ramas de trabajo salen de aqui. |
| `feat/<area>-<descripcion>` | Trabajo de cada integrante. Ej: `feat/realtime-temporizador`. |
| `fix/<descripcion>` | Correcciones. |

Areas: `ui`, `bd`, `realtime`, `sensores`, `pagos`, `push`, `admin`.

## Ciclo diario

```bash
git checkout develop
git pull
git checkout -b feat/sensores-agitar
# ...trabajar...
git add .
git commit -m "feat(sensores): oferta rapida al agitar"
git push -u origin feat/sensores-agitar
```

Luego abrir un Pull Request hacia `develop`. Otro integrante lo revisa y lo prueba en su celular antes de aprobar. Hacer merge al menos una vez al dia para evitar conflictos grandes.

## Commits (Conventional Commits)

`feat:` nueva funcion, `fix:` correccion, `docs:` documentacion, `refactor:`, `chore:` configuracion.
Ejemplo: `fix(realtime): cerrar canal al salir de la pantalla`.

## Reglas

1. Nunca subir `.env` ni llaves. La `service_role` key y la llave secreta de Stripe solo viven en los secretos de Supabase.
2. Cambios a la base de datos solo con una migracion nueva en `supabase/migrations` (`npx supabase migration new <nombre>`), revisada por el Integrante 2. No modificar tablas desde el dashboard.
3. Despues de cada migracion: `npm run db:types` y subir `src/types/database.ts`.
4. No actualizar la version del SDK de Expo durante el proyecto.
5. Antes de abrir el PR: `npm run typecheck`.

## Dueños por carpeta

| Carpeta | Responsable |
|---|---|
| `app/(auth)`, `app/(tabs)`, `src/lib/ui.ts` | Integrante 1 - Frontend |
| `supabase/migrations`, `supabase/seed.sql`, `src/types` | Integrante 2 - Backend y BD |
| `src/hooks/useSubastaRealtime.ts`, `useCuentaRegresiva.ts`, `supabase/functions/tick-subastas` | Integrante 3 - Tiempo real |
| `src/hooks/useAgitar.ts`, `useConfirmarInclinacion.ts`, `useUbicacion.ts`, `app/escanear.tsx` | Integrante 4 - Sensores |
| `src/features/creditos`, `src/features/notificaciones`, `app/(admin)`, `supabase/functions/crear-pago`, `stripe-webhook`, `notificar-oferta` | Integrante 5 - Pagos, push y admin |
| `app/subasta/[id].tsx` | Compartida (1, 3 y 4) |
