import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSesion } from "../src/lib/sesion";

export default function Index() {
  const { session, cargando } = useSesion();
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Redirect href={session ? "/(tabs)" : "/(auth)/login"} />;
}
