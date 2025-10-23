// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { crewMemberId, analysisType = "wellbeing" } = await req.json();

    if (!crewMemberId) {
      throw new Error("Crew member ID is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Lovable AI API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch crew health data
    const { data: healthData, error: healthError } = await supabase
      .from("crew_health_logs")
      .select("*")
      .eq("crew_member_id", crewMemberId)
      .order("timestamp", { ascending: false })
      .limit(30);

    if (healthError) {
      console.error("Error fetching health data:", healthError);
    }

    // Fetch crew status
    const { data: statusData, error: statusError } = await supabase
      .from("crew_status")
      .select("*")
      .eq("id", crewMemberId)
      .single();

    if (statusError) {
      console.error("Error fetching status:", statusError);
    }

    const analysisData = {
      crew_member: statusData,
      recent_health_logs: healthData || [],
      analysis_date: new Date().toISOString(),
    };

    const systemPrompt = `Você é um especialista em saúde ocupacional marítima e bem-estar de tripulação. 
Analise os dados fornecidos e forneça insights detalhados sobre:

1. Estado atual de saúde e bem-estar
2. Padrões de fadiga ou estresse
3. Recomendações de prevenção
4. Necessidade de rotação ou descanso
5. Alertas críticos de saúde
6. Sugestões para melhorar qualidade de vida a bordo

Retorne uma análise estruturada em JSON com:
- summary: resumo executivo
- health_status: avaliação do estado de saúde
- fatigue_level: nível de fadiga (low/medium/high/critical)
- stress_indicators: indicadores de estresse
- recommendations: recomendações específicas
- alerts: alertas críticos (array)
- rotation_needed: se precisa rotação (boolean)
- rotation_reason: razão da rotação se necessário
- preventive_actions: ações preventivas sugeridas (array)`;

    const userPrompt = `Analise os dados do tripulante: ${JSON.stringify(analysisData, null, 2)}`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (e) {
      parsedAnalysis = {
        summary: analysis,
        analysis_type: analysisType,
        generated_at: new Date().toISOString(),
        health_status: "unknown",
        fatigue_level: "medium",
        recommendations: ["Revisar dados manualmente"],
      };
    }

    // Store the analysis
    const { data: insertData, error: insertError } = await supabase
      .from("crew_ai_insights")
      .insert({
        crew_member_id: crewMemberId,
        analysis_type: "wellbeing",
        insights_data: parsedAnalysis,
        confidence_score: 0.85,
        generated_by: "gemini-2.5-flash"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing analysis:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: parsedAnalysis,
        crew_member_id: crewMemberId,
        analysis_id: insertData?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in crew AI analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
