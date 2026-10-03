-- Programa la Edge Function tick-subastas cada minuto.
-- NO es migracion porque contiene secretos: ejecutar UNA vez en
-- Supabase Dashboard > SQL Editor, reemplazando <PROJECT_REF> y <CRON_SECRET>.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'tick-subastas',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/tick-subastas',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "<CRON_SECRET>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

-- Para detenerlo: select cron.unschedule('tick-subastas');
