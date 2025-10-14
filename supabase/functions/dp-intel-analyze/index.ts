import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  incident_id?: string;
  incident_data?: any;
  query?: string;
  analysis_type?: "full" | "summary" | "recommendations" | "comparison";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident_id, incident_data, query, analysis_type = "full" }: AnalyzeRequest = await req.json();

    console.log("DP Intel Analyze request:", { incident_id, analysis_type, has_query: !!query });

    // Get Supabase client
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    let incident = incident_data;

    // Fetch incident if ID provided
    if (incident_id && !incident_data) {
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .eq("incident_id", incident_id)
        .single();

      if (error) {
        throw new Error(`Incidente não encontrado: ${incident_id}`);
      }

      incident = data;
    }

    if (!incident && !query) {
      throw new Error("É necessário fornecer incident_id, incident_data ou query");
    }

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key não configurada");
    }

    // Build system prompt for DP Intelligence
    const systemPrompt = `Você é um especialista técnico em Posicionamento Dinâmico (DP) e normas IMCA.

Suas responsabilidades:
✅ Analisar incidentes DP com profundidade técnica
✅ Referenciar normas IMCA relevantes (M190, M103, M117, M182, etc.)
✅ Identificar causas raízes e fatores contribuintes
✅ Propor ações corretivas e preventivas
✅ Avaliar conformidade com PEO-DP (Petrobras)
✅ Fornecer lições aprendidas

Estrutura de resposta:
📋 **Resumo Técnico**: Visão geral concisa do incidente
📚 **Normas IMCA Aplicáveis**: Referências específicas às normas relevantes
🔍 **Análise de Causa Raiz**: Investigação detalhada das causas
⚠️ **Fatores Contribuintes**: Outros elementos que contribuíram
🛠️ **Ações Corretivas**: Medidas imediatas necessárias
🔐 **Medidas Preventivas**: Ações para evitar recorrência
📊 **Classificação de Risco**: Avaliação de severidade e probabilidade
✅ **Conformidade PEO-DP**: Status e recomendações
💡 **Lições Aprendidas**: Insights para a indústria

Seja técnico, preciso e orientado à ação. Use terminologia marítima e de DP apropriada.`;

    let userPrompt = "";

    if (query) {
      // General query mode
      userPrompt = query;
    } else if (analysis_type === "full") {
      // Full analysis mode
      userPrompt = `Analise o seguinte incidente DP em detalhes:

**Incidente ID**: ${incident.incident_id}
**Título**: ${incident.title}
**Descrição**: ${incident.description || "N/A"}
**Classe do Navio**: ${incident.vessel_class || "N/A"}
**Tipo de Incidente**: ${incident.incident_type || "N/A"}
**Severidade**: ${incident.severity || "N/A"}
**Causa Raiz**: ${incident.root_cause || "A ser determinada"}
**Sistemas Envolvidos**: ${incident.system_involved?.join(", ") || "N/A"}
**Normas IMCA**: ${incident.imca_standards?.join(", ") || "Nenhuma referenciada"}

Forneça uma análise completa seguindo a estrutura definida.`;
    } else if (analysis_type === "summary") {
      userPrompt = `Forneça um resumo executivo do incidente ${incident.incident_id}: ${incident.title}`;
    } else if (analysis_type === "recommendations") {
      userPrompt = `Com base no incidente ${incident.incident_id}, liste recomendações específicas para prevenção de incidentes similares.`;
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Update incident with AI analysis if incident_id provided
    if (incident_id) {
      await supabase
        .from("dp_incidents")
        .update({
          ai_analysis: {
            analysis: analysis,
            analyzed_at: new Date().toISOString(),
            model: "gpt-4o-mini",
            analysis_type: analysis_type,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("incident_id", incident_id);
    }

    // Return analysis
    return new Response(
      JSON.stringify({
        success: true,
        incident_id: incident_id || null,
        analysis_type: analysis_type,
        analysis: analysis,
        incident_summary: incident ? {
          id: incident.incident_id,
          title: incident.title,
          severity: incident.severity,
          vessel_class: incident.vessel_class,
        } : null,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in dp-intel-analyze:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
