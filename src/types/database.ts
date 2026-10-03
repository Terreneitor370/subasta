// ARCHIVO GENERADO. No editar a mano: ejecutar `npm run db:types` despues de cada migracion.
// Version inicial escrita a mano para poder compilar antes de enlazar el proyecto de Supabase.

export type EstadoSubasta = "programada" | "activa" | "finalizada" | "cancelada";
export type MetodoOferta = "normal" | "rapida_agitar";

type Tabla<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  creditos: number;
  creditos_reservados: number;
  rol: "usuario" | "admin";
  push_token: string | null;
  creado_en: string;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio_inicial: number;
  precio_actual: number;
  incremento_minimo: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoSubasta;
  lider_id: string | null;
  latitud: number | null;
  longitud: number | null;
  aviso_10min_enviado: boolean;
  aviso_final_enviado: boolean;
  creado_por: string | null;
  creado_en: string;
};

export type Oferta = {
  id: string;
  usuario_id: string;
  producto_id: string;
  monto: number;
  metodo: MetodoOferta;
  latitud: number | null;
  longitud: number | null;
  fecha: string;
};

export type Transaccion = {
  id: string;
  usuario_id: string;
  cantidad: number;
  tipo: "compra" | "reserva" | "liberacion" | "cargo" | "ajuste";
  referencia: string | null;
  fecha: string;
};

export type Ganador = {
  id: string;
  producto_id: string;
  usuario_id: string;
  oferta_id: string;
  monto: number;
  fecha: string;
};

export type Notificacion = {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  producto_id: string | null;
  leida: boolean;
  fecha: string;
};

export type Database = {
  public: {
    Tables: {
      usuarios: Tabla<Usuario>;
      productos: Tabla<Producto, Partial<Producto> & Pick<Producto, "nombre" | "precio_inicial" | "precio_actual" | "fecha_fin">>;
      ofertas: Tabla<Oferta>;
      transacciones: Tabla<Transaccion>;
      ganadores: Tabla<Ganador>;
      notificaciones: Tabla<Notificacion>;
    };
    Views: Record<string, never>;
    Functions: {
      realizar_oferta: {
        Args: {
          p_producto_id: string;
          p_monto: number;
          p_latitud?: number | null;
          p_longitud?: number | null;
          p_metodo?: MetodoOferta;
        };
        Returns: { oferta_id: string; precio_actual: number; lider_anterior: string | null };
      };
      cancelar_subasta: { Args: { p_producto_id: string }; Returns: undefined };
      hora_servidor: { Args: Record<string, never>; Returns: string };
      es_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
