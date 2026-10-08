// Integrante 1 / 5 - Perfil, bandeja de notificaciones y acceso al panel admin
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSesion } from "../../src/lib/sesion";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function Perfil() {
  const { usuario } = useSesion();
  const { data: notificaciones = [] } = useQuery({
    queryKey: ["notificaciones", usuario?.id],
    enabled: !!usuario,
    queryFn: async () =>
      (await supabase.from("notificaciones").select("*").order("fecha", { ascending: false }).limit(30)).data ?? [],
  });

  return (
    <View style={[ui.pantalla, { gap: 12 }]}>
      <Text style={ui.titulo}>{usuario?.nombre}</Text>
      <Text style={{ color: colores.gris }}>{usuario?.correo}</Text>
      {usuario?.rol === "admin" && (
        <Pressable style={ui.boton} onPress={() => router.push("/(admin)")}>
          <Text style={ui.botonTexto}>Panel de administrador</Text>
        </Pressable>
      )}
      <Text style={{ fontWeight: "600", marginTop: 8 }}>Notificaciones</Text>
      <FlatList
        data={notificaciones}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ gap: 6 }}
        renderItem={({ item }) => (
          <View style={ui.tarjeta}>
            <Text style={{ fontWeight: "600" }}>{item.titulo}</Text>
            <Text>{item.cuerpo}</Text>
          </View>
        )}
      />
      <Pressable onPress={() => supabase.auth.signOut().then(() => router.replace("/(auth)/login"))}>
        <Text style={{ color: colores.alerta, textAlign: "center" }}>Cerrar sesion</Text>
      </Pressable>
    </View>
  );
}
