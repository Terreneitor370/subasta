-- Datos de prueba. Despues de registrar tu usuario en la app, hazte admin:
--   update public.usuarios set rol = 'admin' where correo = 'tu@correo.com';
insert into public.productos (nombre, descripcion, precio_inicial, precio_actual, incremento_minimo, fecha_inicio, fecha_fin, estado, latitud, longitud)
values
  ('Audifonos inalambricos', 'Nuevos, en caja', 100, 100, 10, now(), now() + interval '30 minutes', 'activa', 32.4561, -114.7719),
  ('Bocina portatil', 'Resistente al agua', 150, 150, 15, now(), now() + interval '2 hours', 'activa', 32.4600, -114.7800),
  ('Smartwatch', 'Seminuevo', 300, 300, 25, now() + interval '1 day', now() + interval '2 days', 'programada', 32.6245, -115.4523);
