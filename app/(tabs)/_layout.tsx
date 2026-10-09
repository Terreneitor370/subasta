import { Tabs } from "expo-router";
import { Icono } from "../../src/components/Icono";
import { colores, tipografia } from "../../src/lib/ui";
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: tipografia.editorial,
          fontWeight: "700",
          fontSize: 20,
        },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.gris,
        tabBarStyle: {
          backgroundColor: colores.blanco,
          borderTopColor: colores.borde,
        },
        tabBarLabelStyle: {
          fontFamily: tipografia.interfaz,
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      {(
        [
          ["index", "Subastas", "subastas"],
          ["mis-ofertas", "Mis ofertas", "ofertas"],
          ["ganados", "Ganados", "ganados"],
          ["creditos", "Créditos", "creditos"],
          ["perfil", "Perfil", "perfil"],
        ] as const
      ).map(([name, title, icono]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => <Icono nombre={icono} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
