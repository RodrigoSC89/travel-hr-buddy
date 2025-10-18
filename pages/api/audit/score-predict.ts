import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { vessel_id, audit_type } = req.body;

  if (!vessel_id || !audit_type) {
    return res.status(400).json({ error: "vessel_id and audit_type are required" });
  }

  if (!AUDIT_TYPES.includes(audit_type)) {
    return res.status(400).json({ 
      error: "Invalid audit_type",
      valid_types: AUDIT_TYPES 
    });
  }

  try {
    // Get vessel data
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vessel_id)
      .single();

    if (vesselError || !vessel) {
      return res.status(404).json({ error: "Vessel not found" });
    }

    // Get compliance data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: audits } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("audit_date", sixMonthsAgo.toISOString());

    const { data: incidents } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("incident_date", sixMonthsAgo.toISOString());

    const { data: trainings } = await supabase
      .from("crew_training_records")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("training_date", sixMonthsAgo.toISOString());

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    let prediction: any = null;

    if (openaiKey) {
      try {
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
                content: `You are a maritime audit prediction AI. Analyze vessel compliance data and predict audit outcomes. Return a JSON object with: predicted_score (0-100), confidence_level (0-100), pass_probability (0-100), compliance_areas (array of {area: string, score: number}), weaknesses (array of strings), recommendations (array of strings), readiness_status (Ready/Needs_Improvement/Critical).`
              },
              {
                role: "user",
                content: `Predict ${audit_type} audit outcome for vessel ${vessel.name}:\nRecent Audits: ${JSON.stringify(audits || [])}\nIncidents: ${JSON.stringify(incidents || [])}\nTrainings: ${JSON.stringify(trainings || [])}`
              }
            ]
          })
        });

        const aiData = await response.json();
        
        if (aiData.choices && aiData.choices[0]?.message?.content) {
          const content = aiData.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            prediction = JSON.parse(jsonMatch[0]);
            prediction.ai_generated = true;
            prediction.ai_model = "gpt-4o-mini";
          }
        }
      } catch (aiError) {
        console.error("AI error, falling back to rule-based:", aiError);
      }
    }

    // Fallback to rule-based logic
    if (!prediction) {
      const incidentCount = incidents?.length || 0;
      const auditCount = audits?.length || 0;
      const trainingCount = trainings?.length || 0;

      // Calculate base score
      let baseScore = 75;
      baseScore -= incidentCount * 5; // Deduct for incidents
      baseScore += auditCount * 3; // Add for previous audits
      baseScore += trainingCount * 2; // Add for trainings
      baseScore = Math.max(0, Math.min(100, baseScore));

      const passProbability = baseScore >= 70 ? 80 : baseScore >= 60 ? 60 : 40;
      let readinessStatus = "Ready";
      if (baseScore < 60) readinessStatus = "Critical";
      else if (baseScore < 70) readinessStatus = "Needs_Improvement";

      prediction = {
        predicted_score: baseScore,
        confidence_level: 70,
        pass_probability: passProbability,
        compliance_areas: [
          { area: "Safety Management", score: baseScore + 5 },
          { area: "Operational Procedures", score: baseScore },
          { area: "Training & Competency", score: baseScore + trainingCount * 3 },
          { area: "Documentation", score: baseScore - 5 },
          { area: "Equipment Maintenance", score: baseScore },
          { area: "Emergency Preparedness", score: baseScore + 2 },
        ],
        weaknesses: incidentCount > 0 
          ? ["Recent incidents requiring review", "Incident reporting processes"]
          : ["Routine documentation updates needed"],
        recommendations: [
          "Review safety procedures",
          "Conduct crew training sessions",
          "Update compliance documentation",
          incidentCount > 0 ? "Address recent incident findings" : "Maintain current standards",
        ],
        readiness_status: readinessStatus,
        ai_generated: false,
      };
    }

    // Save prediction to database
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);

    const predictionToInsert = {
      vessel_id,
      audit_type,
      predicted_score: prediction.predicted_score,
      confidence_level: prediction.confidence_level,
      pass_probability: prediction.pass_probability,
      compliance_areas: prediction.compliance_areas,
      weaknesses: prediction.weaknesses,
      recommendations: prediction.recommendations,
      readiness_status: prediction.readiness_status,
      prediction_date: new Date().toISOString().split("T")[0],
      valid_until: validUntil.toISOString().split("T")[0],
      ai_generated: prediction.ai_generated || false,
      ai_model: prediction.ai_model || null,
    };

    const { data: savedPrediction, error: insertError } = await supabase
      .from("audit_predictions")
      .insert(predictionToInsert)
      .select()
      .single();

    if (insertError) {
      console.error("Error saving prediction:", insertError);
      return res.status(500).json({ error: "Failed to save prediction" });
    }

    return res.status(200).json({
      success: true,
      vessel_name: vessel.name,
      audit_type,
      prediction: savedPrediction,
      ai_powered: !!openaiKey,
    });
  } catch (error) {
    console.error("Error predicting audit score:", error);
    return res.status(500).json({
      error: "Failed to predict audit score",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
