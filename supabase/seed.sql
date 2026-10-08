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

-- Mas productos para la demo (DIA 4): ayudan a que haya subastas en paralelo
insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
select 'Audifonos Pro', 'Cancelacion de ruido, estuche de carga', 200, 200, 20, now(), now() + interval '3 hours', 'activa', 32.4501, -114.7601
where not exists (select 1 from public.productos where nombre = 'Audifonos Pro');

insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
select 'Bocina Gigante', 'Para fiestas, bateria de 8 horas', 350, 350, 25, now(), now() + interval '5 hours', 'activa', 32.4702, -114.7702
where not exists (select 1 from public.productos where nombre = 'Bocina Gigante');

insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
select 'Laptop Gamer', 'RTX 4060, 16 GB RAM, seminueva', 1200, 1200, 100, now() + interval '2 days', now() + interval '4 days', 'programada', 32.5003, -114.7503
where not exists (select 1 from public.productos where nombre = 'Laptop Gamer');
