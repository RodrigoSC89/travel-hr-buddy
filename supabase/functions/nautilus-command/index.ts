// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, action } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load real data from database for context enrichment
    let enrichedContext = context || {};
    
    try {
      const [vesselsRes, crewRes, maintenanceRes, certsRes] = await Promise.all([
        supabase.from("vessels").select("id, vessel_name, status, vessel_type").limit(20),
        supabase.from("crew_members").select("id, full_name, rank, status").limit(50),
        supabase.from("maintenance_schedules").select("id, title, status, priority, due_date").limit(30),
        supabase.from("employee_certificates").select("id, certificate_name, expiry_date").limit(30)
      ]);

      const vessels = vesselsRes.data || [];
      const crew = crewRes.data || [];
      const maintenance = maintenanceRes.data || [];
      const certs = certsRes.data || [];

      const today = new Date();
      const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      enrichedContext = {
        ...enrichedContext,
        realData: {
          vessels: {
            total: vessels.length,
            active: vessels.filter(v => v.status === "active").length,
            maintenance: vessels.filter(v => v.status === "maintenance").length,
            list: vessels.slice(0, 5)
          },
          crew: {
            total: crew.length,
            onboard: crew.filter(c => c.status === "active").length,
            onLeave: crew.filter(c => c.status === "on_leave").length
          },
          maintenance: {
            total: maintenance.length,
            overdue: maintenance.filter(m => m.status === "overdue").length,
            scheduled: maintenance.filter(m => m.status === "scheduled").length,
            critical: maintenance.filter(m => m.priority === "critical").length
          },
          certificates: {
            total: certs.length,
            expiringSoon: certs.filter(c => {
              const expiry = new Date(c.expiry_date);
              return expiry <= thirtyDays && expiry >= today;
            }).length
          }
        }
      };
    } catch (dbError) {
      console.error("Error loading context data:", dbError);
    }

    const systemPrompt = `Você é o Nautilus Command AI, o assistente inteligente central do sistema Nautilus One - uma plataforma completa de gestão marítima.

## SUAS CAPACIDADES:
1. **Análise Operacional**: Interpretar dados de frota, tripulação e manutenção
2. **Sugestões Estratégicas**: Propor ações de otimização baseadas em dados
3. **Alertas Inteligentes**: Identificar riscos e urgências
4. **Briefings Executivos**: Gerar resumos claros e acionáveis
5. **Previsões**: Antecipar necessidades de manutenção e certificações

## CONTEXTO ATUAL DO SISTEMA:
${JSON.stringify(enrichedContext, null, 2)}

## REGRAS DE RESPOSTA:
- Seja CONCISO e TÉCNICO
- Use formatação Markdown para estruturar respostas
- Destaque **alertas críticos** em negrito
- Inclua números e métricas quando disponíveis
- Sugira ações específicas e priorizadas
- Indique quando uma ação requer confirmação do usuário
- Responda em português brasileiro

## FORMATO PARA BRIEFINGS:
📊 **Status Geral**: [resumo em 1 linha]
⚠️ **Alertas**: [lista de alertas críticos]
✅ **Ações Prioritárias**: [lista numerada de ações]
📈 **Indicadores**: [KPIs principais]`;

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    console.log("AI response received, streaming to client...");

    // Log interaction asynchronously
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      supabase.from("ai_logs").insert({
        service: "nautilus-command",
        prompt_hash: btoa(messages[messages.length - 1]?.content?.slice(0, 50) || ""),
        prompt_length: JSON.stringify(messages).length,
        status: "success",
        model: "google/gemini-2.5-flash"
      }).catch(err => console.error("Log error:", err));
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in nautilus-command:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
