import { VistaConTeclado } from "../../src/components/VistaConTeclado";
// Integrante 5 (formulario) + Integrante 4 (CAMARA para la foto, GPS para la ubicacion)
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCampoVisible } from "../../src/hooks/useCampoVisible";
import { subirFotoProducto } from "../../src/features/admin/subirFoto";
import { obtenerUbicacion } from "../../src/hooks/useUbicacion";
import { useSesion } from "../../src/lib/sesion";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

const DURACION_MAXIMA_MINUTOS = 5 * 24 * 60;

export default function NuevaSubasta() {
  const campos = useCampoVisible();

  const { usuario } = useSesion();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const camara = useRef<CameraView>(null);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [incremento, setIncremento] = useState("10");
  const [minutos, setMinutos] = useState("60");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (mostrarCamara && permiso && !permiso.granted && permiso.canAskAgain) {
      pedirPermiso();
    }
  }, [mostrarCamara, permiso]);

  const tomarFoto = async () => {
    const r = await camara.current?.takePictureAsync({ quality: 0.6 });
    if (r) setFoto(r.uri);
    setMostrarCamara(false);
  };

  const guardar = async () => {
    if (!nombre || !precio)
      return Alert.alert(
        "Faltan datos",
        "Nombre y precio inicial son obligatorios.",
      );
    const duracionMinutos = Number(minutos);

    if (duracionMinutos > DURACION_MAXIMA_MINUTOS) {
      return Alert.alert(
        "Duracion invalida",
        "La duracion maxima permitida es de 5 dias (7200 minutos).",
      );
    }

    setGuardando(true);
    try {
      const imagen_url = foto ? await subirFotoProducto(foto) : null;
      const ubic = await obtenerUbicacion();
      const ahora = new Date();
      const { error } = await supabase.from("productos").insert({
        nombre,
        descripcion,
        imagen_url,
        precio_inicial: Number(precio),
        precio_actual: Number(precio),
        incremento_minimo: Number(incremento),
        fecha_inicio: ahora.toISOString(),
        fecha_fin: new Date(
          ahora.getTime() + duracionMinutos * 60_000,
        ).toISOString(),
        estado: "activa",
        latitud: ubic?.latitud ?? null,
        longitud: ubic?.longitud ?? null,
        creado_por: usuario?.id ?? null,
      });
      if (error) throw error;
      router.back();
    } catch (e) {
      Alert.alert("Error", (e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  if (mostrarCamara) {
    if (!permiso?.granted) {
      if (permiso && !permiso.canAskAgain) {
        return (
          <View style={[ui.pantalla, { justifyContent: "center", gap: 12 }]}>
            <Text>
              Desactivaste el permiso de camara. Actívalo en los ajustes del
              sistema para tomar la foto.
            </Text>
            <Pressable style={ui.boton} onPress={() => Linking.openSettings()}>
              <Text style={ui.botonTexto}>Abrir ajustes</Text>
            </Pressable>
            <Pressable onPress={() => setMostrarCamara(false)}>
              <Text style={{ color: colores.alerta, textAlign: "center" }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        );
      }
      return <View />;
    }
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={camara} style={{ flex: 1 }} facing="back" />
        <Pressable style={[ui.boton, { margin: 16 }]} onPress={tomarFoto}>
          <Text style={ui.botonTexto}>Tomar foto</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: colores.fondo }}
    >
      <VistaConTeclado>
        <ScrollView
          ref={(vista) => {
            campos.ref.current = vista;
          }}
          onScroll={campos.onScroll}
          scrollEventThrottle={16}
          onLayout={campos.revelarCampo}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable
            onPress={() => setMostrarCamara(true)}
            style={[ui.tarjeta, { alignItems: "center" }]}
          >
            {foto ? (
              <Image
                source={foto}
                style={{ width: "100%", height: 180, borderRadius: 8 }}
              />
            ) : (
              <Text>Tomar foto del producto</Text>
            )}
          </Pressable>
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Nombre del producto
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            style={ui.input}
            placeholder="Ej. Audifonos inalambricos"
            placeholderTextColor={colores.gris}
            value={nombre}
            onChangeText={setNombre}
          />
          <Text style={{ fontWeight: "600", marginTop: 6 }}>Descripcion</Text>
          <TextInput
            onFocus={campos.revelarCampo}
            onContentSizeChange={campos.revelarCampo}
            style={[ui.input, { maxHeight: 140, textAlignVertical: "top" }]}
            placeholder="Estado, color, caracteristicas..."
            placeholderTextColor={colores.gris}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Precio inicial (creditos)
          </Text>
          <Text style={ui.pista}>
            Cuanto vale el producto al empezar la subasta. Ej: 100
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            style={ui.input}
            placeholder="Ej. 100"
            placeholderTextColor={colores.gris}
            keyboardType="number-pad"
            value={precio}
            onChangeText={setPrecio}
          />
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Incremento minimo
          </Text>
          <Text style={ui.pista}>
            De cuanto en cuanto debe subir cada oferta (si es 10, se oferta 100,
            110, 120...).
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            style={ui.input}
            placeholder="Ej. 10"
            placeholderTextColor={colores.gris}
            keyboardType="number-pad"
            value={incremento}
            onChangeText={setIncremento}
          />
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Duracion (minutos)
          </Text>
          <Text style={ui.pista}>
            Cuanto tiempo aceptara ofertas a partir de publicarse. Maximo: 5
            dias (7200 minutos).
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            style={ui.input}
            placeholder="Ej. 60 (max 7200)"
            placeholderTextColor={colores.gris}
            keyboardType="number-pad"
            value={minutos}
            onChangeText={setMinutos}
          />
        </ScrollView>
        <View
          style={{
            padding: 20,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colores.borde,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: guardando, busy: guardando }}
            style={[ui.boton, guardando && ui.deshabilitado]}
            onPress={guardar}
            disabled={guardando}
          >
            <Text style={ui.botonTexto}>
              {guardando ? "Guardando..." : "Publicar subasta"}
            </Text>
          </Pressable>
        </View>
      </VistaConTeclado>
    </SafeAreaView>
  );
}
