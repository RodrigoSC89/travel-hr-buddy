// Deno Edge Function: log-incident
// Recebe {module, severity, message, metadata?, timestamp?} e grava em public.incidents
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { module, severity, message, metadata = {}, timestamp = new Date().toISOString() } = await req.json();
    
    if (!module || !severity || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const { error } = await supabase.from("incidents").insert({
      module,
      severity,
      message,
      metadata,
      timestamp
    });

    if (error) throw error;

    return new Response(JSON.stringify({ status: "ok" }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), { status: 500 });
  }
});
