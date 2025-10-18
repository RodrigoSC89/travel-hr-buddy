// ETAPA 32.1: AI-Powered External Audit Simulation
// Supabase Edge Function for simulating technical audits using OpenAI GPT-4

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditRequest {
  vesselId: string;
  vesselName: string;
  auditType: string;
  norms: string[];
  organizationId?: string;
}

interface AuditResult {
  conformities: string[];
  nonConformities: Array<{
    severity: string;
    description: string;
    clause: string;
  }>;
  scoresByNorm: Record<string, number>;
  technicalReport: string;
  actionPlan: Array<{
    priority: string;
    action: string;
    deadline: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Parse request body
    const { vesselId, vesselName, auditType, norms, organizationId }: AuditRequest = await req.json();

    // Validate input
    if (!vesselId || !vesselName || !auditType || !norms || norms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vesselId, vesselName, auditType, norms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch vessel data and related incidents
    const { data: incidents, error: incidentsError } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("vessel", vesselName)
      .order("incident_date", { ascending: false })
      .limit(50);

    if (incidentsError) {
      console.error("Error fetching incidents:", incidentsError);
    }

    // Fetch existing audits for context
    const { data: previousAudits, error: auditsError } = await supabase
      .from("audit_simulations")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("simulated_at", { ascending: false })
      .limit(5);

    if (auditsError) {
      console.error("Error fetching previous audits:", auditsError);
    }

    // Build context for AI analysis
    const incidentsSummary = incidents?.length
      ? incidents.map((inc) => `- ${inc.title} (${inc.severity}): ${inc.description}`).join("\n")
      : "No incidents recorded";

    const previousAuditsSummary = previousAudits?.length
      ? `Previous audits found ${previousAudits.length} records with average compliance trends.`
      : "No previous audit history.";

    // Construct GPT-4 prompt
    const prompt = `Você é um auditor técnico sênior da entidade: "${auditType}".

Avalie os dados do navio "${vesselName}" de acordo com as normas: ${norms.join(", ")}

Contexto do navio:
${incidentsSummary}

Histórico de auditorias:
${previousAuditsSummary}

Forneça uma resposta estruturada em formato JSON com:
{
  "conformities": ["lista de conformidades detectadas"],
  "nonConformities": [
    {
      "severity": "Alta|Média|Baixa",
      "description": "descrição da não conformidade",
      "clause": "cláusula específica da norma"
    }
  ],
  "scoresByNorm": {
    "${norms[0]}": 85
  },
  "technicalReport": "relatório técnico detalhado da auditoria em português",
  "actionPlan": [
    {
      "priority": "Alta|Média|Baixa",
      "action": "ação corretiva recomendada",
      "deadline": "prazo sugerido em dias"
    }
  ]
}

Analise criticamente:
1. Conformidades com as normas aplicadas
2. Não conformidades críticas, maiores e menores
3. Score de 0 a 100 para cada norma
4. Relatório técnico simulado da auditoria
5. Plano de ação priorizado para os gaps detectados

Seja rigoroso e técnico, como um auditor real de ${auditType}.`;

    // Call OpenAI GPT-4
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um auditor técnico especializado em normas marítimas e de segurança. Sempre responda em português do Brasil com análises técnicas rigorosas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from OpenAI");
    }

    // Parse AI response (extract JSON from markdown if needed)
    let auditResult: AuditResult;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      auditResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse audit result from AI");
    }

    // Get user ID from auth header
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id;
    }

    // Save audit simulation to database
    const { data: savedAudit, error: saveError } = await supabase
      .from("audit_simulations")
      .insert({
        organization_id: organizationId,
        vessel_id: vesselId,
        vessel_name: vesselName,
        audit_type: auditType,
        norms_applied: norms,
        conformities: auditResult.conformities,
        non_conformities: auditResult.nonConformities,
        scores_by_norm: auditResult.scoresByNorm,
        technical_report: auditResult.technicalReport,
        action_plan: auditResult.actionPlan,
        simulated_by: userId,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving audit:", saveError);
      throw saveError;
    }

    // Return comprehensive audit report
    return new Response(
      JSON.stringify({
        success: true,
        auditId: savedAudit.id,
        vesselName,
        auditType,
        norms,
        result: auditResult,
        simulatedAt: savedAudit.simulated_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in audit-simulate function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
