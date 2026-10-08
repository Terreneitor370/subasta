import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/** Recupera datos al volver desde otra pestaña, una oferta o un aviso. */
export function useActualizarPantalla(
  refetch: () => Promise<unknown>,
  habilitado = true,
) {
  useFocusEffect(
    useCallback(() => {
      if (habilitado) void refetch().catch(() => undefined);
    }, [refetch, habilitado]),
  );
}
