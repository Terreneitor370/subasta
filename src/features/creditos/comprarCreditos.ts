// Integrante 5 - Pagos (Stripe en modo prueba, con respaldo "simulado")
import type { useStripe } from "@stripe/stripe-react-native";
import { supabase } from "../../lib/supabase";

export type Paquete = "basico" | "medio" | "pro";
export const PAQUETES: { id: Paquete; creditos: number; precio: number }[] = [
  { id: "basico", creditos: 100, precio: 50 },
  { id: "medio", creditos: 250, precio: 110 },
  { id: "pro", creditos: 600, precio: 240 },
];

type Stripe = ReturnType<typeof useStripe>;

/**
 * 1. Edge Function crear-pago crea el PaymentIntent (o acredita si es simulado).
 * 2. Se abre el PaymentSheet. Tarjeta de prueba: 4242 4242 4242 4242.
 * 3. Los creditos los acredita el webhook de Stripe (servidor), no la app.
 *    La app solo refresca el saldo (o lo recibe por Realtime).
 */
export async function comprarCreditos(paquete: Paquete, stripe: Stripe): Promise<"ok" | "cancelado"> {
  const { data, error } = await supabase.functions.invoke("crear-pago", { body: { paquete } });
  if (error) throw error;
  if (data.simulado) return "ok";

  const init = await stripe.initPaymentSheet({
    merchantDisplayName: "Subasta",
    paymentIntentClientSecret: data.clientSecret,
  });
  if (init.error) throw new Error(init.error.message);

  const res = await stripe.presentPaymentSheet();
  if (res.error) {
    if (res.error.code === "Canceled") return "cancelado";
    throw new Error(res.error.message);
  }
  return "ok";
}
