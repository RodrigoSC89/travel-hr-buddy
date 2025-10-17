import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DPIncident {
  id: string;
  title: string;
  vessel: string;
  plan_of_action: string;
  plan_sent_to: string;
  plan_sent_at: string;
  plan_status: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all pending incidents that have been sent to someone
    const { data: incidents, error } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("plan_status", "pendente")
      .not("plan_sent_to", "is", null)
      .not("plan_of_action", "is", null);

    if (error) {
      console.error("Error fetching incidents:", error);
      throw new Error(`Failed to fetch incidents: ${error.message}`);
    }

    if (!incidents || incidents.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhum plano pendente encontrado",
          count: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    const toResend: DPIncident[] = [];

    // Filter incidents where plan_sent_at is >= 7 days ago
    for (const incident of incidents) {
      if (incident.plan_sent_at) {
        const sentDate = new Date(incident.plan_sent_at);
        const diffDays = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 7) {
          toResend.push(incident as DPIncident);
        }
      }
    }

    if (toResend.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhum plano pendente com mais de 7 dias encontrado",
          total_pending: incidents.length,
          count: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Resend emails for pending plans
    const resendResults = [];
    
    for (const incident of toResend) {
      try {
        // Only attempt to send email if Resend API key is configured
        if (resendApiKey) {
          const subject = `⏰ Lembrete: Plano de Ação Pendente (Navio: ${incident.vessel})`;
          
          const html = `
            <h1>Plano de Ação Gerado por IA</h1>
            <p><strong>Incidente:</strong> ${incident.title}</p>
            <p><strong>Navio:</strong> ${incident.vessel}</p>
            <p>O plano de ação ainda não foi executado. Veja novamente abaixo:</p>
            <pre style="background:#f9f9f9;padding:10px;border-radius:5px;white-space:pre-wrap;">${incident.plan_of_action}</pre>
            <p>Atualize o status diretamente no painel do Nautilus One.</p>
          `;

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Nautilus One <nautilus@suasistema.com>",
              to: incident.plan_sent_to,
              subject,
              html,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email for incident ${incident.id}:`, errorText);
            resendResults.push({ 
              id: incident.id, 
              success: false, 
              error: `Email failed: ${errorText}` 
            });
            continue;
          }
        }

        // Update plan_sent_at to current time
        const { error: updateError } = await supabase
          .from("dp_incidents")
          .update({ plan_sent_at: now.toISOString() })
          .eq("id", incident.id);

        if (updateError) {
          console.error(`Failed to update incident ${incident.id}:`, updateError);
          resendResults.push({ 
            id: incident.id, 
            success: false, 
            error: `Update failed: ${updateError.message}` 
          });
        } else {
          resendResults.push({ id: incident.id, success: true });
        }
      } catch (error) {
        console.error(`Error processing incident ${incident.id}:`, error);
        resendResults.push({ 
          id: incident.id, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    const successCount = resendResults.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        message: `Processados ${toResend.length} planos pendentes`,
        resent_count: successCount,
        failed_count: toResend.length - successCount,
        results: resendResults,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in resend_pending_plans:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to resend pending plans",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
