// Pantalla central: integra Tiempo real (Int. 3), Sensores (Int. 4) y UI (Int. 1)
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { ofertar } from "../../src/features/ofertas/ofertar";
import { useAgitar } from "../../src/hooks/useAgitar";
import { useConfirmarInclinacion } from "../../src/hooks/useConfirmarInclinacion";
import { formatoTiempo, useCuentaRegresiva } from "../../src/hooks/useCuentaRegresiva";
import { useSubastaRealtime } from "../../src/hooks/useSubastaRealtime";
import { useSesion } from "../../src/lib/sesion";
import { colores, ui } from "../../src/lib/ui";

export default function DetalleSubasta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useSesion();
  const { producto, ofertas } = useSubastaRealtime(id);
  const restante = useCuentaRegresiva(producto?.fecha_fin);
  const [monto, setMonto] = useState("");
  const [rapida, setRapida] = useState<number | null>(null); // monto propuesto al agitar
  const [enviando, setEnviando] = useState(false);

  const activa = producto?.estado === "activa" && restante > 0;
  const minimo = producto ? (producto.lider_id ? producto.precio_actual + producto.incremento_minimo : producto.precio_inicial) : 0;

  const enviar = async (valor: number, metodo: "normal" | "rapida_agitar") => {
    setEnviando(true);
    try {
      await ofertar(id, valor, metodo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMonto("");
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Oferta rechazada", (e as Error).message);
    } finally {
      setEnviando(false);
      setRapida(null);
    }
  };

  // ACELEROMETRO: agitar propone una oferta rapida (minimo permitido)
  useAgitar(() => {
    if (!activa || rapida !== null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRapida(minimo);
  }, activa);

  // GIROSCOPIO: inclinar el telefono hacia el frente confirma la oferta rapida
  const progreso = useConfirmarInclinacion(rapida !== null && !enviando, () => {
    if (rapida !== null) enviar(rapida, "rapida_agitar");
  });

  if (!producto) return <ActivityIndicator style={{ flex: 1 }} />;
  const voyGanando = producto.lider_id === usuario?.id;

  return (
    <View style={[ui.pantalla, { gap: 10 }]}>
      <Image source={producto.imagen_url ?? undefined} style={{ height: 200, borderRadius: 10, backgroundColor: colores.borde }} contentFit="cover" />
      <Text style={ui.titulo}>{producto.nombre}</Text>
      <Text style={{ color: colores.gris }}>{producto.descripcion}</Text>

      <View style={[ui.tarjeta, { flexDirection: "row", justifyContent: "space-between" }]}>
        <View>
          <Text style={{ color: colores.gris }}>Precio actual</Text>
          <Text style={{ fontSize: 26, fontWeight: "700" }}>{producto.precio_actual}</Text>
          {voyGanando && <Text style={{ color: colores.exito }}>Vas ganando</Text>}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colores.gris }}>Tiempo restante</Text>
          <Text style={{ fontSize: 26, fontWeight: "700", color: restante < 60_000 ? colores.alerta : colores.texto }}>
            {activa ? formatoTiempo(restante) : "Finalizada"}
          </Text>
        </View>
      </View>

      {activa && (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput style={[ui.input, { flex: 1 }]} keyboardType="number-pad" placeholder={`Minimo ${minimo}`} placeholderTextColor={colores.gris} value={monto} onChangeText={setMonto} />
            <Pressable style={ui.boton} disabled={enviando} onPress={() => enviar(Number(monto || minimo), "normal")}>
              <Text style={ui.botonTexto}>Ofertar</Text>
            </Pressable>
          </View>
          <Text style={{ color: colores.gris, fontSize: 12 }}>Tip: agita el telefono para una oferta rapida de {minimo}.</Text>
        </>
      )}

      <Text style={{ fontWeight: "600" }}>Ofertas recientes</Text>
      <FlatList
        data={ofertas}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <Text>
            {item.monto} creditos - {new Date(item.fecha).toLocaleTimeString()}
            {item.usuario_id === usuario?.id ? " (tu)" : ""}
            {item.metodo === "rapida_agitar" ? " - rapida" : ""}
          </Text>
        )}
      />

      <Modal visible={rapida !== null} transparent animationType="fade" onRequestClose={() => setRapida(null)}>
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={[ui.tarjeta, { gap: 12 }]}>
            <Text style={ui.titulo}>Oferta rapida: {rapida}</Text>
            <Text>Inclina el telefono hacia el frente para confirmar.</Text>
            <View style={{ height: 10, backgroundColor: colores.borde, borderRadius: 5 }}>
              <View style={{ width: `${progreso * 100}%`, height: 10, backgroundColor: colores.exito, borderRadius: 5 }} />
            </View>
            <Pressable onPress={() => setRapida(null)}>
              <Text style={{ color: colores.alerta, textAlign: "center" }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
