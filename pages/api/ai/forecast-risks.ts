import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { vessel_id } = req.body;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get vessels to analyze
    let vessels: { id: string; name: string; status: string }[] = [];
    if (vessel_id) {
      const { data } = await supabase
        .from("vessels")
        .select("*")
        .eq("id", vessel_id)
        .eq("status", "active")
        .single();
      if (data) vessels = [data];
    } else {
      const { data } = await supabase
        .from("vessels")
        .select("*")
        .eq("status", "active");
      if (data) vessels = data;
    }

    if (vessels.length === 0) {
      return res.status(404).json({ error: "No active vessels found" });
    }

    const results = [];

    for (const vessel of vessels) {
      // Get 60 days of operational data
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
          .gte("date", sixtyDaysAgo.toISOString()),
        supabase
          .from("safety_incidents")
          .select("*")
          .eq("vessel_id", vessel.id)
          .gte("incident_date", sixtyDaysAgo.toISOString())
      ]);

      const operationalData = {
        vessel_name: vessel.name,
        dp_incidents: dpIncidents.data || [],
        sgso_practices: sgsoRecords.data || [],
        safety_incidents: safetyIncidents.data || []
      };

      let risks: { system: string; risk_type: string; risk_score: number; risk_level: string; description: string; suggested_action: string }[] = [];

      // Try AI analysis with OpenAI
      if (openaiKey) {
        try {
          const openai = new OpenAI({ apiKey: openaiKey });
          const prompt = `Analyze the following 60 days of operational data for vessel "${vessel.name}" and predict tactical risks for the next 15 days.

Operational Data:
- DP Incidents: ${JSON.stringify(operationalData.dp_incidents.slice(0, 10))}
- SGSO Practices: ${JSON.stringify(operationalData.sgso_practices.slice(0, 10))}
- Safety Incidents: ${JSON.stringify(operationalData.safety_incidents.slice(0, 10))}

Generate a JSON array of predicted risks with this structure:
[{
  "system": "DP|Energia|SGSO|Comunicações|Propulsion|Navigation",
  "risk_type": "Failure|Intermittency|Delay|Degradation|Normal",
  "risk_score": 0-100,
  "risk_level": "Critical|High|Medium|Low",
  "description": "brief description",
  "suggested_action": "recommended action"
}]

Focus on systems with historical issues and predict 3-7 risks.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 2000
          });

          const content = completion.choices[0]?.message?.content || "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            risks = JSON.parse(jsonMatch[0]);
          }
        } catch (aiError) {
          console.error("AI analysis failed, using fallback:", aiError);
        }
      }

      // Fallback: rule-based risk analysis
      if (risks.length === 0) {
        const systems = ["DP", "Energia", "SGSO", "Comunicações", "Propulsion", "Navigation"];
        const dpIssues = operationalData.dp_incidents.length;
        const sgsoIssues = operationalData.sgso_practices.filter((p: { compliance_level?: string }) => p.compliance_level === "low").length;
        const safetyIssues = operationalData.safety_incidents.length;

        systems.forEach(system => {
          let riskScore = 30; // Base score
          let riskType = "Normal";
          let description = `${system} operating normally`;

          if (system === "DP" && dpIssues > 5) {
            riskScore = Math.min(85, 50 + dpIssues * 3);
            riskType = "Intermittency";
            description = `High DP incident rate (${dpIssues} in 60 days)`;
          } else if (system === "SGSO" && sgsoIssues > 3) {
            riskScore = Math.min(75, 40 + sgsoIssues * 5);
            riskType = "Degradation";
            description = "SGSO compliance issues detected";
          } else if (safetyIssues > 2) {
            riskScore = Math.min(70, 35 + safetyIssues * 5);
            riskType = "Delay";
            description = "Safety incidents may impact operations";
          }

          const riskLevel = riskScore >= 75 ? "Critical" : riskScore >= 60 ? "High" : riskScore >= 40 ? "Medium" : "Low";

          risks.push({
            system,
            risk_type: riskType,
            risk_score: riskScore,
            risk_level: riskLevel,
            description,
            suggested_action: riskScore >= 60 ? `Immediate inspection and maintenance required for ${system}` : `Monitor ${system} performance`
          });
        });
      }

      // Mark old risks as resolved
      await supabase
        .from("tactical_risks")
        .update({ status: "resolved" })
        .eq("vessel_id", vessel.id)
        .eq("status", "active");

      // Insert new risks
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() + 15);

      const risksToInsert = risks.map(risk => ({
        vessel_id: vessel.id,
        system: risk.system,
        risk_type: risk.risk_type,
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        description: risk.description,
        suggested_action: risk.suggested_action,
        predicted_date: now.toISOString(),
        valid_until: validUntil.toISOString(),
        status: "active"
      }));

      const { data: insertedRisks, error: insertError } = await supabase
        .from("tactical_risks")
        .insert(risksToInsert)
        .select();

      if (insertError) {
        console.error("Error inserting risks:", insertError);
      }

      results.push({
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        risks_generated: insertedRisks?.length || 0,
        risks: insertedRisks
      });
    }

    return res.status(200).json({
      success: true,
      message: `Generated risk forecasts for ${results.length} vessel(s)`,
      results
    });
  } catch (error: any) {
    console.error("Error in forecast-risks:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
