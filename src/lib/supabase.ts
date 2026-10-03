import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import type { Database } from "../types/database";

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Refresca la sesion solo mientras la app esta en primer plano
AppState.addEventListener("change", (estado) => {
  if (estado === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** Traduce los errores de realizar_oferta() a mensajes para el usuario. */
export const MENSAJES_ERROR: Record<string, string> = {
  NO_AUTENTICADO: "Inicia sesion para ofertar.",
  SUBASTA_NO_EXISTE: "La subasta no existe.",
  SUBASTA_NO_ACTIVA: "La subasta ya no esta activa.",
  MONTO_INSUFICIENTE: "Tu oferta debe superar el precio actual mas el incremento minimo.",
  CREDITOS_INSUFICIENTES: "No tienes creditos suficientes. Compra mas creditos.",
};
export const traducirError = (msg: string) =>
  MENSAJES_ERROR[Object.keys(MENSAJES_ERROR).find((k) => msg.includes(k)) ?? ""] ?? msg;
