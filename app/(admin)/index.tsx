import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function AdminSubastas() {
  const { data = [], refetch, isFetching } = useQuery({
    queryKey: ["admin", "productos"],
    queryFn: async () => (await supabase.from("productos").select("*").order("creado_en", { ascending: false })).data ?? [],
  });

  const cancelar = (id: string) =>
    Alert.alert("Cancelar subasta", "Esta accion no se puede deshacer.", [
      { text: "No" },
      {
        text: "Si, cancelar",
        style: "destructive",
        onPress: async () => {
          // RPC: cancela y devuelve los creditos reservados al lider
          const { error } = await supabase.rpc("cancelar_subasta", { p_producto_id: id });
          if (error) Alert.alert("Error", error.message);
          refetch();
        },
      },
    ]);

  return (
    <View style={[ui.pantalla, { gap: 12 }]}>
      <Pressable style={ui.boton} onPress={() => router.push("/(admin)/nueva")}>
        <Text style={ui.botonTexto}>Crear subasta</Text>
      </Pressable>
      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View style={ui.tarjeta}>
            <Text style={{ fontWeight: "600" }}>{item.nombre}</Text>
            <Text>{item.estado} - {item.precio_actual} creditos</Text>
            <Text style={{ color: colores.gris, fontSize: 12 }}>QR: {item.id}</Text>
            {(item.estado === "activa" || item.estado === "programada") && (
              <Pressable onPress={() => cancelar(item.id)}>
                <Text style={{ color: colores.alerta }}>Cancelar</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}
