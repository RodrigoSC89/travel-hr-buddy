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

interface RiskForecast {
  vessel_id: string;
  risk_type: string;
  risk_title: string;
  risk_description: string;
  severity: string;
  probability: string;
  impact_score: number;
  forecast_date: string;
  recommended_action: string;
  confidence_score: number;
  predicted_by: string;
  data_source?: Record<string, unknown>;
}

// Fallback rule-based risk assessment
function generateRuleBasedRisks(vesselId: string, operationalData: Record<string, unknown>): RiskForecast[] {
  const risks: RiskForecast[] = [];
  const today = new Date();
  
  // Weather-based risk
  if (operationalData.weather_conditions?.includes("rough") || 
      operationalData.weather_conditions?.includes("storm")) {
    risks.push({
      vessel_id: vesselId,
      risk_type: "weather",
      risk_title: "Adverse Weather Conditions",
      risk_description: "Rough sea conditions may impact operations",
      severity: "high",
      probability: "medium",
      impact_score: 7,
      forecast_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      recommended_action: "Monitor weather forecasts and prepare contingency plans",
      confidence_score: 0.75,
      predicted_by: "rule-based"
    });
  }

  // Equipment maintenance risk
  if (operationalData.days_since_maintenance > 60) {
    risks.push({
      vessel_id: vesselId,
      risk_type: "equipment",
      risk_title: "Equipment Maintenance Due",
      risk_description: "Critical equipment maintenance window approaching",
      severity: "medium",
      probability: "high",
      impact_score: 6,
      forecast_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      recommended_action: "Schedule maintenance inspection within next 7 days",
      confidence_score: 0.85,
      predicted_by: "rule-based"
    });
  }

  // Compliance risk
  if (operationalData.certification_expiry_days < 30) {
    risks.push({
      vessel_id: vesselId,
      risk_type: "compliance",
      risk_title: "Certification Expiry",
      risk_description: "Vessel certification expiring soon",
      severity: "high",
      probability: "high",
      impact_score: 8,
      forecast_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      recommended_action: "Initiate renewal process immediately",
      confidence_score: 0.95,
      predicted_by: "rule-based"
    });
  }

  return risks;
}

// AI-powered risk forecast using GPT-4o-mini
async function forecastRisksWithAI(vesselId: string, operationalData: any): Promise<RiskForecast[]> {
  if (!openai) {
    console.log("OpenAI not configured, using rule-based fallback");
    return generateRuleBasedRisks(vesselId, operationalData);
  }

  try {
    const prompt = `You are a maritime risk analyst. Analyze the following operational data for vessel ${vesselId} and predict potential risks for the next 15 days.

Operational Data:
${JSON.stringify(operationalData, null, 2)}

Provide a JSON array of 3-5 predicted risks with the following structure for each risk:
{
  "risk_type": "operational|safety|environmental|compliance|weather|equipment|crew|logistical",
  "risk_title": "Brief title",
  "risk_description": "Detailed description",
  "severity": "low|medium|high|critical",
  "probability": "low|medium|high",
  "impact_score": 1-10,
  "forecast_date": "YYYY-MM-DD (within next 15 days)",
  "recommended_action": "Specific mitigation action",
  "confidence_score": 0.0-1.0
}

Return only valid JSON array, no markdown or explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content || "[]";
    const aiRisks = JSON.parse(content);

    return aiRisks.map((risk: unknown) => ({
      ...risk,
      vessel_id: vesselId,
      predicted_by: "ai",
      data_source: { model: "gpt-4o-mini", data: operationalData }
    }));
  } catch (error) {
    console.error("AI forecasting error:", error);
    return generateRuleBasedRisks(vesselId, operationalData);
  }
}

// Fetch operational data for risk analysis
async function getOperationalData(vesselId?: string) {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Get recent incidents
  const { data: incidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .gte("created_at", sixtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  // Get vessel info if specific vessel
  let vesselData = null;
  if (vesselId) {
    const { data } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vesselId)
      .single();
    vesselData = data;
  }

  return {
    incidents: incidents || [],
    vessel: vesselData,
    days_since_maintenance: Math.floor(Math.random() * 90), // Mock data
    certification_expiry_days: Math.floor(Math.random() * 60), // Mock data
    weather_conditions: ["normal", "rough", "calm"][Math.floor(Math.random() * 3)]
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
    const { vessel_id, process_all } = req.body;

    if (!vessel_id && !process_all) {
      return res.status(400).json({ 
        error: "vessel_id or process_all flag required" 
      });
    }

    let vesselsToProcess: string[] = [];
    
    if (process_all) {
      // Get all active vessels
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id")
        .eq("status", "active");
      
      vesselsToProcess = vessels?.map(v => v.id) || [];
    } else {
      vesselsToProcess = [vessel_id];
    }

    const allRisks: RiskForecast[] = [];

    for (const vesselId of vesselsToProcess) {
      const operationalData = await getOperationalData(vesselId);
      const risks = await forecastRisksWithAI(vesselId, operationalData);
      
      // Insert risks into database
      for (const risk of risks) {
        const { error } = await supabase
          .from("tactical_risks")
          .insert(risk);
        
        if (error) {
          console.error(`Error inserting risk for ${vesselId}:`, error);
        }
      }

      allRisks.push(...risks);
    }

    return res.status(200).json({
      success: true,
      risks_generated: allRisks.length,
      vessels_processed: vesselsToProcess.length,
      risks: allRisks
    });

  } catch (error: unknown) {
    console.error("Forecast risks error:", error);
    return res.status(500).json({ 
      error: "Failed to forecast risks",
      details: error.message 
    });
  }
}
