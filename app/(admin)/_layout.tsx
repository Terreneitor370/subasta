// Integrante 5 - Panel de administrador (solo rol admin; RLS lo refuerza en la BD)
import { Redirect, Stack } from "expo-router";
import { useSesion } from "../../src/lib/sesion";

export default function AdminLayout() {
  const { usuario } = useSesion();
  if (usuario && usuario.rol !== "admin") return <Redirect href="/(tabs)" />;
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Administrar subastas" }} />
      <Stack.Screen name="nueva" options={{ title: "Nueva subasta" }} />
    </Stack>
  );
}
