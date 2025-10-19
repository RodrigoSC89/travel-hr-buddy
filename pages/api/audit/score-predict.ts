import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface AuditPrediction {
  vessel_id: string;
  audit_type: string;
  predicted_score: number;
  pass_probability: number;
  readiness_level: string;
  weaknesses: string[];
  recommendations: string[];
  compliance_gaps: string[];
  based_on_months: number;
  simulated_by: string;
}

// Rule-based audit prediction fallback
function generateRuleBasedPrediction(
  vesselId: string,
  auditType: string,
  complianceData: any
): AuditPrediction {
  const incidentCount = complianceData.incidents?.length || 0;
  const completedActions = complianceData.completed_actions || 0;
  const totalActions = complianceData.total_actions || 1;
  
  // Simple scoring algorithm
  const incidentPenalty = Math.min(incidentCount * 5, 30);
  const actionBonus = (completedActions / totalActions) * 20;
  const baseScore = 70;
  const predictedScore = Math.max(0, Math.min(100, baseScore - incidentPenalty + actionBonus));
  
  const passThreshold = 60;
  const passProbability = predictedScore >= passThreshold 
    ? Math.min(0.95, 0.5 + (predictedScore - passThreshold) / 80)
    : Math.max(0.05, predictedScore / passThreshold * 0.5);

  let readinessLevel = "low";
  if (predictedScore >= 85) readinessLevel = "excellent";
  else if (predictedScore >= 75) readinessLevel = "high";
  else if (predictedScore >= 60) readinessLevel = "medium";

  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const complianceGaps: string[] = [];

  if (incidentCount > 5) {
    weaknesses.push("High incident rate in recent months");
    recommendations.push("Implement enhanced safety protocols");
    complianceGaps.push("Incident reduction program");
  }

  if (completedActions / totalActions < 0.7) {
    weaknesses.push("Low completion rate of corrective actions");
    recommendations.push("Prioritize and accelerate action plan execution");
    complianceGaps.push("Action plan completion tracking");
  }

  // Audit-specific checks
  switch (auditType) {
  case "petrobras":
    if (incidentCount > 3) complianceGaps.push("HSE procedures documentation");
    break;
  case "ibama":
    complianceGaps.push("Environmental impact assessments");
    break;
  case "iso":
    complianceGaps.push("Quality management system documentation");
    break;
  case "imca":
    complianceGaps.push("Marine operations standards");
    break;
  case "ism":
    complianceGaps.push("Safety management system certification");
    break;
  case "sgso":
    complianceGaps.push("QSMS compliance records");
    break;
  }

  return {
    vessel_id: vesselId,
    audit_type: auditType,
    predicted_score: Math.round(predictedScore),
    pass_probability: Number(passProbability.toFixed(2)),
    readiness_level: readinessLevel,
    weaknesses,
    recommendations,
    compliance_gaps: complianceGaps,
    based_on_months: 6,
    simulated_by: "rule-based"
  };
}

// AI-powered audit prediction
async function predictAuditWithAI(
  vesselId: string,
  auditType: string,
  complianceData: any
): Promise<AuditPrediction> {
  if (!openai) {
    console.log("OpenAI not configured, using rule-based fallback");
    return generateRuleBasedPrediction(vesselId, auditType, complianceData);
  }

  try {
    const prompt = `You are a maritime compliance expert. Analyze the following compliance data for vessel ${vesselId} and predict the outcome of a ${auditType.toUpperCase()} audit.

Compliance Data (last 6 months):
${JSON.stringify(complianceData, null, 2)}

Audit Type Details:
- Petrobras: HSE and operational compliance
- IBAMA: Environmental regulations
- ISO: Quality management standards
- IMCA: Marine contractor standards
- ISM: International Safety Management
- SGSO: Quality Safety Management System

Provide a JSON object with this structure:
{
  "predicted_score": 0-100 (integer),
  "pass_probability": 0.0-1.0 (decimal),
  "readiness_level": "low|medium|high|excellent",
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "compliance_gaps": ["gap 1", "gap 2", ...]
}

Return only valid JSON, no markdown or explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content || "{}";
    const aiPrediction = JSON.parse(content);

    return {
      vessel_id: vesselId,
      audit_type: auditType,
      ...aiPrediction,
      based_on_months: 6,
      simulated_by: "ai"
    };
  } catch (error) {
    console.error("AI prediction error:", error);
    return generateRuleBasedPrediction(vesselId, auditType, complianceData);
  }
}

// Fetch compliance data for analysis
async function getComplianceData(vesselId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get incidents
  const { data: incidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("created_at", sixMonthsAgo.toISOString());

  // Get action plans
  const { data: actionPlans } = await supabase
    .from("sgso_action_plans")
    .select("*")
    .eq("vessel_id", vesselId);

  // Get audits history
  const { data: audits } = await supabase
    .from("auditorias_imca")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("audit_date", sixMonthsAgo.toISOString());

  return {
    incidents: incidents || [],
    action_plans: actionPlans || [],
    audits: audits || [],
    total_actions: actionPlans?.length || 0,
    completed_actions: actionPlans?.filter(a => a.status === "resolvido").length || 0,
    pending_actions: actionPlans?.filter(a => a.status !== "resolvido").length || 0
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { vessel_id, audit_type, audit_date } = req.body;

    if (!vessel_id || !audit_type) {
      return res.status(400).json({ 
        error: "vessel_id and audit_type are required" 
      });
    }

    const validAuditTypes = ["petrobras", "ibama", "iso", "imca", "ism", "sgso"];
    if (!validAuditTypes.includes(audit_type.toLowerCase())) {
      return res.status(400).json({ 
        error: `Invalid audit_type. Must be one of: ${validAuditTypes.join(", ")}` 
      });
    }

    // Fetch compliance data
    const complianceData = await getComplianceData(vessel_id);

    // Generate prediction
    const prediction = await predictAuditWithAI(
      vessel_id,
      audit_type.toLowerCase(),
      complianceData
    );

    // Insert prediction into database
    const { data, error } = await supabase
      .from("audit_predictions")
      .insert({
        ...prediction,
        audit_date: audit_date || null,
        weaknesses: prediction.weaknesses,
        recommendations: prediction.recommendations,
        compliance_gaps: prediction.compliance_gaps
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return res.status(500).json({ error: "Failed to save prediction" });
    }

    return res.status(200).json({
      success: true,
      prediction: data
    });

  } catch (error: any) {
    console.error("Audit prediction error:", error);
    return res.status(500).json({ 
      error: "Failed to generate audit prediction",
      details: error.message 
    });
  }
}
