import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Fetching auditorias list...");

    // Fetch auditorias from auditorias_imca table
    const { data: auditorias, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching auditorias:", error);
      throw error;
    }

    // Map data to expected format
    const formattedAuditorias = auditorias?.map((auditoria: any) => ({
      id: auditoria.id,
      navio: auditoria.navio || "N/A",
      data: auditoria.data || auditoria.audit_date || auditoria.created_at,
      norma: auditoria.norma || "N/A",
      item_auditado: auditoria.item_auditado || auditoria.title || "N/A",
      resultado: auditoria.resultado || "Observação",
      comentarios: auditoria.comentarios || auditoria.description || "",
    })) || [];

    console.log(`Successfully fetched ${formattedAuditorias.length} auditorias`);

    return new Response(
      JSON.stringify(formattedAuditorias),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in auditorias-list function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
