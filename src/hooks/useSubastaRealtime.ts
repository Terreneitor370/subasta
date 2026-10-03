// Integrante 3 - Tiempo real
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Oferta, Producto } from "../types/database";

/**
 * Carga una subasta con sus ultimas ofertas y se suscribe a:
 *  - UPDATE de productos (precio_actual, lider_id, estado, fecha_fin)
 *  - INSERT de ofertas de ese producto (historial en vivo)
 * El canal se cierra al salir de la pantalla.
 */
export function useSubastaRealtime(productoId: string) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  useEffect(() => {
    let activo = true;

    (async () => {
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("productos").select("*").eq("id", productoId).single(),
        supabase.from("ofertas").select("*").eq("producto_id", productoId).order("monto", { ascending: false }).limit(20),
      ]);
      if (!activo) return;
      setProducto(p);
      setOfertas(o ?? []);
    })();

    const canal = supabase
      .channel(`subasta:${productoId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "productos", filter: `id=eq.${productoId}` },
        (payload) => setProducto(payload.new as Producto),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ofertas", filter: `producto_id=eq.${productoId}` },
        (payload) => setOfertas((prev) => [payload.new as Oferta, ...prev].slice(0, 20)),
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, [productoId]);

  return { producto, ofertas };
}
