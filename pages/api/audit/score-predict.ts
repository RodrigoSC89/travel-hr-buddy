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
  expected_score: number;
  probability: "Alta" | "Média" | "Baixa";
  weaknesses: string[];
  recommendations: string[];
  compliance_areas: Record<string, number>;
  risk_factors: string[];
  ai_confidence: number;
}

interface ComplianceData {
  incidents: any[];
  sgso_practices: any[];
  certificates: any[];
  trainings: any[];
  audits: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { vessel_id, audit_type } = req.body;

    // Validate inputs
    if (!vessel_id || !audit_type) {
      return res.status(400).json({
        error: "vessel_id and audit_type are required",
      });
    }

    const validAuditTypes = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];
    if (!validAuditTypes.includes(audit_type)) {
      return res.status(400).json({
        error: `Invalid audit_type. Must be one of: ${validAuditTypes.join(", ")}`,
      });
    }

    // Get vessel information
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("id, name, vessel_type, imo_number")
      .eq("id", vessel_id)
      .single();

    if (vesselError || !vessel) {
      return res.status(404).json({ error: "Vessel not found" });
    }

    // Collect compliance data for the last 6 months
    const complianceData = await collectComplianceData(vessel_id);

    // Generate audit prediction using AI or fallback
    const prediction = await generateAuditPrediction(
      vessel,
      audit_type,
      complianceData
    );

    // Store prediction in database
    const { data: savedPrediction, error: insertError } = await supabase
      .from("audit_predictions")
      .insert({
        vessel_id: vessel.id,
        audit_type,
        expected_score: prediction.expected_score,
        probability: prediction.probability,
        weaknesses: prediction.weaknesses,
        recommendations: prediction.recommendations,
        compliance_areas: prediction.compliance_areas,
        risk_factors: prediction.risk_factors,
        ai_confidence: prediction.ai_confidence,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving audit prediction:", insertError);
      throw insertError;
    }

    res.status(200).json({
      success: true,
      prediction: {
        id: savedPrediction.id,
        vessel_name: vessel.name,
        audit_type,
        ...prediction,
        generated_at: savedPrediction.generated_at,
      },
    });
  } catch (error) {
    console.error("Error in score-predict API:", error);
    res.status(500).json({
      error: "Failed to generate audit prediction",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function collectComplianceData(
  vessel_id: string
): Promise<ComplianceData> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Collect various compliance data
  const { data: incidents } = await supabase
    .from("dp_incidents")
    .select("*")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: false });

  const { data: sgsoPractices } = await supabase
    .from("sgso_practices")
    .select("*")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: false });

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*, employees!inner(vessel_assignment)")
    .order("expiry_date", { ascending: true });

  const { data: audits } = await supabase
    .from("auditorias_imca")
    .select("*")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: false });

  return {
    incidents: incidents || [],
    sgso_practices: sgsoPractices || [],
    certificates: certificates || [],
    trainings: [], // Could be expanded if training table exists
    audits: audits || [],
  };
}

