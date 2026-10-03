// Integrante 5 - Notificaciones push
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "../../lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pide permiso, obtiene el Expo push token y lo guarda en usuarios.push_token.
 * Android + Expo Go: el push remoto no esta disponible -> usar development build.
 * Si falla, la app sigue funcionando con la bandeja (tabla notificaciones).
 */
export async function registrarPush(usuarioId: string) {
  if (!Device.isDevice) return;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Subastas",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await supabase.from("usuarios").update({ push_token: token }).eq("id", usuarioId);
  } catch (e) {
    console.warn("Push no disponible en este entorno:", e);
  }
}
