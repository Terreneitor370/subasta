-- =====================================================================
-- App de Subastas - Esquema inicial
-- Responsable: Integrante 2 (Backend y BD)
-- Aplicar con: npx supabase db push
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type rol_usuario as enum ('usuario', 'admin');
create type estado_subasta as enum ('programada', 'activa', 'finalizada', 'cancelada');
create type tipo_transaccion as enum ('compra', 'reserva', 'liberacion', 'cargo', 'ajuste');
create type metodo_oferta as enum ('normal', 'rapida_agitar');

-- ---------------------------------------------------------------------
-- Usuarios (perfil). La contrasena vive en auth.users (Supabase Auth),
-- nunca en esta tabla.
-- ---------------------------------------------------------------------
create table public.usuarios (
  id                   uuid primary key references auth.users (id) on delete cascade,
  nombre               text not null,
  correo               text not null unique,
  creditos             integer not null default 0 check (creditos >= 0),            -- disponibles
  creditos_reservados  integer not null default 0 check (creditos_reservados >= 0), -- comprometidos en ofertas lideres
  rol                  rol_usuario not null default 'usuario',
  push_token           text,
  creado_en            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Productos en subasta
-- ---------------------------------------------------------------------
create table public.productos (
  id                   uuid primary key default gen_random_uuid(),
  nombre               text not null,
  descripcion          text,
  imagen_url           text,
  precio_inicial       integer not null check (precio_inicial > 0),   -- en creditos
  precio_actual        integer not null,
  incremento_minimo    integer not null default 10 check (incremento_minimo > 0),
  fecha_inicio         timestamptz not null default now(),
  fecha_fin            timestamptz not null,
  estado               estado_subasta not null default 'programada',
  lider_id             uuid references public.usuarios (id),          -- usuario con la oferta mas alta
  latitud              double precision,                              -- para "subastas cercanas"
  longitud             double precision,
  aviso_10min_enviado  boolean not null default false,
  aviso_final_enviado  boolean not null default false,
  creado_por           uuid references public.usuarios (id),
  creado_en            timestamptz not null default now(),
  constraint fechas_validas check (fecha_fin > fecha_inicio)
);
create index productos_estado_fin_idx on public.productos (estado, fecha_fin);

-- ---------------------------------------------------------------------
-- Ofertas
-- ---------------------------------------------------------------------
create table public.ofertas (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid not null references public.usuarios (id),
  producto_id  uuid not null references public.productos (id) on delete cascade,
  monto        integer not null check (monto > 0),
  metodo       metodo_oferta not null default 'normal',
  latitud      double precision,
  longitud     double precision,
  fecha        timestamptz not null default now()
);
create index ofertas_producto_idx on public.ofertas (producto_id, monto desc);
create index ofertas_usuario_idx on public.ofertas (usuario_id, fecha desc);

-- ---------------------------------------------------------------------
-- Transacciones de creditos (bitacora; el saldo vive en usuarios)
-- ---------------------------------------------------------------------
create table public.transacciones (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null references public.usuarios (id),
  cantidad      integer not null,           -- positivo suma, negativo resta
  tipo          tipo_transaccion not null,
  referencia    text,                       -- id de PaymentIntent, oferta o producto
  fecha         timestamptz not null default now()
);
-- Evita acreditar dos veces el mismo pago (reintentos del webhook)
create unique index transacciones_compra_unica on public.transacciones (referencia) where tipo = 'compra';

-- ---------------------------------------------------------------------
-- Ganadores
-- ---------------------------------------------------------------------
create table public.ganadores (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid not null unique references public.productos (id) on delete cascade,
  usuario_id   uuid not null references public.usuarios (id),
  oferta_id    uuid not null references public.ofertas (id),
  monto        integer not null,
  fecha        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Notificaciones (bandeja dentro de la app; respaldo si el push no llega)
-- ---------------------------------------------------------------------
create table public.notificaciones (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.usuarios (id) on delete cascade,
  tipo        text not null,   -- superada, termina_10min, por_terminar, ganaste, perdiste
  titulo      text not null,
  cuerpo      text not null,
  producto_id uuid references public.productos (id) on delete cascade,
  leida       boolean not null default false,
  fecha       timestamptz not null default now()
);
create index notificaciones_usuario_idx on public.notificaciones (usuario_id, fecha desc);

-- =====================================================================
-- Funciones
-- =====================================================================

-- Crea el perfil automaticamente al registrarse en Supabase Auth
create or replace function public.crear_perfil_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.usuarios (id, nombre, correo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)), new.email);
  return new;
end $$;

create trigger al_registrar_usuario
after insert on auth.users
for each row execute function public.crear_perfil_usuario();

-- Helper: es admin el usuario actual
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and rol = 'admin');
$$;

-- Hora del servidor (la app calcula el desfase del reloj para el temporizador)
create or replace function public.hora_servidor()
returns timestamptz language sql stable as $$ select now(); $$;

