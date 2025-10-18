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

interface RiskPrediction {
  system: string;
  predicted_risk: string;
  risk_score: number;
  suggested_action: string;
  ai_confidence: number;
}

interface OperationalData {
  dp_incidents: any[];
  sgso_practices: any[];
  safety_incidents: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { vessel_id, vessel_name, all_vessels } = req.body;

    // Validate inputs
    if (!all_vessels && !vessel_id) {
      return res.status(400).json({
        error: "Either vessel_id or all_vessels=true must be provided",
      });
    }

    let vessels: any[] = [];

    if (all_vessels) {
      // Get all active vessels
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type")
        .eq("status", "active");

      if (error) throw error;
      vessels = data || [];
    } else {
      // Get specific vessel
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type")
        .eq("id", vessel_id)
        .single();

      if (error) throw error;
      if (data) vessels = [data];
    }

    if (vessels.length === 0) {
      return res.status(404).json({ error: "No vessels found" });
    }

    const results = [];

    for (const vessel of vessels) {
      try {
        // Collect operational data for the last 60 days
        const operationalData = await collectOperationalData(vessel.id);

        // Generate risk predictions using AI or fallback
        const predictions = await generateRiskPredictions(
          vessel,
          operationalData
        );

        // Mark old predictions as resolved
        await supabase
          .from("tactical_risks")
          .update({ status: "resolved", resolved_at: new Date().toISOString() })
          .eq("vessel_id", vessel.id)
          .eq("status", "pending")
          .lt("valid_until", new Date().toISOString());

        // Insert new predictions
        for (const prediction of predictions) {
          const { error: insertError } = await supabase
            .from("tactical_risks")
            .insert({
              vessel_id: vessel.id,
              system: prediction.system,
              predicted_risk: prediction.predicted_risk,
              risk_score: prediction.risk_score,
              suggested_action: prediction.suggested_action,
              ai_confidence: prediction.ai_confidence,
              status: "pending",
            });

          if (insertError) {
            console.error(
              `Error inserting risk for vessel ${vessel.name}:`,
              insertError
            );
          }
        }

        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          predictions_count: predictions.length,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing vessel ${vessel.name}:`, error);
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Risk predictions generated successfully",
      results,
    });
  } catch (error) {
    console.error("Error in forecast-risks API:", error);
    res.status(500).json({
      error: "Failed to generate risk predictions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function collectOperationalData(
  vessel_id: string
): Promise<OperationalData> {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Collect DP incidents
  const { data: dpIncidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .gte("created_at", sixtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  // Collect SGSO practices
  const { data: sgsoPractices } = await supabase
    .from("sgso_practices")
    .select("*")
    .gte("created_at", sixtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  // Collect safety incidents (if available)
  const { data: safetyIncidents } = await supabase
    .from("safety_incidents")
    .select("*")
    .gte("created_at", sixtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    dp_incidents: dpIncidents || [],
    sgso_practices: sgsoPractices || [],
    safety_incidents: safetyIncidents || [],
  };
}

async function generateRiskPredictions(
  vessel: any,
  operationalData: OperationalData
): Promise<RiskPrediction[]> {
  if (!openai) {
    console.log("OpenAI not available, using fallback risk generation");
    return generateFallbackRiskPredictions(vessel, operationalData);
  }

  try {
    const prompt = `You are a maritime risk prediction system analyzing vessel operational data.

Vessel: ${vessel.name} (Type: ${vessel.vessel_type})

Operational data from the last 60 days:
- DP Incidents: ${operationalData.dp_incidents.length}
- SGSO Practices: ${operationalData.sgso_practices.length}
- Safety Incidents: ${operationalData.safety_incidents.length}

Recent incidents summary:
${operationalData.dp_incidents.slice(0, 5).map((inc: any) => `- DP: ${inc.incident_type || "Unknown type"}`).join("\n")}

Analyze this data and predict potential risks for the next 15 days across these systems:
- DP (Dynamic Positioning)
- Energia (Power/Energy)
- SGSO (Safety Management)
- Comunicações (Communications)
- Propulsão (Propulsion)
- Navegação (Navigation)

For each system with a risk level above 20, provide:
1. predicted_risk: One of [Failure, Intermittency, Delay, Degradation, Normal]
2. risk_score: 0-100 (only include if >20)
3. suggested_action: Specific actionable recommendation
4. ai_confidence: 0.0-1.0

Return ONLY a valid JSON array with this structure:
[
  {
    "system": "DP",
    "predicted_risk": "Intermittency",
    "risk_score": 65,
    "suggested_action": "Schedule preventive maintenance for thruster #2",
    "ai_confidence": 0.75
  }
]

Return an empty array [] if no significant risks are detected.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content || "[]";
    
    // Extract JSON from response (handle potential markdown wrapping)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    }
    
    const predictions = JSON.parse(jsonContent);

    // Validate and sanitize predictions
    return predictions
      .filter((p: any) => p.risk_score > 20)
      .map((p: any) => ({
        system: p.system,
        predicted_risk: p.predicted_risk,
        risk_score: Math.min(100, Math.max(0, p.risk_score)),
        suggested_action: p.suggested_action,
        ai_confidence: Math.min(1, Math.max(0, p.ai_confidence || 0.5)),
      }));
  } catch (error) {
    console.error("Error calling OpenAI, using fallback:", error);
    return generateFallbackRiskPredictions(vessel, operationalData);
  }
}

function generateFallbackRiskPredictions(
  vessel: any,
  operationalData: OperationalData
): RiskPrediction[] {
  const predictions: RiskPrediction[] = [];

  // Rule-based risk assessment when AI is not available
  const dpIncidentCount = operationalData.dp_incidents.length;
  const sgsoCount = operationalData.sgso_practices.length;
  const safetyCount = operationalData.safety_incidents.length;

  // DP System risk
  if (dpIncidentCount > 5) {
    predictions.push({
      system: "DP",
      predicted_risk: "Intermittency",
      risk_score: Math.min(40 + dpIncidentCount * 5, 85),
      suggested_action:
        "Revisar logs do sistema DP e agendar manutenção preventiva",
      ai_confidence: 0.6,
    });
  }

  // SGSO risk based on practice compliance
  if (sgsoCount < 10) {
    predictions.push({
      system: "SGSO",
      predicted_risk: "Delay",
      risk_score: Math.max(30, 70 - sgsoCount * 3),
      suggested_action:
        "Intensificar práticas SGSO e treinamento da tripulação",
      ai_confidence: 0.65,
    });
  }

  // Safety incidents indicate potential broader issues
  if (safetyCount > 3) {
    predictions.push({
      system: "Energia",
      predicted_risk: "Degradation",
      risk_score: Math.min(35 + safetyCount * 8, 75),
      suggested_action:
        "Investigar padrões de incidentes e verificar sistemas de energia",
      ai_confidence: 0.55,
    });
  }

  // Communication system based on overall operational health
  const totalIncidents = dpIncidentCount + safetyCount;
  if (totalIncidents > 8) {
    predictions.push({
      system: "Comunicações",
      predicted_risk: "Intermittency",
      risk_score: Math.min(25 + totalIncidents * 3, 60),
      suggested_action:
        "Verificar sistemas de comunicação e redundância de equipamentos",
      ai_confidence: 0.5,
    });
  }

  return predictions;
}
