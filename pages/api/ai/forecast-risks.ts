import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { vessel_id, process_all } = req.body;

  if (!vessel_id && !process_all) {
    return res.status(400).json({ error: "vessel_id or process_all required" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get vessels to process
    let vesselsQuery = supabase.from("vessels").select("id, name");
    
    if (vessel_id) {
      vesselsQuery = vesselsQuery.eq("id", vessel_id);
    }

    const { data: vessels, error: vesselsError } = await vesselsQuery;

    if (vesselsError) throw vesselsError;
    if (!vessels || vessels.length === 0) {
      return res.status(404).json({ error: "No vessels found" });
    }

    const results = [];

    for (const vessel of vessels) {
      try {
        // Collect operational data from last 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Get DP incidents
        const { data: dpIncidents } = await supabase
          .from("dp_incidents")
          .select("*")
          .eq("vessel_id", vessel.id)
          .gte("incident_date", sixtyDaysAgo.toISOString())
          .order("incident_date", { ascending: false });

        // Get safety incidents
        const { data: safetyIncidents } = await supabase
          .from("sgso_incidents")
          .select("*")
          .eq("vessel_id", vessel.id)
          .gte("incident_date", sixtyDaysAgo.toISOString())
          .order("incident_date", { ascending: false });

        // Get SGSO practices
        const { data: sgsoPractices } = await supabase
          .from("sgso_practices")
          .select("*")
          .eq("vessel_id", vessel.id)
          .gte("created_at", sixtyDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        // Generate AI predictions
        const risks = await generateRiskPredictions(
          vessel,
          dpIncidents || [],
          safetyIncidents || [],
          sgsoPractices || []
        );

        // Mark old risks as resolved
        await supabase
          .from("tactical_risks")
          .update({ status: "resolved" })
          .eq("vessel_id", vessel.id)
          .eq("status", "active")
          .lt("valid_until", new Date().toISOString());

        // Insert new predictions
        if (risks.length > 0) {
          const { error: insertError } = await supabase
            .from("tactical_risks")
            .insert(risks);

          if (insertError) {
            console.error(`Error inserting risks for ${vessel.name}:`, insertError);
          }
        }

        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          risks_generated: risks.length,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing vessel ${vessel.name}:`, error);
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    return res.status(200).json({
      message: "Risk forecasting completed",
      results,
    });
  } catch (error) {
    console.error("Error in forecast-risks:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

async function generateRiskPredictions(
  vessel: { id: string; name: string },
  dpIncidents: any[],
  safetyIncidents: any[],
  sgsoPractices: any[]
): Promise<any[]> {
  // Try AI-powered prediction first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Analyze the following operational data for vessel "${vessel.name}" and generate risk predictions for the next 15 days.

DP Incidents (last 60 days): ${dpIncidents.length} incidents
${dpIncidents.slice(0, 5).map((inc) => `- ${inc.description || "N/A"} (${inc.incident_date})`).join("\n")}

Safety Incidents (last 60 days): ${safetyIncidents.length} incidents
${safetyIncidents.slice(0, 5).map((inc) => `- ${inc.description || "N/A"} (${inc.incident_date})`).join("\n")}

SGSO Practices (last 60 days): ${sgsoPractices.length} entries

Based on this data, predict potential risks for the following systems:
1. DP (Dynamic Positioning)
2. Energia (Energy Systems)
3. SGSO (Safety Management)
4. Comunicações (Communications)

For each risk, provide:
- system_name: string
- risk_type: "Failure" | "Intermittency" | "Delay" | "Degradation" | "Normal"
- risk_score: 0-100 (higher = more critical)
- description: brief description
- suggested_actions: recommended actions
- ai_confidence: 0-100

Return ONLY a JSON array of risk objects, no additional text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const aiRisks = JSON.parse(jsonMatch[0]);
        
        return aiRisks.map((risk: any) => ({
          vessel_id: vessel.id,
          system_name: risk.system_name,
          risk_type: risk.risk_type,
          risk_score: risk.risk_score,
          predicted_date: new Date().toISOString().split("T")[0],
          description: risk.description,
          suggested_actions: risk.suggested_actions,
          ai_confidence: risk.ai_confidence || 75,
          status: "active",
        }));
      }
    } catch (error) {
      console.error("AI prediction failed, using fallback:", error);
    }
  }

  // Fallback: Rule-based analysis
  return generateFallbackRisks(vessel, dpIncidents, safetyIncidents, sgsoPractices);
}

function generateFallbackRisks(
  vessel: { id: string; name: string },
  dpIncidents: any[],
  safetyIncidents: any[],
  sgsoPractices: any[]
): any[] {
  const risks: any[] = [];
  const today = new Date().toISOString().split("T")[0];

  // DP System Risk
  if (dpIncidents.length >= 3) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "DP",
      risk_type: dpIncidents.length >= 5 ? "Failure" : "Intermittency",
      risk_score: Math.min(40 + dpIncidents.length * 10, 95),
      predicted_date: today,
      description: `Histórico de ${dpIncidents.length} incidentes DP nos últimos 60 dias indica risco elevado`,
      suggested_actions: "Revisar sistema DP, verificar redundâncias, treinar equipe",
      ai_confidence: 70,
      status: "active",
    });
  }

  // Safety Management Risk
  if (safetyIncidents.length >= 2) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "SGSO",
      risk_type: safetyIncidents.length >= 4 ? "Failure" : "Degradation",
      risk_score: Math.min(35 + safetyIncidents.length * 12, 90),
      predicted_date: today,
      description: `${safetyIncidents.length} incidentes de segurança detectados`,
      suggested_actions: "Intensificar treinamentos, revisar procedimentos SGSO",
      ai_confidence: 65,
      status: "active",
    });
  }

  // Energy System Risk (if many incidents)
  if (dpIncidents.length + safetyIncidents.length >= 5) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "Energia",
      risk_type: "Degradation",
      risk_score: 55,
      predicted_date: today,
      description: "Histórico operacional sugere possível degradação do sistema de energia",
      suggested_actions: "Inspeção preventiva dos geradores, verificar backups",
      ai_confidence: 60,
      status: "active",
    });
  }

  // Communications Risk (baseline)
  if (risks.length > 0) {
    risks.push({
      vessel_id: vessel.id,
      system_name: "Comunicações",
      risk_type: "Normal",
      risk_score: 25,
      predicted_date: today,
      description: "Sistema de comunicações operando dentro dos parâmetros normais",
      suggested_actions: "Manutenção preventiva conforme cronograma",
      ai_confidence: 80,
      status: "active",
    });
  }

  return risks;
}
