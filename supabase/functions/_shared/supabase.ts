import { createClient } from "npm:@supabase/supabase-js@2";

// Cliente con service_role: SOLO existe en Edge Functions, nunca en la app.
export const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
