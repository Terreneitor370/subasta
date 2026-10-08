import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { colores, tipografia, ui } from "../lib/ui";

export function Marca() {
  return (
    <View style={{ gap: 6, paddingVertical: 6 }}>
      <Text
        style={{
          fontFamily: tipografia.editorial,
          fontSize: 36,
          letterSpacing: -1.5,
          color: colores.texto,
        }}
      >
        subasta<Text style={{ color: colores.primario }}>.</Text>
      </Text>
      <Text style={ui.ceja}>Objetos. Historias. Nuevos dueños.</Text>
    </View>
  );
}

export function Encabezado({
  ceja,
  titulo,
  detalle,
}: {
  ceja: string;
  titulo: string;
  detalle?: string;
}) {
  return (
    <View style={{ gap: 12, paddingTop: 6, paddingBottom: 8 }}>
      <Text style={ui.ceja}>{ceja}</Text>
      <Text style={ui.titulo}>{titulo}</Text>
      {detalle && <Text style={ui.secundario}>{detalle}</Text>}
      <View
        style={{
          height: 2,
          width: 40,
          backgroundColor: colores.primario,
          marginTop: 4,
        }}
      />
    </View>
  );
}

export function ImagenProducto({
  uri,
  nombre,
  alto = 180,
}: {
  uri?: string | null;
  nombre: string;
  alto?: number;
}) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [uri]);
  if (uri && !fallo) {
    return (
      <Image
        source={uri}
        style={{
          height: alto,
          borderRadius: 6,
          backgroundColor: colores.suave,
        }}
        contentFit="cover"
        accessibilityLabel={nombre}
        onError={() => setFallo(true)}
      />
    );
  }
  return (
    <View
      style={{
        height: alto,
        borderRadius: 6,
        backgroundColor: colores.suave,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text
        style={{
          fontFamily: tipografia.editorial,
          color: colores.gris,
          fontSize: 48,
        }}
        accessibilityElementsHidden
      >
        S.
      </Text>
      <Text
        style={[
          ui.ceja,
          { color: colores.gris, fontSize: 11, letterSpacing: 1.4 },
        ]}
      >
        Imagen no disponible
      </Text>
    </View>
  );
}
