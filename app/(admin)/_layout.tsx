// Integrante 5 - Panel de administrador (solo rol admin; RLS lo refuerza en la BD)
import { Redirect, Stack } from "expo-router";
import { useSesion } from "../../src/lib/sesion";
import { colores, tipografia } from "../../src/lib/ui";

export default function AdminLayout() {
  const { usuario } = useSesion();
  if (usuario && usuario.rol !== "admin") return <Redirect href="/(tabs)" />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.oscuro },
        headerTintColor: colores.blanco,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: tipografia.interfaz,
          fontSize: 20,
          fontWeight: "700",
        },
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Administrar subastas" }} />
      <Stack.Screen name="nueva" options={{ title: "Nueva subasta" }} />
    </Stack>
  );
}
