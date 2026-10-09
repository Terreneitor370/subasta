import { Encabezado, ImagenProducto, PanelOferta } from "../../src/components/Editorial";
import { useCampoVisible } from "../../src/hooks/useCampoVisible";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Estado, Insignia } from "../../src/components/Ui";
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
export default function Subastas() {
  const campos = useCampoVisible();
  const { usuario } = usePerfilActual();
  const [busqueda, setBusqueda] = useState("");
  const consulta = useQuery({
    queryKey: ["subastas", "activa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("estado", "activa")
        .order("fecha_fin", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  useActualizarPantalla(consulta.refetch);
  const lista = (consulta.data ?? []).filter((p) =>
    p.nombre.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase()),
  );
  return (
    <SafeAreaView edges={["top", "bottom"]} style={[ui.pantalla, { padding: 0 }]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ref={(vista) => {
          campos.ref.current = vista;
        }}
        onScroll={campos.onScroll}
        scrollEventThrottle={16}
        onLayout={campos.revelarCampo}
        data={consulta.isError ? [] : lista}
        keyExtractor={(p) => p.id}
        onRefresh={() => {
          void consulta.refetch();
        }}
        refreshing={consulta.isRefetching}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[ui.contenido, { padding: 16, paddingBottom: 32 }]}
        ListHeaderComponent={
          <View style={{ gap: 12, paddingBottom: 0 }}>
            <Encabezado
              catalogo
              ceja="EL CATÁLOGO"
              titulo="Subastas"
              detalle={`Bienvenido, ${usuario?.nombre?.trim().split(" ")[0] || "visitante"}`}
            >
              <TextInput
                onFocus={campos.revelarCampo}
                accessibilityLabel="Buscar subastas por nombre"
                style={ui.input}
                placeholder="Buscar un producto…"
                placeholderTextColor={colores.gris}
                value={busqueda}
                onChangeText={setBusqueda}
                clearButtonMode="while-editing"
                maxLength={120}
              />
            </Encabezado>
            <Text style={ui.secundario}>
              Ordenadas por fecha de cierre · {lista.length} resultados
            </Text>
          </View>
        }
        ListEmptyComponent={
          consulta.isPending ? (
            <Estado titulo="Buscando subastas…" cargando />
          ) : consulta.isError ? (
            <Estado
              titulo="No pudimos cargar las subastas"
              detalle={mensajeError(consulta.error)}
              accion="Reintentar"
              onPress={() => {
                void consulta.refetch();
              }}
            />
          ) : (
            <Estado
              titulo={
                busqueda ? "Sin coincidencias" : "No hay subastas por ahora"
              }
              detalle={
                busqueda
                  ? "Prueba con otro nombre o borra la búsqueda."
                  : "Vuelve más tarde para descubrir nuevos productos."
              }
            />
          )
        }
        renderItem={({ item }) => (
          <View style={ui.tarjeta}>
            <View>
            <ImagenProducto
              uri={item.imagen_url}
              nombre={item.nombre}
              alto={180}
            />
            <View pointerEvents="none" style={{ position: "absolute", left: 10, top: 10 }}><Insignia texto={etiquetasEstado[item.estado]} tono="exito" /></View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver ${item.nombre}, ${item.precio_actual} créditos`}
              style={({ pressed }) => [
                { gap: 8 },
                pressed && ui.deshabilitado,
              ]}
              onPress={() => router.push(`/subasta/${item.id}`)}
            >
              <Text style={ui.subtitulo}>{item.nombre}</Text>
              {!!item.descripcion && <Text style={ui.secundario} numberOfLines={1}>{item.descripcion}</Text>}
              <PanelOferta precio={item.precio_actual} cierre={fecha(item.fecha_fin)} />
              <Text style={ui.enlace}>Ver subasta →</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
