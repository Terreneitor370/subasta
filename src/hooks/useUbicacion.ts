// Integrante 4 - Sensor: GPS
import * as Location from "expo-location";

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

/** Ubicacion actual o null si el usuario no da permiso (la oferta se hace igual). */
export async function obtenerUbicacion(): Promise<Coordenadas | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const pos =
    (await Location.getLastKnownPositionAsync()) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return pos ? { latitud: pos.coords.latitude, longitud: pos.coords.longitude } : null;
}

/** true si el usuario nego el permiso de ubicacion y ya no se le puede volver a pedir (debe ir a Ajustes). */
export async function ubicacionDenegadaPermanente(): Promise<boolean> {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
  return status === "denied" && !canAskAgain;
}

/** Distancia en km (Haversine) para ordenar "subastas cercanas". */
export function distanciaKm(a: Coordenadas, b: Coordenadas) {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitud - a.latitud);
  const dLon = rad(b.longitud - a.longitud);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
