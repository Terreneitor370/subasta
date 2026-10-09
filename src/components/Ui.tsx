import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { colores, numero, tipografia, ui } from "../lib/ui";
import { Icono, type NombreIcono } from "./Icono";
export function Boton({
  titulo,
  onPress,
  cargando = false,
  disabled = false,
  secundario = false,
  icono,
  peligro = false,
  accessibilityLabel,
}: {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  disabled?: boolean;
  secundario?: boolean;
  icono?: NombreIcono;
  peligro?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: disabled || cargando, busy: cargando }}
      disabled={disabled || cargando}
      onPress={onPress}
      style={({ pressed }) => [
        secundario ? ui.botonSecundario : ui.boton,
        { flexDirection: "row", gap: 8 },
        peligro && {
          borderWidth: 1,
          borderColor: colores.alerta,
          backgroundColor: colores.blanco,
        },
        (disabled || cargando || pressed) && ui.deshabilitado,
      ]}
    >
      {icono && !cargando && (
        <Icono
          nombre={icono}
          color={secundario ? colores.primario : colores.blanco}
          size={20}
        />
      )}
      {cargando ? (
        <ActivityIndicator
          color={secundario ? colores.primario : colores.blanco}
          accessibilityLabel="Cargando"
        />
      ) : (
        <Text
          style={[
            ui.botonTexto,
            secundario && { color: colores.primario },
            peligro && { color: colores.alerta },
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}
export function Estado({
  titulo,
  detalle,
  cargando = false,
  accion,
  onPress,
}: {
  titulo: string;
  detalle?: string;
  cargando?: boolean;
  accion?: string;
  onPress?: () => void;
}) {
  return (
    <View
      style={[ui.tarjeta, { alignItems: "center", paddingVertical: 32 }]}
      accessibilityLiveRegion="polite"
    >
      {cargando && <ActivityIndicator color={colores.primario} size="large" />}
      <Text style={[ui.subtitulo, { textAlign: "center" }]}>{titulo}</Text>
      {detalle && (
        <Text style={[ui.secundario, { textAlign: "center" }]}>{detalle}</Text>
      )}
      {accion && onPress && (
        <Boton titulo={accion} onPress={onPress} secundario />
      )}
    </View>
  );
}
export function Insignia({
  texto,
  tono = "normal",
}: {
  texto: string;
  tono?: "normal" | "exito" | "alerta";
}) {
  const color =
    texto === "En vivo"
      ? colores.acento
      : tono === "exito"
        ? colores.exito
        : tono === "alerta"
          ? colores.alerta
          : colores.primario;
  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: texto === "En vivo" ? colores.acento : `${color}15`,
      }}
    >
      <Text
        style={{
          color: texto === "En vivo" ? colores.blanco : color,
          fontFamily: tipografia.interfaz,
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {texto}
      </Text>
    </View>
  );
}
export function Saldo({
  disponibles,
  reservados,
}: {
  disponibles?: number;
  reservados?: number;
}) {
  return (
    <View style={[ui.hero, { backgroundColor: colores.primario, padding: 16, gap: 12 }]}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
        <View style={{ flex: 1, minWidth: 100 }}>
          <Text style={ui.heroTexto}>Disponibles</Text>
          <Text style={[ui.heroTitulo, { fontSize: 46, lineHeight: 56 }]}>
            {disponibles == null ? "—" : numero(disponibles)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 100,
            borderLeftWidth: 1,
            borderLeftColor: "#FFFFFF50",
            paddingLeft: 16,
          }}
        >
          <Text style={ui.heroTexto}>{reservados == null ? "Cargando saldo…" : "Reservados"}</Text>
          <Text style={[ui.heroTitulo, { fontSize: 46, lineHeight: 56 }]}>
            {reservados == null ? "—" : numero(reservados)}
          </Text>
        </View>
      </View>
      <Text style={[ui.heroTexto, { textAlign: "center", borderTopWidth: 1, borderTopColor: "#FFFFFF50", paddingTop: 8 }]}>$1 MXN = 1 crédito. Por cada peso obtienes un crédito.</Text>
    </View>
  );
}
