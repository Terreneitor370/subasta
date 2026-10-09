// Integrante 5 - Notificaciones push
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "../../lib/supabase";

type ExpoNotifications = typeof import("expo-notifications");

const esExpoGo =
  Constants.executionEnvironment === "storeClient" ||
  Constants.appOwnership === "expo";
let handlerConfigurado = false;

const cargarExpoNotifications = async (): Promise<ExpoNotifications | null> => {
  try {
    return await import("expo-notifications");
  } catch (error) {
    console.warn("No se pudo cargar expo-notifications en este entorno:", error);
    return null;
  }
};

/**
 * Pide permiso, obtiene el Expo push token y lo guarda en usuarios.push_token.
 * Android + Expo Go: el push remoto no esta disponible -> usar development build.
 * Si falla, la app sigue funcionando con la bandeja (tabla notificaciones).
 */
export async function registrarPush(usuarioId: string) {
  if (!Device.isDevice) return;
  if (esExpoGo) {
    console.warn("Push remoto no disponible en Expo Go. Usa un development build para registrar push tokens.");
    return;
  }

  const Notifications = await cargarExpoNotifications();
  if (!Notifications) return;

  if (!handlerConfigurado) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigurado = true;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Subastas",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;
  try {
    const projectId =
      Constants.easConfig?.projectId ??
      (Constants.expoConfig?.extra?.eas?.projectId as string | undefined);

    if (!projectId) {
      console.warn("No se encontro projectId de EAS; no se pudo generar el token push.");
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await supabase.from("usuarios").update({ push_token: token }).eq("id", usuarioId);
  } catch (e) {
    console.warn("Push no disponible en este entorno:", e);
  }
}
