/**
 * PATCH 600 - Painel Consolidado de Risco (RiskOps AI)
 * Consolidated risk monitoring and analysis dashboard
 */

/**
 * Risk Operations Engine
 * Gerencia avaliações de risco, alertas e análises de tendências
 * 
 * ⚠️ NOTA IMPORTANTE:
 * As tabelas risk_assessments, risk_heatmap_data, risk_trends, risk_alerts, risk_exports
 * existem nas migrations mas NÃO estão aplicadas no Supabase ainda.
 * 
 * Migrations a aplicar:
 * - supabase/migrations/20251103200200_create_risk_operations_tables.sql
 * - supabase/migrations/20251103203000_patch_600_risk_ops.sql
 * 
 * Após aplicar as migrations, regenerar types com:
 * npx supabase gen types typescript --project-id vnbptmixvwropvanyhdb > src/integrations/supabase/types.ts
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ModuleType = "PSC" | "MLC" | "LSA_FFA" | "OVID" | "DRILL" | "GENERAL";
export type RiskType = "compliance" | "human" | "technical" | "operational" | "environmental";
export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface RiskAssessment {
  id?: string;
  vesselId: string;
  moduleType: ModuleType;
  riskType: RiskType;
  riskLevel: RiskLevel;
  riskScore: number;
  riskTitle: string;
  riskDescription: string;
  affectedAreas: string[];
  mitigationActions: MitigationAction[];
  aiClassification: AIClassification;
  linkedFindings: string[];
  status: "active" | "mitigating" | "resolved" | "accepted";
}

export interface MitigationAction {
  action: string;
  deadline: string;
  responsible: string;
  status: "pending" | "in_progress" | "completed";
}

export interface AIClassification {
  confidence: number;
  factors: string[];
  predictedImpact: string;
  recommendations: string[];
}

export interface RiskHeatmapPoint {
  vesselId?: string;
  region: string;
  moduleType: ModuleType | "OVERALL";
  riskIntensity: number;
  riskCount: number;
  coordinates?: { lat: number; lng: number };
}

export interface RiskTrend {
  vesselId: string;
  moduleType: ModuleType | "OVERALL";
  periodStart: Date;
  periodEnd: Date;
  averageRiskScore: number;
  criticalRisksCount: number;
  highRisksCount: number;
  mediumRisksCount: number;
  lowRisksCount: number;
  trendDirection: "improving" | "stable" | "worsening";
  keyIssues: string[];
}

/**
 * AI-powered risk classifier
 * Analyzes findings and classifies risk automatically
 */
