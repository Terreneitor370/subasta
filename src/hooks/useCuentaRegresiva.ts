// Integrante 3 - Temporizador sincronizado con el reloj del servidor
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

let desfaseMs: number | null = null; // reloj servidor - reloj del celular

async function sincronizarReloj() {
  if (desfaseMs !== null) return;
  const t0 = Date.now();
  const { data } = await supabase.rpc("hora_servidor");
  const t1 = Date.now();
  if (data) desfaseMs = new Date(data).getTime() - (t0 + t1) / 2;
}

/** Milisegundos restantes hasta fechaFin usando la hora del servidor. */
export function useCuentaRegresiva(fechaFin: string | undefined) {
  const [restante, setRestante] = useState(0);

  useEffect(() => {
    sincronizarReloj();
    if (!fechaFin) return;
    const fin = new Date(fechaFin).getTime();
    const tick = () => setRestante(Math.max(0, fin - (Date.now() + (desfaseMs ?? 0))));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [fechaFin]);

  return restante;
}

export function formatoTiempo(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dos(m)}:${dos(seg)}` : `${dos(m)}:${dos(seg)}`;
}
