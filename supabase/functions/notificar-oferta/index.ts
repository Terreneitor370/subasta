// Disparada por un Database Webhook: tabla productos, evento UPDATE.
// Si cambia el lider, avisa al lider anterior que superaron su oferta.
// Deploy: npx supabase functions deploy notificar-oferta --no-verify-jwt
import { enviarAvisos } from "../_shared/push.ts";
import { json } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return json({ error: "no autorizado" }, 401);
  }
  const { record, old_record } = await req.json();
  const anterior = old_record?.lider_id as string | null;

  if (anterior && anterior !== record.lider_id) {
    await enviarAvisos([
      {
        usuarioId: anterior,
        tipo: "superada",
        titulo: "Superaron tu oferta",
        cuerpo: `${record.nombre}: la oferta actual es de ${record.precio_actual} creditos. Tus creditos fueron liberados.`,
        productoId: record.id,
      },
    ]);
  }
  return json({ ok: true });
});
