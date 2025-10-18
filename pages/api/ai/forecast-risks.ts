import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface VesselData {
  id: string;
  name: string;
  vessel_type: string;
  status: string;
}

interface OperationalLog {
  system: string;
  incidents: number;
  last_incident_date: string;
  avg_severity: number;
}

interface RiskPrediction {
  system: string;
  predicted_risk: string;
  risk_score: number;
  suggested_action: string;
  reasoning: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { vessel_id } = req.body;

    // Get vessel information
    const { data: vessels, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq(vessel_id ? "id" : "status", vessel_id || "active");

    if (vesselError) {
      console.error("Error fetching vessels:", vesselError);
      return res.status(500).json({ error: vesselError.message });
    }

    if (!vessels || vessels.length === 0) {
      return res.status(404).json({ error: "Nenhuma embarcação encontrada." });
    }

    const results = [];

    for (const vessel of vessels) {
      // Collect operational data
      const operationalData = await collectOperationalData(vessel.id);
      
      // Generate AI predictions
      const predictions = await generateRiskPredictions(
        vessel,
        operationalData
      );

      // Store predictions in database
      for (const prediction of predictions) {
        const { error: insertError } = await supabase
          .from("tactical_risks")
          .insert({
            vessel_id: vessel.id,
            system: prediction.system,
            predicted_risk: prediction.predicted_risk,
            risk_score: prediction.risk_score,
            suggested_action: prediction.suggested_action,
            analysis_details: {
              reasoning: prediction.reasoning,
              based_on_data: operationalData,
            },
            valid_until: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000
            ).toISOString(), // 15 days
            status: "active",
          });

        if (insertError) {
          console.error("Error inserting tactical risk:", insertError);
        }
      }

      results.push({
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        risks_generated: predictions.length,
        predictions: predictions,
      });
    }

    return res.status(200).json({
      success: true,
      processed_vessels: results.length,
      results: results,
    });
  } catch (error) {
    console.error("Error in forecast-risks endpoint:", error);
    return res.status(500).json({
      error: "Erro interno ao processar previsões de risco.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function collectOperationalData(vesselId: string): Promise<any> {
  // Collect data from multiple sources
  const [dpIncidents, safetyIncidents, sgsoData] = await Promise.all([
    // DP Incidents
    supabase
      .from("dp_incidents")
      .select("*")
      .eq("vessel_id", vesselId)
      .gte(
        "created_at",
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      ) // Last 60 days
      .order("created_at", { ascending: false })
      .limit(50),

    // Safety Incidents
    supabase
      .from("safety_incidents")
      .select("*")
      .eq("vessel_id", vesselId)
      .gte(
        "created_at",
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(50),

    // SGSO Practice Status
    supabase
      .from("sgso_practices")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  // Aggregate data by system
  const systemData: { [key: string]: OperationalLog } = {
    DP: {
      system: "DP",
      incidents: dpIncidents.data?.length || 0,
      last_incident_date:
        dpIncidents.data?.[0]?.created_at || "N/A",
      avg_severity:
        dpIncidents.data?.reduce(
          (acc: number, inc: any) =>
            acc + (inc.severity === "critical" ? 5 : inc.severity === "high" ? 4 : 3),
          0
        ) / (dpIncidents.data?.length || 1) || 0,
    },
    Energia: {
      system: "Energia",
      incidents: 0,
      last_incident_date: "N/A",
      avg_severity: 0,
    },
    SGSO: {
      system: "SGSO",
      incidents: sgsoData.data?.filter((p: any) => p.status === "non_compliant").length || 0,
      last_incident_date: sgsoData.data?.[0]?.updated_at || "N/A",
      avg_severity: sgsoData.data?.reduce(
        (acc: number, p: any) => acc + (100 - (p.compliance_level || 0)) / 20,
        0
      ) / (sgsoData.data?.length || 1) || 0,
    },
    Comunicações: {
      system: "Comunicações",
      incidents: 0,
      last_incident_date: "N/A",
      avg_severity: 0,
    },
  };

  return systemData;
}

async function generateRiskPredictions(
  vessel: VesselData,
  operationalData: any
): Promise<RiskPrediction[]> {
  const prompt = `
Você é um sistema de previsão de riscos técnicos para embarcações offshore.

Analise os dados operacionais da embarcação "${vessel.name}" e informe:

1. Quais sistemas apresentam risco elevado de falha nos próximos 15 dias
2. Tipo de risco: Falha (total), Intermitência, Atraso, Degradação, ou Normal
3. Score de risco (0-100, onde 100 é crítico)
4. Ação recomendada para evitar ou mitigar a falha

Dados operacionais:
${JSON.stringify(operationalData, null, 2)}

Responda APENAS com um array JSON válido no seguinte formato:
[
  {
    "system": "DP",
    "predicted_risk": "Intermitência",
    "risk_score": 65,
    "suggested_action": "Realizar manutenção preventiva no sistema de posicionamento",
    "reasoning": "Histórico recente mostra 3 incidentes nos últimos 60 dias"
  }
]

Considere TODOS os sistemas: DP, Energia, SGSO, Comunicações, mesmo que o risco seja baixo.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em análise de riscos operacionais para embarcações offshore. Responda sempre com JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "[]";
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    
    const predictions: RiskPrediction[] = JSON.parse(jsonContent);
    
    // Validate predictions
    return predictions.filter(
      (p) =>
        p.system &&
        p.predicted_risk &&
        p.risk_score >= 0 &&
        p.risk_score <= 100 &&
        p.suggested_action
    );
  } catch (error) {
    console.error("Error generating AI predictions:", error);
    
    // Fallback: return basic predictions based on data analysis
    return Object.values(operationalData).map((data: any) => ({
      system: data.system,
      predicted_risk: data.incidents > 3 ? "Intermitência" : "Normal",
      risk_score: Math.min(data.incidents * 15 + data.avg_severity * 10, 100),
      suggested_action:
        data.incidents > 3
          ? `Verificar e realizar manutenção preventiva no sistema ${data.system}`
          : `Continuar monitoramento regular do sistema ${data.system}`,
      reasoning: `Baseado em ${data.incidents} incidentes recentes`,
    }));
  }
}
