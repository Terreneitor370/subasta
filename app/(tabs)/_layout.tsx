import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colores, tipografia } from "../../src/lib/ui";
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: tipografia.editorial,
          fontWeight: "400",
          fontSize: 22,
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
          ["index", "Subastas", "◈"],
          ["mis-ofertas", "Mis ofertas", "↗"],
          ["ganados", "Ganados", "★"],
          ["creditos", "Créditos", "+"],
          ["perfil", "Perfil", "●"],
        ] as const
      ).map(([name, title, icono]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }} accessibilityElementsHidden>
                {icono}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
