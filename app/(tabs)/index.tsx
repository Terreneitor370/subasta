import { Encabezado, ImagenProducto } from "../../src/components/Editorial";
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
    <SafeAreaView edges={["top", "bottom"]} style={ui.pantalla}>
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
        contentContainerStyle={ui.contenido}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <Text style={ui.secundario}>
              Bienvenido, {usuario?.nombre?.trim().split(" ")[0] || "visitante"}
            </Text>
            <Encabezado ceja="EL CATÁLOGO" titulo="Subastas" />
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver ${item.nombre}, ${item.precio_actual} créditos`}
            style={({ pressed }) => [ui.tarjeta, pressed && ui.deshabilitado]}
            onPress={() => router.push(`/subasta/${item.id}`)}
          >
            <ImagenProducto
              uri={item.imagen_url}
              nombre={item.nombre}
              alto={190}
            />
            <Insignia
              texto={etiquetasEstado[item.estado]}
              tono={item.estado === "activa" ? "exito" : "normal"}
            />
            <Text style={ui.subtitulo}>{item.nombre}</Text>
            <Text style={ui.cifra}>
              {numero(item.precio_actual)}{" "}
              <Text style={ui.secundario}>créditos</Text>
            </Text>
            <Text style={ui.secundario}>
              {item.estado === "programada"
                ? `Inicia ${fecha(item.fecha_inicio)}`
                : `Cierra ${fecha(item.fecha_fin)}`}
            </Text>
            <Text style={ui.enlace}>Ver subasta →</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
