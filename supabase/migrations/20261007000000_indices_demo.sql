-- =====================================================================
-- Dia 4 - Indices para las consultas mas frecuentes de la app
-- Responsable: Integrante 2 (Backend y BD)
-- Aplicar con: npx supabase db push
-- =====================================================================

-- "Mis ganados": ganadores del usuario que ve (fecha, usuario)
create index ganadores_usuario_idx
  on public.ganadores (usuario_id, fecha desc);

-- Bitacora de creditos por usuario (perfil / auditoria)
create index transacciones_usuario_idx
  on public.transacciones (usuario_id, fecha desc);

-- tick_subastas(): buscar la oferta ganadora de un producto para un usuario
create index ofertas_tick_idx
  on public.ofertas (producto_id, usuario_id);

-- Panel admin: listar productos por fecha de creacion (mas nuevos primero)
create index productos_creado_idx
  on public.productos (creado_en desc);