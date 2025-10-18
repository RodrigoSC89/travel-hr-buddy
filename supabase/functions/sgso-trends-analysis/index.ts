import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrendsRequest {
  vesselId?: string;
  startDate?: string;
  endDate?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vesselId, startDate, endDate }: TrendsRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Fetching SGSO action plans for trends analysis");

    // Build query
    let query = supabase
      .from("sgso_action_plans")
      .select(`
        *,
        dp_incidents (
          id,
          title,
          date,
          vessel,
          location,
          root_cause,
          summary
        )
      `)
      .eq("status_approval", "aprovado")
      .order("created_at", { ascending: false });

    // Apply filters
    if (vesselId) {
      query = query.eq("dp_incidents.vessel", vesselId);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: plans, error } = await query;

    if (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }

    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No approved action plans found for analysis",
          message: "Nenhum plano aprovado encontrado para análise"
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Analyzing ${plans.length} action plans`);

    // Serialize plans for AI analysis
    const serialized = plans
      .map(
        (p: any) => `
- Incidente: ${p.dp_incidents?.title || p.incident_id}
- Categoria: ${p.dp_incidents?.sgso_category || "N/A"}
- Causa raiz: ${p.dp_incidents?.sgso_root_cause || p.dp_incidents?.root_cause || "N/A"}
- Embarcação: ${p.dp_incidents?.vessel || "N/A"}
- Ação Corretiva: ${p.corrective_action}
- Ação Preventiva: ${p.preventive_action}
- Recomendação: ${p.recommendation || "N/A"}
`
      )
      .join("\n");

    const prompt = `
Você é um auditor de segurança marítima especializado em SGSO (Sistema de Gestão de Segurança Operacional) e incidentes de Dynamic Positioning (DP).

A partir dos seguintes incidentes e planos SGSO, gere uma análise estruturada em formato JSON com:

1. Top 3 categorias mais frequentes (com contagem e percentual)
2. Principais causas raiz (liste as 5 mais comuns com número de ocorrências)
3. Medidas sistêmicas sugeridas (5 recomendações preventivas)
4. Riscos emergentes detectados (3-5 riscos potenciais identificados nos dados)
5. Resumo executivo (parágrafo de 3-4 linhas)

Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "topCategories": [
    { "category": "nome da categoria", "count": número, "percentage": percentual }
  ],
  "mainRootCauses": [
    { "cause": "descrição da causa", "occurrences": número }
  ],
  "systemicMeasures": [
    "medida preventiva 1",
    "medida preventiva 2",
    ...
  ],
  "emergingRisks": [
    "risco emergente 1",
    "risco emergente 2",
    ...
  ],
  "summary": "resumo executivo em 3-4 linhas"
}

Base de dados (${plans.length} planos de ação):
${serialized}
`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse JSON response
    const analysis = JSON.parse(content);

    // Add metadata
    const result = {
      ...analysis,
      generatedAt: new Date().toISOString(),
      plansAnalyzed: plans.length,
    };

    console.log("Trends analysis completed successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in SGSO trends analysis:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to analyze SGSO trends"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
