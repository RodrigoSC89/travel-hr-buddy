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
  vessel_id: string;
  audit_type: string;
  expected_score: number;
  pass_probability: string;
  confidence_level: number;
  weaknesses: string[];
  recommendations: string[];
  compliance_areas: Record<string, number>;
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

    if (!vessel_id || !audit_type) {
      return res.status(400).json({
        error: "Missing required parameters: vessel_id and audit_type",
      });
    }

    // Validate audit type
    const validAuditTypes = [
      "Petrobras",
      "IBAMA",
      "ISO",
      "IMCA",
      "ISM",
      "SGSO",
    ];
    if (!validAuditTypes.includes(audit_type)) {
      return res.status(400).json({
        error: `Invalid audit_type. Must be one of: ${validAuditTypes.join(", ")}`,
      });
    }

    // Get vessel data
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vessel_id)
      .eq("status", "active")
      .single();

    if (vesselError || !vessel) {
      return res.status(404).json({ error: "Vessel not found or inactive" });
    }

    // Fetch compliance data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      incidents,
      certificates,
      trainingRecords,
      sgsoRecords,
      auditHistory,
    ] = await Promise.all([
      supabase
        .from("safety_incidents")
        .select("*")
        .eq("vessel_id", vessel_id)
        .gte("incident_date", sixMonthsAgo.toISOString()),
      supabase
        .from("certificates")
        .select("*")
        .eq("vessel_id", vessel_id)
        .gte("valid_until", new Date().toISOString()),
      supabase
        .from("training_records")
        .select("*")
        .eq("vessel_id", vessel_id)
        .gte("completion_date", sixMonthsAgo.toISOString()),
      supabase
        .from("sgso_practices")
        .select("*")
        .eq("vessel_id", vessel_id)
        .gte("created_at", sixMonthsAgo.toISOString()),
      supabase
        .from("auditorias")
        .select("*")
        .eq("vessel_id", vessel_id)
        .eq("tipo_auditoria", audit_type)
        .order("data_auditoria", { ascending: false })
        .limit(3),
    ]);

    let prediction: AuditPrediction;

    // Try AI-powered prediction if OpenAI is available
    if (openai) {
      const complianceContext = {
        vessel_name: vessel.name,
        vessel_type: vessel.type,
        audit_type: audit_type,
        incidents_count: incidents.data?.length || 0,
        valid_certificates: certificates.data?.length || 0,
        training_records: trainingRecords.data?.length || 0,
        sgso_records: sgsoRecords.data?.length || 0,
        recent_audit_scores:
          auditHistory.data?.map((a: any) => a.score) || [],
      };

      const prompt = `You are a maritime compliance audit AI. Predict the outcome of an upcoming ${audit_type} audit for this vessel.

Vessel: ${complianceContext.vessel_name} (${complianceContext.vessel_type})
Last 6 months data:
- Safety Incidents: ${complianceContext.incidents_count}
- Valid Certificates: ${complianceContext.valid_certificates}
- Training Records: ${complianceContext.training_records}
- SGSO Records: ${complianceContext.sgso_records}
- Recent Audit Scores: ${complianceContext.recent_audit_scores.join(", ") || "No recent audits"}

Predict the audit outcome with the following structure:
- expected_score: 0-100
- pass_probability: one of [Alta, Média, Baixa]
- confidence_level: 0-100 (how confident in this prediction)
- weaknesses: array of 2-4 specific compliance weaknesses identified
- recommendations: array of 3-5 specific actions to improve audit readiness
- compliance_areas: object with scores (0-100) for key areas like {
    "documentation": 85,
    "safety_procedures": 90,
    "crew_training": 75,
    "equipment_maintenance": 80,
    "environmental_compliance": 88
  }

Respond ONLY with a valid JSON object.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 2000,
        });

        const aiResponse = completion.choices[0]?.message?.content || "{}";
        const parsedPrediction = JSON.parse(aiResponse);

        prediction = {
          vessel_id: vessel_id,
          audit_type: audit_type,
          expected_score: Math.min(
            100,
            Math.max(0, parsedPrediction.expected_score)
          ),
          pass_probability: parsedPrediction.pass_probability,
          confidence_level: Math.min(
            100,
            Math.max(0, parsedPrediction.confidence_level)
          ),
          weaknesses: parsedPrediction.weaknesses || [],
          recommendations: parsedPrediction.recommendations || [],
          compliance_areas: parsedPrediction.compliance_areas || {},
        };
      } catch (aiError) {
        console.error("AI prediction failed, using fallback:", aiError);
        prediction = generateFallbackPrediction(
          vessel_id,
          audit_type,
          incidents.data?.length || 0,
          certificates.data?.length || 0,
          trainingRecords.data?.length || 0,
          auditHistory.data || []
        );
      }
    } else {
      // Fallback to rule-based prediction
      prediction = generateFallbackPrediction(
        vessel_id,
        audit_type,
        incidents.data?.length || 0,
        certificates.data?.length || 0,
        trainingRecords.data?.length || 0,
        auditHistory.data || []
      );
    }

    // Store prediction in database
    const { error: insertError } = await supabase
      .from("audit_predictions")
      .insert(prediction);

    if (insertError) {
      console.error("Error storing prediction:", insertError);
      throw insertError;
    }

    return res.status(200).json({
      success: true,
      prediction: prediction,
    });
  } catch (error: any) {
    console.error("Error in score-predict API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

// Fallback rule-based prediction
function generateFallbackPrediction(
  vessel_id: string,
  audit_type: string,
  incidentsCount: number,
  validCertificates: number,
  trainingRecordsCount: number,
  auditHistory: any[]
): AuditPrediction {
  // Calculate base score
  let baseScore = 70;

  // Adjust based on incidents (negative impact)
  baseScore -= incidentsCount * 5;

  // Adjust based on certificates (positive impact)
  baseScore += Math.min(15, validCertificates * 3);

  // Adjust based on training (positive impact)
  baseScore += Math.min(10, trainingRecordsCount * 2);

  // Adjust based on audit history trend
  if (auditHistory.length > 0) {
    const avgHistoricalScore =
      auditHistory.reduce((sum, a) => sum + (a.score || 0), 0) /
      auditHistory.length;
    baseScore = (baseScore + avgHistoricalScore) / 2;
  }

  // Ensure score is within valid range
  const expected_score = Math.min(100, Math.max(0, Math.round(baseScore)));

  // Determine probability based on score
  let pass_probability: string;
  if (expected_score >= 80) {
    pass_probability = "Alta";
  } else if (expected_score >= 60) {
    pass_probability = "Média";
  } else {
    pass_probability = "Baixa";
  }

  // Calculate confidence based on data availability
  const dataPoints =
    (incidentsCount > 0 ? 1 : 0) +
    (validCertificates > 0 ? 1 : 0) +
    (trainingRecordsCount > 0 ? 1 : 0) +
    (auditHistory.length > 0 ? 1 : 0);
  const confidence_level = Math.min(90, 40 + dataPoints * 12);

  // Generate weaknesses based on score
  const weaknesses: string[] = [];
  if (incidentsCount > 3) {
    weaknesses.push(
      `High incident rate detected (${incidentsCount} incidents in 6 months)`
    );
  }
  if (validCertificates < 5) {
    weaknesses.push(
      `Limited valid certificates (${validCertificates} certificates)`
    );
  }
  if (trainingRecordsCount < 10) {
    weaknesses.push(
      `Insufficient recent training records (${trainingRecordsCount} records)`
    );
  }
  if (expected_score < 70) {
    weaknesses.push("Overall compliance score below audit passing threshold");
  }

  // Generate recommendations
  const recommendations: string[] = [
    `Review and update all ${audit_type} compliance documentation`,
    "Conduct pre-audit internal assessment",
    "Ensure all required certificates are valid and up to date",
  ];

  if (incidentsCount > 0) {
    recommendations.push(
      "Implement corrective actions for recent incidents"
    );
  }
  if (trainingRecordsCount < 15) {
    recommendations.push(
      "Schedule additional crew training sessions before audit"
    );
  }

  // Generate compliance areas scores
  const compliance_areas: Record<string, number> = {
    documentation: Math.max(50, expected_score - 5),
    safety_procedures: Math.max(40, expected_score - 10),
    crew_training: Math.max(45, expected_score - 8),
    equipment_maintenance: Math.max(55, expected_score),
    environmental_compliance: Math.max(50, expected_score - 3),
  };

  return {
    vessel_id,
    audit_type,
    expected_score,
    pass_probability,
    confidence_level,
    weaknesses:
      weaknesses.length > 0
        ? weaknesses
        : ["No significant weaknesses identified"],
    recommendations,
    compliance_areas,
  };
}
