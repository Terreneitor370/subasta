import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
            <ScrollView
              horizontal
              key={`${zoom}-${medidas.width}-${medidas.height}`}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: medidas.width * zoom, height: medidas.height }}
              >
                <Image
                  source={uri}
                  accessibilityLabel={`Foto ampliada de ${nombre}`}
                  contentFit="contain"
                  onError={() => setFallo(true)}
                  style={{
                    width: medidas.width * zoom,
                    height: medidas.height * zoom,
                  }}
                />
              </ScrollView>
            </ScrollView>
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
              () => setZoom((value) => Math.max(1, value - 0.5)),
              zoom <= 1 || fallo,
            )}
            {control(
              `${Math.round(zoom * 100)} %`,
              "Restablecer tamaño de foto",
              () => setZoom(1),
              fallo,
            )}
            {control(
              "+",
              "Ampliar foto",
              () => setZoom((value) => Math.min(4, value + 0.5)),
              zoom >= 4 || fallo,
            )}
          </View>
          <Text
            style={[ui.secundario, { color: "#CDD7E5", textAlign: "center" }]}
          >
            Usa + para ampliar y desliza para ver los detalles.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
