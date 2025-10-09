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
    const { crew_member_id, analysis_type = "comprehensive" } = await req.json();

    if (!crew_member_id) {
      throw new Error("Crew member ID is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch crew member data with related information
    const { data: crewData, error: crewError } = await supabase
      .from("crew_members")
      .select(`
        *,
        crew_certifications (*),
        crew_embarkations (*),
        crew_performance_reviews (*),
        crew_evaluations (*)
      `)
      .eq("id", crew_member_id)
      .single();

    if (crewError || !crewData) {
      throw new Error("Crew member not found");
    }

    // Prepare data for AI analysis
    const analysisData = {
      personal_info: {
        name: crewData.full_name,
        position: crewData.position,
        experience_years: crewData.experience_years,
        nationality: crewData.nationality,
        status: crewData.status
      },
      certifications: crewData.crew_certifications?.map((cert: any) => ({
        name: cert.certification_name,
        type: cert.certification_type,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        status: cert.status,
        issuing_authority: cert.issuing_authority
      })) || [],
      embarkations: crewData.crew_embarkations?.map((emb: any) => ({
        vessel_name: emb.vessel_name,
        vessel_type: emb.vessel_type,
        function_role: emb.function_role,
        embark_date: emb.embark_date,
        disembark_date: emb.disembark_date,
        hours_worked: emb.hours_worked,
        performance_rating: emb.performance_rating
      })) || [],
      performance_reviews: crewData.crew_performance_reviews?.map((review: any) => ({
        review_date: review.review_date,
        overall_score: review.overall_score,
        technical_score: review.technical_score,
        behavioral_score: review.behavioral_score,
        safety_score: review.safety_score,
        strengths: review.strengths,
        improvement_areas: review.improvement_areas
      })) || [],
      evaluations: crewData.crew_evaluations?.map((evaluation: any) => ({
        evaluation_date: evaluation.evaluation_date,
        overall_score: evaluation.overall_score,
        technical_score: evaluation.technical_score,
        behavioral_score: evaluation.behavioral_score,
        positive_feedback: evaluation.positive_feedback,
        improvement_areas: evaluation.improvement_areas
      })) || []
    };

    // Create AI prompt for analysis
    const systemPrompt = `Você é um especialista em análise de recursos humanos marítimos. Analise os dados do tripulante e forneça insights detalhados sobre:

1. Performance e Desenvolvimento
2. Competências e Certificações
3. Histórico de Embarques
4. Áreas de Melhoria
5. Recomendações de Carreira
6. Alertas e Preocupações
7. Pontos Fortes

Retorne uma análise estruturada em JSON com as seguintes seções:
- summary: resumo executivo
- performance_analysis: análise de performance
- certification_status: status das certificações
- career_progression: progressão de carreira
- recommendations: recomendações específicas
- alerts: alertas importantes
- strengths: pontos fortes identificados
- development_areas: áreas de desenvolvimento
- risk_assessment: avaliação de riscos
- next_steps: próximos passos sugeridos`;

    const userPrompt = `Analise os dados do tripulante: ${JSON.stringify(analysisData, null, 2)}`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedAnalysis = {
        summary: analysis,
        analysis_type: analysis_type,
        generated_at: new Date().toISOString()
      };
    }

    // Store the analysis in the database
    const { data: insertData, error: insertError } = await supabase
      .from("crew_ai_insights")
      .insert({
        crew_member_id: crew_member_id,
        analysis_type: analysis_type,
        insights_data: parsedAnalysis,
        confidence_score: 0.85,
        generated_by: "gpt-4o-mini"
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
        crew_member: crewData.full_name,
        analysis_id: insertData?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in crew AI insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});