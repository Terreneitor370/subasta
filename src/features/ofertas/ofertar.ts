// Integrante 2 / 3 - Unica forma de ofertar: RPC realizar_oferta (atomica en la BD)
import { supabase, traducirError } from "../../lib/supabase";
import type { MetodoOferta } from "../../types/database";

export async function ofertar(productoId: string, monto: number, metodo: MetodoOferta = "normal") {
  const { data, error } = await supabase.rpc("realizar_oferta", {
    p_producto_id: productoId,
    p_monto: monto,
    p_metodo: metodo,
  });
  if (error) throw new Error(traducirError(error.message));
  return data;
}
