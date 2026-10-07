import { StyleSheet } from "react-native";

export const colores = {
  primario: "#1d4ed8",
  texto: "#111827",
  gris: "#6b7280",
  borde: "#e5e7eb",
  exito: "#059669",
  alerta: "#dc2626",
  fondo: "#f9fafb",
};

export const ui = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo, padding: 16 },
  titulo: { fontSize: 22, fontWeight: "700", color: colores.texto },
  input: { borderWidth: 1, borderColor: colores.borde, borderRadius: 8, padding: 12, backgroundColor: "#fff", color: colores.texto },
  boton: { backgroundColor: colores.primario, padding: 14, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "600" },
  tarjeta: { backgroundColor: "#fff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colores.borde },
});
