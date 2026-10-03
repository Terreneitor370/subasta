# Subasta

App movil de subastas con creditos, ofertas en tiempo real, pagos, notificaciones push y uso de sensores (camara, GPS, acelerometro y giroscopio).

**Stack:** Expo SDK 57 (React Native + Expo Router + TypeScript) y Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions, pg_cron). Pagos con Stripe en modo prueba. Push con Expo Push Service.

El documento de arquitectura completo esta en `docs/Arquitectura_App_Subastas.docx`.

## Requisitos

- Node.js 22 LTS y Git
- Cuenta en Expo (gratuita) y acceso al proyecto de Supabase del equipo
- Android: celular en modo desarrollador + Android Studio (SDK) para el development build
- iOS: app **Expo Go** actualizada (debe soportar SDK 57)

## Primeros pasos

```bash
git clone https://github.com/Terreneitor370/subasta.git
cd subasta
npm install
cp .env.example .env        # en Windows PowerShell: Copy-Item .env.example .env
# Completar .env con los valores que comparte el Integrante 2
```

### iOS (Expo Go)

```bash
npm start            # escanear el QR con la camara del iPhone
npm run start:tunnel # si la red de la escuela bloquea la conexion local
```

### Android (development build)

```bash
npm run android      # compila e instala la app en el celular conectado por USB
npm start            # en adelante, solo esto
```

En Android las notificaciones push NO funcionan dentro de Expo Go, por eso se usa el development build.

## Estructura

```
app/                      Pantallas (Expo Router: cada archivo es una ruta)
  (auth)/                 Login y registro
  (tabs)/                 Subastas, Mis ofertas, Ganados, Creditos, Perfil
  (admin)/                Panel de administrador (solo rol admin)
  subasta/[id].tsx        Detalle: tiempo real + oferta rapida (agitar + inclinar)
  escanear.tsx            Escaner QR (camara)
src/
  lib/                    Cliente Supabase, sesion, estilos
  hooks/                  Tiempo real, temporizador, sensores
  features/               Ofertas, creditos (pagos), notificaciones, admin
  types/database.ts       Tipos generados de la BD (npm run db:types)
supabase/
  migrations/             Esquema SQL, RLS y funciones (fuente de verdad de la BD)
  functions/              Edge Functions: crear-pago, stripe-webhook, notificar-oferta, tick-subastas
  seed.sql                Datos de prueba
  cron_tick.sql           Programacion del cierre de subastas (se ejecuta una vez)
docs/                     Documentacion del proyecto
```

## Usuarios de prueba

1. Registrate en la app.
2. En Supabase > SQL Editor: `update public.usuarios set rol = 'admin' where correo = 'tu@correo.com';`
3. Tarjeta de prueba de Stripe: `4242 4242 4242 4242`, fecha futura, CVC cualquiera.

## Flujo de trabajo

Ver [CONTRIBUTING.md](CONTRIBUTING.md).
