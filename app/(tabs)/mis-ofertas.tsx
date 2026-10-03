// Integrante 1 - Mis ofertas
import { useQuery } from "@tanstack/react-query";
import { FlatList, Text, View } from "react-native";
import { useSesion } from "../../src/lib/sesion";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function MisOfertas() {
  const { usuario } = useSesion();
  const { data = [], refetch, isFetching } = useQuery({
    queryKey: ["mis-ofertas", usuario?.id],
    enabled: !!usuario,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ofertas")
        .select("id, monto, fecha, metodo, productos(nombre, precio_actual, estado, lider_id)")
        .eq("usuario_id", usuario!.id)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data as unknown as {
        id: string; monto: number; fecha: string; metodo: string;
        productos: { nombre: string; precio_actual: number; estado: string; lider_id: string | null };
      }[];
    },
  });

  return (
    <View style={ui.pantalla}>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const ganando = item.productos.lider_id === usuario?.id && item.productos.precio_actual === item.monto;
          return (
            <View style={ui.tarjeta}>
              <Text style={{ fontWeight: "600" }}>{item.productos.nombre}</Text>
              <Text>Tu oferta: {item.monto} - Actual: {item.productos.precio_actual}</Text>
              <Text style={{ color: ganando ? colores.exito : colores.gris }}>
                {ganando ? "Vas ganando" : item.productos.estado === "activa" ? "Superada" : item.productos.estado}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