export async function classifyRiskWithAI(
  finding: {
    type: string;
    description: string;
    severity: string;
    details?: Record<string, unknown>;
  }
): Promise<AIClassification> {
  try {
    const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY as string;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = `
Analyze this compliance finding and classify the associated risks:

Type: ${finding.type}
Description: ${finding.description}
Severity: ${finding.severity}
Details: ${JSON.stringify(finding.details || {})}

Provide risk classification:
1. Risk type (compliance, human, technical, operational, environmental)
2. Risk level (critical, high, medium, low)
3. Risk score (0-100)
4. Confidence level (0-100)
5. Key risk factors
6. Predicted impact
7. Recommendations

Format as JSON:
{
  "riskType": "compliance",
  "riskLevel": "high",
  "riskScore": 75,
  "confidence": 85,
  "factors": ["Factor 1", "Factor 2"],
  "predictedImpact": "Impact description",
  "recommendations": ["Rec 1", "Rec 2"]
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a maritime risk analysis expert who classifies compliance findings into risk categories and provides actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const classification = JSON.parse(data.choices[0].message.content);

    return {
      confidence: classification.confidence,
      factors: classification.factors,
      predictedImpact: classification.predictedImpact,
      recommendations: classification.recommendations,
    };
  } catch (error) {
    logger.error("Error classifying risk", error as Error, { findingType: finding.type, severity: finding.severity });
    // Return default classification on error
    return {
      confidence: 50,
      factors: ["Manual review required"],
      predictedImpact: "Unknown - requires manual assessment",
      recommendations: ["Conduct detailed risk assessment"],
    };
  }
}

/**
 * Creates a risk assessment with AI classification
 */
export async function createRiskAssessment(
  assessment: Omit<RiskAssessment, "id" | "aiClassification">,
  findingData?: any
): Promise<string> {
  try {
    // Get AI classification
    const aiClassification = findingData 
      ? await classifyRiskWithAI(findingData)
      : {
        confidence: 0,
        factors: [],
        predictedImpact: "",
        recommendations: [],
      };

    const { data, error } = await supabase
      .from("risk_assessments")
      .insert({
        vessel_id: assessment.vesselId,
        module_type: assessment.moduleType,
        risk_type: assessment.riskType,
        risk_level: assessment.riskLevel,
        risk_score: assessment.riskScore,
        risk_title: assessment.riskTitle,
        risk_description: assessment.riskDescription,
        affected_areas: assessment.affectedAreas,
        mitigation_actions: assessment.mitigationActions,
        ai_classification: aiClassification,
        linked_findings: assessment.linkedFindings,
        status: assessment.status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    logger.error("Error creating risk assessment", error as Error, { vesselId: assessment.vesselId, moduleType: assessment.moduleType });
    throw error;
  }
}

/**
 * Gets consolidated risk score for a vessel
 */
export async function getConsolidatedRiskScore(vesselId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("risk_assessments")
      .select("risk_score")
      .eq("vessel_id", vesselId)
      .eq("status", "active");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Calculate weighted average
    const totalScore = data.reduce((sum: number, r: any) => sum + r.risk_score, 0);
    return Math.round(totalScore / data.length);
  } catch (error) {
    logger.error("Error calculating risk score", error as Error, { vesselId });
    return 0;
  }
}

/**
 * Generates risk heatmap data
 */
export async function generateRiskHeatmap(
  filters?: {
    vesselIds?: string[];
    moduleTypes?: ModuleType[];
    startDate?: Date;
    endDate?: Date;
  }
): Promise<RiskHeatmapPoint[]> {
  try {
    let query = supabase
      .from("risk_assessments")
      .select("vessel_id, module_type, risk_score, status")
      .eq("status", "active");

    if (filters?.vesselIds && filters.vesselIds.length > 0) {
      query = query.in("vessel_id", filters.vesselIds);
    }

    if (filters?.moduleTypes && filters.moduleTypes.length > 0) {
      query = query.in("module_type", filters.moduleTypes);
    }

    if (filters?.startDate) {
      query = query.gte("assessed_at", filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte("assessed_at", filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Group by vessel and module
    const heatmapData: Map<string, RiskHeatmapPoint> = new Map();

    data?.forEach((risk: any) => {
      const key = `${risk.vessel_id}-${risk.module_type}`;
      const existing = heatmapData.get(key);

      if (existing) {
        existing.riskIntensity = (existing.riskIntensity * existing.riskCount + risk.risk_score) / (existing.riskCount + 1);
        existing.riskCount += 1;
      } else {
        heatmapData.set(key, {
          vesselId: risk.vessel_id,
          region: "Fleet", // Could be enhanced with actual vessel location
          moduleType: risk.module_type,
          riskIntensity: risk.risk_score,
          riskCount: 1,
        });
      }
    });

    // Store heatmap data
    for (const point of heatmapData.values()) {
      await supabase.from("risk_heatmap_data").upsert({
        vessel_id: point.vesselId,
        region: point.region,
        module_type: point.moduleType,
        risk_intensity: point.riskIntensity,
        risk_count: point.riskCount,
        period_date: new Date().toISOString().split("T")[0],
      });
    }

    return Array.from(heatmapData.values());
  } catch (error) {
    logger.error("Error generating heatmap", error as Error, { filters });
    throw error;
  }
}

/**
 * Calculates risk trends over time
 */
export async function calculateRiskTrends(
  vesselId: string,
  moduleType: ModuleType | "OVERALL",
  periodDays: number = 30
): Promise<RiskTrend> {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

    let query = supabase
      .from("risk_assessments")
      .select("*")
      .eq("vessel_id", vesselId)
      .gte("assessed_at", startDate.toISOString())
      .lte("assessed_at", endDate.toISOString());

    if (moduleType !== "OVERALL") {
      query = query.eq("module_type", moduleType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        vesselId,
        moduleType,
        periodStart: startDate,
        periodEnd: endDate,
        averageRiskScore: 0,
        criticalRisksCount: 0,
        highRisksCount: 0,
        mediumRisksCount: 0,
        lowRisksCount: 0,
        trendDirection: "stable",
        keyIssues: [],
      });
    }

    const totalScore = data.reduce((sum: number, r: any) => sum + r.risk_score, 0);
    const averageRiskScore = totalScore / data.length;

    const criticalRisksCount = data.filter((r: any) => r.risk_level === "critical").length;
    const highRisksCount = data.filter((r: any) => r.risk_level === "high").length;
    const mediumRisksCount = data.filter((r: any) => r.risk_level === "medium").length;
    const lowRisksCount = data.filter((r: any) => r.risk_level === "low").length;

    // Calculate trend direction (simplified)
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum: number, r: any) => sum + r.risk_score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum: number, r: any) => sum + r.risk_score, 0) / secondHalf.length;
    
    let trendDirection: "improving" | "stable" | "worsening" = "stable";
    if (secondHalfAvg < firstHalfAvg - 5) trendDirection = "improving";
    if (secondHalfAvg > firstHalfAvg + 5) trendDirection = "worsening";

    // Extract key issues
    const keyIssues = data
      .filter((r: any) => r.risk_level === "critical" || r.risk_level === "high")
      .map((r: any) => r.risk_title)
      .slice(0, 5);

    const trend: RiskTrend = {
      vesselId,
      moduleType,
      periodStart: startDate,
      periodEnd: endDate,
      averageRiskScore,
      criticalRisksCount,
      highRisksCount,
      mediumRisksCount,
      lowRisksCount,
      trendDirection,
      keyIssues,
    };

    // Store trend data
    await supabase.from("risk_trends").insert({
      vessel_id: vesselId,
      module_type: moduleType,
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      average_risk_score: averageRiskScore,
      critical_risks_count: criticalRisksCount,
      high_risks_count: highRisksCount,
      medium_risks_count: mediumRisksCount,
      low_risks_count: lowRisksCount,
      trend_direction: trendDirection,
      key_issues: keyIssues,
    });

    return trend;
  } catch (error) {
    logger.error("Error calculating risk trends", error as Error, { vesselId, moduleType, periodDays });
    throw error;
  }
}

/**
 * Creates a watchdog alert for critical risks
 */
export async function createRiskAlert(
  vesselId: string,
  alertType: "threshold_exceeded" | "pattern_detected" | "anomaly" | "deadline_approaching" | "regulatory_change",
  severity: "critical" | "high" | "medium" | "low",
  title: string,
  message: string,
  riskAssessmentId?: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("risk_alerts")
      .insert({
        vessel_id: vesselId,
        alert_type: alertType,
        severity,
        title,
        message,
        risk_assessment_id: riskAssessmentId,
        action_required: severity === "critical" || severity === "high",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating alert: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    logger.error("Error creating risk alert", error as Error, { vesselId, alertType, severity });
    throw error;
  }
}

/**
 * Exports risk data in various formats
 */
export async function exportRiskData(
  format: "PDF" | "CSV" | "JSON" | "EXCEL",
  scope: "vessel" | "fleet" | "module" | "custom",
  filters: Record<string, any>,
  userId: string
): Promise<string> {
  try {
    // Get risk data based on filters
    let query = supabase.from("risk_assessments").select("*");

    if (filters.vesselId) {
      query = query.eq("vessel_id", filters.vesselId);
    }

    if (filters.moduleType) {
      query = query.eq("module_type", filters.moduleType);
    }

    if (filters.riskLevel) {
      query = query.eq("risk_level", filters.riskLevel);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Record export
    const { data: exportRecord, error: exportError } = await supabase
      .from("risk_exports")
      .insert({
        export_type: format,
        export_scope: scope,
        filters,
        generated_by: userId,
        file_size_bytes: JSON.stringify(data).length,
      })
      .select()
      .single();

    if (exportError) {
      throw exportError;
    }

    return exportRecord.id;
  } catch (error) {
    logger.error("Error exporting risk data", error as Error, { format, scope, userId });
    throw error;
  }
}

/**
 * Gets active alerts for a vessel
 */
export async function getActiveAlerts(vesselId: string, limit = 20) {
  const { data, error } = await supabase
    .from("risk_alerts")
    .select("*")
    .eq("vessel_id", vesselId)
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets risk assessments for a vessel
 */
export async function getRiskAssessments(
  vesselId: string,
  filters?: {
    moduleType?: ModuleType;
    riskLevel?: RiskLevel;
    status?: string;
  }
) {
  let query = supabase
    .from("risk_assessments")
    .select("*")
    .eq("vessel_id", vesselId);

  if (filters?.moduleType) {
    query = query.eq("module_type", filters.moduleType);
  }

  if (filters?.riskLevel) {
    query = query.eq("risk_level", filters.riskLevel);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("assessed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
