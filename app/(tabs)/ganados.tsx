import { Encabezado, ImagenProducto } from "../../src/components/Editorial";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Estado, Insignia } from "../../src/components/Ui";
import { usePerfilActual } from "../../src/components/usePerfilActual";
import { supabase } from "../../src/lib/supabase";
import { colores, fecha, mensajeError, numero, ui } from "../../src/lib/ui";
export default function Ganados() {
  const { session } = usePerfilActual();
  const uid = session?.user.id;
  const consulta = useQuery({
    queryKey: ["ganados", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data: ganadores, error } = await supabase
        .from("ganadores")
        .select("*")
        .eq("usuario_id", uid!)
        .order("fecha", { ascending: false });
      if (error) throw error;
      if (!ganadores?.length) return [];
      const { data: productos, error: fallo } = await supabase
        .from("productos")
        .select("*")
        .in("id", [...new Set(ganadores.map((g) => g.producto_id))]);
      if (fallo) throw fallo;
      const mapa = new Map((productos ?? []).map((p) => [p.id, p]));
      return ganadores.map((g) => ({
        ...g,
        producto: mapa.get(g.producto_id) ?? null,
      }));
    },
  });
  useActualizarPantalla(consulta.refetch, !!uid);
  return (
    <SafeAreaView edges={["top", "bottom"]} style={[ui.pantalla, { padding: 0 }]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={consulta.isError ? [] : (consulta.data ?? [])}
        keyExtractor={(g) => g.id}
        contentContainerStyle={[ui.contenido, { padding: 16, paddingBottom: 32 }]}
        onRefresh={() => {
          void consulta.refetch();
        }}
        refreshing={consulta.isRefetching}
        ListHeaderComponent={
          <View style={{ paddingBottom: 16 }}>
            <Encabezado
              ceja="TU COLECCIÓN"
              titulo="Ganados"
              detalle="Tus subastas adjudicadas."
            />
          </View>
        }
        ListEmptyComponent={
          consulta.isPending ? (
            <Estado titulo="Cargando tus victorias…" cargando />
          ) : consulta.isError ? (
            <Estado
              titulo="No pudimos cargar tus productos"
              detalle={mensajeError(consulta.error)}
              accion="Reintentar"
              onPress={() => {
                void consulta.refetch();
              }}
            />
          ) : (
            <Estado
              titulo="Aún no has ganado una subasta"
              detalle="Sigue participando. Tu próxima victoria puede estar cerca."
              accion="Explorar subastas"
              onPress={() => router.navigate("/(tabs)")}
            />
          )
        }
        renderItem={({ item }) => (
          <View style={ui.tarjeta}>
            <ImagenProducto
              uri={item.producto?.imagen_url}
              nombre={item.producto?.nombre ?? "Producto"}
              alto={170}
            />
            <Pressable
              accessibilityRole="button"
              style={{ gap: 6 }}
              onPress={() => router.push(`/subasta/${item.producto_id}`)}
            >
              <Insignia texto="Subasta ganada" tono="exito" />
              <Text style={ui.subtitulo}>
                {item.producto?.nombre ?? "Producto no disponible"}
              </Text>
              <Text style={[ui.cifra, { color: colores.oscuro, fontSize: 24, lineHeight: 32 }]}>
                {numero(item.monto)} <Text style={ui.secundario}>créditos</Text>
              </Text>
              <Text style={ui.secundario}>Ganada el {fecha(item.fecha)}</Text>
              <Text style={ui.enlace}>Ver subasta →</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
