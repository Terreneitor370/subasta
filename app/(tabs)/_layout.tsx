import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Subastas" }} />
      <Tabs.Screen name="mis-ofertas" options={{ title: "Mis ofertas" }} />
      <Tabs.Screen name="ganados" options={{ title: "Ganados" }} />
      <Tabs.Screen name="creditos" options={{ title: "Creditos" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
