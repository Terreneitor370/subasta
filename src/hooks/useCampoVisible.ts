import { useCallback, useEffect, useRef } from "react";
import {
  Keyboard,
  Platform,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

type Contenedor = {
  getScrollResponder(): unknown;
  getNativeScrollRef(): unknown;
};
type Medible = {
  measureInWindow(
    callback: (x: number, y: number, width: number, height: number) => void,
  ): void;
};
type Desplazable = {
  scrollTo(options: { y: number; animated: boolean }): void;
};

/** Mantiene el campo activo dentro del área visible, incluso al cambiar de campo con el teclado abierto. */
export function useCampoVisible(margenInferior = 16) {
  const ref = useRef<Contenedor | null>(null);
  const desplazamiento = useRef(0);
  const tecladoY = useRef<number | null>(null);
  const pendiente = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ajustar = useCallback(() => {
    if (Platform.OS === "web") return;
    const campo = TextInput.State.currentlyFocusedInput();
    const scroll = ref.current?.getScrollResponder() as Desplazable | null;
    const vista = ref.current?.getNativeScrollRef() as Medible | null;
    if (!campo || !scroll || !vista) return;
    vista.measureInWindow((_x, inicio, _ancho, alto) => {
      campo.measureInWindow((_cx, campoY, _cw, campoAlto) => {
        // El pie fijo y las cabeceras ya están excluidos de la medida del scroll.
        const limite =
          Math.min(inicio + alto, tecladoY.current ?? Infinity) -
          margenInferior;
        const cambio =
          campoY < inicio + 12
            ? campoY - inicio - 12
            : Math.max(0, campoY + campoAlto - limite);
        if (Math.abs(cambio) > 1)
          scroll.scrollTo({
            y: Math.max(0, desplazamiento.current + cambio),
            animated: true,
          });
      });
    });
  }, [margenInferior]);

  const revelarCampo = useCallback(() => {
    if (pendiente.current) clearTimeout(pendiente.current);
    pendiente.current = setTimeout(ajustar, 100);
  }, [ajustar]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const abrir = Keyboard.addListener("keyboardDidShow", (evento) => {
      tecladoY.current = evento.endCoordinates.screenY;
      revelarCampo();
    });
    const cambiar = Keyboard.addListener(
      "keyboardWillChangeFrame",
      (evento) => {
        tecladoY.current = evento.endCoordinates.screenY;
        revelarCampo();
      },
    );
    const cerrar = Keyboard.addListener("keyboardDidHide", () => {
      tecladoY.current = null;
    });
    return () => {
      abrir.remove();
      cambiar.remove();
      cerrar.remove();
      if (pendiente.current) clearTimeout(pendiente.current);
    };
  }, [revelarCampo]);

  const onScroll = useCallback(
    (evento: NativeSyntheticEvent<NativeScrollEvent>) => {
      desplazamiento.current = evento.nativeEvent.contentOffset.y;
    },
    [],
  );

  return { ref, onScroll, revelarCampo };
}
