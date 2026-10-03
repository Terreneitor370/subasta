// Integrante 4 - Sensor: GIROSCOPIO (confirmar oferta inclinando el telefono)
import { Gyroscope } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

const ANGULO_CONFIRMAR = 35; // grados de inclinacion hacia el frente
const INTERVALO_MS = 50;

/**
 * Mientras esta activo, integra la velocidad angular del eje X del giroscopio
 * (rad/s * s = rad) para estimar cuanto se ha inclinado el telefono desde que
 * se mostro la confirmacion. Al pasar ANGULO_CONFIRMAR llama a onConfirmar.
 * Devuelve el progreso (0..1) para dibujar una barra.
 */
export function useConfirmarInclinacion(activo: boolean, onConfirmar: () => void) {
  const [progreso, setProgreso] = useState(0);
  const angulo = useRef(0);
  const cb = useRef(onConfirmar);
  cb.current = onConfirmar;

  useEffect(() => {
    if (!activo) return;
    angulo.current = 0;
    setProgreso(0);
    Gyroscope.setUpdateInterval(INTERVALO_MS);
    let confirmado = false;
    const sub = Gyroscope.addListener(({ x }) => {
      angulo.current += (x * INTERVALO_MS) / 1000;
      const grados = Math.abs((angulo.current * 180) / Math.PI);
      setProgreso(Math.min(1, grados / ANGULO_CONFIRMAR));
      if (!confirmado && grados >= ANGULO_CONFIRMAR) {
        confirmado = true;
        cb.current();
      }
    });
    return () => sub.remove();
  }, [activo]);

  return progreso;
}
