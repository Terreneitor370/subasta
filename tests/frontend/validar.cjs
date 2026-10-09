const fs = require("fs"),
  path = require("path"),
  assert = require("node:assert/strict"),
  Module = require("module");
const project = path.resolve(__dirname, "../..");
const runtime = process.env.SUBASTA_TEST_RUNTIME
  ? path.resolve(process.env.SUBASTA_TEST_RUNTIME)
  : project;
const requireRuntime = Module.createRequire(path.join(runtime, "package.json"));
const React = requireRuntime("react");
const { act, create } = requireRuntime("react-test-renderer");
const ts = require(path.join(project, "node_modules/typescript"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => {
  if (!String(args[0]).includes("react-test-renderer is deprecated"))
    originalError(...args);
};
const uid = "11111111-1111-4111-8111-111111111111",
  pid = "22222222-2222-4222-8222-222222222222";
const user = {
  id: uid,
  nombre: "Jorge",
  correo: "jorge@example.test",
  creditos: 250,
  creditos_reservados: 120,
  rol: "usuario",
};
const product = {
  id: pid,
  nombre: "Audífonos",
  precio_actual: 120,
  precio_inicial: 100,
  incremento_minimo: 10,
  lider_id: uid,
  estado: "activa",
  fecha_inicio: "2026-10-06T18:00:00Z",
  fecha_fin: "2026-10-07T18:00:00Z",
  imagen_url: null,
  descripcion: "Producto de prueba",
  latitud: null,
  longitud: null,
};
let state, tree;
const routes = [],
  alerts = [],
  dbCalls = [],
  results = [];
const e = React.createElement;
function FlatList(props) {
  return e(
    "FlatList",
    props,
    props.ListHeaderComponent,
    props.data?.length
      ? props.data.map((item, index) =>
          e(
            React.Fragment,
            { key: item.id ?? index },
            props.renderItem({ item, index }),
          ),
        )
      : props.ListEmptyComponent,
    props.ListFooterComponent,
  );
}
const RN = {
  Keyboard: { addListener: () => ({ remove: () => {} }) },
  ...Object.fromEntries(
    [
      "View",
      "Text",
      "TextInput",
      "Pressable",
      "ActivityIndicator",
      "ScrollView",
      "KeyboardAvoidingView",
      "RefreshControl",
    ].map((n) => [n, n]),
  ),
  FlatList,
  Modal: ({ visible, children, ...props }) =>
    visible ? e("Modal", props, children) : null,
  Platform: { OS: "ios" },
  StyleSheet: { create: (s) => s },
  AppState: {
    addEventListener: (name, cb) => {
      state.appState = cb;
      return { remove: () => (state.listenerRemoved = true) };
    },
  },
  Alert: { alert: (...args) => alerts.push(args) },
};
const Stack = ({ children }) => e("Stack", null, children);
Stack.Screen = (p) => e("Screen", p);
Stack.Protected = ({ guard, children }) =>
  guard ? e(React.Fragment, null, children) : null;
const Tabs = ({ children }) => e("Tabs", null, children);
Tabs.Screen = (p) => e("TabScreen", p);
const router = Object.fromEntries(
  ["push", "navigate", "replace", "back"].map((m) => [
    m,
    (p) => routes.push([m, p]),
  ]),
);
const supabase = {
  auth: {
    signInWithPassword: async (p) => {
      state.authCalls.push(p);
      return state.authResult;
    },
    signUp: async (p) => {
      state.authCalls.push(p);
      return state.authResult;
    },
    signOut: async () => {
      state.signouts++;
      return state.authResult;
    },
  },
  from: (table) => {
    const call = { table, steps: [] };
    dbCalls.push(call);
    const chain = {};
    for (const method of [
      "select",
      "eq",
      "in",
      "order",
      "limit",
      "update",
      "insert",
      "maybeSingle",
    ])
      chain[method] = (...args) => {
        call.steps.push([method, ...args]);
        return chain;
      };
    chain.then = (resolve, reject) =>
      Promise.resolve(state.db.shift() ?? { data: [], error: null }).then(
        resolve,
        reject,
      );
    return chain;
  },
};
const mocks = {
  react: React,
  "react/jsx-runtime": requireRuntime("react/jsx-runtime"),
  "react-native": RN,
  "react-native-safe-area-context": { SafeAreaView: "SafeAreaView" },
  "expo-router": {
    router,
    Stack,
    Tabs,
    Link: "Link",
    Redirect: "Redirect",
    useLocalSearchParams: () => ({ id: state.id }),
    useFocusEffect: (cb) => React.useEffect(cb, [cb]),
  },
  "expo-image": { Image: "Image" },
  "expo-camera": {
    CameraView: "CameraView",
    useCameraPermissions: () => [
      { granted: false, canAskAgain: true },
      async () => {},
    ],
  },
  "expo-local-authentication": {
    hasHardwareAsync: async () => state.huella?.hardware ?? true,
    isEnrolledAsync: async () => state.huella?.enrolada ?? true,
    authenticateAsync: async () => state.huella?.resultado ?? { success: true },
  },
  "expo-image-picker": {
    launchImageLibraryAsync: async () => state.galeria ?? { canceled: true },
  },
  "expo-status-bar": { StatusBar: "StatusBar" },
  "expo-haptics": {
    notificationAsync: async () => {},
    impactAsync: async () => {},
    NotificationFeedbackType: { Success: 1, Error: 2 },
    ImpactFeedbackStyle: { Heavy: 1 },
  },
  "@stripe/stripe-react-native": {
    StripeProvider: ({ children }) => children,
    useStripe: () => ({}),
  },
  "@tanstack/react-query": {
    focusManager: { setFocused: (value) => (state.focused = value) },
    QueryClient: class {},
    QueryClientProvider: ({ children }) => children,
    useQueryClient: () => ({ clear: () => state.cleared++ }),
    useQuery: (options) => {
      state.queryOptions = options;
      return state.query;
    },
  },
};
const load = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.hasOwn(mocks, request)) return mocks[request];
  if (/lib\/sesion$/.test(request))
    return {
      useSesion: () => state.session,
      SesionProvider: ({ children }) => children,
    };
  if (/lib\/supabase$/.test(request)) return { supabase };
  if (/useSubastaRealtime$/.test(request))
    return { useSubastaRealtime: () => state.realtime };
  if (/useCuentaRegresiva$/.test(request))
    return {
      useCuentaRegresiva: () => state.remaining,
      formatoTiempo: () => "01:00",
    };
  if (/useAgitar$/.test(request))
    return {
      useAgitar: (cb, enabled) => {
        state.shake = { cb, enabled };
      },
    };
  if (/useConfirmarInclinacion$/.test(request))
    return {
      useConfirmarInclinacion: (enabled, cb) => {
        state.tilt = { enabled, cb };
        return 0;
      },
    };
  if (/ofertas\/ofertar$/.test(request))
    return {
      ofertar: async (...args) => {
        state.bids.push(args);
        return state.bidResult();
      },
    };
  if (/creditos\/comprarCreditos$/.test(request))
    return {
      PAQUETES: require(
        path.join(project, "src/features/creditos/comprarCreditos.ts"),
      ).PAQUETES,
      comprarCreditos: async (...args) => {
        state.payments.push(args);
        return state.paymentResult();
      },
    };
  return load.call(this, request, parent, isMain);
};
for (const ext of [".ts", ".tsx"])
  Module._extensions[ext] = (module, filename) => {
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    module._compile(code, filename);
  };
