/**
 * PATCH 629 - Predictive Risk Engine
 * AI-powered risk prediction system for compliance and operational risks
 * Analyzes historical data to predict future non-conformances
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface RiskScore {
  moduleId: string;
  moduleName: string;
  score: number; // 0-100 (>80 = imminent risk)
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  prediction: string;
  recommendedActions: string[];
  lastInspectionDate?: string;
  daysWithoutInspection: number;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  value: number;
  description: string;
}

interface InspectionHistory {
  module: string;
  date: string;
  nonConformances: number;
  severity: string;
}

interface ComplianceModule {
  id: string;
  name: string;
  type: "PSC" | "ISM" | "MLC" | "MARPOL" | "IMCA" | "SGSO";
  lastInspection?: string;
  nonConformanceCount: number;
  changeFrequency: number;
}

/**
 * Calculate risk score for a compliance module
 */
export function calculateRiskScore(
  module: ComplianceModule,
  inspectionHistory: InspectionHistory[]
): RiskScore {
  const factors: RiskFactor[] = [];
  
  // Factor 1: Time since last inspection (0-30 points)
  const daysSinceInspection = module.lastInspection
    ? Math.floor((Date.now() - new Date(module.lastInspection).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  const timeFactor = Math.min(30, (daysSinceInspection / 180) * 30);
  factors.push({
    factor: "Time Since Inspection",
    weight: 0.3,
    value: timeFactor,
    description: `${daysSinceInspection} days without inspection`
  });

  // Factor 2: Historical non-conformances (0-35 points)
  const recentHistory = inspectionHistory
    .filter(h => h.module === module.id)
    .slice(0, 5);
  
  const avgNonConformances = recentHistory.length > 0
    ? recentHistory.reduce((sum, h) => sum + h.nonConformances, 0) / recentHistory.length
    : 0;
  
  const nonConformanceFactor = Math.min(35, avgNonConformances * 7);
  factors.push({
    factor: "Historical Non-Conformances",
    weight: 0.35,
    value: nonConformanceFactor,
    description: `Average of ${avgNonConformances.toFixed(1)} non-conformances in recent inspections`
  });

  // Factor 3: Change frequency (0-20 points)
  const changeFactor = Math.min(20, module.changeFrequency * 4);
  factors.push({
    factor: "Module Change Frequency",
    weight: 0.2,
    value: changeFactor,
    description: `${module.changeFrequency} changes in last 30 days`
  });

  // Factor 4: Severity trend (0-15 points)
  const severityTrend = calculateSeverityTrend(recentHistory);
  factors.push({
    factor: "Severity Trend",
    weight: 0.15,
    value: severityTrend,
    description: severityTrend > 10 ? "Increasing severity" : "Stable or decreasing"
  });

  // Calculate total weighted score
  const totalScore = factors.reduce((sum, f) => sum + f.value, 0);
  
  // Determine risk level
  let riskLevel: RiskScore["riskLevel"];
  if (totalScore >= 80) riskLevel = "critical";
  else if (totalScore >= 60) riskLevel = "high";
  else if (totalScore >= 40) riskLevel = "medium";
  else riskLevel = "low";

  // Generate prediction
  const prediction = generatePrediction(totalScore, daysSinceInspection, riskLevel);

  // Generate recommended actions
  const recommendedActions = generateRecommendedActions(riskLevel, factors, module);

  return {
    moduleId: module.id,
    moduleName: module.name,
    score: Math.round(totalScore),
    riskLevel,
    factors,
    prediction,
    recommendedActions,
    lastInspectionDate: module.lastInspection,
    daysWithoutInspection: daysSinceInspection
  };
}

/**
 * Calculate severity trend from inspection history
 */
function calculateSeverityTrend(history: InspectionHistory[]): number {
  if (history.length < 2) return 0;

  const severityMap: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  let trendScore = 0;
  for (let i = 1; i < history.length; i++) {
    const current = severityMap[history[i - 1].severity] || 0;
    const previous = severityMap[history[i].severity] || 0;
    if (current > previous) trendScore += 5;
  }

  return Math.min(15, trendScore);
}

/**
 * Generate prediction message
 */
function generatePrediction(
  score: number,
  daysSinceInspection: number,
  riskLevel: RiskScore["riskLevel"]
): string {
  if (riskLevel === "critical") {
    return `⚠️ CRITICAL: High probability of compliance failure within 7 days. Immediate action required.`;
  } else if (riskLevel === "high") {
    return `⚠️ HIGH RISK: Predicted non-conformance within 14-30 days. Schedule inspection urgently.`;
  } else if (riskLevel === "medium") {
    return `⚡ MEDIUM RISK: Potential issues detected. Consider scheduling inspection within 60 days.`;
  } else {
    return `✅ LOW RISK: Module appears compliant. Maintain regular inspection schedule.`;
  }
}

/**
 * Generate recommended actions based on risk assessment
 */
function generateRecommendedActions(
  riskLevel: RiskScore["riskLevel"],
  factors: RiskFactor[],
  module: ComplianceModule
): string[] {
  const actions: string[] = [];

  if (riskLevel === "critical" || riskLevel === "high") {
    actions.push("Schedule immediate internal audit");
    actions.push("Review recent operational changes");
    actions.push("Notify compliance team and vessel management");
  }

  // Check specific factors
  const timeFactor = factors.find(f => f.factor === "Time Since Inspection");
  if (timeFactor && timeFactor.value > 20) {
    actions.push("Conduct overdue inspection");
  }

  const ncFactor = factors.find(f => f.factor === "Historical Non-Conformances");
  if (ncFactor && ncFactor.value > 20) {
    actions.push("Review and address recurring non-conformances");
    actions.push("Provide additional training to crew");
  }

  const changeFactor = factors.find(f => f.factor === "Module Change Frequency");
  if (changeFactor && changeFactor.value > 10) {
    actions.push("Validate recent system changes");
    actions.push("Update documentation and procedures");
  }

  if (module.type === "ISM" || module.type === "SGSO") {
    actions.push("Review SMS procedures and compliance");
  }

  if (actions.length === 0) {
    actions.push("Continue monitoring");
    actions.push("Maintain current inspection schedule");
  }

  return actions;
}

/**
 * Predict risks for all compliance modules
 */
export async function predictComplianceRisks(
  vesselId?: string
): Promise<RiskScore[]> {
  try {
    logger.info("🔮 Starting predictive risk analysis", { vesselId });

    // Mock data for demonstration (replace with real Supabase queries)
    const modules: ComplianceModule[] = [
      {
        id: "ism-code",
        name: "ISM Code Compliance",
        type: "ISM",
        lastInspection: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 3,
        changeFrequency: 5
      },
      {
        id: "mlc-2006",
        name: "MLC 2006 Maritime Labor",
        type: "MLC",
        lastInspection: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 1,
        changeFrequency: 2
      },
      {
        id: "marpol-73-78",
        name: "MARPOL 73/78 Environmental",
        type: "MARPOL",
        lastInspection: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 2,
        changeFrequency: 3
      },
      {
        id: "psc-inspection",
        name: "Port State Control",
        type: "PSC",
        lastInspection: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 4,
        changeFrequency: 1
      },
      {
        id: "imca-m117",
        name: "IMCA M117 DP Operations",
        type: "IMCA",
        lastInspection: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 0,
        changeFrequency: 7
      },
      {
        id: "sgso",
        name: "SGSO Safety Management",
        type: "SGSO",
        lastInspection: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        nonConformanceCount: 2,
        changeFrequency: 4
      }
    ];

    // Mock inspection history
    const inspectionHistory: InspectionHistory[] = [
      { module: "ism-code", date: "2025-06-01", nonConformances: 4, severity: "high" },
      { module: "ism-code", date: "2025-03-15", nonConformances: 2, severity: "medium" },
      { module: "ism-code", date: "2024-12-10", nonConformances: 3, severity: "high" },
      { module: "mlc-2006", date: "2025-09-20", nonConformances: 1, severity: "low" },
      { module: "mlc-2006", date: "2025-06-01", nonConformances: 0, severity: "low" },
      { module: "marpol-73-78", date: "2025-08-01", nonConformances: 2, severity: "medium" },
      { module: "marpol-73-78", date: "2025-05-15", nonConformances: 3, severity: "medium" },
      { module: "psc-inspection", date: "2025-04-30", nonConformances: 5, severity: "critical" },
      { module: "psc-inspection", date: "2025-01-15", nonConformances: 3, severity: "high" },
      { module: "imca-m117", date: "2025-10-05", nonConformances: 0, severity: "low" },
      { module: "sgso", date: "2025-07-15", nonConformances: 2, severity: "medium" },
      { module: "sgso", date: "2025-04-10", nonConformances: 3, severity: "medium" }
    ];

    // Calculate risk for each module
    const risks = modules.map(module => 
      calculateRiskScore(module, inspectionHistory)
    );

    // Sort by risk score (highest first)
    risks.sort((a, b) => b.score - a.score);

    logger.info("✅ Risk analysis complete", {
      totalModules: risks.length,
      criticalRisks: risks.filter(r => r.riskLevel === "critical").length,
      highRisks: risks.filter(r => r.riskLevel === "high").length
    });

    return risks;
  } catch (error) {
    logger.error("❌ Error in predictive risk analysis", { error });
    throw error;
  }
}

/**
 * Get risk score for a specific module
 */
export async function getModuleRisk(moduleId: string): Promise<RiskScore | null> {
  const risks = await predictComplianceRisks();
  return risks.find(r => r.moduleId === moduleId) || null;
}

/**
 * Get aggregated risk summary
 */
export async function getRiskSummary() {
  const risks = await predictComplianceRisks();
  
  return {
    totalModules: risks.length,
    averageScore: Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length),
    criticalCount: risks.filter(r => r.riskLevel === "critical").length,
    highCount: risks.filter(r => r.riskLevel === "high").length,
    mediumCount: risks.filter(r => r.riskLevel === "medium").length,
    lowCount: risks.filter(r => r.riskLevel === "low").length,
    topRisks: risks.slice(0, 5),
    timestamp: new Date().toISOString()
  };
}
