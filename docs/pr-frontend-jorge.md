# feat(ui): completar pantallas y diseño editorial de subastas

Base propuesta: develop. Rama de trabajo: feat/ui-jorge-pantallas.

## Que cambia

Completa acceso, registro, catálogo, ofertas, ganados, créditos y perfil con una identidad editorial compartida. El detalle permite ofertar mediante los módulos existentes, valida montos y saldo y evita envíos duplicados. Las rutas requieren sesión real; perfiles de otras sesiones no habilitan administración ni aportan saldo. Las pantallas manejan carga, error, vacío, imágenes fallidas y retorno desde segundo plano.

Cambios limitados al frontend, pruebas y documentación. No incluye .env ni cambios a package.json o tsconfig.json presentes en el entorno.

## Como probarlo

Consultar frontend-jorge.md para iniciar en Expo Go y reproducir la suite de componentes. Revisar la navegación y todos los estados de las ocho pantallas.

- [ ] Probado en celular Android (development build)
- [ ] Sigue abriendo en Expo Go (iPhone)
- [x] npm run typecheck sin errores
- [x] 88 pruebas de componentes aprobadas
- [x] Revisión estática: 0 errores y 0 advertencias
- [x] Exportación iOS y Android
- [x] Revisión visual del código real con datos de prueba a 320/390/430 px

Las verificaciones físicas y la integración real de Stripe, sensores y dos usuarios quedan pendientes de otro integrante antes de aprobar, conforme a CONTRIBUTING.md. No hay migraciones.
