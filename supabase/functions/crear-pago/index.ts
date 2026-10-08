// La app llama a esta funcion para comprar un paquete de creditos.
// PAGOS_MODO=stripe   -> crea un PaymentIntent (modo prueba) y devuelve el client_secret
//                        para el PaymentSheet. Los creditos se acreditan en stripe-webhook.
// PAGOS_MODO=simulado -> acredita de inmediato (respaldo para la demo).
// Deploy: npx supabase functions deploy crear-pago   (requiere JWT del usuario)
import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";
import { admin, json } from "../_shared/supabase.ts";

// Paquetes fijos: el precio NUNCA lo manda la app.
const PAQUETES: Record<string, { creditos: number; precioMXN: number }> = {
  basico: { creditos: 100, precioMXN: 100 },
  medio: { creditos: 250, precioMXN: 250 },
  pro: { creditos: 600, precioMXN: 600 },
};

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "no autenticado" }, 401);

  const { paquete } = await req.json();
  const p = PAQUETES[paquete as string];
  if (!p) return json({ error: "paquete invalido" }, 400);

  if (Deno.env.get("PAGOS_MODO") === "simulado") {
    const ref = `sim_${crypto.randomUUID()}`;
    const { error } = await admin.rpc("acreditar_compra", {
      p_usuario_id: user.id,
      p_creditos: p.creditos,
      p_referencia: ref,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ simulado: true, creditos: p.creditos });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
  const intent = await stripe.paymentIntents.create({
    amount: p.precioMXN * 100, // centavos
    currency: "mxn",
    automatic_payment_methods: { enabled: true },
    metadata: { usuario_id: user.id, creditos: String(p.creditos), paquete },
  });
  return json({ clientSecret: intent.client_secret });
});
