// Integrante 5 - Admin: sube la foto tomada con la camara a Supabase Storage
import { supabase } from "../../lib/supabase";

export async function subirFotoProducto(uriLocal: string): Promise<string> {
  const nombre = `${Date.now()}.jpg`;
  const archivo = await fetch(uriLocal).then((r) => r.arrayBuffer());
  const { error } = await supabase.storage
    .from("productos")
    .upload(nombre, archivo, { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from("productos").getPublicUrl(nombre).data.publicUrl;
}
