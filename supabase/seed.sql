-- Datos de prueba. Idempotente: puede ejecutarse varias veces sin duplicar productos.
-- Despues de registrar tu usuario en la app, hazte admin:
--   update public.usuarios set rol = 'admin' where correo = 'tu@correo.com';

insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
select 'Audifonos inalambricos', 'Nuevos, en caja', 100, 100, 10, now(), now() + interval '30 minutes', 'activa', 32.4561, -114.7719
where not exists (select 1 from public.productos where nombre = 'Audifonos inalambricos');

insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
select 'Bocina portatil', 'Resistente al agua', 150, 150, 15, now(), now() + interval '2 hours', 'activa', 32.4600, -114.7800
where not exists (select 1 from public.productos where nombre = 'Bocina portatil');

insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
select 'Smartwatch', 'Seminuevo', 300, 300, 25, now() + interval '1 day', now() + interval '2 days', 'programada', 32.6245, -115.4523
where not exists (select 1 from public.productos where nombre = 'Smartwatch');
