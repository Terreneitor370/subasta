// Ejecutada cada minuto por pg_cron (ver supabase/cron_tick.sql).
//  1. Cierra subastas vencidas y avisa ganaste / perdiste.
//  2. Avisa "termina en 10 minutos" a los participantes.
//  3. Avisa "esta por terminar" (2 min) a participantes que no van ganando.
// Deploy: npx supabase functions deploy tick-subastas --no-verify-jwt
import { type Aviso, enviarAvisos, participantes } from "../_shared/push.ts";
import { admin, json } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return json({ error: "no autorizado" }, 401);
  }
  try {
    const avisos: Aviso[] = [];

    // 1. Cierre de subastas
    const { data: cerradas, error } = await admin.rpc("tick_subastas");
    if (error) throw new Error(`tick_subastas fallo: ${error.message}`);

    for (const s of cerradas ?? []) {
      if (s.ganador_id) {
        avisos.push({
          usuarioId: s.ganador_id,
          tipo: "ganaste",
          titulo: "Ganaste la subasta",
          cuerpo: `${s.nombre} es tuyo por ${s.monto} creditos.`,
          productoId: s.producto_id,
        });
      }
      for (const uid of await participantes(s.producto_id)) {
        if (uid !== s.ganador_id) {
          avisos.push({
            usuarioId: uid,
            tipo: "perdiste",
            titulo: "Subasta finalizada",
            cuerpo: `No ganaste ${s.nombre}. Precio final: ${s.monto} creditos.`,
            productoId: s.producto_id,
          });
        }
      }
    }

    // 2 y 3. Avisos previos al cierre
    const ahora = Date.now();
    const en = (min: number) => new Date(ahora + min * 60_000).toISOString();

    const { data: diezMin, error: diezMinError } = await admin
      .from("productos")
      .select("id, nombre")
      .eq("estado", "activa")
      .eq("aviso_10min_enviado", false)
      .lte("fecha_fin", en(10));
    if (diezMinError) throw new Error(`No se pudieron consultar avisos de 10 minutos: ${diezMinError.message}`);

    for (const p of diezMin ?? []) {
      for (const uid of await participantes(p.id)) {
        avisos.push({ usuarioId: uid, tipo: "termina_10min", titulo: "Tu subasta termina en 10 minutos", cuerpo: p.nombre, productoId: p.id });
      }
      const { error: marcaDiezError } = await admin.from("productos").update({ aviso_10min_enviado: true }).eq("id", p.id);
      if (marcaDiezError) throw new Error(`No se pudo marcar aviso_10min_enviado en ${p.id}: ${marcaDiezError.message}`);
    }

    const { data: finales, error: finalesError } = await admin
      .from("productos")
      .select("id, nombre, lider_id, precio_actual")
      .eq("estado", "activa")
      .eq("aviso_final_enviado", false)
      .lte("fecha_fin", en(2));
    if (finalesError) throw new Error(`No se pudieron consultar avisos finales: ${finalesError.message}`);

    for (const p of finales ?? []) {
      for (const uid of await participantes(p.id)) {
        if (uid !== p.lider_id) {
          avisos.push({
            usuarioId: uid,
            tipo: "por_terminar",
            titulo: "La subasta esta por terminar",
            cuerpo: `${p.nombre} va en ${p.precio_actual} creditos. Ultima oportunidad.`,
            productoId: p.id,
          });
        }
      }
      const { error: marcaFinalError } = await admin.from("productos").update({ aviso_final_enviado: true }).eq("id", p.id);
      if (marcaFinalError) throw new Error(`No se pudo marcar aviso_final_enviado en ${p.id}: ${marcaFinalError.message}`);
    }

    await enviarAvisos(avisos);
    return json({ cerradas: cerradas?.length ?? 0, avisos: avisos.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "error inesperado";
    return json({ error: message }, 500);
  }
});
