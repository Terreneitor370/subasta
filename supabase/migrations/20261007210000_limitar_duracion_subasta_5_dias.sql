-- Limita la duracion maxima de una subasta a 5 dias.
-- Ajusta registros existentes que excedan ese limite para evitar errores al ofertar.
update public.productos
set fecha_fin = fecha_inicio + interval '5 days'
where fecha_fin > fecha_inicio + interval '5 days';

alter table public.productos
drop constraint if exists fechas_validas;

alter table public.productos
add constraint fechas_validas check (
  fecha_fin > fecha_inicio
  and fecha_fin <= fecha_inicio + interval '5 days'
);
