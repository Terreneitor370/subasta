import { Encabezado, ImagenProducto } from "../../src/components/Editorial";
import { useActualizarPantalla } from "../../src/components/useActualizarPantalla";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton, Estado, Insignia } from "../../src/components/Ui";
import {
  distanciaKm,
  obtenerUbicacion,
  ubicacionDenegadaPermanente,
  type Coordenadas,
} from "../../src/hooks/useUbicacion";
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
  const { usuario } = usePerfilActual();
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<"activa" | "programada">("activa");
  const consulta = useQuery({
    queryKey: ["subastas", estado],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("estado", estado)
        .order("fecha_fin", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  useActualizarPantalla(consulta.refetch);
  const lista = (consulta.data ?? [])
    .filter((p) =>
      p.nombre
        .toLocaleLowerCase()
        .includes(busqueda.trim().toLocaleLowerCase()),
    )
    .map((p) => ({
      ...p,
      km:
        ubicacion && p.latitud != null && p.longitud != null
          ? distanciaKm(ubicacion, { latitud: p.latitud, longitud: p.longitud })
          : null,
    }));
  if (ubicacion) lista.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
  const cercanas = async () => {
    if (ubicacion) return setUbicacion(null);
    setLocalizando(true);
    try {
      const posicion = await obtenerUbicacion();
      if (posicion) setUbicacion(posicion);
      else if (await ubicacionDenegadaPermanente())
        Alert.alert(
          "Permiso de ubicación desactivado",
          "Para ver subastas cercanas, activa el permiso de ubicación en los ajustes del sistema.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
          ],
        );
      else
        Alert.alert(
          "Ubicación no disponible",
          "Activa el permiso de ubicación para ordenar por distancia. Puedes seguir viendo todas las subastas.",
        );
    } catch {
      Alert.alert(
        "No pudimos obtener tu ubicación",
        "Inténtalo de nuevo o explora todas las subastas.",
      );
    } finally {
      setLocalizando(false);
    }
  };
  return (
    <SafeAreaView edges={["bottom"]} style={ui.pantalla}>
      <FlatList
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
            <Encabezado
              ceja="EL CATÁLOGO"
              titulo="Encuentra tu próxima pieza."
              detalle="Explora los productos disponibles y participa en sus subastas."
            />
            <TextInput
              accessibilityLabel="Buscar subastas por nombre"
              style={ui.input}
              placeholder="Buscar un producto…"
              placeholderTextColor={colores.gris}
              value={busqueda}
              onChangeText={setBusqueda}
              clearButtonMode="while-editing"
            />
            <View style={ui.fila}>
              <View style={{ flex: 1 }}>
                <Boton
                  titulo={ubicacion ? "Ver todas" : "Cercanas a mí"}
                  secundario
                  cargando={localizando}
                  onPress={cercanas}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Boton
                  titulo="Escanear QR"
                  secundario
                  onPress={() => router.push("/escanear")}
                />
              </View>
            </View>
            <View style={ui.fila}>
              {(["activa", "programada"] as const).map((e) => (
                <Pressable
                  key={e}
                  accessibilityRole="button"
                  accessibilityState={{ selected: estado === e }}
                  onPress={() => setEstado(e)}
                  style={[ui.chip, estado === e && ui.chipActivo]}
                >
                  <Text style={ui.etiqueta}>
                    {e === "activa" ? "En vivo" : "Próximamente"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={ui.secundario}>
              {ubicacion
                ? "Ordenadas por cercanía · sin ubicación al final"
                : "Ordenadas por fecha de cierre"}{" "}
              · {lista.length} resultados
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
            <Insignia texto={etiquetasEstado[item.estado]} />
            <Text style={ui.subtitulo}>{item.nombre}</Text>
            <Text style={ui.cifra}>
              {numero(item.precio_actual)}{" "}
              <Text style={ui.secundario}>créditos</Text>
            </Text>
            <Text style={ui.secundario}>
              {item.estado === "programada"
                ? `Inicia ${fecha(item.fecha_inicio)}`
                : `Cierra ${fecha(item.fecha_fin)}`}
              {item.km != null ? ` · ${item.km.toFixed(1)} km` : ""}
            </Text>
            <Text style={ui.enlace}>Ver subasta →</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
