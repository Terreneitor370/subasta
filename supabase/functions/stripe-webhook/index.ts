// Webhook de Stripe: acredita los creditos cuando el pago se confirma.
// Se acredita AQUI (servidor) y no desde la app, para que nadie pueda
// regalarse creditos. Es idempotente: Stripe puede reenviar el evento.
// Deploy: npx supabase functions deploy stripe-webhook --no-verify-jwt
import Stripe from "npm:stripe@18";
import { admin, json } from "../_shared/supabase.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const firma = req.headers.get("Stripe-Signature");
  const body = await req.text();
  let evento: Stripe.Event;
  try {
    evento = await stripe.webhooks.constructEventAsync(
      body,
      firma!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch (e) {
    return json({ error: `firma invalida: ${(e as Error).message}` }, 400);
  }

  if (evento.type === "payment_intent.succeeded") {
    const pi = evento.data.object as Stripe.PaymentIntent;
    const { error } = await admin.rpc("acreditar_compra", {
      p_usuario_id: pi.metadata.usuario_id,
      p_creditos: Number(pi.metadata.creditos),
      p_referencia: pi.id,
    });
    if (error) return json({ error: error.message }, 500);
  }
  return json({ recibido: true });
});
