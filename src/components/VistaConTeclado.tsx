import { useRef, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

/** Mide la posición real de la pantalla para compensar cabeceras y área segura. */
export function VistaConTeclado({ children }: { children: ReactNode }) {
  const vista = useRef<View>(null);
  const [inicio, setInicio] = useState(0);
  return (
    <View
      ref={vista}
      style={{ flex: 1 }}
      onLayout={() => {
        vista.current?.measureInWindow((_x, y) => setInicio(y));
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        enabled={Platform.OS !== "web"}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={inicio}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}
