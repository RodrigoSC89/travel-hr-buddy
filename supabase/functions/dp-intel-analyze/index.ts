import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the incident from request body
    const { incident } = await req.json();

    if (!incident) {
      return new Response(
        JSON.stringify({ error: "Incident data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Create AI prompt with DP/IMCA context
    const systemPrompt = `Você é um especialista em Dynamic Positioning (DP) e análise de incidentes marítimos com profundo conhecimento das normas:
- IMCA M190 (Guidance on Failure Modes and Effects Analyses)
- IMCA M103 (Guidelines for the Design and Operation of Dynamically Positioned Vessels)
- IMCA M117 (DP Operations Guidance)
- IMCA M166 (DP Vessel Design Philosophy Guidelines)
- Petrobras PEO-DP (Plano de Operações com DP)
- IMO MSC.1/Circ.1580 (Guidelines for Vessels with Dynamic Positioning Systems)
- MTS DP Operations Guidance

Analise o incidente de DP fornecido e retorne uma resposta estruturada em JSON com os seguintes campos:

{
  "resumo_tecnico": "Resumo técnico do incidente em português",
  "normas_relacionadas": [
    {
      "norma": "Nome da norma (ex: IMCA M190)",
      "secao": "Seção relevante",
      "descricao": "Como esta norma se aplica ao incidente"
    }
  ],
  "causas_adicionais": [
    "Lista de possíveis causas adicionais não mencionadas no relatório original"
  ],
  "recomendacoes_preventivas": [
    "Lista de recomendações para prevenir incidentes similares"
  ],
  "acoes_corretivas": [
    "Lista de ações corretivas sugeridas baseadas nas melhores práticas"
  ]
}

Seja técnico, preciso e baseie suas recomendações nas normas mencionadas.`;

    const userPrompt = `Analise o seguinte incidente de DP:

Título: ${incident.title}
Data: ${incident.date}
Embarcação: ${incident.vessel}
Local: ${incident.location}
Classe DP: ${incident.class_dp}
Causa Raiz: ${incident.root_cause}
Resumo: ${incident.summary}
Tags: ${incident.tags?.join(", ")}

Forneça uma análise detalhada seguindo o formato JSON especificado.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;

    // Try to parse as JSON, fallback to text if needed
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      // If JSON parsing fails, return as text with basic structure
      analysis = {
        resumo_tecnico: analysisText,
        normas_relacionadas: [],
        causas_adicionais: [],
        recomendacoes_preventivas: [],
        acoes_corretivas: [],
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        incident_id: incident.id,
        analysis: analysis,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in dp-intel-analyze:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
