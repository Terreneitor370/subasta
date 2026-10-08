// Integrante 5 - Compra de creditos
import { Alert, Pressable, Text, View } from "react-native";
import { comprarCreditos, PAQUETES, type Paquete } from "../../src/features/creditos/comprarCreditos";
import { useSesion } from "../../src/lib/sesion";
import { useStripe } from "../../src/lib/useStripe";
import { ui } from "../../src/lib/ui";

export default function Creditos() {
  const stripe = useStripe();
  const { usuario } = useSesion();

  const comprar = async (p: Paquete) => {
    try {
      const r = await comprarCreditos(p, stripe);
      if (r === "ok") Alert.alert("Pago recibido", "Tus creditos se acreditaran en unos segundos.");
    } catch (e) {
      Alert.alert("Error en el pago", (e as Error).message);
    }
  };

  return (
    <View style={[ui.pantalla, { gap: 12 }]}>
      <Text style={ui.titulo}>Disponibles: {usuario?.creditos ?? 0}</Text>
      <Text>Reservados en ofertas: {usuario?.creditos_reservados ?? 0}</Text>
      {PAQUETES.map((p) => (
        <Pressable key={p.id} style={ui.tarjeta} onPress={() => comprar(p.id)}>
          <Text style={{ fontWeight: "600" }}>{p.creditos} creditos</Text>
          <Text>${p.precio} MXN</Text>
        </Pressable>
      ))}
      <Text style={{ fontSize: 12 }}>Modo prueba: usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC.</Text>
    </View>
  );
}
