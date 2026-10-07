// Integrante 4 - Sensor: CAMARA (escaneo de QR). El QR de cada producto contiene
// "subasta://subasta/<id>" o solo el <id> del producto.
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { ui } from "../src/lib/ui";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const leido = useRef(false);

  if (!permiso) return <View />;
  if (!permiso.granted) {
    if (!permiso.canAskAgain) {
      return (
        <View style={[ui.pantalla, { justifyContent: "center", gap: 12 }]}>
          <Text>Desactivaste el permiso de camara. Actívalo en los ajustes del sistema para escanear codigos QR.</Text>
          <Pressable style={ui.boton} onPress={() => Linking.openSettings()}>
            <Text style={ui.botonTexto}>Abrir ajustes</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={[ui.pantalla, { justifyContent: "center", gap: 12 }]}>
        <Text>Necesitamos acceso a la camara para escanear el codigo.</Text>
        <Pressable style={ui.boton} onPress={pedirPermiso}>
          <Text style={ui.botonTexto}>Dar permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={({ data }) => {
        const id = data.match(UUID)?.[0];
        if (!id || leido.current) return;
        leido.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/subasta/${id}`);
      }}
    />
  );
}