-- ---------------------------------------------------------------------
-- realizar_oferta: UNICA via para ofertar. Atomica y segura ante
-- ofertas simultaneas (bloquea la fila del producto con FOR UPDATE).
--  - Valida subasta activa, monto minimo y creditos suficientes.
--  - Reserva los creditos del nuevo lider y libera los del lider anterior.
--  - Devuelve el lider anterior para notificar "superaron tu oferta".
-- ---------------------------------------------------------------------
create or replace function public.realizar_oferta(
  p_producto_id uuid,
  p_monto       integer,
  p_latitud     double precision default null,
  p_longitud    double precision default null,
  p_metodo      metodo_oferta default 'normal'
)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_prod      public.productos%rowtype;
  v_oferta_id uuid;
  v_previo    integer := 0;  -- lo que el mismo usuario ya tenia reservado en esta subasta
  v_lider_ant uuid;
begin
  if v_uid is null then raise exception 'NO_AUTENTICADO'; end if;

  select * into v_prod from public.productos where id = p_producto_id for update;
  if not found then raise exception 'SUBASTA_NO_EXISTE'; end if;
  if v_prod.estado <> 'activa' or now() >= v_prod.fecha_fin then raise exception 'SUBASTA_NO_ACTIVA'; end if;

  -- Primera oferta puede ser igual al precio inicial; las siguientes deben superar por el incremento
  if v_prod.lider_id is null then
    if p_monto < v_prod.precio_inicial then raise exception 'MONTO_INSUFICIENTE'; end if;
  elsif p_monto < v_prod.precio_actual + v_prod.incremento_minimo then
    raise exception 'MONTO_INSUFICIENTE';
  end if;

  v_lider_ant := v_prod.lider_id;

  -- Si el usuario ya era lider, solo se reserva la diferencia
  if v_lider_ant = v_uid then v_previo := v_prod.precio_actual; end if;

  -- Reservar creditos del ofertante (falla si no alcanzan)
  update public.usuarios
     set creditos = creditos - (p_monto - v_previo),
         creditos_reservados = creditos_reservados + (p_monto - v_previo)
   where id = v_uid and creditos >= (p_monto - v_previo);
  if not found then raise exception 'CREDITOS_INSUFICIENTES'; end if;

  insert into public.transacciones (usuario_id, cantidad, tipo, referencia)
  values (v_uid, -(p_monto - v_previo), 'reserva', p_producto_id::text);

  -- Liberar creditos del lider anterior (si es otra persona)
  if v_lider_ant is not null and v_lider_ant <> v_uid then
    update public.usuarios
       set creditos = creditos + v_prod.precio_actual,
           creditos_reservados = creditos_reservados - v_prod.precio_actual
     where id = v_lider_ant;
    insert into public.transacciones (usuario_id, cantidad, tipo, referencia)
    values (v_lider_ant, v_prod.precio_actual, 'liberacion', p_producto_id::text);
  end if;

  insert into public.ofertas (usuario_id, producto_id, monto, metodo, latitud, longitud)
  values (v_uid, p_producto_id, p_monto, p_metodo, p_latitud, p_longitud)
  returning id into v_oferta_id;

  -- Este UPDATE es el que escuchan los demas usuarios por Realtime
  update public.productos
     set precio_actual = p_monto, lider_id = v_uid
   where id = p_producto_id;

  return json_build_object(
    'oferta_id', v_oferta_id,
    'precio_actual', p_monto,
    'lider_anterior', case when v_lider_ant <> v_uid then v_lider_ant end
  );
end $$;

