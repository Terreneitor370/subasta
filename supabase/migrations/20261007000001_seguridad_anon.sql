-- =====================================================================
-- Dia 5 - Seguridad: apagar la llave de 'anon'
-- Responsable: Integrante 2 (Backend y BD)
-- Aplicar con: npx supabase db push
--
-- La app siempre exige iniciar sesion (rol 'authenticated'); por eso el
-- rol 'anon' (cualquiera sin cuenta) no debe poder tocar tablas,
-- secuencias ni funciones. RLS protege filas, pero las funciones
-- 'security definer' atraviesan el RLS, asi que anon no debe poder
-- ejecutarlas. No se revoca USAGE del schema (necesario para auth,
-- storage y PostgREST). El rol 'authenticated' conserva sus permisos.
-- =====================================================================

revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

-- Asegurar explicitamente lo que la app usa con sesion (patron: solo
-- authenticated, nunca public/anon). Es belt-and-suspenders: tanto
-- realizar_oferta como cancelar_subasta ya estaban limitados en la
-- migracion base; aqui refinamos los helpers.
revoke execute on function public.hora_servidor()          from public, anon;
revoke execute on function public.es_admin()               from public, anon;
revoke execute on function public.crear_perfil_usuario()   from public, anon;

grant execute on function public.hora_servidor() to authenticated;
grant execute on function public.es_admin()      to authenticated;

-- Verificacion:
--   select rolname, privilege_type, table_name
--   from information_schema.role_table_grants
--   where table_schema = 'public' and grantee = 'anon';
--   -> no debe devolver filas.