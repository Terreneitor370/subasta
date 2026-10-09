import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Boton, Estado } from "../src/components/Ui";
import { colores, ui } from "../src/lib/ui";
import { idDesdeQR } from "../src/lib/validacion";

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [aviso, setAviso] = useState("");
  const leido = useRef(false);
  if (!permiso)
    return (
      <View style={ui.pantalla}>
        <Estado titulo="Preparando cámara…" cargando />
      </View>
    );
  if (!permiso.granted)
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={[ui.pantalla, { justifyContent: "center", gap: 16 }]}
      >
        <Text style={ui.titulo}>Acceso a la cámara</Text>
        <Text style={ui.texto}>
          {permiso.canAskAgain
            ? "Necesitamos acceso a la cámara para escanear el código de una subasta."
            : "Activa el permiso de cámara en los ajustes del sistema para escanear códigos QR."}
        </Text>
        <Boton
          titulo={permiso.canAskAgain ? "Dar permiso" : "Abrir ajustes"}
          onPress={() => {
            void (
              permiso.canAskAgain ? pedirPermiso() : Linking.openSettings()
            ).catch(() =>
              setAviso(
                "No pudimos abrir el permiso de cámara. Vuelve a intentarlo.",
              ),
            );
          }}
        />
        {!!aviso && (
          <Text style={ui.error} accessibilityRole="alert">
            {aviso}
          </Text>
        )}
      </SafeAreaView>
    );
  return (
    <View style={{ flex: 1, backgroundColor: colores.oscuro }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          if (leido.current) return;
          const id = idDesdeQR(data);
          if (!id) {
            setAviso("Este QR no contiene un enlace de subasta válido.");
            return;
          }
          leido.current = true;
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => undefined);
          router.replace("/subasta/" + id);
        }}
      />
      <SafeAreaView
        edges={["bottom"]}
        pointerEvents="none"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          gap: 32,
        }}
      >
        <View style={{ width: "80%", maxWidth: 300, aspectRatio: 1 }}>
          {[
            { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
            { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
            { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
            { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
          ].map((borde, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                width: 36,
                height: 36,
                borderColor: colores.primario,
                ...borde,
              }}
            />
          ))}
        </View>
        <View
          style={{
            backgroundColor: "#142B49DD",
            padding: 16,
            borderRadius: 8,
            gap: 8,
          }}
        >
          <Text
            style={[
              ui.texto,
              { color: colores.blanco, textAlign: "center", fontWeight: "600" },
            ]}
          >
            Coloca el código QR dentro del marco
          </Text>
          <Text
            style={[ui.secundario, { color: "#DDE7F5", textAlign: "center" }]}
          >
            Abre el detalle de una subasta.
          </Text>
          {!!aviso && (
            <Text
              style={[ui.texto, { color: colores.blanco }]}
              accessibilityRole="alert"
            >
              {aviso}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
