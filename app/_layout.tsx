import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SesionProvider } from "../src/lib/sesion";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}>
      <QueryClientProvider client={queryClient}>
        <SesionProvider>
          <StatusBar style="dark" />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="subasta/[id]" options={{ title: "Subasta" }} />
            <Stack.Screen name="escanear" options={{ title: "Escanear QR", presentation: "modal" }} />
          </Stack>
        </SesionProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}
