import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { registrarPush } from "../features/notificaciones/registrarPush";
import type { Usuario } from "../types/database";
import { supabase } from "./supabase";

interface SesionCtx {
  session: Session | null;
  usuario: Usuario | null;
  cargando: boolean;
}

const Ctx = createContext<SesionCtx>({ session: null, usuario: null, cargando: true });
export const useSesion = () => useContext(Ctx);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Perfil + saldo de creditos en tiempo real
  useEffect(() => {
    if (!session) return setUsuario(null);
    const uid = session.user.id;
    supabase.from("usuarios").select("*").eq("id", uid).single().then(({ data }) => setUsuario(data));
    registrarPush(uid);
    const canal = supabase
      .channel(`usuario:${uid}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "usuarios", filter: `id=eq.${uid}` }, (p) =>
        setUsuario(p.new as Usuario),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [session]);

  return <Ctx.Provider value={{ session, usuario, cargando }}>{children}</Ctx.Provider>;
}
