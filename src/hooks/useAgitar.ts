// Integrante 4 - Sensor: ACELEROMETRO (oferta rapida al agitar)
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";

const UMBRAL_G = 1.8; // magnitud de aceleracion considerada "agitar"
const ESPERA_MS = 1500; // evita disparos repetidos

/** Llama a onAgitar cuando el usuario agita el telefono. */
export function useAgitar(onAgitar: () => void, habilitado = true) {
  const ultimo = useRef(0);
  const cb = useRef(onAgitar);
  cb.current = onAgitar;

  useEffect(() => {
    if (!habilitado) return;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitud = Math.sqrt(x * x + y * y + z * z);
      const ahora = Date.now();
      if (magnitud > UMBRAL_G && ahora - ultimo.current > ESPERA_MS) {
        ultimo.current = ahora;
        cb.current();
      }
    });
    return () => sub.remove();
  }, [habilitado]);
}
