import { Image } from "expo-image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { colores, numero, tipografia, ui } from "../lib/ui";
import { Icono } from "./Icono";
import { VisorFoto } from "./VisorFoto";

export function Marca({
  clara = false,
  compacta = false,
}: {
  clara?: boolean;
  compacta?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: tipografia.editorial,
          fontSize: compacta ? 24 : 38,
          fontWeight: "800",
          letterSpacing: -0.5,
          color: clara ? colores.blanco : colores.texto,
        }}
      >
        SUBAST<Text style={{ color: colores.acento }}>A</Text>
      </Text>
    </View>
  );
}

export function Encabezado({
  ceja,
  titulo,
  detalle,
  children,
  catalogo = false,
}: {
  ceja: string;
  titulo: string;
  detalle?: string;
  children?: ReactNode;
  catalogo?: boolean;
}) {
  return (
    <View style={{ marginHorizontal: -16, marginTop: -16 }}>
    <View style={[ui.cabecera, { gap: 12, paddingBottom: catalogo ? 18 : 24 }]}>
      <View pointerEvents="none" style={ui.acentoCabecera} />
      <Marca clara compacta={!catalogo} />
      {!catalogo && <>
      <Text style={[ui.titulo, { color: colores.blanco }]}>{titulo}</Text>
      {detalle && <Text style={ui.heroTexto}>{detalle}</Text>}
      {children}
      </>}
    </View>
    {catalogo && <View style={{ gap: 12, padding: 16, backgroundColor: colores.fondo }}>
      <Text style={ui.titulo}>{titulo}</Text>
      {detalle && <Text style={ui.texto}>{detalle}</Text>}
      {children}
    </View>}
    </View>
  );
}

/** Presenta únicamente el precio y el cierre que ya recibe la pantalla. */
export function PanelOferta({ precio, cierre, tiempo, etiqueta = "Cierra" }: {
  precio: number; cierre: string; tiempo?: string; etiqueta?: string;
}) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", borderRadius: 12, overflow: "hidden" }}>
    <View style={{ flexGrow: 1, flexBasis: 130, minWidth: 130, backgroundColor: colores.primario, padding: 12, gap: 4 }}>
      <Text style={[ui.etiqueta, { color: colores.blanco }]}>Oferta actual</Text>
      <Text style={[ui.cifra, { color: colores.blanco, fontSize: 32, lineHeight: 40 }]}>{numero(precio)} <Text style={{ fontFamily: tipografia.interfaz, fontSize: 12 }}>créditos</Text></Text>
    </View>
    <View style={{ flexGrow: 1, flexBasis: 130, minWidth: 130, backgroundColor: colores.acento, padding: 12, gap: 4 }}>
      <Text style={[ui.etiqueta, { color: colores.oscuro }]}>{etiqueta}</Text>
      <Text style={[tiempo ? ui.cifra : ui.secundario, { color: colores.oscuro, fontWeight: "700", fontSize: tiempo ? 24 : 14, lineHeight: tiempo ? 40 : 22 }]}>{tiempo ?? cierre}</Text>
    </View>
  </View>;
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
              borderRadius: 12,
              backgroundColor: colores.suave,
            }}
            contentFit="cover"
            accessibilityLabel={nombre}
            onError={() => setFallo(true)}
          />
          {!compacto && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                backgroundColor: "#102A43D9",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 11, color: "white", fontWeight: "600" }}>
                Ampliar foto
              </Text>
            </View>
          )}
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
        borderRadius: 12,
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
