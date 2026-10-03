import { admin } from "./supabase.ts";

export interface Aviso {
  usuarioId: string;
  tipo: "superada" | "termina_10min" | "por_terminar" | "ganaste" | "perdiste";
  titulo: string;
  cuerpo: string;
  productoId?: string;
}

/**
 * Guarda cada aviso en la tabla notificaciones (bandeja in-app) y lo envia
 * por Expo Push a quienes tengan push_token. Un solo request para todos.
 */
export async function enviarAvisos(avisos: Aviso[]) {
  if (avisos.length === 0) return;

  await admin.from("notificaciones").insert(
    avisos.map((a) => ({
      usuario_id: a.usuarioId,
      tipo: a.tipo,
      titulo: a.titulo,
      cuerpo: a.cuerpo,
      producto_id: a.productoId ?? null,
    })),
  );

  const ids = [...new Set(avisos.map((a) => a.usuarioId))];
  const { data: usuarios } = await admin.from("usuarios").select("id, push_token").in("id", ids);
  const tokens = new Map((usuarios ?? []).map((u) => [u.id, u.push_token as string | null]));

  const mensajes = avisos
    .filter((a) => tokens.get(a.usuarioId))
    .map((a) => ({
      to: tokens.get(a.usuarioId),
      title: a.titulo,
      body: a.cuerpo,
      sound: "default",
      data: { tipo: a.tipo, productoId: a.productoId },
    }));
  if (mensajes.length === 0) return;

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(mensajes),
  });
  if (!res.ok) console.error("Expo push error", await res.text());
}

/** Ids de todos los usuarios que han ofertado en una subasta. */
export async function participantes(productoId: string): Promise<string[]> {
  const { data } = await admin.from("ofertas").select("usuario_id").eq("producto_id", productoId);
  return [...new Set((data ?? []).map((o) => o.usuario_id as string))];
}
