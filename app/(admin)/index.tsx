import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagenProducto } from "../../src/components/Editorial";
import { Boton, Estado, Insignia } from "../../src/components/Ui";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { supabase } from "../../src/lib/supabase";
import {
  colores,
  etiquetasEstado,
  mensajeError,
  numero,
  ui,
} from "../../src/lib/ui";

export default function AdminSubastas() {
  const [cancelando, setCancelando] = useState<string | null>(null);
  const ocupado = useRef(false);
  const consulta = useQuery({
    queryKey: ["admin", "productos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("creado_en", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  useActualizarPantalla(consulta.refetch);
  const cancelar = (id: string) => {
    if (ocupado.current) return;
    Alert.alert(
      "Cancelar subasta",
      "Esta acción no se puede deshacer. Los créditos reservados se devolverán al líder.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            if (ocupado.current) return;
            ocupado.current = true;
            setCancelando(id);
            try {
              const { error } = await supabase.rpc("cancelar_subasta", {
                p_producto_id: id,
              });
              if (error) throw error;
              await consulta.refetch();
            } catch (e) {
              Alert.alert("No pudimos cancelar la subasta", mensajeError(e));
            } finally {
              ocupado.current = false;
              setCancelando(null);
            }
          },
        },
      ],
    );
  };
  return (
    <SafeAreaView edges={["bottom"]} style={ui.pantalla}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={consulta.isError ? [] : (consulta.data ?? [])}
        keyExtractor={(p) => p.id}
        onRefresh={() => {
          void consulta.refetch();
        }}
        refreshing={consulta.isRefetching}
        contentContainerStyle={ui.contenido}
        ListHeaderComponent={
          <View style={{ paddingBottom: 16 }}>
            <Boton
              titulo="Crear subasta"
              onPress={() => router.push("/(admin)/nueva")}
            />
          </View>
        }
        ListEmptyComponent={
          consulta.isPending ? (
            <Estado titulo="Cargando subastas…" cargando />
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
              titulo="No hay subastas"
              detalle="Crea la primera subasta para comenzar."
            />
          )
        }
        renderItem={({ item }) => (
          <View style={[ui.tarjeta, { backgroundColor: colores.suave }]}>
            <View style={[ui.fila, { alignItems: "flex-start" }]}>
              <View style={{ width: 84 }}>
                <ImagenProducto
                  uri={item.imagen_url}
                  nombre={item.nombre}
                  alto={84}
                  compacto
                />
              </View>
              <View style={{ flex: 1, minWidth: 120, gap: 8 }}>
                <Insignia
                  texto={etiquetasEstado[item.estado]}
                  tono={item.estado === "activa" ? "exito" : "normal"}
                />
                <Text style={ui.subtitulo}>{item.nombre}</Text>
                <Text style={[ui.cifra, { fontSize: 22, lineHeight: 30 }]}>
                  {numero(item.precio_actual)}{" "}
                  <Text style={ui.secundario}>créditos</Text>
                </Text>
                <Text style={ui.pista} selectable>
                  ID: {item.id}
                </Text>
              </View>
            </View>
            {(item.estado === "activa" || item.estado === "programada") && (
              <Boton
                titulo="Cancelar subasta"
                secundario
                peligro
                disabled={cancelando !== null}
                cargando={cancelando === item.id}
                onPress={() => cancelar(item.id)}
              />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
