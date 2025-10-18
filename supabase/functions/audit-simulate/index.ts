// ETAPA 32.1: AI-Powered Audit Simulation Edge Function
// Simulates technical audits using OpenAI GPT-4 based on vessel data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuditSimulationRequest {
  vesselId: string;
  vesselName: string;
  auditType: string;
  organizationId: string;
}

interface NonConformity {
  clause: string;
  description: string;
  severity: "critical" | "major" | "minor";
  recommendation: string;
}

interface AuditResult {
  conformities: string[];
  nonConformities: NonConformity[];
  scoresByNorm: Record<string, number>;
  technicalReport: string;
  actionPlan: Array<{
    priority: number;
    action: string;
    responsible: string;
    deadline: string;
  }>;
  overallScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const body: AuditSimulationRequest = await req.json();
    const { vesselId, vesselName, auditType, organizationId } = body;

    if (!vesselId || !vesselName || !auditType || !organizationId) {
      throw new Error("Missing required fields");
    }

    // Fetch vessel data and related information
    const [
      { data: vessel },
      { data: incidents },
      { data: checklists },
      { data: trainings },
    ] = await Promise.all([
      supabase
        .from("vessels")
        .select("*")
        .eq("id", vesselId)
        .single(),
      supabase
        .from("dp_incidents")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("incident_date", { ascending: false })
        .limit(20),
      supabase
        .from("checklist_templates")
        .select("*")
        .eq("vessel_id", vesselId)
        .limit(10),
      supabase
        .from("training_completions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("completed_at", { ascending: false })
        .limit(20),
    ]);

    // Build context for AI analysis
    const context = {
      vessel: vessel || { name: vesselName },
      recentIncidents: incidents || [],
      checklistsCompleted: checklists?.length || 0,
      trainingsCompleted: trainings?.length || 0,
      auditType,
    };

    // Call OpenAI API
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildAuditPrompt(context);

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
                "You are an expert maritime auditor with deep knowledge of international maritime standards including ISM Code, MODU Code, ISO 9001/14001/45001, IMCA guidelines, IBAMA regulations, and Petrobras requirements. Provide detailed, structured audit reports.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0].message.content;

    // Parse AI response
    let auditResult: AuditResult;
    try {
      auditResult = JSON.parse(aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Invalid AI response format");
    }

    // Store audit simulation result in database
    const { data: simulation, error: insertError } = await supabase
      .from("audit_simulations")
      .insert({
        organization_id: organizationId,
        vessel_id: vesselId,
        vessel_name: vesselName,
        audit_type: auditType,
        overall_score: auditResult.overallScore,
        conformities: auditResult.conformities,
        non_conformities: auditResult.nonConformities,
        scores_by_norm: auditResult.scoresByNorm,
        technical_report: auditResult.technicalReport,
        action_plan: auditResult.actionPlan,
        ai_analysis: {
          model: "gpt-4",
          timestamp: new Date().toISOString(),
          context: {
            incidentCount: context.recentIncidents.length,
            checklistCount: context.checklistsCompleted,
            trainingCount: context.trainingsCompleted,
          },
        },
        status: "completed",
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to save audit simulation: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: simulation,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Audit simulation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function buildAuditPrompt(context: any): string {
  return `
Please conduct a comprehensive ${context.auditType} audit simulation for the vessel "${context.vessel.name}".

**Vessel Context:**
- Recent Incidents: ${context.recentIncidents.length} incidents in the last period
${context.recentIncidents.slice(0, 5).map((inc: any, idx: number) => `  ${idx + 1}. ${inc.incident_type || 'Incident'}: ${inc.description || 'No description'}`).join('\n')}
- Completed Checklists: ${context.checklistsCompleted}
- Training Completions: ${context.trainingsCompleted}
- Audit Type: ${context.auditType}

**Required Output Format (JSON):**
{
  "conformities": [
    "List of areas where the vessel is compliant (3-5 items)"
  ],
  "nonConformities": [
    {
      "clause": "Specific norm clause (e.g., ISM Code 9.1)",
      "description": "Detailed description of the non-conformity",
      "severity": "critical|major|minor",
      "recommendation": "Specific corrective action recommended"
    }
  ],
  "scoresByNorm": {
    "ISM Code": 85,
    "MODU Code": 90,
    "ISO 9001": 88
  },
  "technicalReport": "A comprehensive 3-4 paragraph technical report summarizing the audit findings, vessel condition, and overall assessment",
  "actionPlan": [
    {
      "priority": 1,
      "action": "Specific action to be taken",
      "responsible": "Role/position responsible",
      "deadline": "Timeframe (e.g., 30 days, 60 days)"
    }
  ],
  "overallScore": 87
}

**Guidelines:**
1. Base the audit on the ${context.auditType} standard requirements
2. Consider the incident history in your assessment
3. Provide realistic scores between 0-100
4. Include 2-5 non-conformities with varying severities
5. Generate 3-7 conformities highlighting strengths
6. Create 3-5 prioritized action items
7. Write a professional technical report
8. Ensure all recommendations are specific and actionable

Return ONLY the JSON object, no additional text.
`;
}