async function generateAuditPrediction(
  vessel: any,
  audit_type: string,
  complianceData: ComplianceData
): Promise<AuditPrediction> {
  if (!openai) {
    console.log("OpenAI not available, using fallback audit prediction");
    return generateFallbackAuditPrediction(vessel, audit_type, complianceData);
  }

  try {
    const auditTypeGuidelines: Record<string, string> = {
      Petrobras: "Focus on operational safety, environmental compliance, DP capability, and documentation completeness",
      IBAMA: "Focus on environmental protection, waste management, spill prevention, and ecological impact",
      ISO: "Focus on quality management systems, process documentation, and continuous improvement",
      IMCA: "Focus on marine contracting standards, vessel capabilities, and crew competency",
      ISM: "Focus on Safety Management System, risk assessment, and emergency preparedness",
      SGSO: "Focus on safety culture, incident management, training records, and operational procedures",
    };

    const prompt = `You are a maritime audit prediction system analyzing vessel compliance data.

Vessel: ${vessel.name} (Type: ${vessel.vessel_type}, IMO: ${vessel.imo_number || "N/A"})
Audit Type: ${audit_type}
Guidelines: ${auditTypeGuidelines[audit_type]}

Compliance data from the last 6 months:
- Incidents reported: ${complianceData.incidents.length}
- SGSO practices logged: ${complianceData.sgso_practices.length}
- Certificates on file: ${complianceData.certificates.length}
- Previous audits: ${complianceData.audits.length}

Recent incident types:
${complianceData.incidents.slice(0, 5).map((inc: any) => `- ${inc.incident_type || "Unknown"}: ${inc.severity || "N/A"}`).join("\n")}

Certificate status:
${complianceData.certificates.slice(0, 5).map((cert: any) => `- ${cert.certificate_type}: Expires ${cert.expiry_date}`).join("\n")}

Analyze this data and predict the audit outcome for ${audit_type}. Provide:

1. expected_score: 0-100 (realistic prediction based on data)
2. probability: "Alta", "Média", or "Baixa" (likelihood of passing)
3. weaknesses: Array of 2-5 specific compliance gaps or areas of concern
4. recommendations: Array of 3-6 specific, actionable recommendations
5. compliance_areas: JSON object with scores for key areas (0-100 each)
6. risk_factors: Array of 2-4 main risk factors that could affect the audit
7. ai_confidence: 0.0-1.0 (your confidence in this prediction)

Return ONLY valid JSON with this exact structure:
{
  "expected_score": 75,
  "probability": "Média",
  "weaknesses": ["Incomplete training records for Q3", "Missing environmental spill response drill documentation"],
  "recommendations": ["Complete and upload all training certificates", "Conduct and document spill response drill"],
  "compliance_areas": {
    "Documentation": 70,
    "Training": 65,
    "Equipment": 85,
    "Procedures": 75
  },
  "risk_factors": ["Recent increase in minor incidents", "Upcoming certificate renewals"],
  "ai_confidence": 0.75
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content || "{}";
    
    // Extract JSON from response
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    }
    
    const prediction = JSON.parse(jsonContent);

    // Validate and sanitize
    return {
      expected_score: Math.min(100, Math.max(0, prediction.expected_score || 50)),
      probability: ["Alta", "Média", "Baixa"].includes(prediction.probability)
        ? prediction.probability
        : "Média",
      weaknesses: Array.isArray(prediction.weaknesses)
        ? prediction.weaknesses.slice(0, 5)
        : [],
      recommendations: Array.isArray(prediction.recommendations)
        ? prediction.recommendations.slice(0, 6)
        : [],
      compliance_areas: prediction.compliance_areas || {},
      risk_factors: Array.isArray(prediction.risk_factors)
        ? prediction.risk_factors.slice(0, 4)
        : [],
      ai_confidence: Math.min(1, Math.max(0, prediction.ai_confidence || 0.5)),
    };
  } catch (error) {
    console.error("Error calling OpenAI, using fallback:", error);
    return generateFallbackAuditPrediction(vessel, audit_type, complianceData);
  }
}

function generateFallbackAuditPrediction(
  vessel: any,
  audit_type: string,
  complianceData: ComplianceData
): AuditPrediction {
  // Rule-based audit prediction when AI is not available
  const incidentCount = complianceData.incidents.length;
  const sgsoCount = complianceData.sgso_practices.length;
  const certificateCount = complianceData.certificates.length;
  const previousAudits = complianceData.audits.length;

  // Calculate base score
  let baseScore = 70;

  // Adjust based on incidents (more incidents = lower score)
  baseScore -= Math.min(incidentCount * 2, 20);

  // Adjust based on SGSO practices (more practices = higher score)
  baseScore += Math.min(sgsoCount * 0.5, 15);

  // Adjust based on certificates (more valid certificates = higher score)
  baseScore += Math.min(certificateCount * 0.3, 10);

  // Adjust based on previous audits (shows compliance history)
  baseScore += Math.min(previousAudits * 2, 10);

  const expected_score = Math.min(100, Math.max(30, Math.round(baseScore)));

  // Determine probability
  let probability: "Alta" | "Média" | "Baixa";
  if (expected_score >= 75) probability = "Alta";
  else if (expected_score >= 55) probability = "Média";
  else probability = "Baixa";

  // Generate weaknesses based on data
  const weaknesses: string[] = [];
  if (incidentCount > 5) {
    weaknesses.push(`Alto número de incidentes registrados (${incidentCount}) nos últimos 6 meses`);
  }
  if (sgsoCount < 20) {
    weaknesses.push("Registro insuficiente de práticas SGSO");
  }
  if (certificateCount < 10) {
    weaknesses.push("Número baixo de certificações documentadas");
  }
  if (previousAudits === 0) {
    weaknesses.push("Sem histórico de auditorias anteriores");
  }

  // Generate recommendations
  const recommendations: string[] = [
    "Intensificar o registro sistemático de práticas SGSO",
    "Revisar e atualizar todos os certificados da tripulação",
    "Implementar ações corretivas para os incidentes recentes",
    "Realizar auditoria interna preliminar",
  ];

  if (incidentCount > 5) {
    recommendations.push("Analisar padrões de incidentes e implementar medidas preventivas");
  }

  // Compliance areas scores
  const compliance_areas = {
    Documentação: Math.max(40, expected_score - 10),
    Treinamento: Math.max(50, expected_score - 5),
    Equipamentos: Math.max(60, expected_score),
    Procedimentos: Math.max(45, expected_score - 15),
  };

  // Risk factors
  const risk_factors: string[] = [];
  if (incidentCount > 5) {
    risk_factors.push("Histórico recente de incidentes");
  }
  if (sgsoCount < 15) {
    risk_factors.push("Práticas SGSO abaixo do esperado");
  }
  risk_factors.push("Conformidade documental a ser verificada");

  return {
    expected_score,
    probability,
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 6),
    compliance_areas,
    risk_factors: risk_factors.slice(0, 4),
    ai_confidence: 0.6,
  };
}
