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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { vessel_id, audit_type } = req.body;

    if (!vessel_id || !audit_type) {
      return res.status(400).json({
        error: "vessel_id e audit_type são obrigatórios.",
      });
    }

    // Get vessel information
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vessel_id)
      .single();

    if (vesselError || !vessel) {
      return res.status(404).json({ error: "Embarcação não encontrada." });
    }

    // Collect audit-relevant data
    const auditData = await collectAuditData(vessel_id, audit_type);

    // Generate AI prediction
    const prediction = await generateAuditPrediction(
      vessel,
      audit_type,
      auditData
    );

    // Store prediction in database
    const { data: savedPrediction, error: insertError } = await supabase
      .from("audit_predictions")
      .insert({
        vessel_id: vessel.id,
        audit_type: audit_type,
        expected_score: prediction.expected_score,
        probability_pass: prediction.probability_pass,
        weaknesses: prediction.weaknesses,
        recommendations: prediction.recommendations,
        compliance_areas: prediction.compliance_areas || {},
        risk_factors: prediction.risk_factors || [],
        strengths: prediction.strengths || [],
        ai_confidence: prediction.ai_confidence || 75,
        valid_until: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days
        status: "active",
        based_on_data: auditData,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving audit prediction:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({
      success: true,
      prediction: savedPrediction,
    });
  } catch (error) {
    console.error("Error in score-predict endpoint:", error);
    return res.status(500).json({
      error: "Erro interno ao gerar previsão de auditoria.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function collectAuditData(vesselId: string, _auditType: string) {
  const [
    sgsoData,
    safetyIncidents,
    riskAssessments,
    trainingRecords,
    dpIncidents,
    certificates,
  ] = await Promise.all([
    // SGSO Practices
    supabase
      .from("sgso_practices")
      .select("practice_number, practice_name, status, compliance_level")
      .order("practice_number"),

    // Safety Incidents (last 6 months)
    supabase
      .from("safety_incidents")
      .select("incident_type, severity, status")
      .eq("vessel_id", vesselId)
      .gte(
        "created_at",
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      ),

    // Risk Assessments
    supabase
      .from("risk_assessments")
      .select("risk_level, status")
      .eq("vessel_id", vesselId),

    // Training Records
    supabase
      .from("sgso_training_records")
      .select("training_type, status")
      .in("status", ["completed", "expired"]),

    // DP Incidents (if relevant)
    supabase
      .from("dp_incidents")
      .select("severity, status, root_cause")
      .eq("vessel_id", vesselId)
      .gte(
        "created_at",
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      ),

    // Certificates expiry status
    supabase
      .from("certificates")
      .select("certificate_type, status, expiry_date")
      .in("status", ["active", "expiring_soon", "expired"]),
  ]);

  return {
    sgso: {
      total_practices: sgsoData.data?.length || 0,
      compliant: sgsoData.data?.filter((p) => p.status === "compliant").length || 0,
      non_compliant: sgsoData.data?.filter((p) => p.status === "non_compliant").length || 0,
      avg_compliance:
        sgsoData.data?.reduce((acc, p) => acc + (p.compliance_level || 0), 0) /
          (sgsoData.data?.length || 1) || 0,
      practices: sgsoData.data || [],
    },
    incidents: {
      total: safetyIncidents.data?.length || 0,
      critical: safetyIncidents.data?.filter((i) => i.severity === "critical").length || 0,
      unresolved: safetyIncidents.data?.filter((i) => i.status !== "closed").length || 0,
      by_type: safetyIncidents.data?.reduce((acc: Record<string, number>, i: { incident_type: string }) => {
        acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
        return acc;
      }, {}),
    },
    risks: {
      total: riskAssessments.data?.length || 0,
      critical: riskAssessments.data?.filter((r) => r.risk_level === "critical").length || 0,
      high: riskAssessments.data?.filter((r) => r.risk_level === "high").length || 0,
      open: riskAssessments.data?.filter((r) => r.status !== "closed").length || 0,
    },
    training: {
      total: trainingRecords.data?.length || 0,
      completed: trainingRecords.data?.filter((t) => t.status === "completed").length || 0,
      expired: trainingRecords.data?.filter((t) => t.status === "expired").length || 0,
    },
    dp_system: {
      total_incidents: dpIncidents.data?.length || 0,
      critical_incidents: dpIncidents.data?.filter((i) => i.severity === "critical").length || 0,
    },
    certificates: {
      total: certificates.data?.length || 0,
      active: certificates.data?.filter((c) => c.status === "active").length || 0,
      expiring_soon: certificates.data?.filter((c) => c.status === "expiring_soon").length || 0,
      expired: certificates.data?.filter((c) => c.status === "expired").length || 0,
    },
  };
}

interface AuditData {
  sgso: { avg_compliance: number };
  incidents: { critical: number; unresolved: number };
  risks: { critical: number };
  training: { expired: number; completed: number; total: number };
  certificates: { expired: number };
}

async function generateAuditPrediction(
  vessel: { name: string },
  auditType: string,
  auditData: AuditData
) {
  const prompt = `
Você é um auditor experiente especializado em auditorias ${auditType} para embarcações offshore.

Analise os dados de conformidade da embarcação "${vessel.name}" e forneça uma previsão de auditoria:

Dados de Conformidade:
${JSON.stringify(auditData, null, 2)}

Tipo de Auditoria: ${auditType}

Forneça uma análise detalhada com:
1. Score esperado (0-100)
2. Probabilidade de aprovação (Alta/Média/Baixa)
3. Lista de pontos fracos identificados
4. Recomendações específicas e acionáveis
5. Áreas de conformidade (com scores individuais)
6. Fatores de risco principais
7. Pontos fortes da embarcação

Responda APENAS com um objeto JSON válido no seguinte formato:
{
  "expected_score": 72,
  "probability_pass": "Média",
  "ai_confidence": 80,
  "weaknesses": [
    "Evidências incompletas na cláusula M117-6",
    "Capacitação não comprovada SGSO"
  ],
  "recommendations": [
    "Anexar PDF do treinamento SGSO de Setembro",
    "Inserir plano de ação para Blackout 07/10"
  ],
  "compliance_areas": {
    "documentacao": 75,
    "treinamentos": 65,
    "gestao_riscos": 80,
    "incidentes": 70,
    "equipamentos": 85
  },
  "risk_factors": [
    "3 incidentes não resolvidos",
    "2 certificados expirados"
  ],
  "strengths": [
    "Sistema DP bem mantido",
    "Boa taxa de compliance SGSO"
  ]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um auditor especializado em ${auditType} para embarcações offshore. Responda sempre com JSON válido.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    
    const prediction = JSON.parse(jsonContent);

    // Validate and set defaults
    return {
      expected_score: Math.max(0, Math.min(100, prediction.expected_score || 50)),
      probability_pass: ["Alta", "Média", "Baixa"].includes(prediction.probability_pass)
        ? prediction.probability_pass
        : "Média",
      ai_confidence: prediction.ai_confidence || 75,
      weaknesses: Array.isArray(prediction.weaknesses) ? prediction.weaknesses : [],
      recommendations: Array.isArray(prediction.recommendations) ? prediction.recommendations : [],
      compliance_areas: prediction.compliance_areas || {},
      risk_factors: Array.isArray(prediction.risk_factors) ? prediction.risk_factors : [],
      strengths: Array.isArray(prediction.strengths) ? prediction.strengths : [],
    };
  } catch (error) {
    console.error("Error generating audit prediction with AI:", error);

    // Fallback: calculate score based on data
    const sgsoScore = auditData.sgso.avg_compliance || 0;
    const incidentPenalty = Math.min(auditData.incidents.critical * 5, 20);
    const riskPenalty = Math.min(auditData.risks.critical * 3, 15);
    const trainingBonus = auditData.training.expired > 2 ? -10 : 0;
    const certificatePenalty = auditData.certificates.expired * 3;

    const calculatedScore = Math.max(
      0,
      Math.min(100, sgsoScore - incidentPenalty - riskPenalty + trainingBonus - certificatePenalty)
    );

    return {
      expected_score: Math.round(calculatedScore),
      probability_pass: calculatedScore >= 75 ? "Alta" : calculatedScore >= 60 ? "Média" : "Baixa",
      ai_confidence: 65,
      weaknesses: [
        auditData.incidents.unresolved > 0 && `${auditData.incidents.unresolved} incidentes não resolvidos`,
        auditData.certificates.expired > 0 && `${auditData.certificates.expired} certificados expirados`,
        auditData.sgso.non_compliant > 0 && `${auditData.sgso.non_compliant} práticas SGSO não conformes`,
      ].filter(Boolean),
      recommendations: [
        "Resolver incidentes pendentes",
        "Atualizar certificações expiradas",
        "Melhorar compliance SGSO",
      ],
      compliance_areas: {
        sgso: Math.round(sgsoScore),
        incidentes: Math.max(0, 100 - incidentPenalty * 2),
        riscos: Math.max(0, 100 - riskPenalty * 2),
        treinamentos: Math.round((auditData.training.completed / (auditData.training.total || 1)) * 100),
      },
      risk_factors: [
        `${auditData.incidents.critical} incidentes críticos`,
        `${auditData.risks.critical} riscos críticos`,
      ],
      strengths: [],
    };
  }
}
