// Integrante 4 - Sensor: HUELLA (biometria para confirmar que se adjunta una foto)
import * as LocalAuthentication from "expo-local-authentication";

/** true si el dispositivo no tiene huella/biometria configurada. */
export async function huellaNoDisponible(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return true;
  return !(await LocalAuthentication.isEnrolledAsync());
}

/** true si el usuario confirmo su huella para adjuntar la foto. */
export async function confirmarHuella(): Promise<boolean> {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirma tu huella para adjuntar la foto",
    cancelLabel: "Cancelar",
  });
  return resultado.success;
}
