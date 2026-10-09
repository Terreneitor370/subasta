import { View, type ColorValue, type ViewStyle } from "react-native";
import { colores } from "../lib/ui";

export type NombreIcono =
  | "subastas"
  | "ofertas"
  | "ganados"
  | "creditos"
  | "perfil"
  | "camara"
  | "qr"
  | "ojo"
  | "ojo-cerrado";

/** Iconos de contorno dibujados con vistas nativas, sin dependencias ni fuentes externas. */
export function Icono({
  nombre,
  color = colores.texto,
  size = 24,
}: {
  nombre: NombreIcono;
  color?: ColorValue;
  size?: number;
}) {
  const borde = (style: ViewStyle) => (
    <View
      style={{
        position: "absolute",
        borderWidth: 1.8,
        borderColor: color,
        ...style,
      }}
    />
  );
  const linea = (style: ViewStyle) => (
    <View style={{ position: "absolute", backgroundColor: color, ...style }} />
  );
  let figura;
  switch (nombre) {
    case "subastas":
      figura = (
        <>
          {borde({
            width: 14,
            height: 7,
            left: 6,
            top: 4,
            borderRadius: 2,
            transform: [{ rotate: "-40deg" }],
          })}
          {linea({
            width: 2,
            height: 12,
            left: 9,
            top: 9,
            transform: [{ rotate: "40deg" }],
          })}
          {borde({ width: 15, height: 3, left: 4, top: 20, borderRadius: 1 })}
        </>
      );
      break;
    case "ofertas":
      figura = (
        <>
          {borde({
            width: 15,
            height: 12,
            left: 4,
            top: 6,
            borderRadius: 3,
            transform: [{ rotate: "-40deg" }],
          })}
          {borde({ width: 4, height: 4, left: 14, top: 6, borderRadius: 2 })}
        </>
      );
      break;
    case "ganados":
      figura = (
        <>
          {borde({
            width: 13,
            height: 12,
            left: 5.5,
            top: 2,
            borderBottomLeftRadius: 7,
            borderBottomRightRadius: 7,
          })}
          {borde({ width: 5, height: 7, left: 1.5, top: 4, borderRadius: 3 })}
          {borde({ width: 5, height: 7, right: 1.5, top: 4, borderRadius: 3 })}
          {linea({ width: 2, height: 7, left: 11, top: 14 })}
          {linea({ width: 11, height: 2, left: 6.5, top: 21 })}
        </>
      );
      break;
    case "creditos":
      figura = (
        <>
          {[4, 9, 14].map((top) => (
            <View
              key={top}
              style={{
                position: "absolute",
                width: 17,
                height: 7,
                left: 3.5,
                top,
                borderRadius: 8,
                borderWidth: 1.8,
                borderColor: color,
              }}
            />
          ))}
        </>
      );
      break;
    case "perfil":
      figura = (
        <>
          {borde({ width: 8, height: 8, left: 8, top: 2, borderRadius: 5 })}
          {borde({
            width: 18,
            height: 10,
            left: 3,
            top: 13,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomWidth: 0,
          })}
        </>
      );
      break;
    case "camara":
      figura = (
        <>
          {borde({ width: 21, height: 15, left: 1.5, top: 6, borderRadius: 3 })}
          {borde({ width: 9, height: 9, left: 7.5, top: 9, borderRadius: 5 })}
          {borde({ width: 8, height: 4, left: 8, top: 2, borderRadius: 1 })}
        </>
      );
      break;
    case "qr":
      figura = (
        <>
          {[
            [2, 2],
            [14, 2],
            [2, 14],
          ].map(([left, top]) => (
            <View
              key={`${left}:${top}`}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                left,
                top,
                borderWidth: 1.8,
                borderColor: color,
              }}
            />
          ))}
          {linea({ width: 8, height: 2, left: 14, top: 14 })}
          {linea({ width: 2, height: 8, left: 14, top: 14 })}
          {linea({ width: 4, height: 4, left: 18, top: 18 })}
        </>
      );
      break;
    default:
      figura = (
        <>
          {borde({
            width: 22,
            height: 13,
            left: 1,
            top: 5.5,
            borderRadius: 12,
          })}
          {borde({ width: 7, height: 7, left: 8.5, top: 8.5, borderRadius: 4 })}
          {nombre === "ojo-cerrado" &&
            linea({
              width: 27,
              height: 2,
              left: -1.5,
              top: 11,
              transform: [{ rotate: "45deg" }],
            })}
        </>
      );
  }
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          transform: [{ scale: size / 24 }],
          transformOrigin: "top left",
        }}
      >
        {figura}
      </View>
    </View>
  );
}
