// Supabase Edge Function: audit-simulate
// Purpose: AI-powered audit simulation using OpenAI GPT-4
// ETAPA 32.1: External Audit System - Audit Simulation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuditRequest {
  vesselId: string;
  auditType: string;
}

interface AuditResult {
  conformities: Array<{
    clause: string;
    description: string;
    status: string;
  }>;
  nonConformities: Array<{
    clause: string;
    description: string;
    severity: string;
    recommendation: string;
  }>;
  scoresByNorm: Record<string, number>;
  technicalReport: string;
  actionPlan: Array<{
    priority: number;
    action: string;
    deadline: string;
    responsible: string;
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
    const { vesselId, auditType }: AuditRequest = await req.json();

    if (!vesselId || !auditType) {
      return new Response(
        JSON.stringify({ error: "vesselId and auditType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch vessel data
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vesselId)
      .single();

    if (vesselError || !vessel) {
      return new Response(
        JSON.stringify({ error: "Vessel not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch recent audit history
    const { data: recentAudits } = await supabase
      .from("audit_simulations")
      .select("audit_type, scores_by_norm, created_at")
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch recent incidents
    const { data: recentIncidents } = await supabase
      .from("dp_incidents")
      .select("incident_type, severity, created_at")
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch training records
    const { data: trainingRecords } = await supabase
      .from("crew_training_records")
      .select("status, completion_rate")
      .eq("vessel_id", vesselId);

    // Prepare context for GPT-4
    const vesselContext = {
      name: vessel.name,
      type: vessel.type,
      flag: vessel.flag,
      classification_society: vessel.classification_society,
      year_built: vessel.year_built,
      recent_audits: recentAudits || [],
      recent_incidents: recentIncidents || [],
      training_completion_rate: trainingRecords
        ? (trainingRecords.filter((t) => t.status === "completed").length /
            trainingRecords.length) *
          100
        : 75,
    };

    // Build prompt for GPT-4
    const prompt = `You are an expert maritime auditor conducting a ${auditType} audit for vessel ${vessel.name}.

Vessel Information:
- Type: ${vessel.type}
- Flag: ${vessel.flag}
- Classification Society: ${vessel.classification_society}
- Year Built: ${vessel.year_built}
- Training Completion Rate: ${vesselContext.training_completion_rate.toFixed(1)}%
- Recent Incidents: ${recentIncidents?.length || 0}
- Previous Audits: ${recentAudits?.length || 0}

Based on this vessel's profile and ${auditType} requirements, generate a comprehensive audit report in JSON format with:
1. conformities: Array of items that meet requirements (clause, description, status)
2. nonConformities: Array of items that don't meet requirements (clause, description, severity: "critical"|"major"|"minor", recommendation)
3. scoresByNorm: Object with scores by category (0-100)
4. technicalReport: Detailed narrative report (2-3 paragraphs)
5. actionPlan: Array of prioritized actions (priority: 1-5, action, deadline, responsible)

Generate a realistic audit with:
- 8-12 conformities
- 3-6 non-conformities (mix of severities)
- Scores between 70-95 depending on vessel age and incident history
- Specific, actionable recommendations

Return ONLY valid JSON, no additional text.`;

    // Call OpenAI GPT-4
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an expert maritime auditor. Respond only with valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let auditResult: AuditResult;
    try {
      auditResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Save audit simulation to database
    const { data: savedAudit, error: saveError } = await supabase
      .from("audit_simulations")
      .insert({
        vessel_id: vesselId,
        audit_type: auditType,
        conformities: auditResult.conformities,
        non_conformities: auditResult.nonConformities,
        scores_by_norm: auditResult.scoresByNorm,
        technical_report: auditResult.technicalReport,
        action_plan: auditResult.actionPlan,
        status: "completed",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save audit:", saveError);
      throw new Error("Failed to save audit simulation");
    }

    return new Response(
      JSON.stringify({
        success: true,
        audit: savedAudit,
        result: auditResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in audit-simulate function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
