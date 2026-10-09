import { StripeProvider } from "../src/lib/stripe";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, AppState, Platform, View } from "react-native";
import { colores, tipografia } from "../src/lib/ui";
import { SesionProvider } from "../src/lib/sesion";
import { usePerfilActual } from "../src/components/usePerfilActual";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    const evento = AppState.addEventListener("change", (estado) => {
      focusManager.setFocused(estado === "active");
    });
    return () => evento.remove();
  }, []);

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
    >
      <QueryClientProvider client={queryClient}>
        <SesionProvider>
          <StatusBar style="dark" />
          <Navegacion />
        </SesionProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}

// Protección de rutas de interfaz; RLS sigue siendo la autoridad del servidor.
function Navegacion() {
  const { session, usuario, cargando } = usePerfilActual();
  if (cargando)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colores.fondo,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color={colores.primario}
          accessibilityLabel="Restaurando sesión"
        />
      </View>
    );
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerTitleStyle: {
          fontFamily: tipografia.editorial,
          fontWeight: "700",
          fontSize: 20,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="subasta/[id]"
          options={{ title: "Detalle de subasta", headerBackTitle: "Volver" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!!session && usuario?.rol === "admin"}>
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
