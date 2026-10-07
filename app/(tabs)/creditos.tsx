import { Encabezado } from "../../src/components/Editorial";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton, Estado, Saldo } from "../../src/components/Ui";
import {
  comprarCreditos,
  PAQUETES,
  type Paquete,
} from "../../src/features/creditos/comprarCreditos";
import { usePerfilActual } from "../../src/components/usePerfilActual";
import { supabase } from "../../src/lib/supabase";
import { fecha, mensajeError, numero, ui } from "../../src/lib/ui";
const tipos = {
  compra: "Compra",
  reserva: "Reserva de oferta",
  liberacion: "Créditos liberados",
  cargo: "Subasta ganada",
  ajuste: "Ajuste",
};
export default function Creditos() {
  const stripe = useStripe();
  const { usuario, session } = usePerfilActual();
  const [comprando, setComprando] = useState<Paquete | null>(null);
  const ocupado = useRef(false);
  const consulta = useQuery({
    queryKey: ["transacciones", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacciones")
        .select("*")
        .eq("usuario_id", session!.user.id)
        .order("fecha", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
  useActualizarPantalla(consulta.refetch, !!session);
  const comprar = async (p: Paquete) => {
    if (ocupado.current) return;
    ocupado.current = true;
    setComprando(p);
    try {
      const resultado = await comprarCreditos(p, stripe);
      if (resultado === "ok") {
        Alert.alert(
          "Pago recibido",
          "El servidor acreditará tus créditos cuando confirme el pago. Tu saldo se actualizará automáticamente.",
        );
        void consulta.refetch();
      }
    } catch (e) {
      Alert.alert("No pudimos completar el pago", mensajeError(e));
    } finally {
      ocupado.current = false;
      setComprando(null);
    }
  };
  return (
    <SafeAreaView edges={["bottom"]} style={ui.pantalla}>
      <ScrollView
        contentContainerStyle={ui.contenido}
        refreshControl={
          <RefreshControl
            refreshing={consulta.isRefetching}
            onRefresh={() => {
              void consulta.refetch();
            }}
          />
        }
      >
        <Encabezado
          ceja="TU CUENTA"
          titulo="Saldo y movimientos."
          detalle="Compra créditos y consulta cómo los utilizas en cada subasta."
        />
        <Saldo
          disponibles={usuario?.creditos}
          reservados={usuario?.creditos_reservados}
        />
        <Text style={ui.subtitulo}>Elige tu paquete</Text>
        <Text style={ui.secundario}>
          Los créditos reservados se liberan si alguien supera tu oferta o la
          subasta se cancela.
        </Text>
        {PAQUETES.map((p, i) => (
          <View key={p.id} style={ui.tarjeta}>
            <Text style={ui.ceja}>{["BÁSICO", "MEDIO", "PRO"][i]}</Text>
            <Text style={ui.cifra}>
              {numero(p.creditos)} <Text style={ui.secundario}>créditos</Text>
            </Text>
            <Text style={ui.texto}>${numero(p.precio)} MXN · modo prueba</Text>
            <Boton
              titulo={`Comprar ${p.creditos} créditos`}
              cargando={comprando === p.id}
              disabled={comprando !== null || !usuario}
              onPress={() => {
                void comprar(p.id);
              }}
            />
          </View>
        ))}
        <View style={ui.tarjeta}>
          <Text style={ui.etiqueta}>Pagos de prueba</Text>
          <Text style={ui.secundario}>
            Usa 4242 4242 4242 4242, una fecha futura y cualquier CVC en la
            pasarela de prueba. No se cobra dinero real.
          </Text>
        </View>
        <Text style={ui.subtitulo}>Últimos movimientos</Text>
        {consulta.isPending ? (
          <Estado titulo="Cargando movimientos…" cargando />
        ) : consulta.isError ? (
          <Estado
            titulo="No pudimos cargar tus movimientos"
            detalle={mensajeError(consulta.error)}
            accion="Reintentar"
            onPress={() => {
              void consulta.refetch();
            }}
          />
        ) : !consulta.data?.length ? (
          <Estado
            titulo="Sin movimientos todavía"
            detalle="Aquí verás compras, reservas y cargos."
          />
        ) : (
          consulta.data.map((t) => (
            <View key={t.id} style={ui.tarjeta}>
              <Text style={ui.etiqueta}>{tipos[t.tipo]}</Text>
              <Text style={ui.subtitulo}>{numero(t.cantidad)} créditos</Text>
              <Text style={ui.secundario}>{fecha(t.fecha)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
