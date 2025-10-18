import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { vessel_id } = req.body;

  try {
    // Get vessel data
    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq(vessel_id ? "id" : "status", vessel_id || "active");

    if (vesselError) throw vesselError;
    if (!vessels || vessels.length === 0) {
      return res.status(404).json({ error: "No vessels found" });
    }

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    const useAI = !!openaiKey;

    const results = [];

    for (const vessel of vessels) {
      let risks = [];

      if (useAI) {
        try {
          // Fetch operational data (last 60 days)
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

          const { data: incidents } = await supabase
            .from("dp_incidents")
            .select("*")
            .eq("vessel_id", vessel.id)
            .gte("incident_date", sixtyDaysAgo.toISOString());

          // Call OpenAI API
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.3,
              max_tokens: 2000,
              messages: [
                {
                  role: "system",
                  content: "You are a maritime risk forecasting AI. Analyze vessel data and predict tactical risks for the next 15 days. Return a JSON array of risk objects with fields: risk_type, severity (Critical/High/Medium/Low), description, probability (0-100), impact_score (1-10), forecasted_date (YYYY-MM-DD), recommended_actions (array of strings)."
                },
                {
                  role: "user",
                  content: `Analyze this vessel data and predict risks:\nVessel: ${vessel.name}\nRecent Incidents: ${JSON.stringify(incidents || [])}\n\nPredict tactical risks for the next 15 days.`
                }
              ]
            })
          });

          const aiData = await response.json();
          
          if (aiData.choices && aiData.choices[0]?.message?.content) {
            const content = aiData.choices[0].message.content;
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsedRisks = JSON.parse(jsonMatch[0]);
              risks = parsedRisks.map((risk: any) => ({
                ...risk,
                ai_generated: true,
                ai_confidence: 85,
              }));
            }
          }
        } catch (aiError) {
          console.error("AI error, falling back to rule-based:", aiError);
        }
      }

      // Fallback to rule-based logic if AI fails or is unavailable
      if (risks.length === 0) {
        const today = new Date();
        const in7Days = new Date(today);
        in7Days.setDate(today.getDate() + 7);
        const in15Days = new Date(today);
        in15Days.setDate(today.getDate() + 15);

        risks = [
          {
            risk_type: "Operational",
            severity: "Medium",
            description: "Routine operational risk assessment required",
            probability: 45,
            impact_score: 5,
            forecasted_date: in7Days.toISOString().split("T")[0],
            recommended_actions: ["Review operational procedures", "Conduct crew training"],
            ai_generated: false,
            ai_confidence: 60,
          },
          {
            risk_type: "Maintenance",
            severity: "Low",
            description: "Scheduled maintenance window approaching",
            probability: 30,
            impact_score: 3,
            forecasted_date: in15Days.toISOString().split("T")[0],
            recommended_actions: ["Schedule maintenance check", "Verify spare parts availability"],
            ai_generated: false,
            ai_confidence: 70,
          },
        ];
      }

      // Save risks to database
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 15);

      const risksToInsert = risks.map((risk: any) => ({
        vessel_id: vessel.id,
        risk_type: risk.risk_type,
        severity: risk.severity,
        description: risk.description,
        probability: risk.probability,
        impact_score: risk.impact_score,
        forecasted_date: risk.forecasted_date,
        valid_until: validUntilDate.toISOString().split("T")[0],
        recommended_actions: risk.recommended_actions,
        ai_generated: risk.ai_generated,
        ai_confidence: risk.ai_confidence,
        status: "open",
      }));

      const { data: insertedRisks, error: insertError } = await supabase
        .from("tactical_risks")
        .insert(risksToInsert)
        .select();

      if (insertError) {
        console.error("Error inserting risks:", insertError);
        continue;
      }

      results.push({
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        risks_created: insertedRisks?.length || 0,
        risks: insertedRisks,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Risks forecasted for ${results.length} vessel(s)`,
      results,
      ai_powered: useAI,
    });
  } catch (error) {
    console.error("Error forecasting risks:", error);
    return res.status(500).json({
      error: "Failed to forecast risks",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
