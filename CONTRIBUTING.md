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
2. Cambios a la base de datos solo con una migracion nueva en `supabase/migrations` (`npx supabase migration new <nombre>`), revisada por Jorge (Backend y BD). No modificar tablas desde el dashboard.
3. Despues de cada migracion: `npm run db:types` y subir `src/types/database.ts`.
4. No actualizar la version del SDK de Expo durante el proyecto.
5. Antes de abrir el PR: `npm run typecheck`.

## Equipo y responsables

| Integrante | Dispositivo | Rol | Carpetas y archivos |
|---|---|---|---|
| Kassie | iOS (Expo Go) | 1 - Frontend | `app/(auth)`, `app/(tabs)`, `src/lib/ui.ts` |
| Jorge | iOS (Expo Go) | 2 - Backend y BD | `supabase/migrations`, `supabase/seed.sql`, `src/types`, `src/features/ofertas` |
| Jeshua | iOS (Expo Go) | 3 - Tiempo real | `src/hooks/useSubastaRealtime.ts`, `useCuentaRegresiva.ts`, `supabase/functions/tick-subastas`, `supabase/cron_tick.sql` |
| Isabel | Android (development build) | 4 - Sensores | `src/hooks/useAgitar.ts`, `useConfirmarInclinacion.ts`, `useUbicacion.ts`, `app/escanear.tsx`, camara en `app/(admin)/nueva.tsx` |
| Brayan | Android (development build) | 5 - Pagos, push y admin | `src/features/creditos`, `src/features/notificaciones`, `app/(admin)`, `supabase/functions/crear-pago`, `stripe-webhook`, `notificar-oferta` |
| Kassie, Jeshua e Isabel | - | Compartido | `app/subasta/[id].tsx` |

Isabel y Brayan generan el APK de la demo (`eas build --profile preview -p android`). Brayan configura las credenciales de Firebase (FCM) para push en Android con `npx eas credentials`.

Cada Pull Request lo prueba alguien con el sistema operativo contrario: si lo hizo alguien de Android, lo revisa alguien de iOS y viceversa.
