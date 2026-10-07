// Integrante 5 (formulario) + Integrante 4 (CAMARA para la foto, GPS para la ubicacion)
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { subirFotoProducto } from "../../src/features/admin/subirFoto";
import { obtenerUbicacion } from "../../src/hooks/useUbicacion";
import { useSesion } from "../../src/lib/sesion";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function NuevaSubasta() {
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

  const tomarFoto = async () => {
    const r = await camara.current?.takePictureAsync({ quality: 0.6 });
    if (r) setFoto(r.uri);
    setMostrarCamara(false);
  };

  const guardar = async () => {
    if (!nombre || !precio) return Alert.alert("Faltan datos", "Nombre y precio inicial son obligatorios.");
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
        fecha_fin: new Date(ahora.getTime() + Number(minutos) * 60_000).toISOString(),
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
      pedirPermiso();
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
    <ScrollView contentContainerStyle={[ui.pantalla, { gap: 10 }]}>
      <Pressable onPress={() => setMostrarCamara(true)} style={[ui.tarjeta, { alignItems: "center" }]}>
        {foto ? <Image source={foto} style={{ width: "100%", height: 180, borderRadius: 8 }} /> : <Text>Tomar foto del producto</Text>}
      </Pressable>
      <Text style={{ fontWeight: "600", marginTop: 6 }}>Nombre del producto</Text>
      <TextInput style={ui.input} placeholder="Ej. Audifonos inalambricos" placeholderTextColor={colores.gris} value={nombre} onChangeText={setNombre} />
      <Text style={{ fontWeight: "600", marginTop: 6 }}>Descripcion</Text>
      <TextInput style={ui.input} placeholder="Estado, color, caracteristicas..." placeholderTextColor={colores.gris} value={descripcion} onChangeText={setDescripcion} multiline />
      <Text style={{ fontWeight: "600", marginTop: 6 }}>Precio inicial (creditos)</Text>
      <Text style={ui.pista}>Cuanto vale el producto al empezar la subasta. Ej: 100</Text>
      <TextInput style={ui.input} placeholder="Ej. 100" placeholderTextColor={colores.gris} keyboardType="number-pad" value={precio} onChangeText={setPrecio} />
      <Text style={{ fontWeight: "600", marginTop: 6 }}>Incremento minimo</Text>
      <Text style={ui.pista}>De cuanto en cuanto debe subir cada oferta (si es 10, se oferta 100, 110, 120...).</Text>
      <TextInput style={ui.input} placeholder="Ej. 10" placeholderTextColor={colores.gris} keyboardType="number-pad" value={incremento} onChangeText={setIncremento} />
      <Text style={{ fontWeight: "600", marginTop: 6 }}>Duracion (minutos)</Text>
      <Text style={ui.pista}>Cuanto tiempo aceptara ofertas a partir de publicarse. Ej: 60</Text>
      <TextInput style={ui.input} placeholder="Ej. 60" placeholderTextColor={colores.gris} keyboardType="number-pad" value={minutos} onChangeText={setMinutos} />
      <Pressable style={ui.boton} onPress={guardar} disabled={guardando}>
        <Text style={ui.botonTexto}>{guardando ? "Guardando..." : "Publicar subasta"}</Text>
      </Pressable>
    </ScrollView>
  );
}
