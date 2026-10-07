# Frontend de Jorge

## Alcance

Pantallas de acceso y registro, las cinco pestañas, navegación protegida, presentación del detalle de subasta y componentes de interfaz. Se sigue el alcance solicitado por Jorge y el documento de arquitectura; CONTRIBUTING.md contiene una asignación distinta de integrantes. No se cambia backend, base de datos, sensores, módulos de pagos ni SDK.

## Diseño

Estética editorial de casa de subastas: fondo marfil, texto carbón, acento terracota y tarjetas con bordes discretos. Georgia en títulos de iOS, serif nativa en Android; controles y textos largos con la fuente sans del sistema. No necesita descargar fuentes ni instalar librerías nativas. Los valores compartidos viven en src/lib/ui.ts. Editorial.tsx contiene marca, encabezados e imagen con recuperación ante URL rota. Las fotos provienen de imagen_url; si faltan, se muestra un respaldo explícito.

## Rutas

| Ruta | Función |
| --- | --- |
| /(auth)/login | Acceso con correo y contraseña |
| /(auth)/registro | Alta con nombre, correo y confirmación de contraseña |
| /(tabs) | Catálogo, búsqueda y filtro de subastas |
| /(tabs)/mis-ofertas | Actividad de ofertas y su estado |
| /(tabs)/ganados | Productos adjudicados |
| /(tabs)/creditos | Saldo, paquetes y movimientos |
| /(tabs)/perfil | Perfil, avisos y cierre de sesión |
| /subasta/[id] | Detalle, cuenta regresiva y participación |

El acceso a pestañas y detalle requiere sesión real. El enlace de administración requiere perfil admin de la misma sesión. QR y administración enlazan a las rutas existentes del equipo. Las consultas se refrescan al volver a una pantalla y al reanudar la app. Los componentes incluyen carga, error, reintento y vacío.

## Probar en iPhone

Desde la carpeta del proyecto, ejecutar npm start -- --clear y escanear el QR con la cámara del iPhone para abrirlo en Expo Go. Usar la misma red Wi-Fi. Si la red bloquea la conexión, usar npm run start:tunnel. Reiniciar Metro después de editar .env; las tres variables públicas ya están configuradas localmente y no deben subirse a Git.

Comprobar registro e inicio/cierre de sesión; navegar por todas las pestañas; buscar sin coincidencias; cambiar En vivo/Próximamente; denegar ubicación; abrir QR; entrar a un producto; ofertar con monto válido, insuficiente y repetido; agitar, cancelar e inclinar; revisar ganados, saldo y avisos. Desconectar y reconectar internet. Probar texto grande en Ajustes de accesibilidad, teclado abierto, retorno desde segundo plano y dos cuentas distintas. Los datos reales dependen de las tablas y servicios del equipo.

## Validación automática

- npm run typecheck.
- npx expo export --platform ios --platform android --output-dir dist.
- tests/frontend/validar.cjs prueba componentes React reales con servicios y dispositivos simulados. No crea usuarios, ofertas ni pagos remotos. Requiere react-test-renderer de la misma versión que React. Se puede instalar el runtime de pruebas en una carpeta temporal externa, sin tocar package.json ni el lockfile del proyecto:

~~~powershell
$testRuntime = Join-Path $env:TEMP 'subasta-pruebas-jorge'
npm install --prefix $testRuntime --no-save --package-lock=false react@19.2.3 react-test-renderer@19.2.3
$env:SUBASTA_TEST_RUNTIME = $testRuntime
node tests/frontend/validar.cjs
~~~

Última ejecución: 88 casos aprobados, ninguno fallido. Incluye protección de rutas, aislamiento entre cuentas, consultas personales, validación de formularios y montos, bloqueos de pulsaciones duplicadas, pago cancelado, reanudación, cierre de subasta y recuperación de imágenes.

La revisión visual renderizó las ocho pantallas desde su código React mediante React Native Web, con servicios simulados: anchos 320, 390 y 430; sin errores de ejecución ni controles fuera de pantalla. Las capturas son de datos de prueba y no acreditan una sesión en dispositivo.

## Pendientes de aceptación en dispositivo

- [ ] iPhone con Expo Go: navegación, teclado, texto grande y retorno desde segundo plano.
- [ ] Android con development build: revisión de diseño por otro integrante.
- [ ] Integración real: dos usuarios compitiendo, actualización del saldo y cierre del servidor.
- [ ] Stripe en modo prueba con el servicio y webhook de Brayan.
- [ ] QR, permisos y gestos en hardware real con los módulos de Isabel.

La exportación y los dobles de prueba no sustituyen estas comprobaciones. No hay acceso a un celular físico en esta sesión. La instalación limpia del proyecto tiene un conflicto previo de versiones React/react-dom, y expo-doctor detecta dependencias desalineadas; se reportan para los responsables y no se cambian dentro de este trabajo de frontend.
