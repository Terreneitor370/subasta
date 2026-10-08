import { ImagenProducto } from "../../src/components/Editorial";
// UI compartida de Jorge: consume los hooks de Jeshua e Isabel sin modificarlos.
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton, Estado, Insignia } from "../../src/components/Ui";
import { ofertar } from "../../src/features/ofertas/ofertar";
import { useAgitar } from "../../src/hooks/useAgitar";
import { useConfirmarInclinacion } from "../../src/hooks/useConfirmarInclinacion";
import {
  formatoTiempo,
  useCuentaRegresiva,
} from "../../src/hooks/useCuentaRegresiva";
import { useSubastaRealtime } from "../../src/hooks/useSubastaRealtime";
import { usePerfilActual } from "../../src/components/usePerfilActual";
import { supabase } from "../../src/lib/supabase";
import {
  colores,
  etiquetasEstado,
  fecha,
  mensajeError,
  numero,
  ui,
} from "../../src/lib/ui";

export default function DetalleSubasta() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [intento, setIntento] = useState(0);
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return (
      <View style={ui.pantalla}>
        <Estado
          titulo="Enlace de subasta inválido"
          accion="Ver subastas"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    );
  return (
    <Contenido
      key={`${id}:${intento}`}
      id={id}
      reintentar={() => setIntento((i) => i + 1)}
    />
  );
}
function Contenido({ id, reintentar }: { id: string; reintentar: () => void }) {
  const { usuario } = usePerfilActual();
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const { producto: productoRealtime, ofertas } = useSubastaRealtime(id);
  // El hook actual no expone carga/error: esta consulta permite representarlos en UI.
  const disponibilidad = useQuery({
    queryKey: ["detalle-disponibilidad", id],
    enabled: !productoRealtime,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const producto =
    productoRealtime ??
    (disponibilidad.data?.id === id ? disponibilidad.data : null);
  const restante = useCuentaRegresiva(producto?.fecha_fin);
  const [monto, setMonto] = useState("");
  const [rapida, setRapida] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const ocupado = useRef(false);
  const activa = !!producto && producto.estado === "activa" && restante > 0;
  const minimo = producto
    ? producto.lider_id
      ? producto.precio_actual + producto.incremento_minimo
      : producto.precio_inicial
    : 0;
  const disponibleOferta = (valor: number) =>
    (usuario?.creditos ?? 0) +
      (producto?.lider_id === usuario?.id
        ? (producto?.precio_actual ?? 0)
        : 0) >=
    valor;
  useEffect(() => {
    if (!activa || !focused) setRapida(null);
  }, [activa, focused]);
  const enviar = async (valor: number, metodo: "normal" | "rapida_agitar") => {
    if (ocupado.current) return;
    if (!activa) {
      setRapida(null);
      return setError("La subasta no está aceptando ofertas.");
    }
    if (!Number.isSafeInteger(valor) || valor < minimo) {
      setRapida(null);
      return setError(
        `Escribe un monto entero de al menos ${numero(minimo)} créditos.`,
      );
    }
    if (!disponibleOferta(valor)) {
      setRapida(null);
      return setError(
        "No tienes créditos disponibles suficientes. Revisa la pestaña Créditos.",
      );
    }
    ocupado.current = true;
    setEnviando(true);
    setError("");
    try {
      await ofertar(id, valor, metodo);
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => undefined);
      setMonto("");
      Alert.alert(
        "Oferta registrada",
        "Revisa el precio y el historial en vivo. El servidor confirmó tu oferta.",
      );
    } catch (e) {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      ).catch(() => undefined);
      setError(mensajeError(e));
    } finally {
      ocupado.current = false;
      setEnviando(false);
      setRapida(null);
    }
  };
  useAgitar(
    () => {
      if (
        !activa ||
        ocupado.current ||
        rapida !== null ||
        !disponibleOferta(minimo)
      )
        return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
        () => undefined,
      );
      setRapida(minimo);
    },
    activa && focused && !enviando,
  );
  const progreso = useConfirmarInclinacion(
    rapida !== null && activa && focused && !enviando,
    () => {
      if (rapida !== null) void enviar(rapida, "rapida_agitar");
    },
  );
  if (!producto)
    return (
      <View style={ui.pantalla}>
        {disponibilidad.isPending ? (
          <Estado titulo="Cargando subasta…" cargando />
        ) : disponibilidad.isError ? (
          <Estado
            titulo="No pudimos cargar la subasta"
            detalle={mensajeError(disponibilidad.error)}
            accion="Reintentar"
            onPress={() => {
              void disponibilidad.refetch();
              reintentar();
            }}
          />
        ) : disponibilidad.data === null ? (
          <Estado
            titulo="Subasta no disponible"
            detalle="El producto no existe o ya no está disponible."
            accion="Ver subastas"
            onPress={() => router.replace("/(tabs)")}
          />
        ) : (
          <Estado
            titulo="Conectando con la subasta"
            detalle="Si tarda demasiado, vuelve a intentar."
            accion="Reintentar"
            onPress={reintentar}
          />
        )}
      </View>
    );
  const voyGanando = producto.lider_id === usuario?.id;
  const estado =
    producto.estado === "activa" && !activa
      ? "Esperando cierre del servidor"
      : etiquetasEstado[producto.estado];
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: colores.fondo }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={ofertas}
          keyExtractor={(o) => o.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[ui.contenido, { padding: 20 }]}
          ListHeaderComponent={
            <View style={{ gap: 16, paddingBottom: 16 }}>
              <ImagenProducto
                uri={producto.imagen_url}
                nombre={producto.nombre}
                alto={250}
              />
              <Insignia texto={estado} />
              <Text style={ui.titulo}>{producto.nombre}</Text>
              {!!producto.descripcion && (
                <Text style={ui.secundario}>{producto.descripcion}</Text>
              )}
              <View style={ui.hero}>
                <Text style={ui.heroTexto}>PRECIO ACTUAL · CRÉDITOS</Text>
                <Text style={ui.heroTitulo}>
                  {numero(producto.precio_actual)}
                </Text>
                {voyGanando && producto.estado === "activa" && (
                  <Text style={ui.heroTexto}>Tu oferta está liderando</Text>
                )}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#FFFFFF30",
                    marginVertical: 6,
                  }}
                />
                <Text style={ui.heroTexto}>
                  {producto.estado === "programada"
                    ? `Inicia ${fecha(producto.fecha_inicio)}`
                    : `Cierra ${fecha(producto.fecha_fin)}`}
                </Text>
                {producto.estado === "activa" && (
                  <Text
                    style={[ui.heroTitulo, { fontVariant: ["tabular-nums"] }]}
                  >
                    {activa ? formatoTiempo(restante) : "00:00"}
                  </Text>
                )}
              </View>
              {activa ? (
                <View style={ui.tarjeta}>
                  <Text style={ui.subtitulo}>Haz tu oferta</Text>
                  <Text style={ui.secundario}>
                    Mínimo: {numero(minimo)} créditos · Incremento:{" "}
                    {numero(producto.incremento_minimo)}
                  </Text>
                  <Text style={ui.secundario}>
                    Disponibles: {usuario ? numero(usuario.creditos) : "—"}
                    {voyGanando
                      ? " · Tu reserva actual cuenta para subir la oferta"
                      : ""}
                  </Text>
                  <TextInput
                    accessibilityLabel="Monto de tu oferta en créditos"
                    style={ui.input}
                    keyboardType="number-pad"
                    placeholder={`Mínimo ${minimo}`}
                    placeholderTextColor={colores.gris}
                    value={monto}
                    onChangeText={setMonto}
                    editable={!enviando}
                    maxLength={10}
                  />
                  {!!error && (
                    <Text style={ui.error} accessibilityRole="alert">
                      {error}
                    </Text>
                  )}
                  <Boton
                    titulo={`Ofertar ${monto || numero(minimo)} créditos`}
                    cargando={enviando}
                    disabled={!usuario}
                    onPress={() => {
                      void enviar(
                        monto.trim() ? Number(monto) : minimo,
                        "normal",
                      );
                    }}
                  />
                  <Text style={ui.secundario}>
                    Oferta rápida: agita para proponer el mínimo e inclina el
                    teléfono para confirmar.
                  </Text>
                </View>
              ) : (
                <Estado
                  titulo={estado}
                  detalle={
                    producto.estado === "cancelada"
                      ? "Los créditos reservados se liberan desde el servidor."
                      : producto.estado === "programada"
                        ? "Podrás ofertar cuando el servidor active la subasta."
                        : "Consulta Ganados para ver los resultados confirmados."
                  }
                />
              )}
              <Text style={ui.subtitulo}>Ofertas recientes</Text>
              <Text style={ui.secundario}>
                El precio y el historial se actualizan en vivo.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Estado
              titulo="Sé el primero en participar"
              detalle="Todavía no hay ofertas registradas."
            />
          }
          renderItem={({ item }) => (
            <View style={ui.tarjeta}>
              <View
                style={[
                  ui.fila,
                  { flexWrap: "wrap", justifyContent: "space-between" },
                ]}
              >
                <Text style={ui.subtitulo}>{numero(item.monto)} créditos</Text>
                {item.usuario_id === usuario?.id && (
                  <Insignia texto="Tu oferta" />
                )}
              </View>
              <Text style={ui.secundario}>
                {fecha(item.fecha)} ·{" "}
                {item.metodo === "rapida_agitar"
                  ? "Rápida al agitar"
                  : "Manual"}
              </Text>
            </View>
          )}
        />
        <Modal
          visible={rapida !== null}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!enviando) setRapida(null);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#10203CCC",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View style={ui.tarjeta}>
              <Insignia texto="Oferta rápida" />
              <Text style={ui.titulo}>{numero(rapida ?? 0)} créditos</Text>
              <Text style={ui.texto}>
                Inclina el teléfono hacia el frente para confirmar esta oferta.
              </Text>
              <Text style={ui.secundario}>
                Agitar solo propone. Inclinar envía la oferta al servidor.
              </Text>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: Math.round(progreso * 100),
                }}
                style={{
                  height: 12,
                  backgroundColor: colores.borde,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${Math.min(1, Math.max(0, progreso)) * 100}%`,
                    height: 12,
                    backgroundColor: colores.exito,
                  }}
                />
              </View>
              <Boton
                titulo="Cancelar"
                secundario
                disabled={enviando}
                cargando={enviando}
                onPress={() => setRapida(null)}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
