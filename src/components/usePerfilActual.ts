import { useSesion } from "../lib/sesion";

/** Evita mostrar saldo o permisos del perfil anterior mientras cambia la sesión. */
export function usePerfilActual() {
  const contexto = useSesion();
  return {
    ...contexto,
    usuario:
      contexto.session && contexto.usuario?.id === contexto.session.user.id
        ? contexto.usuario
        : null,
  };
}
