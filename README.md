# Subasta

App Android de subastas con creditos, ofertas en tiempo real, pagos, notificaciones push y uso de sensores (camara, GPS, acelerometro y giroscopio).

**Stack:** Expo SDK 57 (React Native + Expo Router + TypeScript) y Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions, pg_cron). Pagos con Stripe en modo prueba. Push con Expo Push Service.

El documento de arquitectura completo esta en `docs/Arquitectura_App_Subastas.docx`.

## Requisitos

- Node.js 22 LTS y Git
- Android Studio (SDK y emulador)
- Acceso al proyecto de Supabase del equipo
- Isabel y Brayan: celular Android en modo desarrollador
- Kassie, Jorge y Jeshua: emulador con imagen **Google Play** (API 35 o superior), virtualizacion activada y 8 GB de RAM o mas

La app es **solo para Android** y todo el equipo usa el mismo **development build** (no Expo Go).

## Primeros pasos

```bash
git clone https://github.com/Terreneitor370/subasta.git
cd subasta
npm install
cp .env.example .env        # en Windows PowerShell: Copy-Item .env.example .env
# Completar .env con los valores que comparte Jorge (Backend y BD)
```

### Con celular fisico (Isabel y Brayan)

```bash
npm run android      # la primera vez: compila e instala el development build por USB
npm start            # en adelante, solo esto
```

### Con emulador (Kassie, Jorge y Jeshua)

1. Abrir el emulador en Android Studio (Device Manager).
2. Arrastrar a la ventana del emulador el APK de desarrollo que comparte Isabel (`app-debug.apk`).
3. `npm start` y presionar `a`.

Sensores en el emulador: Extended controls (boton `...`) > Virtual sensors para acelerometro y giroscopio, y Location para el GPS. La validacion final de sensores y push se hace en los celulares de Isabel o Brayan.

### APK de desarrollo y APK final

- **APK de desarrollo:** Isabel ejecuta `npm run android` y comparte `android/app/build/outputs/apk/debug/app-debug.apk`. Se regenera solo cuando cambia algo nativo (librerias nativas, permisos o plugins en `app.json`).
- **APK final para la demo:** Brayan ejecuta `eas build --profile preview -p android`.

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
