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

  const { vessel_id, audit_type } = req.body;

  if (!vessel_id || !audit_type) {
    return res.status(400).json({ error: "vessel_id and audit_type required" });
  }

  const validAuditTypes = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];
  if (!validAuditTypes.includes(audit_type)) {
    return res.status(400).json({ error: "Invalid audit_type" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get vessel info
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("id", vessel_id)
      .single();

    if (vesselError || !vessel) {
      return res.status(404).json({ error: "Vessel not found" });
    }

    // Collect compliance data from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get incidents
    const { data: incidents } = await supabase
      .from("sgso_incidents")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("incident_date", sixMonthsAgo.toISOString())
      .order("incident_date", { ascending: false });

    // Get training records
    const { data: training } = await supabase
      .from("crew_training_records")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("training_date", sixMonthsAgo.toISOString())
      .order("training_date", { ascending: false });

    // Get certificates
    const { data: certificates } = await supabase
      .from("vessel_certificates")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("expiry_date", new Date().toISOString())
      .order("expiry_date", { ascending: true });

    // Get SGSO practices
    const { data: sgsoPractices } = await supabase
      .from("sgso_practices")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: false });

    // Generate audit prediction
    const prediction = await generateAuditPrediction(
      vessel,
      audit_type,
      incidents || [],
      training || [],
      certificates || [],
      sgsoPractices || []
    );

    // Mark old predictions as expired
    await supabase
      .from("audit_predictions")
      .update({ status: "expired" })
      .eq("vessel_id", vessel_id)
      .eq("audit_type", audit_type)
      .eq("status", "active");

    // Insert new prediction
    const { data: insertedPrediction, error: insertError } = await supabase
      .from("audit_predictions")
      .insert([prediction])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return res.status(200).json({
      message: "Audit prediction generated successfully",
      prediction: insertedPrediction,
    });
  } catch (error) {
    console.error("Error in score-predict:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

async function generateAuditPrediction(
  vessel: { id: string; name: string },
  auditType: string,
  incidents: any[],
  training: any[],
  certificates: any[],
  sgsoPractices: any[]
): Promise<any> {
  // Try AI-powered prediction first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Generate an audit prediction for vessel "${vessel.name}" for ${auditType} audit.

Compliance Data (last 6 months):
- Safety Incidents: ${incidents.length}
${incidents.slice(0, 3).map((inc) => `  • ${inc.description || "N/A"} (${inc.incident_date})`).join("\n")}

- Training Sessions: ${training.length}
${training.slice(0, 3).map((t) => `  • ${t.training_type || "N/A"} (${t.training_date})`).join("\n")}

- Active Certificates: ${certificates.length}
${certificates.slice(0, 3).map((cert) => `  • ${cert.certificate_type || "N/A"} (expires: ${cert.expiry_date})`).join("\n")}

- SGSO Practices: ${sgsoPractices.length} recorded

Based on ${auditType} audit standards, provide a prediction with:
1. expected_score: 0-100
2. probability: "Alta" | "Média" | "Baixa" (likelihood of passing)
3. compliance_areas: object with key areas and their scores (0-100)
4. weaknesses: array of 2-4 specific weak points
5. recommendations: array of 3-5 actionable recommendations
6. risk_factors: array of 2-3 main risk factors
7. ai_confidence: 0-100

Return ONLY a JSON object, no additional text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "";
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiPrediction = JSON.parse(jsonMatch[0]);
        
        return {
          vessel_id: vessel.id,
          audit_type: auditType,
          expected_score: aiPrediction.expected_score,
          probability: aiPrediction.probability,
          compliance_areas: aiPrediction.compliance_areas,
          weaknesses: aiPrediction.weaknesses,
          recommendations: aiPrediction.recommendations,
          risk_factors: aiPrediction.risk_factors,
          ai_confidence: aiPrediction.ai_confidence || 75,
          prediction_date: new Date().toISOString().split("T")[0],
          status: "active",
        };
      }
    } catch (error) {
      console.error("AI audit prediction failed, using fallback:", error);
    }
  }

  // Fallback: Rule-based analysis
  return generateFallbackPrediction(
    vessel,
    auditType,
    incidents,
    training,
    certificates,
    sgsoPractices
  );
}

function generateFallbackPrediction(
  vessel: { id: string; name: string },
  auditType: string,
  incidents: any[],
  training: any[],
  certificates: any[],
  sgsoPractices: any[]
): any {
  // Calculate base score
  let baseScore = 70;

  // Deduct for incidents
  baseScore -= Math.min(incidents.length * 5, 20);

  // Add for training
  baseScore += Math.min(training.length * 2, 10);

  // Add for certificates
  baseScore += Math.min(certificates.length * 3, 10);

  // Add for SGSO practices
  baseScore += Math.min(sgsoPractices.length * 1, 5);

  // Clamp score
  const expectedScore = Math.max(40, Math.min(95, baseScore));

  // Determine probability
  let probability: "Alta" | "Média" | "Baixa";
  if (expectedScore >= 80) {
    probability = "Alta";
  } else if (expectedScore >= 65) {
    probability = "Média";
  } else {
    probability = "Baixa";
  }

  // Generate compliance areas
  const complianceAreas: Record<string, number> = {};
  const auditStandards = getAuditStandards(auditType);
  
  auditStandards.forEach((area) => {
    let areaScore = expectedScore + (Math.random() * 20 - 10);
    complianceAreas[area] = Math.max(0, Math.min(100, Math.round(areaScore)));
  });

  // Generate weaknesses
  const weaknesses: string[] = [];
  if (incidents.length > 2) {
    weaknesses.push(`Alto número de incidentes de segurança (${incidents.length})`);
  }
  if (training.length < 5) {
    weaknesses.push("Treinamentos insuficientes para a equipe");
  }
  if (certificates.length < 3) {
    weaknesses.push("Certificações pendentes ou próximas ao vencimento");
  }
  if (sgsoPractices.length < 10) {
    weaknesses.push("Registro limitado de práticas SGSO");
  }

  // Generate recommendations
  const recommendations = [
    "Realizar auditoria interna prévia",
    "Revisar e atualizar documentação de conformidade",
    "Intensificar treinamentos da equipe",
    "Corrigir não-conformidades identificadas",
    "Manter registro detalhado de todas as atividades",
  ];

  // Generate risk factors
  const riskFactors = [
    "Histórico de incidentes",
    "Nível de preparação da equipe",
    "Atualização de documentação",
  ];

  return {
    vessel_id: vessel.id,
    audit_type: auditType,
    expected_score: expectedScore,
    probability,
    compliance_areas: complianceAreas,
    weaknesses: weaknesses.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    risk_factors: riskFactors,
    ai_confidence: 65,
    prediction_date: new Date().toISOString().split("T")[0],
    status: "active",
  };
}

function getAuditStandards(auditType: string): string[] {
  const standards: Record<string, string[]> = {
    Petrobras: ["Documentação", "Treinamento", "Equipamentos", "Procedimentos"],
    IBAMA: ["Ambiental", "Licenças", "Resíduos", "Prevenção"],
    ISO: ["Qualidade", "Processos", "Documentação", "Melhoria Contínua"],
    IMCA: ["DP", "Segurança", "Operações", "Manutenção"],
    ISM: ["Segurança", "Gestão", "Recursos", "Comunicação"],
    SGSO: ["Política", "Planejamento", "Implementação", "Verificação", "Análise Crítica"],
  };

  return standards[auditType] || ["Geral", "Segurança", "Conformidade", "Operações"];
}
