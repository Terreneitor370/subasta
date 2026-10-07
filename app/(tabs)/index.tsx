// Integrante 1 (UI) + Integrante 4 (GPS: subastas cercanas, camara: QR)
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { distanciaKm, obtenerUbicacion, ubicacionDenegadaPermanente, type Coordenadas } from "../../src/hooks/useUbicacion";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function Subastas() {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);

  const { data = [], refetch, isFetching } = useQuery({
    queryKey: ["subastas", "activas"],
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

  const lista = ubicacion
    ? [...data]
        .map((p) => ({
          ...p,
          km: p.latitud != null && p.longitud != null ? distanciaKm(ubicacion, { latitud: p.latitud, longitud: p.longitud }) : null,
        }))
        .sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9))
    : data.map((p) => ({ ...p, km: null as number | null }));

  return (
    <View style={ui.pantalla}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <Pressable
          style={[ui.boton, { flex: 1 }]}
          onPress={async () => {
            if (ubicacion) return setUbicacion(null);
            const u = await obtenerUbicacion();
            if (u) return setUbicacion(u);
            if (await ubicacionDenegadaPermanente()) {
              Alert.alert("Permiso de ubicacion desactivado", "Para ver subastas cercanas, activa el permiso de ubicacion en los ajustes del sistema.", [
                { text: "Cancelar", style: "cancel" },
                { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
              ]);
            }
          }}
        >
          <Text style={ui.botonTexto}>{ubicacion ? "Ver todas" : "Cercanas a mi"}</Text>
        </Pressable>
        <Pressable style={[ui.boton, { flex: 1 }]} onPress={() => router.push("/escanear")}>
          <Text style={ui.botonTexto}>Escanear QR</Text>
        </Pressable>
      </View>
      <FlatList
        data={lista}
        keyExtractor={(p) => p.id}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<Text style={{ color: colores.gris }}>No hay subastas activas.</Text>}
        renderItem={({ item }) => (
          <Link href={`/subasta/${item.id}`} asChild>
            <Pressable style={StyleSheet.flatten([ui.tarjeta, { flexDirection: "row", gap: 12 }])}>
              <Image source={item.imagen_url ?? undefined} style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: colores.borde }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600" }}>{item.nombre}</Text>
                <Text>{item.precio_actual} creditos</Text>
                <Text style={{ color: colores.gris }}>
                  Termina: {new Date(item.fecha_fin).toLocaleString()}
                  {item.km != null ? `  -  ${item.km.toFixed(1)} km` : ""}
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
