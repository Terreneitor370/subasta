export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ganadores: {
        Row: {
          fecha: string
          id: string
          monto: number
          oferta_id: string
          producto_id: string
          usuario_id: string
        }
        Insert: {
          fecha?: string
          id?: string
          monto: number
          oferta_id: string
          producto_id: string
          usuario_id: string
        }
        Update: {
          fecha?: string
          id?: string
          monto?: number
          oferta_id?: string
          producto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ganadores_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganadores_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: true
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganadores_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          cuerpo: string
          fecha: string
          id: string
          leida: boolean
          producto_id: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          cuerpo: string
          fecha?: string
          id?: string
          leida?: boolean
          producto_id?: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          cuerpo?: string
          fecha?: string
          id?: string
          leida?: boolean
          producto_id?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas: {
        Row: {
          fecha: string
          id: string
          latitud: number | null
          longitud: number | null
          metodo: Database["public"]["Enums"]["metodo_oferta"]
          monto: number
          producto_id: string
          usuario_id: string
        }
        Insert: {
          fecha?: string
          id?: string
          latitud?: number | null
          longitud?: number | null
          metodo?: Database["public"]["Enums"]["metodo_oferta"]
          monto: number
          producto_id: string
          usuario_id: string
        }
        Update: {
          fecha?: string
          id?: string
          latitud?: number | null
          longitud?: number | null
          metodo?: Database["public"]["Enums"]["metodo_oferta"]
          monto?: number
          producto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          aviso_10min_enviado: boolean
          aviso_final_enviado: boolean
          creado_en: string
          creado_por: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_subasta"]
          fecha_fin: string
          fecha_inicio: string
          id: string
          imagen_url: string | null
          incremento_minimo: number
          latitud: number | null
          lider_id: string | null
          longitud: number | null
          nombre: string
          precio_actual: number
          precio_inicial: number
        }
        Insert: {
          aviso_10min_enviado?: boolean
          aviso_final_enviado?: boolean
          creado_en?: string
          creado_por?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_subasta"]
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          imagen_url?: string | null
          incremento_minimo?: number
          latitud?: number | null
          lider_id?: string | null
          longitud?: number | null
          nombre: string
          precio_actual: number
          precio_inicial: number
        }
        Update: {
          aviso_10min_enviado?: boolean
          aviso_final_enviado?: boolean
          creado_en?: string
          creado_por?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_subasta"]
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          imagen_url?: string | null
          incremento_minimo?: number
          latitud?: number | null
          lider_id?: string | null
          longitud?: number | null
          nombre?: string
          precio_actual?: number
          precio_inicial?: number
        }
        Relationships: [
          {
            foreignKeyName: "productos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones: {
        Row: {
          cantidad: number
          fecha: string
          id: string
          referencia: string | null
          tipo: Database["public"]["Enums"]["tipo_transaccion"]
          usuario_id: string
        }
        Insert: {
          cantidad: number
          fecha?: string
          id?: string
          referencia?: string | null
          tipo: Database["public"]["Enums"]["tipo_transaccion"]
          usuario_id: string
        }
        Update: {
          cantidad?: number
          fecha?: string
          id?: string
          referencia?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transaccion"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          correo: string
          creado_en: string
          creditos: number
          creditos_reservados: number
          id: string
          nombre: string
          push_token: string | null
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          correo: string
          creado_en?: string
          creditos?: number
          creditos_reservados?: number
          id: string
          nombre: string
          push_token?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          correo?: string
          creado_en?: string
          creditos?: number
          creditos_reservados?: number
          id?: string
          nombre?: string
          push_token?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acreditar_compra: {
        Args: { p_creditos: number; p_referencia: string; p_usuario_id: string }
        Returns: undefined
      }
      cancelar_subasta: { Args: { p_producto_id: string }; Returns: undefined }
      es_admin: { Args: never; Returns: boolean }
      hora_servidor: { Args: never; Returns: string }
      realizar_oferta: {
        Args: {
          p_latitud?: number
          p_longitud?: number
          p_metodo?: Database["public"]["Enums"]["metodo_oferta"]
          p_monto: number
          p_producto_id: string
        }
        Returns: Json
      }
      tick_subastas: {
        Args: never
        Returns: {
          ganador_id: string
          monto: number
          nombre: string
          producto_id: string
        }[]
      }
    }
    Enums: {
      estado_subasta: "programada" | "activa" | "finalizada" | "cancelada"
      metodo_oferta: "normal" | "rapida_agitar"
      rol_usuario: "usuario" | "admin"
      tipo_transaccion: "compra" | "reserva" | "liberacion" | "cargo" | "ajuste"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estado_subasta: ["programada", "activa", "finalizada", "cancelada"],
      metodo_oferta: ["normal", "rapida_agitar"],
      rol_usuario: ["usuario", "admin"],
      tipo_transaccion: ["compra", "reserva", "liberacion", "cargo", "ajuste"],
    },
  },
} as const
