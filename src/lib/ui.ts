import { Platform, StyleSheet } from "react-native";

// Tipografía sans serif nativa para una interfaz formal y legible.
// Funcionan sin descargar fuentes y sin cambiar el SDK de Expo.
export const tipografia = {
  editorial:
    Platform.OS === "android"
      ? "sans-serif"
      : Platform.OS === "ios"
        ? "System"
        : "Arial",
  interfaz:
    Platform.OS === "android"
      ? "sans-serif"
      : Platform.OS === "ios"
        ? "System"
        : "Arial",
};
export const colores = {
  primario: "#2457D6",
  texto: "#142B49",
  gris: "#536477",
  borde: "#DCE3ED",
  exito: "#168344",
  alerta: "#C6283B",
  fondo: "#FFFFFF",
  blanco: "#FFFFFF",
  suave: "#F3F5F8",
  oscuro: "#142B49",
  aviso: "#A45D08",
};
export const ui = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo, padding: 16 },
  contenido: { gap: 16, paddingBottom: 32 },
  fila: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  titulo: {
    fontFamily: tipografia.editorial,
    fontSize: 26,
    fontWeight: "700",
    color: colores.texto,
    letterSpacing: 0,
    lineHeight: 34,
  },
  subtitulo: {
    fontFamily: tipografia.editorial,
    fontSize: 18,
    fontWeight: "700",
    color: colores.texto,
    lineHeight: 26,
  },
  texto: {
    fontFamily: tipografia.interfaz,
    fontSize: 15,
    lineHeight: 23,
    color: colores.texto,
  },
  secundario: {
    fontFamily: tipografia.interfaz,
    fontSize: 14,
    lineHeight: 22,
    color: colores.gris,
  },
  etiqueta: {
    fontFamily: tipografia.interfaz,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colores.texto,
  },
  ceja: {
    fontFamily: tipografia.interfaz,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colores.primario,
  },
  pista: {
    fontFamily: tipografia.interfaz,
    fontSize: 12,
    color: colores.gris,
    marginBottom: 4,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: tipografia.interfaz,
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: true,
    color: colores.texto,
    backgroundColor: colores.blanco,
  },
  boton: {
    minHeight: 50,
    backgroundColor: colores.primario,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: {
    fontFamily: tipografia.interfaz,
    color: colores.blanco,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  botonSecundario: {
    minHeight: 50,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colores.suave,
    alignItems: "center",
    justifyContent: "center",
  },
  enlace: {
    minHeight: 44,
    fontFamily: tipografia.interfaz,
    color: colores.primario,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
  },
  deshabilitado: { opacity: 0.5 },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: 12,
  },
  hero: {
    backgroundColor: colores.oscuro,
    borderRadius: 8,
    padding: 20,
    gap: 12,
  },
  heroTitulo: {
    fontFamily: tipografia.editorial,
    fontSize: 32,
    fontWeight: "700",
    color: colores.blanco,
    letterSpacing: 0,
    lineHeight: 42,
    includeFontPadding: true,
  },
  heroTexto: {
    fontFamily: tipografia.interfaz,
    fontSize: 13,
    color: "#DDE7F5",
    lineHeight: 21,
  },
  cifra: {
    fontFamily: tipografia.editorial,
    fontSize: 28,
    fontWeight: "700",
    color: colores.texto,
    letterSpacing: 0,
    lineHeight: 38,
    includeFontPadding: true,
    paddingVertical: 2,
    fontVariant: ["tabular-nums"],
  },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  error: {
    fontFamily: tipografia.interfaz,
    color: colores.alerta,
    fontSize: 14,
    lineHeight: 22,
  },
  separador: { height: 1, backgroundColor: colores.borde, marginVertical: 6 },
});
export const numero = (valor: number) => valor.toLocaleString("es-MX");
export const fecha = (valor: string) =>
  new Date(valor).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export const mensajeError = (error: unknown) => {
  const mensaje =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "";
  if (/network|fetch|internet/i.test(mensaje))
    return "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.";
  return mensaje || "Ocurrió un problema. Inténtalo de nuevo.";
};
export const etiquetasEstado = {
  activa: "En vivo",
  programada: "Próximamente",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};
