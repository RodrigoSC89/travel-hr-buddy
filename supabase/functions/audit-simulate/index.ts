import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditSimulateRequest {
  vesselId: string;
  vesselName: string;
  auditType: string;
  auditObjective?: string;
}

interface AuditResult {
  overallScore: number;
  conformities: Array<{
    clause: string;
    description: string;
    evidence: string;
  }>;
  nonConformities: Array<{
    clause: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { vesselId, vesselName, auditType, auditObjective }: AuditSimulateRequest = await req.json();

    if (!vesselId || !vesselName || !auditType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vesselId, vesselName, auditType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log(`Starting audit simulation for vessel: ${vesselName}, type: ${auditType}`);

    // Fetch vessel data and related incidents
    const { data: incidents, error: incidentsError } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("vessel", vesselName)
      .order("created_at", { ascending: false })
      .limit(20);

    if (incidentsError) {
      console.error("Error fetching incidents:", incidentsError);
    }

    // Fetch training records
    const { data: trainings, error: trainingsError } = await supabase
      .from("crew_training_records")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (trainingsError) {
      console.error("Error fetching trainings:", trainingsError);
    }

    // Fetch existing audits
    const { data: previousAudits, error: auditsError } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("embarcacao", vesselName)
      .order("created_at", { ascending: false })
      .limit(5);

    if (auditsError) {
      console.error("Error fetching previous audits:", auditsError);
    }

    // Construct context for AI analysis
    const vesselContext = {
      vesselName,
      incidentCount: incidents?.length || 0,
      recentIncidents: incidents?.slice(0, 5).map((i: any) => ({
        type: i.incident_type,
        severity: i.severity,
        description: i.description,
        date: i.created_at
      })) || [],
      trainingCount: trainings?.length || 0,
      completedTrainings: trainings?.filter((t: any) => t.status === 'completed').length || 0,
      previousAuditScores: previousAudits?.map((a: any) => a.overall_score).filter(Boolean) || []
    };

    // Create AI prompt based on audit type
    const auditTypeDescriptions: Record<string, string> = {
      'Petrobras_PEODP': 'Petrobras PEO-DP requirements for Dynamic Positioning systems in offshore operations',
      'IBAMA_SGSO': 'IBAMA Operational Safety Management System (SGSO) for Brazilian environmental compliance',
      'IMO_ISM': 'IMO International Safety Management Code for maritime vessel safety',
      'IMO_MODU': 'IMO Mobile Offshore Drilling Units Code for offshore drilling safety',
      'ISO_9001': 'ISO 9001 Quality Management System certification',
      'ISO_14001': 'ISO 14001 Environmental Management System certification',
      'ISO_45001': 'ISO 45001 Occupational Health and Safety Management System',
      'IMCA': 'IMCA guidelines for marine operations and DP vessel compliance'
    };

    const prompt = `You are a senior maritime auditor conducting a technical audit for vessel "${vesselName}" against ${auditTypeDescriptions[auditType] || auditType}.

Vessel Context:
- Recent incidents: ${vesselContext.incidentCount} total, ${vesselContext.recentIncidents.length} recent
- Training completion rate: ${vesselContext.completedTrainings}/${vesselContext.trainingCount}
- Previous audit scores: ${vesselContext.previousAuditScores.join(', ') || 'None'}
- Audit objective: ${auditObjective || 'General compliance assessment'}

Recent Incidents Summary:
${vesselContext.recentIncidents.map((i: any) => `- ${i.type} (${i.severity}): ${i.description?.substring(0, 100)}`).join('\n') || 'No recent incidents'}

Conduct a comprehensive audit and provide a structured JSON response with:
1. Overall compliance score (0-100)
2. List of conformities (areas meeting requirements)
3. List of non-conformities with severity levels (critical/major/minor)
4. Scores by specific norm sections (0-100 each)
5. Technical report summary
6. Prioritized action plan with deadlines

Format your response as valid JSON:
{
  "overallScore": number,
  "conformities": [{"clause": string, "description": string, "evidence": string}],
  "nonConformities": [{"clause": string, "description": string, "severity": "critical"|"major"|"minor", "recommendation": string}],
  "scoresByNorm": {"Section Name": score},
  "technicalReport": string,
  "actionPlan": [{"priority": number, "action": string, "deadline": string, "responsible": string}]
}`;

    const startTime = Date.now();

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a senior maritime technical auditor with expertise in international safety standards, DP systems, and offshore operations. Provide detailed, actionable audit reports in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    let auditResult: AuditResult;
    try {
      const content = data.choices[0].message.content;
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      auditResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Failed to parse AI audit response");
    }

    // Get current user ID from auth header
    const authHeader = req.headers.get("authorization");
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id;
    }

    // Store audit simulation in database
    const { data: simulation, error: insertError } = await supabase
      .from("audit_simulations")
      .insert({
        vessel_id: vesselId,
        vessel_name: vesselName,
        audit_type: auditType,
        overall_score: auditResult.overallScore,
        conformities: auditResult.conformities,
        non_conformities: auditResult.nonConformities,
        scores_by_norm: auditResult.scoresByNorm,
        technical_report: auditResult.technicalReport,
        action_plan: auditResult.actionPlan,
        ai_model: "gpt-4",
        processing_time_ms: processingTime,
        vessel_data: vesselContext,
        incidents_analyzed: vesselContext.incidentCount,
        practices_analyzed: vesselContext.trainingCount,
        created_by: userId
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing audit simulation:", insertError);
      throw insertError;
    }

    console.log(`Audit simulation completed in ${processingTime}ms, score: ${auditResult.overallScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        simulation,
        result: auditResult,
        processingTime
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
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