-- ---------------------------------------------------------------------
-- acreditar_compra: la llama SOLO el webhook de pagos (service_role).
-- Idempotente gracias al indice unico de referencia.
-- ---------------------------------------------------------------------
create or replace function public.acreditar_compra(p_usuario_id uuid, p_creditos integer, p_referencia text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.transacciones (usuario_id, cantidad, tipo, referencia)
  values (p_usuario_id, p_creditos, 'compra', p_referencia);
  update public.usuarios set creditos = creditos + p_creditos where id = p_usuario_id;
exception when unique_violation then
  null; -- pago ya acreditado
end $$;

-- ---------------------------------------------------------------------
-- tick_subastas: la ejecuta la Edge Function tick-subastas cada minuto.
-- Activa subastas programadas y cierra las vencidas eligiendo ganador.
-- Devuelve las subastas cerradas para enviar push de ganaste/perdiste.
-- ---------------------------------------------------------------------
create or replace function public.tick_subastas()
returns table (producto_id uuid, nombre text, ganador_id uuid, monto integer)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  r record;
  v_oferta uuid;
begin
  update public.productos set estado = 'activa'
   where estado = 'programada' and fecha_inicio <= now();

  for r in
    select * from public.productos
     where estado = 'activa' and fecha_fin <= now()
     for update skip locked
  loop
    update public.productos set estado = 'finalizada' where id = r.id;

    if r.lider_id is not null then
      select id into v_oferta from public.ofertas
       where producto_id = r.id and usuario_id = r.lider_id
       order by monto desc limit 1;

      insert into public.ganadores (producto_id, usuario_id, oferta_id, monto)
      values (r.id, r.lider_id, v_oferta, r.precio_actual);

      -- Los creditos reservados del ganador se convierten en cargo definitivo.
      -- (ya se descontaron al reservar; la transaccion 'cargo' es solo registro)
      update public.usuarios set creditos_reservados = creditos_reservados - r.precio_actual
       where id = r.lider_id;
      insert into public.transacciones (usuario_id, cantidad, tipo, referencia)
      values (r.lider_id, 0, 'cargo', r.id::text);
    end if;

    producto_id := r.id; nombre := r.nombre; ganador_id := r.lider_id; monto := r.precio_actual;
    return next;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- cancelar_subasta: solo admin. Devuelve los creditos reservados al lider.
-- ---------------------------------------------------------------------
create or replace function public.cancelar_subasta(p_producto_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_prod public.productos%rowtype;
begin
  if not public.es_admin() then raise exception 'SOLO_ADMIN'; end if;
  select * into v_prod from public.productos where id = p_producto_id for update;
  if v_prod.estado not in ('programada', 'activa') then raise exception 'SUBASTA_NO_ACTIVA'; end if;

  if v_prod.lider_id is not null then
    update public.usuarios
       set creditos = creditos + v_prod.precio_actual,
           creditos_reservados = creditos_reservados - v_prod.precio_actual
     where id = v_prod.lider_id;
    insert into public.transacciones (usuario_id, cantidad, tipo, referencia)
    values (v_prod.lider_id, v_prod.precio_actual, 'liberacion', p_producto_id::text);
  end if;

  update public.productos set estado = 'cancelada' where id = p_producto_id;
end $$;

-- =====================================================================
-- Seguridad: Row Level Security
-- Regla general: la app LEE directo de las tablas, pero ESCRIBE dinero,
-- ofertas y ganadores solo mediante funciones (RPC / Edge Functions).
-- =====================================================================
alter table public.usuarios       enable row level security;
alter table public.productos      enable row level security;
alter table public.ofertas        enable row level security;
alter table public.transacciones  enable row level security;
alter table public.ganadores      enable row level security;
alter table public.notificaciones enable row level security;

-- usuarios: cada quien ve su perfil; el admin ve todos
create policy "perfil propio" on public.usuarios for select using (id = auth.uid() or public.es_admin());
-- Solo puede cambiar nombre y push_token (ver grant de columnas abajo)
create policy "editar perfil propio" on public.usuarios for update using (id = auth.uid());
revoke update on public.usuarios from authenticated;
grant update (nombre, push_token) on public.usuarios to authenticated;

-- productos: cualquiera autenticado consulta; solo admin crea/edita
create policy "ver productos" on public.productos for select to authenticated using (true);
create policy "admin crea productos" on public.productos for insert to authenticated with check (public.es_admin());
create policy "admin edita productos" on public.productos for update to authenticated using (public.es_admin());

-- ofertas: visibles para todos (historial de la subasta); se insertan solo via realizar_oferta()
create policy "ver ofertas" on public.ofertas for select to authenticated using (true);

-- transacciones y notificaciones: solo las propias
create policy "mis transacciones" on public.transacciones for select using (usuario_id = auth.uid() or public.es_admin());
create policy "mis notificaciones" on public.notificaciones for select using (usuario_id = auth.uid());
create policy "marcar leida" on public.notificaciones for update using (usuario_id = auth.uid());

-- ganadores: visibles para todos
create policy "ver ganadores" on public.ganadores for select to authenticated using (true);

-- Funciones expuestas a la app
revoke execute on function public.acreditar_compra(uuid, integer, text) from public, anon, authenticated;
revoke execute on function public.tick_subastas() from public, anon, authenticated;
grant execute on function public.realizar_oferta(uuid, integer, double precision, double precision, metodo_oferta) to authenticated;
grant execute on function public.cancelar_subasta(uuid) to authenticated;

-- =====================================================================
-- Realtime: publicar cambios de productos y ofertas
-- =====================================================================
alter publication supabase_realtime add table public.productos;
alter publication supabase_realtime add table public.ofertas;
alter publication supabase_realtime add table public.notificaciones;
alter publication supabase_realtime add table public.usuarios; -- saldo de creditos en vivo (RLS: solo el propio)

-- =====================================================================
-- Storage: bucket publico para fotos de productos (solo admin sube)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and public.es_admin());
create policy "fotos publicas" on storage.objects for select using (bucket_id = 'productos');
