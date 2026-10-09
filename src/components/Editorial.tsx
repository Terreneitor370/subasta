import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { colores, tipografia, ui } from "../lib/ui";
import { Icono } from "./Icono";
import { VisorFoto } from "./VisorFoto";

export function Marca() {
  return (
    <View style={{ gap: 12, paddingVertical: 12, alignItems: "center" }}>
      <Icono nombre="subastas" color={colores.oscuro} size={48} />
      <Text
        style={{
          fontFamily: tipografia.editorial,
          fontSize: 24,
          fontWeight: "700",
          letterSpacing: 3,
          color: colores.texto,
        }}
      >
        SUBASTA
      </Text>
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
      <Text style={ui.titulo}>{titulo}</Text>
      {detalle && <Text style={ui.secundario}>{detalle}</Text>}
    </View>
  );
}

export function ImagenProducto({
  uri,
  nombre,
  alto = 180,
  compacto = false,
}: {
  uri?: string | null;
  nombre: string;
  alto?: number;
  compacto?: boolean;
}) {
  const [fallo, setFallo] = useState(false);
  const [ampliada, setAmpliada] = useState(false);
  useEffect(() => {
    setFallo(false);
    setAmpliada(false);
  }, [uri]);
  if (uri && !fallo) {
    return (
      <>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ampliar foto de ${nombre}`}
          accessibilityHint="Abre la foto completa con controles de zoom"
          onPress={(evento) => {
            evento.stopPropagation();
            setAmpliada(true);
          }}
        >
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
        </Pressable>
        {ampliada && (
          <VisorFoto
            uri={uri}
            nombre={nombre}
            cerrar={() => setAmpliada(false)}
          />
        )}
      </>
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
      <Icono nombre="camara" color={colores.gris} size={36} />
      {!compacto && (
        <Text
          style={[
            ui.ceja,
            { color: colores.gris, fontSize: 11, letterSpacing: 1.4 },
          ]}
        >
          Imagen no disponible
        </Text>
      )}
    </View>
  );
}
