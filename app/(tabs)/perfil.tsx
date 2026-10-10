import { Encabezado } from "../../src/components/Editorial";
import { Icono } from "../../src/components/Icono";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton, Estado, Insignia } from "../../src/components/Ui";
import { usePerfilActual } from "../../src/components/usePerfilActual";
import { supabase } from "../../src/lib/supabase";
import { colores, fecha, mensajeError, ui } from "../../src/lib/ui";
import type { Notificacion } from "../../src/types/database";
export default function Perfil() {
  const { usuario, session } = usePerfilActual();
  const client = useQueryClient();
  const [saliendo, setSaliendo] = useState(false);
  const ocupado = useRef(false);
  const consulta = useQuery({
    queryKey: ["notificaciones", session?.user.id],
    enabled: !!session,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", session!.user.id)
        .order("fecha", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
  useActualizarPantalla(consulta.refetch, !!session);
  const salir = async () => {
    if (ocupado.current) return;
    ocupado.current = true;
    setSaliendo(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      client.clear();
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert("No pudimos cerrar sesión", mensajeError(e));
    } finally {
      ocupado.current = false;
      setSaliendo(false);
    }
  };
  const abrir = async (n: Notificacion) => {
    if (!n.leida) {
      const { error } = await supabase
        .from("notificaciones")
        .update({ leida: true })
        .eq("id", n.id)
        .eq("usuario_id", session!.user.id);
      if (error)
        Alert.alert(
          "Aviso",
          "No pudimos marcar el aviso como leído. Puedes consultar la subasta.",
        );
      else void consulta.refetch();
    }
    if (n.producto_id) router.push(`/subasta/${n.producto_id}`);
  };
  return (
    <SafeAreaView edges={["top", "bottom"]} style={[ui.pantalla, { padding: 0 }]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={consulta.isError ? [] : (consulta.data ?? [])}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[ui.contenido, { padding: 16, paddingBottom: 32 }]}
        onRefresh={() => {
          void consulta.refetch();
        }}
        refreshing={consulta.isRefetching}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <Encabezado ceja="ÁREA PERSONAL" titulo="Perfil" />
            <View
              style={[ui.tarjeta, ui.fila, { alignItems: "center", gap: 16 }]}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colores.primario,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={[ui.titulo, { color: colores.blanco }]}>
                  {usuario?.nombre?.trim().charAt(0).toUpperCase() ?? "●"}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 150, gap: 8 }}>
                <Text style={ui.subtitulo}>
                  {usuario?.nombre ?? "Mi perfil"}
                </Text>
                <Text style={ui.secundario}>
                  {usuario?.correo ?? session?.user.email}
                </Text>
                {usuario?.rol === "admin" && <Insignia texto="Administrador" />}
              </View>
            </View>
            <Boton
              titulo="Cerrar sesión"
              secundario
              peligro
              cargando={saliendo}
              onPress={() =>
                Alert.alert(
                  "Cerrar sesión",
                  "¿Quieres salir de tu cuenta en este dispositivo?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Cerrar sesión",
                      style: "destructive",
                      onPress: () => {
                        void salir();
                      },
                    },
                  ],
                )
              }
            />

            {usuario?.rol === "admin" && (
              <Boton
                titulo="Panel de administrador"
                secundario
                onPress={() => router.push("/(admin)")}
              />
            )}

            <Text style={ui.subtitulo}>Avisos</Text>
            <Text style={ui.secundario}>
              Ofertas superadas, cierres y resultados. Toca un aviso para abrir
              su subasta.
            </Text>
          </View>
        }
        ListEmptyComponent={
          consulta.isPending ? (
            <Estado titulo="Cargando avisos…" cargando />
          ) : consulta.isError ? (
            <Estado
              titulo="No pudimos cargar tus avisos"
              detalle={mensajeError(consulta.error)}
              accion="Reintentar"
              onPress={() => {
                void consulta.refetch();
              }}
            />
          ) : (
            <Estado
              titulo="Estás al día"
              detalle="Tus avisos aparecerán aquí cuando participes en subastas."
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.leida ? "" : "Sin leer. "}${item.titulo}`}
            style={[
              ui.tarjeta,
              { flexDirection: "row", alignItems: "flex-start", gap: 12 },
              !item.leida && { borderColor: colores.primario },
            ]}
            onPress={() => {
              void abrir(item);
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: item.leida ? "#E3F7EA" : "#FFF0E5",
              }}
            >
              <Icono
                nombre={
                  /ganaste|ganador/i.test(item.titulo) ? "ganados" : "ofertas"
                }
                color={
                  /ganaste|ganador/i.test(item.titulo)
                    ? colores.exito
                    : colores.acento
                }
              />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
            {!item.leida && <Insignia texto="Sin leer" />}
            <Text style={ui.subtitulo}>{item.titulo}</Text>
            <Text style={ui.texto}>{item.cuerpo}</Text>
            <Text style={ui.secundario}>{fecha(item.fecha)}</Text>
            {item.producto_id && <Text style={ui.enlace}>Ver subasta →</Text>}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
