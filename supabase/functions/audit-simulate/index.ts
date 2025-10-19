import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditRequest {
  vesselId: string;
  auditType: string;
}

interface AuditResult {
  overallScore: number;
  conformities: Array<{
    clause: string;
    description: string;
    evidence?: string;
  }>;
  nonConformities: Array<{
    clause: string;
    description: string;
    severity: "critical" | "major" | "minor";
    recommendation: string;
  }>;
  scoresByNorm: Record<string, number>;
  technicalReport: string;
  actionPlan: Array<{
    priority: number;
    item: string;
    deadline: string;
    responsible?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Parse request body
    const { vesselId, auditType }: AuditRequest = await req.json();

    if (!vesselId || !auditType) {
      return new Response(
        JSON.stringify({ error: "vesselId and auditType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch recent incidents for this vessel
    const { data: incidents } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("incident_date", { ascending: false })
      .limit(10);

    // Fetch existing audit data
    const { data: previousAudits } = await supabase
      .from("audit_simulations")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("audit_date", { ascending: false })
      .limit(5);

    // Fetch compliance evidences
    const { data: evidences } = await supabase
      .from("compliance_evidences")
      .select("*")
      .eq("vessel_id", vesselId)
      .eq("status", "validated");

    // Construct AI prompt based on audit type
    const auditTypeDescriptions: Record<string, string> = {
      petrobras: "Petrobras PEO-DP (DP Operations Excellence Program)",
      ibama: "IBAMA SGSO (Safety and Environmental Management System)",
      imo_ism: "IMO ISM Code (International Safety Management)",
      imo_modu: "IMO MODU Code (Mobile Offshore Drilling Units)",
      iso_9001: "ISO 9001:2015 (Quality Management)",
      iso_14001: "ISO 14001:2015 (Environmental Management)",
      iso_45001: "ISO 45001:2018 (Occupational Health and Safety)",
      imca: "IMCA Guidelines (International Marine Contractors Association)",
    };

    const prompt = `You are a maritime auditor conducting a ${auditTypeDescriptions[auditType] || auditType} audit simulation.

Vessel Information:
- Name: ${vessel.name || "Unknown"}
- Type: ${vessel.vessel_type || "Unknown"}
- IMO: ${vessel.imo_number || "N/A"}
- Flag: ${vessel.flag || "Unknown"}

Recent Incidents (last 10):
${incidents?.map((inc, i) => `${i + 1}. ${inc.incident_type || "Unknown"} - ${inc.description || "No description"} (Date: ${inc.incident_date || "Unknown"})`).join("\n") || "No incidents recorded"}

Compliance Evidences:
${evidences?.length ? `${evidences.length} validated evidences on file` : "No validated evidences"}

Previous Audit Scores:
${previousAudits?.map((audit, i) => `${i + 1}. ${audit.audit_type}: ${audit.overall_score}/100 (Date: ${audit.audit_date})`).join("\n") || "No previous audits"}

Based on this information, generate a comprehensive audit simulation report in the following JSON format:
{
  "overallScore": <number 0-100>,
  "conformities": [
    {
      "clause": "<clause number>",
      "description": "<what is compliant>",
      "evidence": "<evidence reference if applicable>"
    }
  ],
  "nonConformities": [
    {
      "clause": "<clause number>",
      "description": "<what is non-compliant>",
      "severity": "<critical|major|minor>",
      "recommendation": "<how to fix>"
    }
  ],
  "scoresByNorm": {
    "<norm section>": <score 0-100>
  },
  "technicalReport": "<detailed technical analysis>",
  "actionPlan": [
    {
      "priority": <number>,
      "item": "<action item>",
      "deadline": "<suggested deadline>",
      "responsible": "<role/position>"
    }
  ]
}

Provide a realistic, detailed audit simulation. Consider:
1. Recent incident history indicates areas of concern
2. Lack of evidences suggests documentation gaps
3. Previous audit trends show improvement or decline
4. Industry best practices for ${auditTypeDescriptions[auditType] || auditType}

Return ONLY the JSON object, no additional text.`;

    // Call OpenAI API
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
            content: "You are an expert maritime auditor specialized in international compliance standards. You provide detailed, realistic audit assessments based on vessel data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    // Parse AI response
    let auditResult: AuditResult;
    try {
      auditResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("AI returned invalid JSON");
    }

    // Get current user
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id;
    }

    // Store audit simulation in database
    const { data: auditSimulation, error: insertError } = await supabase
      .from("audit_simulations")
      .insert({
        vessel_id: vesselId,
        audit_type: auditType,
        overall_score: auditResult.overallScore,
        conformities: auditResult.conformities,
        non_conformities: auditResult.nonConformities,
        scores_by_norm: auditResult.scoresByNorm,
        technical_report: auditResult.technicalReport,
        action_plan: auditResult.actionPlan,
        ai_model: "gpt-4",
        prompt_tokens: openaiData.usage?.prompt_tokens || 0,
        completion_tokens: openaiData.usage?.completion_tokens || 0,
        conducted_by: userId,
        status: "completed",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: auditSimulation,
        audit: auditResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in audit-simulate function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
