import { launchImageLibraryAsync } from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

/** El selector del sistema da acceso solo a la foto elegida; no solicita GPS. */
export async function elegirFotoGaleria(): Promise<string | null> {
  const resultado = await launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    allowsEditing: false,
    quality: 0.8,
    exif: false,
  });
  if (resultado.canceled) return null;
  const foto = resultado.assets[0];
  if (!foto?.uri) throw new Error("No se pudo leer la foto seleccionada.");
  // El cargador existente usa JPEG; normalizamos también PNG y HEIC de la galería.
  const contexto = ImageManipulator.manipulate(foto.uri);
  try {
    if (Math.max(foto.width, foto.height) > 2048)
      contexto.resize(
        foto.width >= foto.height ? { width: 2048 } : { height: 2048 },
      );
    const imagen = await contexto.renderAsync();
    try {
      return (
        await imagen.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 })
      ).uri;
    } finally {
      imagen.release();
    }
  } finally {
    contexto.release();
  }
}
