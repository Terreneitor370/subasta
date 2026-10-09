const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const Module = require("node:module");
const runtime = Module.createRequire(
  path.resolve(process.env.SUBASTA_TEST_RUNTIME || ".", "package.json"),
);
const React = runtime("react");
const { act, create } = runtime("react-test-renderer");
const ts = require("typescript");
global.IS_REACT_ACT_ENVIRONMENT = true;
const eventos = {},
  llamadas = [];
let campoY = 500,
  campoAlto = 52,
  api,
  eliminados = 0;
const native = {
  Platform: { OS: "android" },
  TextInput: {
    State: {
      currentlyFocusedInput: () => ({
        measureInWindow: (cb) => cb(0, campoY, 300, campoAlto),
      }),
    },
  },
  Keyboard: {
    addListener: (nombre, cb) => {
      eventos[nombre] = cb;
      return { remove: () => eliminados++ };
    },
  },
};
const original = Module._load;
Module._load = function (name, parent, main) {
  if (name === "react") return React;
  if (name === "react-native") return native;
  return original.call(this, name, parent, main);
};
Module._extensions[".ts"] = (mod, file) =>
  mod._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
const { useCampoVisible } = require("../../src/hooks/useCampoVisible.ts");
function Harness() {
  api = useCampoVisible();
  api.ref.current = {
    getNativeScrollRef: () => ({
      measureInWindow: (cb) => cb(0, 100, 360, 320),
    }),
    getScrollResponder: () => ({
      scrollTo: (options) => llamadas.push(options.y),
    }),
  };
  return null;
}
const esperar = () => new Promise((resolve) => setTimeout(resolve, 130));
(async () => {
  let tree;
  await act(async () => {
    tree = create(React.createElement(Harness));
  });
  eventos.keyboardDidShow({ endCoordinates: { screenY: 450 } });
  await esperar();
  assert.equal(
    llamadas.pop(),
    148,
    "Desplaza el campo por encima del pie fijo y del teclado",
  );
  api.onScroll({ nativeEvent: { contentOffset: { y: 148 } } });
  campoY = 430;
  api.revelarCampo();
  await esperar();
  assert.equal(
    llamadas.pop(),
    226,
    "Cambiar de campo con teclado abierto conserva el desplazamiento previo",
  );
  campoY = 200;
  api.revelarCampo();
  await esperar();
  assert.equal(llamadas.length, 0, "No mueve un campo que ya está visible");
  campoY = 80;
  api.revelarCampo();
  await esperar();
  assert.equal(
    llamadas.pop(),
    116,
    "Recupera un campo situado por encima de la cabecera",
  );
  await act(async () => tree.unmount());
  assert.equal(eliminados, 3, "Elimina listeners al salir");
  console.log("PASS: teclado, cambio de campo, pie fijo, cabecera y limpieza");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
