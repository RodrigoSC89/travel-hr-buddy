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
  risk_category: string;
  risk_type: string;
  risk_score: number;
  description: string;
  predicted_date: string;
  recommended_actions: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { vessel_id } = req.body;

    // Get vessels to analyze
    let vessels;
    if (vessel_id) {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .eq("id", vessel_id)
        .eq("status", "active")
        .single();

      if (error) throw error;
      vessels = data ? [data] : [];
    } else {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      vessels = data || [];
    }

    if (vessels.length === 0) {
      return res.status(404).json({ error: "No active vessels found" });
    }

    const allForecasts: RiskForecast[] = [];

    // Process each vessel
    for (const vessel of vessels) {
      try {
        // Fetch operational data for the last 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [dpIncidents, sgsoRecords, safetyIncidents] = await Promise.all([
          supabase
            .from("dp_incidents")
            .select("*")
            .eq("vessel_id", vessel.id)
            .gte("incident_date", sixtyDaysAgo.toISOString()),
          supabase
            .from("sgso_practices")
            .select("*")
            .eq("vessel_id", vessel.id)
            .gte("created_at", sixtyDaysAgo.toISOString()),
          supabase
            .from("safety_incidents")
            .select("*")
            .eq("vessel_id", vessel.id)
            .gte("incident_date", sixtyDaysAgo.toISOString()),
        ]);

        let forecasts: RiskForecast[];

        // Try AI-powered forecasting if OpenAI is available
        if (openai) {
          const operationalContext = {
            vessel_name: vessel.name,
            vessel_type: vessel.type,
            dp_incidents_count: dpIncidents.data?.length || 0,
            sgso_records_count: sgsoRecords.data?.length || 0,
            safety_incidents_count: safetyIncidents.data?.length || 0,
            recent_dp_incidents: dpIncidents.data?.slice(0, 5) || [],
            recent_safety_incidents: safetyIncidents.data?.slice(0, 5) || [],
          };

          const prompt = `You are a maritime risk assessment AI. Analyze the following operational data and predict potential risks for the next 15 days.

Vessel: ${operationalContext.vessel_name} (${operationalContext.vessel_type})
Last 60 days data:
- DP Incidents: ${operationalContext.dp_incidents_count}
- SGSO Records: ${operationalContext.sgso_records_count}
- Safety Incidents: ${operationalContext.safety_incidents_count}

Based on this data, predict 3-5 tactical risks with the following structure:
- risk_category: one of [DP, Energia, SGSO, Comunicações, Navegação, Máquinas, Segurança]
- risk_type: one of [Failure, Intermittency, Delay, Degradation, Normal]
- risk_score: 0-100 (higher = more critical)
- description: detailed description of the risk
- recommended_actions: array of 2-3 specific actions to mitigate the risk

Respond ONLY with a valid JSON array of risk predictions.`;

          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              max_tokens: 2000,
            });

            const aiResponse = completion.choices[0]?.message?.content || "[]";
            const parsedForecasts = JSON.parse(aiResponse);

            forecasts = parsedForecasts.map((f: any) => ({
              vessel_id: vessel.id,
              risk_category: f.risk_category,
              risk_type: f.risk_type,
              risk_score: Math.min(100, Math.max(0, f.risk_score)),
              description: f.description,
              predicted_date: new Date().toISOString(),
              recommended_actions: f.recommended_actions,
            }));
          } catch (aiError) {
            console.error("AI forecasting failed, using fallback:", aiError);
            forecasts = generateFallbackForecasts(
              vessel,
              dpIncidents.data?.length || 0,
              safetyIncidents.data?.length || 0
            );
          }
        } else {
          // Fallback to rule-based forecasting
          forecasts = generateFallbackForecasts(
            vessel,
            dpIncidents.data?.length || 0,
            safetyIncidents.data?.length || 0
          );
        }

        allForecasts.push(...forecasts);

        // Mark expired risks as resolved
        await supabase
          .from("tactical_risks")
          .update({ status: "Expired" })
          .eq("vessel_id", vessel.id)
          .eq("status", "Active")
          .lt("valid_until", new Date().toISOString());

        // Insert new forecasts
        if (forecasts.length > 0) {
          const { error: insertError } = await supabase
            .from("tactical_risks")
            .insert(forecasts);

          if (insertError) {
            console.error(
              `Error inserting forecasts for vessel ${vessel.name}:`,
              insertError
            );
          }
        }
      } catch (vesselError) {
        console.error(
          `Error processing vessel ${vessel.name}:`,
          vesselError
        );
        continue;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${allForecasts.length} risk forecasts for ${vessels.length} vessel(s)`,
      forecasts: allForecasts,
    });
  } catch (error: any) {
    console.error("Error in forecast-risks API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

// Fallback rule-based forecasting
function generateFallbackForecasts(
  vessel: any,
  dpIncidentsCount: number,
  safetyIncidentsCount: number
): RiskForecast[] {
  const forecasts: RiskForecast[] = [];

  // DP System risk based on incident count
  if (dpIncidentsCount > 3) {
    forecasts.push({
      vessel_id: vessel.id,
      risk_category: "DP",
      risk_type: "Intermittency",
      risk_score: Math.min(85, 60 + dpIncidentsCount * 5),
      description: `High frequency of DP incidents detected (${dpIncidentsCount} in last 60 days). Potential system degradation or operator training gaps.`,
      predicted_date: new Date().toISOString(),
      recommended_actions: [
        "Schedule comprehensive DP system inspection",
        "Review operator training records",
        "Analyze incident patterns for root cause",
      ],
    });
  }

  // Safety risk based on safety incidents
  if (safetyIncidentsCount > 2) {
    forecasts.push({
      vessel_id: vessel.id,
      risk_category: "Segurança",
      risk_type: "Degradation",
      risk_score: Math.min(75, 50 + safetyIncidentsCount * 8),
      description: `Elevated safety incident rate (${safetyIncidentsCount} incidents). Review safety protocols and crew awareness.`,
      predicted_date: new Date().toISOString(),
      recommended_actions: [
        "Conduct safety toolbox talks",
        "Review and update safety procedures",
        "Implement additional safety audits",
      ],
    });
  }

  // SGSO compliance risk
  forecasts.push({
    vessel_id: vessel.id,
    risk_category: "SGSO",
    risk_type: "Delay",
    risk_score: 45,
    description:
      "Routine SGSO compliance check recommended. Ensure all documentation is up to date.",
    predicted_date: new Date().toISOString(),
    recommended_actions: [
      "Review SGSO documentation completeness",
      "Update risk assessments",
      "Schedule internal audit",
    ],
  });

  // If no specific risks detected, add a low-risk general monitoring item
  if (forecasts.length === 0) {
    forecasts.push({
      vessel_id: vessel.id,
      risk_category: "Navegação",
      risk_type: "Normal",
      risk_score: 25,
      description:
        "No significant operational risks detected. Continue routine monitoring.",
      predicted_date: new Date().toISOString(),
      recommended_actions: [
        "Maintain current operational procedures",
        "Continue routine inspections",
      ],
    });
  }

  return forecasts;
}
