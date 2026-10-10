import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { GestureResponderEvent, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colores, ui } from "../lib/ui";

/** Vista local de la imagen existente: encuadre completo, ampliación y desplazamiento. */
export function VisorFoto({
  uri,
  nombre,
  cerrar,
}: {
  uri: string;
  nombre: string;
  cerrar: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [medidas, setMedidas] = useState({ width: 1, height: 1 });
  const [fallo, setFallo] = useState(false);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const gesto = useRef({ dedos: 0, distancia: 0, zoom: 1, x: 0, y: 0, origenX: 0, origenY: 0 });
  const limitar = (valor: number, maximo: number) => Math.max(-maximo, Math.min(maximo, valor));
  const cambiarZoom = (valor: number) => {
    setZoom(Math.max(1, Math.min(4, valor)));
    setPosicion({ x: 0, y: 0 });
  };
  const tocar = (evento: GestureResponderEvent, iniciar = false) => {
    const dedos = evento.nativeEvent.touches;
    if (!dedos.length) { gesto.current.dedos = 0; return; }
    const x = dedos[0].pageX;
    const y = dedos[0].pageY;
    const distancia = dedos.length > 1
      ? Math.hypot(dedos[1].pageX - x, dedos[1].pageY - y) : 0;
    if (iniciar || gesto.current.dedos !== dedos.length) {
      gesto.current = { dedos: dedos.length, distancia, zoom, x, y, origenX: posicion.x, origenY: posicion.y };
      return;
    }
    const inicio = gesto.current;
    if (dedos.length > 1 && inicio.distancia > 0) {
      const escala = Math.max(1, Math.min(4, inicio.zoom * distancia / inicio.distancia));
      setZoom(escala);
      setPosicion({ x: limitar(inicio.origenX, medidas.width * (escala - 1) / 2), y: limitar(inicio.origenY, medidas.height * (escala - 1) / 2) });
    } else if (dedos.length === 1) {
      setPosicion({ x: limitar(inicio.origenX + x - inicio.x, medidas.width * (zoom - 1) / 2), y: limitar(inicio.origenY + y - inicio.y, medidas.height * (zoom - 1) / 2) });
    }
  };
  const control = (
    texto: string,
    etiqueta: string,
    accion: () => void,
    disabled = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={accion}
      style={{
        minWidth: 48,
        minHeight: 48,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colores.oscuro,
        borderRadius: texto === "Cerrar" ? 8 : 24,
        borderWidth: 1,
        borderColor: "#31516F",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={[ui.texto, { color: "white", fontWeight: "700" }]}>
        {texto}
      </Text>
    </Pressable>
  );
  return (
    <Modal visible animationType="fade" onRequestClose={cerrar}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1422" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 12,
          }}
        >
          <Text
            numberOfLines={2}
            style={[ui.texto, { flex: 1, color: "white" }]}
          >
            {nombre}
          </Text>
          {control("Cerrar", "Cerrar foto", cerrar)}
        </View>
        <View
          style={{ flex: 1 }}
          onLayout={({ nativeEvent }) => setMedidas(nativeEvent.layout)}
        >
          {fallo ? (
            <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
              <Text
                style={[ui.texto, { color: "white", textAlign: "center" }]}
                accessibilityRole="alert"
              >
                No se pudo cargar la foto. Cierra la vista e intenta de nuevo.
              </Text>
            </View>
          ) : (
            <View
              accessibilityLabel="Imagen con zoom por gesto"
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(evento) => tocar(evento, true)}
              onResponderMove={(evento) => tocar(evento)}
              onTouchStart={(evento) => tocar(evento, true)}
              onTouchEnd={() => { gesto.current.dedos = 0; }}
              onResponderTerminationRequest={() => false}
              onResponderTerminate={() => { gesto.current.dedos = 0; }}
              style={{ flex: 1, overflow: "hidden" }}
            >
                <Image
                  source={uri}
                  accessibilityLabel={`Foto ampliada de ${nombre}`}
                  contentFit="contain"
                  onError={() => setFallo(true)}
                  style={{
                    width: medidas.width,
                    height: medidas.height,
                    transform: [{ translateX: posicion.x }, { translateY: posicion.y }, { scale: zoom }],
                  }}
                />
            </View>
          )}
        </View>
        <View style={{ padding: 12, gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {control(
              "−",
              "Reducir foto",
              () => cambiarZoom(zoom - 0.5),
              zoom <= 1 || fallo,
            )}
            {control(
              `${Math.round(zoom * 100)} %`,
              "Restablecer tamaño de foto",
              () => cambiarZoom(1),
              fallo,
            )}
            {control(
              "+",
              "Ampliar foto",
              () => cambiarZoom(zoom + 0.5),
              zoom >= 4 || fallo,
            )}
          </View>
          <Text
            style={[ui.secundario, { color: "#CDD7E5", textAlign: "center" }]}
          >
            Separa dos dedos para ampliar, júntalos para reducir y arrastra para ver los detalles.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
