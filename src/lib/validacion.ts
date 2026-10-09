// Validaciones de interfaz compatibles con los campos enteros existentes.
export const MAXIMO_CREDITOS = 2_147_483_647;
export function enteroPositivo(
  texto: string,
  maximo = MAXIMO_CREDITOS,
): number | null {
  const limpio = texto.trim();
  if (!/^\d+$/.test(limpio)) return null;
  const valor = Number(limpio);
  return Number.isSafeInteger(valor) && valor > 0 && valor <= maximo
    ? valor
    : null;
}
export type DatosNuevaSubasta = {
  nombre: string;
  descripcion: string;
  precio: string;
  incremento: string;
  minutos: string;
};
export function validarNuevaSubasta(datos: DatosNuevaSubasta) {
  const errores: Partial<Record<keyof DatosNuevaSubasta, string>> = {};
  const nombre = datos.nombre.trim();
  if (nombre.length < 2 || nombre.length > 120)
    errores.nombre = "Escribe un nombre de 2 a 120 caracteres.";
  if (datos.descripcion.trim().length > 2000)
    errores.descripcion = "La descripción admite hasta 2000 caracteres.";
  const precio = enteroPositivo(datos.precio);
  const incremento = enteroPositivo(datos.incremento);
  const minutos = enteroPositivo(datos.minutos, 7200);
  if (precio === null)
    errores.precio =
      "Escribe un precio entero mayor que cero y no mayor que 2,147,483,647.";
  if (incremento === null)
    errores.incremento = "Escribe un incremento entero mayor que cero.";
  else if (precio !== null && precio + incremento > MAXIMO_CREDITOS)
    errores.incremento =
      "El precio más el incremento supera el límite permitido.";
  if (minutos === null)
    errores.minutos =
      "Escribe una duración entera de 1 a 7200 minutos (máximo 5 días).";
  return errores;
}
