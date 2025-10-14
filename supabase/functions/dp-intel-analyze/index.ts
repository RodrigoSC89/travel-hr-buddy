import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface DPIncident {
  id?: string;
  title: string;
  date: string;
  class_dp: string;
  vessel: string;
  location: string;
  summary: string;
  root_cause?: string;
}

interface AnalysisResult {
  resumo_tecnico: string;
  normas_relacionadas: string[];
  causas_adicionais: string[];
  recomendacoes_preventivas: string[];
  acoes_corretivas: string[];
  referencias_imca: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident } = await req.json();

    if (!incident) {
      throw new Error("Incident data is required");
    }

    console.log(`Starting DP incident analysis for: ${incident.title}`);

    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = `Você é um engenheiro DP embarcado com foco em conformidade com as normas IMCA, MTS, IMO e Petrobras (PEO-DP).
Analise incidentes de Posicionamento Dinâmico com base em FMEA, causas raiz, classe DP e diretrizes normativas.
Inclua recomendações técnicas, sugestões de mitigação e referência cruzada às normas (ex: IMCA M190, M103, M166).

Retorne uma análise estruturada em JSON com as seguintes seções:
- resumo_tecnico: string (resumo técnico do incidente)
- normas_relacionadas: string[] (normas IMCA/IMO/PEO-DP aplicáveis)
- causas_adicionais: string[] (possíveis causas além da reportada)
- recomendacoes_preventivas: string[] (recomendações para prevenção)
- acoes_corretivas: string[] (ações corretivas sugeridas)
- referencias_imca: string[] (referências específicas IMCA com códigos)`;

    const userPrompt = `Analise tecnicamente o seguinte incidente de Posicionamento Dinâmico:

Título: ${incident.title}
Data: ${incident.date}
Classe DP: ${incident.class_dp}
Embarcação: ${incident.vessel}
Local: ${incident.location}
Resumo: ${incident.summary}
Causa raiz informada: ${incident.root_cause || "Não informada"}

Gere uma análise estruturada com os seguintes blocos:
✅ Resumo Técnico
📚 Normas relacionadas (IMCA, IMO, PEO-DP)
📌 Possíveis causas adicionais
🧠 Recomendações preventivas
📄 Ações corretivas possíveis
🔗 Referências IMCA específicas

Retorne apenas o JSON estruturado conforme o formato especificado.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisContent = data.choices[0].message.content;
    
    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(analysisContent);
    } catch (e) {
      console.error("Failed to parse AI response:", analysisContent);
      throw new Error("Invalid AI response format");
    }

    console.log("AI analysis completed successfully");

    // Save analysis to database if incident has an ID
    if (incident.id) {
      const { error: updateError } = await supabase
        .from("dp_incidents")
        .update({
          ai_analysis: analysis,
          status: "analyzed",
        })
        .eq("id", incident.id);

      if (updateError) {
        console.error("Error saving analysis to database:", updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      result: analysis,
      message: "Análise DP concluída com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in DP incident analysis:", error);
    return new Response(JSON.stringify({ 
      error: "Erro na análise IA",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