const component = (file, name = "default") =>
  require(path.join(project, file))[name];
const Auth = component("src/components/AuthForm.tsx", "AuthForm");
const screens = {
  subastas: component("app/(tabs)/index.tsx"),
  ofertas: component("app/(tabs)/mis-ofertas.tsx"),
  ganados: component("app/(tabs)/ganados.tsx"),
  creditos: component("app/(tabs)/creditos.tsx"),
  perfil: component("app/(tabs)/perfil.tsx"),
  detalle: component("app/subasta/[id].tsx"),
};
const Root = component("app/_layout.tsx");
const NuevaSubasta = component("app/(admin)/nueva.tsx");
const ImagenProducto = component(
  "src/components/Editorial.tsx",
  "ImagenProducto",
);
function text(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join(" ");
  return text(node.children ?? []);
}
const has = (s) =>
  assert.ok(text(tree.toJSON()).includes(s), `No aparece: ${s}`);
const lacks = (s) =>
  assert.ok(!text(tree.toJSON()).includes(s), `Aparece inesperadamente: ${s}`);
const button = (s) => {
  const b = tree.root
    .findAllByType("Pressable")
    .find((n) => text(n).includes(s) || n.props.accessibilityLabel === s || n.props.accessibilityLabel?.startsWith(s + " "));
  assert.ok(b, `No se encuentra botón ${s}`);
  return b;
};
async function press(s) {
  await act(async () => {
    await button(s).props.onPress();
  });
}
async function fill(label, value) {
  await act(async () =>
    tree.root
      .findAllByType("TextInput")
      .find((n) => n.props.accessibilityLabel === label)
      .props.onChangeText(value),
  );
}
async function mount(Component, props = {}) {
  await act(async () => {
    tree = create(e(Component, props));
  });
}
async function reset() {
  if (tree) {
    await act(async () => tree.unmount());
    tree = null;
  }
  routes.length = alerts.length = dbCalls.length = 0;
  state = {
    session: {
      session: { user: { id: uid, email: user.correo } },
      usuario: { ...user },
      cargando: false,
    },
    query: {
      data: [],
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: async () => {
        state.refetches++;
      },
    },
    refetches: 0,
    authCalls: [],
    authResult: { data: { session: null }, error: null },
    db: [],
    realtime: { producto: { ...product }, ofertas: [] },
    id: pid,
    remaining: 60000,
    location: null,
    bids: [],
    bidResult: async () => {},
    payments: [],
    paymentResult: async () => "ok",
    signouts: 0,
    cleared: 0,
  };
}
async function test(name, fn) {
  await reset();
  try {
    await fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    results.push({ name, status: "FAIL", error: error.message });
  }
}
async function authReady(reg = false) {
  await mount(Auth, { registro: reg });
  if (reg) await fill("Nombre", " Jorge ");
  await fill("Correo electrónico", " JORGE@EXAMPLE.TEST ");
  await fill("Contraseña", "secreto123");
  if (reg) await fill("Confirmar contraseña", "secreto123");
}
async function run() {
  const { enteroPositivo, validarNuevaSubasta } = require(path.join(project, "src/lib/validacion.ts"));
  await test("Importes: rechaza decimales, exponentes, negativos y desbordamientos", async () => {
    for (const value of ["", "0", "-1", "1.5", "1e3", "0x10", "Infinity", "2147483648", "999999999999999999"]) assert.equal(enteroPositivo(value), null);
    assert.equal(enteroPositivo(" 100 "), 100);
    assert.equal(enteroPositivo("2147483647"), 2147483647);
  });
  await test("Nueva subasta: valida duración, nombre y siguiente oferta", async () => {
    const datos = { nombre: "Audífonos", descripcion: "", precio: "100", incremento: "10", minutos: "7200" };
    assert.deepEqual(validarNuevaSubasta(datos), {});
    for (const minutos of ["0", "7201", "1.5", "1e2"]) assert.ok(validarNuevaSubasta({...datos, minutos}).minutos);
    assert.ok(validarNuevaSubasta({...datos, nombre: "  "}).nombre);
    assert.ok(validarNuevaSubasta({...datos, descripcion: "a".repeat(2001)}).descripcion);
    assert.ok(validarNuevaSubasta({...datos, precio: "2147483647"}).incremento);
  });
  await test("Nueva subasta: formulario inválido no envía una publicación", async () => {
    await mount(NuevaSubasta);
    await press("Publicar subasta");
    has("Escribe un nombre de 2 a 120 caracteres.");
    assert.equal(dbCalls.filter(call => call[0] === "insert").length, 0);
  });
  await test("Nueva subasta: publicar permanece fuera del contenido desplazable", async () => {
    await mount(NuevaSubasta);
    const scroll = tree.root.findByType("ScrollView");
    assert.equal(scroll.findAllByType("TextInput").length, 5);
    assert.ok(!text(scroll).includes("Publicar subasta"));
    assert.equal(button("Publicar subasta").props.disabled, false);
    assert.equal(scroll.props.contentContainerStyle.flex, undefined);
    assert.equal(tree.root.findByType("SafeAreaView").props.edges[0], "bottom");
  });
  await test("Nueva subasta: huella no configurada bloquea adjuntar foto", async () => {
    state.huella = { hardware: false };
    await mount(NuevaSubasta);
    await press("Adjuntar foto del producto");
    assert.ok(alerts[0][0].includes("Huella"));
    has("Adjuntar foto del producto");
  });
  await test("Nueva subasta: huella rechazada no ofrece elegir la foto", async () => {
    state.huella = { resultado: { success: false } };
    await mount(NuevaSubasta);
    await press("Adjuntar foto del producto");
    assert.equal(alerts.length, 0);
    has("Adjuntar foto del producto");
  });
  await test("Nueva subasta: huella confirmada ofrece tomar foto o elegir de galería", async () => {
    await mount(NuevaSubasta);
    await press("Adjuntar foto del producto");
    const opciones = alerts[0][2].map((o) => o.text);
    assert.deepEqual(opciones, ["Tomar foto", "Elegir de galería", "Cancelar"]);
  });
  await test("Nueva subasta: elegir tomar foto abre el flujo de cámara", async () => {
    await mount(NuevaSubasta);
    await press("Adjuntar foto del producto");
    await act(async () =>
      alerts[0][2].find((o) => o.text === "Tomar foto").onPress(),
    );
    has("Necesitamos permiso de cámara para tomar la foto.");
  });
  await test("Nueva subasta: elegir de galería adjunta la foto seleccionada", async () => {
    state.galeria = { canceled: false, assets: [{ uri: "file://foto.jpg" }] };
    await mount(NuevaSubasta);
    await press("Adjuntar foto del producto");
    await act(async () =>
      alerts[0][2].find((o) => o.text === "Elegir de galería").onPress(),
    );
    lacks("Adjuntar foto del producto");
    assert.equal(tree.root.findAllByType("Image").length, 1);
  });
  await test("Nueva subasta: cancelar la galería conserva la pantalla", async () => {
    state.galeria = { canceled: true };
    await mount(NuevaSubasta);
    await press("Adjuntar foto del producto");
    await act(async () =>
      alerts[0][2].find((o) => o.text === "Elegir de galería").onPress(),
    );
    has("Adjuntar foto del producto");
  });
  await test("Créditos: todos los paquetes aplican un peso por crédito", async () => {
    const PAQUETES = component(
      "src/features/creditos/comprarCreditos.ts",
      "PAQUETES",
    );
    for (const paquete of PAQUETES)
      assert.equal(paquete.precio, paquete.creditos);
    await mount(screens.creditos);
    has("$1 MXN = 1 crédito");
    const precios = tree.root
      .findAllByType("Text")
      .map((node) => text(node).replace(/\s+/g, ""));
    for (const paquete of PAQUETES)
      assert.ok(precios.includes(`$${paquete.precio}MXN`));
    lacks("modo prueba");
    lacks("Pagos de prueba");
    lacks("4242");
  });
  await test("Imagen: producto sin foto conserva su presentación", async () => {
    await mount(ImagenProducto, { nombre: "Audífonos" });
    has("Imagen no disponible");
    assert.equal(tree.root.findAllByType("Image").length, 0);
  });
  await test("Foto: abre sin navegar, muestra imagen completa y limita el zoom", async () => {
    await mount(ImagenProducto, {nombre: "Audífonos", uri: "https://example.test/foto.png"});
    let detenido = false;
    await act(async () => button("Ampliar foto de Audífonos").props.onPress({stopPropagation: () => { detenido = true; }}));
    assert.ok(detenido);
    assert.equal(tree.root.findAllByType("Image")[1].props.contentFit, "contain");
    const ampliar = () => tree.root.findAllByType("Pressable").find(node => node.props.accessibilityLabel === "Ampliar foto");
    for (let i = 0; i < 6; i++) await act(async () => ampliar().props.onPress());
    has("400 %");
    assert.equal(ampliar().props.disabled, true);
    await press("Restablecer tamaño de foto");
    has("100 %");
    assert.equal(button("Reducir foto").props.disabled, true);
    await act(async () => tree.root.findByType("Modal").props.onRequestClose());
    assert.equal(tree.root.findAllByType("Modal").length, 0);
  });
  await test("Foto: un fallo en pantalla completa permite cerrar y volver a intentar", async () => {
    await mount(ImagenProducto, {nombre: "Audífonos", uri: "https://example.test/foto.png"});
    await act(async () => button("Ampliar foto de Audífonos").props.onPress({stopPropagation() {}}));
    await act(async () => tree.root.findAllByType("Image")[1].props.onError());
    has("No se pudo cargar la foto");
    await press("Cerrar foto");
    assert.equal(tree.root.findAllByType("Modal").length, 0);
  });
  await test("Imagen: URL rota muestra respaldo", async () => {
    await mount(ImagenProducto, {
      nombre: "Audífonos",
      uri: "https://example.test/foto.png",
    });
    await act(async () => tree.root.findByType("Image").props.onError());
    has("Imagen no disponible");
  });
  await test("Imagen: URL nueva recupera imagen tras fallo anterior", async () => {
    await mount(ImagenProducto, {
      nombre: "Audífonos",
      uri: "https://example.test/rota.png",
    });
    await act(async () => tree.root.findByType("Image").props.onError());
    await act(async () =>
      tree.update(
        e(ImagenProducto, {
          nombre: "Audífonos",
          uri: "https://example.test/nueva.png",
        }),
      ),
    );
    assert.equal(
      tree.root.findByType("Image").props.source,
      "https://example.test/nueva.png",
    );
  });

  await test("Login: campos requeridos impiden llamar Auth", async () => {
    await mount(Auth);
    await press("Iniciar sesión");
    has("correo válido");
    assert.equal(state.authCalls.length, 0);
  });
  await test("Login: correo inválido no se envía", async () => {
    await mount(Auth);
    await fill("Correo electrónico", "a@b");
    await press("Iniciar sesión");
    assert.equal(state.authCalls.length, 0);
  });
  await test("Login: normaliza correo y conserva contraseña", async () => {
    await authReady();
    await press("Iniciar sesión");
    assert.deepEqual(state.authCalls[0], {
      email: "jorge@example.test",
      password: "secreto123",
    });
  });
  await test("Login: credenciales rechazadas tienen mensaje útil", async () => {
    state.authResult = { error: { code: "invalid_credentials" } };
    await authReady();
    await press("Iniciar sesión");
    has("incorrectos");
  });
  await test("Login: correo sin confirmar tiene mensaje útil", async () => {
    state.authResult = { error: { code: "email_not_confirmed" } };
    await authReady();
    await press("Iniciar sesión");
    has("Confirma tu correo");
  });
  await test("Login: error de conexión no rompe pantalla", async () => {
    state.authResult = { error: new Error("network") };
    await authReady();
    await press("Iniciar sesión");
    has("conexión");
  });
  await test("Registro: nombre corto no llama Auth", async () => {
    await authReady(true);
    await fill("Nombre", "J");
    await press("Crear mi cuenta");
    has("al menos 2");
    assert.equal(state.authCalls.length, 0);
  });
  await test("Registro: contraseña corta no llama Auth", async () => {
    await authReady(true);
    await fill("Contraseña", "123");
    await press("Crear mi cuenta");
    has("al menos 6");
    assert.equal(state.authCalls.length, 0);
  });
  await test("Registro: confirmación diferente no llama Auth", async () => {
    await authReady(true);
    await fill("Confirmar contraseña", "otra");
    await press("Crear mi cuenta");
    has("no coinciden");
    assert.equal(state.authCalls.length, 0);
  });
  await test("Registro: nombre normalizado en metadata de Auth", async () => {
    await authReady(true);
    await press("Crear mi cuenta");
    assert.equal(state.authCalls[0].options.data.nombre, "Jorge");
  });
  await test("Registro: sin sesión pide confirmar correo sin navegar", async () => {
    await authReady(true);
    await press("Crear mi cuenta");
    has("Revisa tu correo");
    assert.equal(routes.length, 0);
  });
  await test("Registro: cuenta existente muestra error", async () => {
    state.authResult = { error: { code: "user_already_exists" } };
    await authReady(true);
    await press("Crear mi cuenta");
    has("Ya existe");
  });
  await test("Contraseña: oculta por defecto y permite mostrar", async () => {
    await authReady();
    assert.equal(
      tree.root
        .findAllByType("TextInput")
        .find((n) => n.props.accessibilityLabel === "Contraseña").props
        .secureTextEntry,
      true,
    );
  });
  // Verificación por etiqueta, sin depender del orden de campos.
  await test("Contraseña: alterna campo seguro", async () => {
    await authReady();
    const get = () =>
      tree.root
        .findAllByType("TextInput")
        .find((n) => n.props.accessibilityLabel === "Contraseña");
    assert.equal(get().props.secureTextEntry, true);
    await press("Mostrar contraseña");
    assert.equal(get().props.secureTextEntry, false);
    await press("Ocultar contraseña");
    assert.equal(get().props.secureTextEntry, true);
  });
  for (const [name, Component] of Object.entries(screens).filter(
    ([name]) => name !== "detalle",
  )) {
    await test(`${name}: estado de carga`, async () => {
      state.query.isPending = true;
      await mount(Component);
      assert.ok(tree.root.findAllByType("ActivityIndicator").length);
    });
    await test(`${name}: error con reintento`, async () => {
      state.query.isError = true;
      state.query.error = new Error("network");
      await mount(Component);
      has("No pudimos");
      await press("Reintentar");
      assert.equal(state.refetches, 2);
    });
    await test(`${name}: estado vacío estable`, async () => {
      await mount(Component);
      assert.ok(text(tree.toJSON()).length > 20);
    });
  }
  await test("Subastas: búsqueda sin coincidencias", async () => {
    state.query.data = [product];
    await mount(screens.subastas);
    await fill("Buscar subastas por nombre", "inexistente");
    has("Sin coincidencias");
    lacks("Audífonos");
  });
  await test("Subastas: búsqueda ignora mayúsculas y espacios", async () => {
    state.query.data = [product];
    await mount(screens.subastas);
    await fill("Buscar subastas por nombre", " AUDÍFONOS ");
    has("Audífonos");
  });
  await test("Subastas: catálogo consulta solo activas y no ofrece próximas", async () => {
    await mount(screens.subastas);
    lacks("Próximamente");
    assert.deepEqual(state.queryOptions.queryKey, ["subastas", "activa"]);
  });
  await test("Subastas: no muestra el escáner QR", async () => {
    await mount(screens.subastas);
    lacks("Escanear QR");
  });
  await test("Ofertas: producto ausente no rompe render", async () => {
    state.query.data = [
      {
        id: "o",
        producto_id: pid,
        monto: 100,
        metodo: "normal",
        fecha: product.fecha_inicio,
        producto: null,
      },
    ];
    await mount(screens.ofertas);
    has("Producto no disponible");
  });
  for (const [estado, monto, expected] of [
    ["activa", 120, "Vas ganando"],
    ["activa", 100, "Superada"],
    ["cancelada", 120, "Cancelada"],
    ["finalizada", 120, "Oferta ganadora"],
  ])
    await test(`Ofertas: estado ${expected}`, async () => {
      state.query.data = [
        {
          id: "o",
          producto_id: pid,
          monto,
          metodo: "normal",
          fecha: product.fecha_inicio,
          producto: { ...product, estado },
        },
      ];
      await mount(screens.ofertas);
      has(expected);
    });
  await test("Perfil: usuario común no ve admin", async () => {
    await mount(screens.perfil);
    lacks("Panel de administrador");
  });
  await test("Perfil: admin tiene enlace", async () => {
    state.session.usuario.rol = "admin";
    await mount(screens.perfil);
    await press("Panel de administrador");
    assert.deepEqual(routes[0], ["push", "/(admin)"]);
  });
  await test("Perfil: cierre exitoso limpia caché y navega", async () => {
    await mount(screens.perfil);
    await press("Cerrar sesión");
    await act(async () => alerts[0][2][1].onPress());
    assert.equal(state.signouts, 1);
    assert.equal(state.cleared, 1);
    assert.deepEqual(routes[0], ["replace", "/(auth)/login"]);
  });
  await test("Perfil: fallo de cierre conserva caché", async () => {
    state.authResult = { error: new Error("network") };
    await mount(screens.perfil);
    await press("Cerrar sesión");
    await act(async () => alerts[0][2][1].onPress());
    assert.equal(state.cleared, 0);
    assert.equal(routes.length, 0);
  });
  await test("Perfil: aviso marca solo leida y filtra por usuario", async () => {
    state.query.data = [
      {
        id: "n",
        usuario_id: uid,
        titulo: "Aviso",
        cuerpo: "Texto",
        producto_id: pid,
        leida: false,
        fecha: product.fecha_inicio,
      },
    ];
    await mount(screens.perfil);
    state.db = [{ error: null }];
    await press("Aviso");
    assert.ok(
      dbCalls[0].steps.some((s) => s[0] === "update" && s[1].leida === true),
    );
    assert.ok(
      dbCalls[0].steps.some(
        (s) => s[0] === "eq" && s[1] === "usuario_id" && s[2] === uid,
      ),
    );
    assert.deepEqual(routes[0], ["push", `/subasta/${pid}`]);
  });
  await test("Reanudación: volver al primer plano reactiva consultas y libera listener", async () => {
    await mount(Root);
    state.appState("background");
    assert.equal(state.focused, false);
    state.appState("active");
    assert.equal(state.focused, true);
    await act(async () => tree.unmount());
    tree = null;
    assert.equal(state.listenerRemoved, true);
  });
  await test("Créditos: saldo pendiente no se presenta como cero", async () => {
    state.session.usuario = null;
    await mount(screens.creditos);
    has("Cargando saldo");
    assert.equal(button("Comprar 100").props.disabled, true);
  });
  await test("Créditos: cancelación de pago no da éxito", async () => {
    state.paymentResult = async () => "cancelado";
    await mount(screens.creditos);
    await press("Comprar 100");
    assert.equal(alerts.length, 0);
  });
  await test("Créditos: fallo de pago conserva interfaz", async () => {
    state.paymentResult = async () => {
      throw new Error("network");
    };
    await mount(screens.creditos);
    await press("Comprar 100");
    assert.ok(alerts[0][0].includes("No pudimos"));
    assert.equal(button("Comprar 100").props.disabled, false);
  });
  await test("Detalle: UUID inválido no activa servicios", async () => {
    state.id = "xxx";
    await mount(screens.detalle);
    has("Enlace de subasta inválido");
    assert.equal(state.shake, undefined);
  });
  await test("Detalle: sin producto y consulta pendiente muestra carga", async () => {
    state.realtime.producto = null;
    state.query.isPending = true;
    await mount(screens.detalle);
    has("Cargando subasta");
  });
  await test("Detalle: consulta de respaldo recupera pantalla cuando carga inicial falla", async () => {
    state.realtime.producto = null;
    state.query.data = product;
    await mount(screens.detalle);
    has("Haz tu oferta");
  });
  await test("Detalle: producto no encontrado tiene salida", async () => {
    state.realtime.producto = null;
    state.query.data = null;
    await mount(screens.detalle);
    has("Subasta no disponible");
    await press("Ver subastas");
    assert.equal(routes[0][1], "/(tabs)");
  });
  for (const estado of ["programada", "cancelada", "finalizada"])
    await test(`Detalle: ${estado} no permite ofertar ni agitar`, async () => {
      state.realtime.producto.estado = estado;
      await mount(screens.detalle);
      lacks("Haz tu oferta");
      assert.equal(state.shake.enabled, false);
    });
  await test("Detalle: espera cierre servidor al vencer reloj", async () => {
    state.remaining = 0;
    await mount(screens.detalle);
    has("Esperando cierre del servidor");
    lacks("Haz tu oferta");
  });
  for (const value of [
    "12",
    "-1",
    "1.5",
    "abc",
    "Infinity",
    "9007199254740993",
  ])
    await test(`Detalle: monto inválido ${value} no llama RPC`, async () => {
      await mount(screens.detalle);
      await fill("Monto de tu oferta en créditos", value);
      await press("Ofertar");
      assert.equal(state.bids.length, 0);
      has("monto entero");
    });
  await test("Detalle: primera oferta usa precio inicial", async () => {
    state.realtime.producto.lider_id = null;
    await mount(screens.detalle);
    await press("Ofertar");
    assert.equal(state.bids[0][1], 100);
  });
  await test("Detalle: creador no puede ofertar manualmente ni agitar", async () => {
    state.session.usuario.rol = "admin";
    state.realtime.producto.creado_por = uid;
    await mount(screens.detalle);
    has("No puedes ofertar en tu propia subasta.");
    assert.equal(button("Ofertar").props.disabled, true);
    assert.equal(state.shake.enabled, false);
    await press("Ofertar");
    await act(async () => state.shake.cb());
    await act(async () => state.tilt.cb());
    assert.equal(state.bids.length, 0);
    lacks("Oferta rápida");
  });
  await test("Detalle: administrador puede ofertar en subastas de otro creador", async () => {
    state.session.usuario.rol = "admin";
    state.realtime.producto.creado_por = "otro";
    await mount(screens.detalle);
    assert.equal(button("Ofertar").props.disabled, false);
    await press("Ofertar");
    assert.equal(state.bids.length, 1);
  });
  await test("Detalle: reserva del líder cuenta para subir oferta", async () => {
    state.session.usuario.creditos = 10;
    await mount(screens.detalle);
    await press("Ofertar");
    assert.equal(state.bids[0][1], 130);
  });
  await test("Detalle: créditos insuficientes no llaman RPC", async () => {
    state.realtime.producto.lider_id = "otro";
    state.session.usuario.creditos = 10;
    await mount(screens.detalle);
    await press("Ofertar");
    assert.equal(state.bids.length, 0);
    has("créditos disponibles suficientes");
  });
  await test("Detalle: error de RPC aparece y habilita reintento", async () => {
    state.bidResult = async () => {
      throw new Error("SUBASTA_NO_ACTIVA");
    };
    await mount(screens.detalle);
    await press("Ofertar");
    has("SUBASTA_NO_ACTIVA");
    assert.equal(button("Ofertar").props.disabled, false);
  });
  await test("Detalle: agitar propone sin enviar", async () => {
    await mount(screens.detalle);
    await act(async () => state.shake.cb());
    has("Oferta rápida");
    assert.equal(state.bids.length, 0);
    assert.equal(state.tilt.enabled, true);
  });
  await test("Detalle: inclinar confirma mediante módulo de ofertas", async () => {
    await mount(screens.detalle);
    await act(async () => state.shake.cb());
    await act(async () => state.tilt.cb());
    assert.equal(state.bids[0][2], "rapida_agitar");
  });
  await test("Detalle: cancelar propuesta no envía oferta", async () => {
    await mount(screens.detalle);
    await act(async () => state.shake.cb());
    await press("Cancelar");
    assert.equal(state.bids.length, 0);
    assert.equal(state.tilt.enabled, false);
  });
  await test("Detalle: doble pulsación envía una sola oferta", async () => {
    let resolve;
    state.bidResult = () => new Promise((r) => (resolve = r));
    await mount(screens.detalle);
    const onPress = button("Ofertar").props.onPress;
    await act(async () => {
      onPress();
      onPress();
    });
    assert.equal(state.bids.length, 1);
    await act(async () => resolve());
  });
  for (const [session, role, allowed] of [
    [false, "usuario", ["index", "(auth)"]],
    [true, "usuario", ["index", "(tabs)", "subasta/[id]"]],
    [true, "admin", ["index", "(tabs)", "subasta/[id]", "(admin)"]],
  ])
    await test(`Rutas: sesión ${session}, rol ${role}`, async () => {
      state.session.usuario.rol = role;
      if (!session) state.session.session = null;
      await mount(Root);
      assert.deepEqual(
        tree.root.findAllByType("Screen").map((s) => s.props.name),
        allowed,
      );
    });
  await test("Rutas: sesión en restauración no muestra rutas", async () => {
    state.session.cargando = true;
    await mount(Root);
    assert.equal(tree.root.findAllByType("Screen").length, 0);
  });
  await test("Rutas: perfil admin de otra sesión no debe abrir admin", async () => {
    state.session.usuario = { ...user, id: "otro", rol: "admin" };
    await mount(Root);
    assert.ok(
      !tree.root
        .findAllByType("Screen")
        .some((s) => s.props.name === "(admin)"),
    );
  });
  await test("Consultas: Mis ofertas filtra usuario y relaciona productos sin joins inseguros", async () => {
    await mount(screens.ofertas);
    state.db = [
      { data: [{ id: "o", producto_id: pid, monto: 100 }], error: null },
      { data: [product], error: null },
    ];
    const data = await state.queryOptions.queryFn();
    assert.equal(data[0].producto.id, pid);
    assert.ok(
      dbCalls[0].steps.some(
        (s) => s[0] === "eq" && s[1] === "usuario_id" && s[2] === uid,
      ),
    );
  });
  await test("Consultas: error BD se propaga para mostrar reintento", async () => {
    await mount(screens.ganados);
    state.db = [{ data: null, error: new Error("connection") }];
    await assert.rejects(state.queryOptions.queryFn(), /connection/);
  });
  await test("Accesibilidad: acciones de compra tienen rol y estado", async () => {
    await mount(screens.creditos);
    for (const b of tree.root.findAllByType("Pressable")) {
      assert.equal(b.props.accessibilityRole, "button");
      assert.equal(typeof b.props.accessibilityState.disabled, "boolean");
    }
  });
  await test("Login: doble pulsación genera una solicitud", async () => {
    let resolve;
    state.authResult = new Promise((r) => (resolve = r));
    await authReady();
    const cb = button("Iniciar sesión").props.onPress;
    await act(async () => {
      void cb();
      void cb();
    });
    assert.equal(state.authCalls.length, 1);
    await act(async () => resolve({ data: { session: null }, error: null }));
  });
  await test("Registro: sesión válida no pide confirmar correo", async () => {
    state.authResult = {
      data: { session: { user: { id: uid } } },
      error: null,
    };
    await authReady(true);
    await press("Crear mi cuenta");
    lacks("Revisa tu correo");
  });
  await test("Créditos: doble pulsación crea una sola solicitud", async () => {
    let resolve;
    state.paymentResult = () => new Promise((r) => (resolve = r));
    await mount(screens.creditos);
    const cb = button("Comprar 100").props.onPress;
    await act(async () => {
      cb();
      cb();
    });
    assert.equal(state.payments.length, 1);
    await act(async () => resolve("ok"));
  });
  await test("Perfil: perfil de otra cuenta no muestra administrador", async () => {
    state.session.usuario = { ...user, id: "otro", rol: "admin" };
    await mount(screens.perfil);
    lacks("Panel de administrador");
    has("Mi perfil");
  });
  await test("Créditos: perfil de otra cuenta no muestra su saldo", async () => {
    state.session.usuario = { ...user, id: "otro", creditos: 9999 };
    await mount(screens.creditos);
    lacks("9,999");
    has("Cargando saldo");
    assert.equal(button("Comprar 100").props.disabled, true);
  });
  await test("Detalle: perfil ajeno no aporta créditos para ofertar", async () => {
    state.session.usuario = { ...user, id: "otro", creditos: 9999 };
    await mount(screens.detalle);
    assert.equal(button("Ofertar").props.disabled, true);
    assert.equal(state.bids.length, 0);
  });
  await test("Consultas: sin sesión no habilita datos personales", async () => {
    state.session.session = null;
    state.session.usuario = null;
    for (const s of ["ofertas", "ganados", "creditos", "perfil"]) {
      await mount(screens[s]);
      assert.equal(state.queryOptions.enabled, false);
      await act(async () => tree.unmount());
      tree = null;
    }
  });
  await reset();
  fs.writeFileSync(
    process.env.SUBASTA_TEST_OUTPUT ||
      path.join(require("os").tmpdir(), "subasta-frontend-results.json"),
    JSON.stringify(
      {
        type: "Componentes React reales; módulos nativos y servicios simulados. No es E2E en dispositivo.",
        passed: results.filter((r) => r.status === "PASS").length,
        failed: results.filter((r) => r.status === "FAIL").length,
        results,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        passed: results.filter((r) => r.status === "PASS").length,
        failed: results.filter((r) => r.status === "FAIL").length,
        failures: results.filter((r) => r.status === "FAIL"),
      },
      null,
      2,
    ),
  );
  process.exitCode = results.some((r) => r.status === "FAIL") ? 1 : 0;
}
run().catch((e) => {
  originalError(e);
  process.exitCode = 1;
});
