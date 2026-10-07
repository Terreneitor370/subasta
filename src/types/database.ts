// Fachada de tipos de la base de datos.
// database.gen.ts lo genera `npm run db:types` (nunca se edita a mano);
// este archivo es estable y no cambia al regenerar, por eso la app importa de aqui.
export * from "./database.gen";

import type { Database } from "./database.gen";

export type Usuario = Database["public"]["Tables"]["usuarios"]["Row"];
export type Producto = Database["public"]["Tables"]["productos"]["Row"];
export type Oferta = Database["public"]["Tables"]["ofertas"]["Row"];
export type Transaccion = Database["public"]["Tables"]["transacciones"]["Row"];
export type Ganador = Database["public"]["Tables"]["ganadores"]["Row"];
export type Notificacion = Database["public"]["Tables"]["notificaciones"]["Row"];

export type ProductoInsert = Database["public"]["Tables"]["productos"]["Insert"];

export type EstadoSubasta = Database["public"]["Enums"]["estado_subasta"];
export type MetodoOferta = Database["public"]["Enums"]["metodo_oferta"];
export type RolUsuario = Database["public"]["Enums"]["rol_usuario"];
export type TipoTransaccion = Database["public"]["Enums"]["tipo_transaccion"];
