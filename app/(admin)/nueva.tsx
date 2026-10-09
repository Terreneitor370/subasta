import { VistaConTeclado } from "../../src/components/VistaConTeclado";
// Integrante 5 (formulario) + Integrante 4 (CAMARA + HUELLA para adjuntar la foto)
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
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
import { confirmarHuella, huellaNoDisponible } from "../../src/hooks/useHuella";
import { usePerfilActual } from "../../src/components/usePerfilActual";
import { Icono } from "../../src/components/Icono";
import { Boton } from "../../src/components/Ui";
import {
  validarNuevaSubasta,
  type DatosNuevaSubasta,
} from "../../src/lib/validacion";
import { supabase } from "../../src/lib/supabase";
import { colores, mensajeError, ui } from "../../src/lib/ui";

const DURACION_MAXIMA_MINUTOS = 5 * 24 * 60;
const DURACION_MINIMA_MINUTOS = 1;
const MINUTOS_POR_HORA = 60;

export default function NuevaSubasta() {
  const campos = useCampoVisible();

  const { usuario } = usePerfilActual();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const camara = useRef<CameraView>(null);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [incremento, setIncremento] = useState("10");
  const [duracionHoras, setDuracionHoras] = useState(1);
  const [duracionMinutos, setDuracionMinutos] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const ocupado = useRef(false);
  const [tomando, setTomando] = useState(false);
  const capturando = useRef(false);
  const minutosTotales = duracionHoras * MINUTOS_POR_HORA + duracionMinutos;
  const minutos = String(minutosTotales);
  const [errores, setErrores] = useState<
    Partial<Record<keyof DatosNuevaSubasta, string>>
  >({});
  const entradas = useRef<
    Partial<Record<keyof DatosNuevaSubasta, TextInput | null>>
  >({});
  const errorCampo = (campo: keyof DatosNuevaSubasta) =>
    errores[campo] ? (
      <Text style={ui.error} accessibilityRole="alert">
        {errores[campo]}
      </Text>
    ) : null;

  const ajustarDuracion = (deltaMinutos: number) => {
    const proximaDuracion = Math.min(
      DURACION_MAXIMA_MINUTOS,
      Math.max(DURACION_MINIMA_MINUTOS, minutosTotales + deltaMinutos),
    );

    setDuracionHoras(Math.floor(proximaDuracion / MINUTOS_POR_HORA));
    setDuracionMinutos(proximaDuracion % MINUTOS_POR_HORA);
  };

  const abrirCamara = async () => {
    try {
      if (!permiso?.granted && permiso?.canAskAgain !== false)
        await pedirPermiso();
      setMostrarCamara(true);
    } catch {
      Alert.alert(
        "Cámara no disponible",
        "No pudimos solicitar el permiso. Vuelve a intentarlo.",
      );
    }
  };

  const elegirDeGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.6,
      });
      if (!resultado.canceled) setFoto(resultado.assets[0].uri);
    } catch (e) {
      Alert.alert("No pudimos abrir la galería", mensajeError(e));
    }
  };

  const adjuntarFoto = async () => {
    try {
      if (await huellaNoDisponible())
        return Alert.alert(
          "Huella no configurada",
          "Activa el desbloqueo por huella en los ajustes de tu celular para adjuntar fotos.",
        );
      if (!(await confirmarHuella())) return;
      Alert.alert(
        "Adjuntar foto",
        "¿Cómo quieres agregar la foto del producto?",
        [
          { text: "Tomar foto", onPress: () => void abrirCamara() },
          { text: "Elegir de galería", onPress: () => void elegirDeGaleria() },
          { text: "Cancelar", style: "cancel" },
        ],
      );
    } catch {
      Alert.alert(
        "No disponible",
        "No pudimos iniciar el proceso. Vuelve a intentarlo.",
      );
    }
  };

  const tomarFoto = async () => {
    if (capturando.current) return;
    capturando.current = true;
    setTomando(true);
    try {
      const r = await camara.current?.takePictureAsync({ quality: 0.6 });
      if (!r) throw new Error("La cámara todavía no está lista.");
      setFoto(r.uri);
      setMostrarCamara(false);
    } catch (e) {
      Alert.alert("No pudimos tomar la foto", mensajeError(e));
    } finally {
      capturando.current = false;
      setTomando(false);
    }
  };

  const guardar = async () => {
    if (ocupado.current) return;
    const fallos = validarNuevaSubasta({
      nombre,
      descripcion,
      precio,
      incremento,
      minutos,
    });
    setErrores(fallos);
    const primerError = Object.keys(fallos)[0] as
      keyof DatosNuevaSubasta | undefined;
    if (primerError) {
      entradas.current[primerError]?.focus();
      return;
    }
    if (!usuario || usuario.rol !== "admin")
      return Alert.alert(
        "Perfil no disponible",
        "Espera a que cargue tu perfil de administrador e inténtalo de nuevo.",
      );
    ocupado.current = true;
    setGuardando(true);
    try {
      const imagen_url = foto ? await subirFotoProducto(foto) : null;
      const ahora = new Date();
      const { error } = await supabase.from("productos").insert({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        imagen_url,
        precio_inicial: Number(precio),
        precio_actual: Number(precio),
        incremento_minimo: Number(incremento),
        fecha_inicio: ahora.toISOString(),
        fecha_fin: new Date(
          ahora.getTime() + minutosTotales * 60_000,
        ).toISOString(),
        estado: "activa",
        creado_por: usuario.id,
      });
      if (error) throw error;
      router.back();
    } catch (e) {
      Alert.alert("No pudimos publicar la subasta", mensajeError(e));
    } finally {
      setGuardando(false);
      ocupado.current = false;
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
      return (
        <View style={[ui.pantalla, { justifyContent: "center", gap: 16 }]}>
          <Text style={ui.texto}>
            Necesitamos permiso de cámara para tomar la foto.
          </Text>
          <Boton
            titulo="Dar permiso"
            onPress={() => {
              void pedirPermiso().catch(() =>
                Alert.alert("Error", "No pudimos abrir la cámara."),
              );
            }}
          />
          <Boton
            titulo="Volver al formulario"
            secundario
            onPress={() => setMostrarCamara(false)}
          />
        </View>
      );
    }
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: colores.fondo }}
      >
        <CameraView ref={camara} style={{ flex: 1 }} facing="back" />
        <View style={{ padding: 16, gap: 8 }}>
          <Boton
            titulo="Tomar foto"
            cargando={tomando}
            onPress={() => {
              void tomarFoto();
            }}
          />
          <Boton
            titulo="Cancelar"
            secundario
            disabled={tomando}
            onPress={() => setMostrarCamara(false)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: colores.fondo }}
    >
      <VistaConTeclado>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ref={(vista) => {
            campos.ref.current = vista;
          }}
          onScroll={campos.onScroll}
          scrollEventThrottle={16}
          onLayout={campos.revelarCampo}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 8 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable
            onPress={() => {
              void adjuntarFoto();
            }}
            disabled={guardando}
            accessibilityRole="button"
            accessibilityLabel="Adjuntar foto del producto"
            style={[
              ui.tarjeta,
              {
                alignItems: "center",
                backgroundColor: colores.suave,
                minHeight: 96,
                justifyContent: "center",
              },
            ]}
          >
            {foto ? (
              <Image
                source={foto}
                style={{ width: "100%", height: 140, borderRadius: 8 }}
              />
            ) : (
              <>
                <Icono nombre="camara" size={28} />
                <Text style={ui.etiqueta}>Adjuntar foto del producto</Text>
              </>
            )}
          </Pressable>
          <Text style={ui.pista}>
            Toma una foto nueva o elige una de tu galería. Te pediremos tu
            huella para confirmarlo.
          </Text>
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Nombre del producto
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            accessibilityLabel="Nombre del producto"
            ref={(entrada) => {
              entradas.current.nombre = entrada;
            }}
            editable={!guardando}
            maxLength={120}
            style={ui.input}
            placeholder="Ej. Audifonos inalambricos"
            placeholderTextColor={colores.gris}
            value={nombre}
            onChangeText={setNombre}
          />
          {errorCampo("nombre")}
          <Text style={ui.etiqueta}>Descripción</Text>
          <TextInput
            onFocus={campos.revelarCampo}
            accessibilityLabel="Descripción del producto"
            ref={(entrada) => {
              entradas.current.descripcion = entrada;
            }}
            editable={!guardando}
            maxLength={2000}
            onContentSizeChange={campos.revelarCampo}
            style={[ui.input, { maxHeight: 140, textAlignVertical: "top" }]}
            placeholder="Estado, color, caracteristicas..."
            placeholderTextColor={colores.gris}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />
          {errorCampo("descripcion")}
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Precio inicial (creditos)
          </Text>
          <Text style={ui.pista}>
            Cuanto vale el producto al empezar la subasta. Ej: 100
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            accessibilityLabel="Precio inicial en créditos"
            ref={(entrada) => {
              entradas.current.precio = entrada;
            }}
            editable={!guardando}
            maxLength={10}
            style={ui.input}
            placeholder="Ej. 100"
            placeholderTextColor={colores.gris}
            keyboardType="number-pad"
            value={precio}
            onChangeText={setPrecio}
          />
          {errorCampo("precio")}
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Incremento minimo
          </Text>
          <Text style={ui.pista}>
            De cuanto en cuanto debe subir cada oferta (si es 10, se oferta 100,
            110, 120...).
          </Text>
          <TextInput
            onFocus={campos.revelarCampo}
            accessibilityLabel="Incremento mínimo en créditos"
            ref={(entrada) => {
              entradas.current.incremento = entrada;
            }}
            editable={!guardando}
            maxLength={10}
            style={ui.input}
            placeholder="Ej. 10"
            placeholderTextColor={colores.gris}
            keyboardType="number-pad"
            value={incremento}
            onChangeText={setIncremento}
          />
          {errorCampo("incremento")}
          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Duracion (horas y minutos)
          </Text>
          <Text style={ui.pista}>
            Selecciona cuanto tiempo aceptara ofertas a partir de publicarse.
            Maximo: 5 dias.
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={ui.pista}>Horas</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Restar una hora"
                  onPress={() => ajustarDuracion(-MINUTOS_POR_HORA)}
                  disabled={
                    guardando || minutosTotales <= DURACION_MINIMA_MINUTOS
                  }
                  style={({ pressed }) => [
                    ui.botonSecundario,
                    { minHeight: 52, minWidth: 44, paddingHorizontal: 0 },
                    (pressed ||
                      guardando ||
                      minutosTotales <= DURACION_MINIMA_MINUTOS) &&
                      ui.deshabilitado,
                  ]}
                >
                  <Text
                    style={[
                      ui.botonTexto,
                      { color: colores.primario, fontSize: 20 },
                    ]}
                  >
                    -
                  </Text>
                </Pressable>
                <View
                  style={[
                    ui.input,
                    {
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={ui.texto}>{duracionHoras}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sumar una hora"
                  onPress={() => ajustarDuracion(MINUTOS_POR_HORA)}
                  disabled={
                    guardando || minutosTotales >= DURACION_MAXIMA_MINUTOS
                  }
                  style={({ pressed }) => [
                    ui.botonSecundario,
                    { minHeight: 52, minWidth: 44, paddingHorizontal: 0 },
                    (pressed ||
                      guardando ||
                      minutosTotales >= DURACION_MAXIMA_MINUTOS) &&
                      ui.deshabilitado,
                  ]}
                >
                  <Text
                    style={[
                      ui.botonTexto,
                      { color: colores.primario, fontSize: 20 },
                    ]}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ui.pista}>Minutos</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Restar un minuto"
                  onPress={() => ajustarDuracion(-1)}
                  disabled={
                    guardando || minutosTotales <= DURACION_MINIMA_MINUTOS
                  }
                  style={({ pressed }) => [
                    ui.botonSecundario,
                    { minHeight: 52, minWidth: 44, paddingHorizontal: 0 },
                    (pressed ||
                      guardando ||
                      minutosTotales <= DURACION_MINIMA_MINUTOS) &&
                      ui.deshabilitado,
                  ]}
                >
                  <Text
                    style={[
                      ui.botonTexto,
                      { color: colores.primario, fontSize: 20 },
                    ]}
                  >
                    -
                  </Text>
                </Pressable>
                <View
                  style={[
                    ui.input,
                    {
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={ui.texto}>
                    {duracionMinutos.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sumar un minuto"
                  onPress={() => ajustarDuracion(1)}
                  disabled={
                    guardando || minutosTotales >= DURACION_MAXIMA_MINUTOS
                  }
                  style={({ pressed }) => [
                    ui.botonSecundario,
                    { minHeight: 52, minWidth: 44, paddingHorizontal: 0 },
                    (pressed ||
                      guardando ||
                      minutosTotales >= DURACION_MAXIMA_MINUTOS) &&
                      ui.deshabilitado,
                  ]}
                >
                  <Text
                    style={[
                      ui.botonTexto,
                      { color: colores.primario, fontSize: 20 },
                    ]}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <Text style={ui.pista}>Duracion total: {minutosTotales} minutos.</Text>
          {errorCampo("minutos")}
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
