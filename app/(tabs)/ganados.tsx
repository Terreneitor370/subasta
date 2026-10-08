// Integrante 1 - Productos ganados
import { useQuery } from "@tanstack/react-query";
import { FlatList, Text, View } from "react-native";
import { useSesion } from "../../src/lib/sesion";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function Ganados() {
  const { usuario } = useSesion();
  const { data = [] } = useQuery({
    queryKey: ["ganados", usuario?.id],
    enabled: !!usuario,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ganadores")
        .select("id, monto, fecha, productos(nombre)")
        .eq("usuario_id", usuario!.id)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data as unknown as { id: string; monto: number; fecha: string; productos: { nombre: string } }[];
    },
  });
  return (
    <View style={ui.pantalla}>
      <FlatList
        data={data}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={<Text style={{ color: colores.gris }}>Aun no has ganado subastas.</Text>}
        renderItem={({ item }) => (
          <View style={ui.tarjeta}>
            <Text style={{ fontWeight: "600" }}>{item.productos.nombre}</Text>
            <Text>Ganado por {item.monto} creditos - {new Date(item.fecha).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
