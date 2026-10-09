import { Encabezado, ImagenProducto } from "../../src/components/Editorial";
import { useState } from "react";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton, Estado, Insignia } from "../../src/components/Ui";
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
import type { Oferta, Producto } from "../../src/types/database";
// Consultas explícitas: los tipos iniciales aún no declaran Relationships.
export default function MisOfertas() {
  const [soloLiderando, setSoloLiderando] = useState(false);
  const { session } = usePerfilActual();
  const uid = session?.user.id;
  const consulta = useQuery({
    queryKey: ["mis-ofertas", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data: ofertas, error } = await supabase
        .from("ofertas")
        .select("*")
        .eq("usuario_id", uid!)
        .order("fecha", { ascending: false });
      if (error) throw error;
      if (!ofertas?.length) return [];
      const ids = [...new Set(ofertas.map((o) => o.producto_id))];
      const { data: productos, error: fallo } = await supabase
        .from("productos")
        .select("*")
        .in("id", ids);
      if (fallo) throw fallo;
      const mapa = new Map((productos ?? []).map((p) => [p.id, p]));
      return ofertas.map((o) => ({
        ...o,
        producto: mapa.get(o.producto_id) ?? null,
      })) as (Oferta & { producto: Producto | null })[];
    },
  });
  useActualizarPantalla(consulta.refetch, !!uid);
  return (
    <SafeAreaView edges={["top", "bottom"]} style={ui.pantalla}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={
          consulta.isError
            ? []
            : (consulta.data ?? []).filter(
                (o) =>
                  !soloLiderando ||
                  (o.producto?.estado === "activa" &&
                    o.producto?.lider_id === uid &&
                    o.producto?.precio_actual === o.monto),
              )
        }
        keyExtractor={(o) => o.id}
        contentContainerStyle={ui.contenido}
        onRefresh={() => {
          void consulta.refetch();
        }}
        refreshing={consulta.isRefetching}
        ListHeaderComponent={
          <View style={{ paddingBottom: 16 }}>
            <Encabezado ceja="TU ACTIVIDAD" titulo="Mis ofertas" />
            <View style={ui.fila}>
              {([false, true] as const).map((activo) => (
                <Pressable
                  key={String(activo)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: soloLiderando === activo }}
                  style={[
                    ui.chip,
                    { flex: 1, alignItems: "center" },
                    soloLiderando === activo && ui.chipActivo,
                  ]}
                  onPress={() => setSoloLiderando(activo)}
                >
                  <Text
                    style={[
                      ui.etiqueta,
                      soloLiderando === activo && { color: colores.blanco },
                    ]}
                  >
                    {activo ? "Liderando" : "Todas"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          consulta.isPending ? (
            <Estado titulo="Cargando tus ofertas…" cargando />
          ) : consulta.isError ? (
            <Estado
              titulo="No pudimos cargar tu historial"
              detalle={mensajeError(consulta.error)}
              accion="Reintentar"
              onPress={() => {
                void consulta.refetch();
              }}
            />
          ) : (
            <Estado
              titulo={
                soloLiderando
                  ? "No estás liderando subastas"
                  : "Tu primera oferta te espera"
              }
              detalle="Explora un producto y participa en su subasta."
              accion="Explorar subastas"
              onPress={() => router.navigate("/(tabs)")}
            />
          )
        }
        ListFooterComponent={
          consulta.isError && consulta.data?.length ? (
            <Boton
              titulo="Actualizar historial"
              secundario
              onPress={() => {
                void consulta.refetch();
              }}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const p = item.producto;
          const lider = p?.lider_id === uid && p?.precio_actual === item.monto;
          const texto = !p
            ? "Producto no disponible"
            : p.estado === "finalizada"
              ? lider
                ? "Oferta ganadora"
                : "Finalizada"
              : p.estado === "cancelada"
                ? "Cancelada"
                : lider
                  ? "Vas ganando"
                  : p.estado === "activa"
                    ? "Superada"
                    : etiquetasEstado[p.estado];
          return (
            <Pressable
              accessibilityRole="button"
              style={ui.tarjeta}
              onPress={() => router.push(`/subasta/${item.producto_id}`)}
            >
              <ImagenProducto
                uri={p?.imagen_url}
                nombre={p?.nombre ?? "Producto"}
                alto={160}
              />
              <Insignia
                texto={texto}
                tono={lider && p?.estado !== "cancelada" ? "exito" : "normal"}
              />
              <Text style={ui.subtitulo}>
                {p?.nombre ?? "Subasta no disponible"}
              </Text>
              <Text style={ui.cifra}>
                {numero(item.monto)} <Text style={ui.secundario}>créditos</Text>
              </Text>
              <Text style={ui.secundario}>Tu oferta · {fecha(item.fecha)}</Text>
              {p && (
                <Text style={ui.texto}>
                  Precio actual: {numero(p.precio_actual)} créditos
                </Text>
              )}
              <Text style={ui.secundario}>
                {item.metodo === "rapida_agitar"
                  ? "Oferta rápida al agitar"
                  : "Oferta manual"}
              </Text>
              <Text style={ui.enlace}>Ver detalle →</Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
