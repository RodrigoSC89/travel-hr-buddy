/**
 * Compliance Hub - AI Service
 * PATCH 92.0 - AI-powered compliance review and analysis
 */

import { runAIContext } from "@/ai/kernel";
import { Logger } from "@/lib/utils/logger";
import { AIAuditResponse, DocumentAIAnalysis, RiskItem } from "../types";
import { COMPLIANCE_CONFIG } from "../utils/config";

/**
 * Analyze compliance document using AI
 */
export async function analyzeDocumentWithAI(
  documentText: string,
  category: string,
  documentId: string
): Promise<DocumentAIAnalysis | null> {
  try {
    Logger.info("Starting AI document analysis", { documentId, category });

    const response = await runAIContext({
      module: "compliance-review",
      action: "document-analysis",
      context: {
        documentText: documentText.substring(0, 5000), // Limit to first 5000 chars
        category,
        documentId
      }
    });

    if (response.type === "diagnosis" || response.type === "recommendation") {
      // Parse AI response into structured format
      const analysis: DocumentAIAnalysis = {
        document_id: documentId,
        summary: response.message,
        key_points: extractKeyPoints(response.message),
        compliance_requirements: extractComplianceRequirements(response.message),
        action_items: extractActionItems(response.message),
        related_regulations: extractRegulations(response.message),
        confidence: response.confidence || 85,
        analyzed_at: new Date().toISOString()
      };

      Logger.info("Document analysis completed", { documentId, confidence: analysis.confidence });
      return analysis;
    }

    return null;
  } catch (error) {
    Logger.error("AI document analysis failed", error, "compliance-hub");
    return null;
  }
}

/**
 * Evaluate audit checklist using AI
 */
export async function evaluateChecklistWithAI(
  checklistData: Record<string, string>,
  auditType: string
): Promise<AIAuditResponse | null> {
  try {
    Logger.info("Starting AI checklist evaluation", { auditType });

    const response = await runAIContext({
      module: "compliance-review",
      action: "checklist-evaluation",
      context: {
        checklistData,
        auditType
      }
    });

    if (response.type === "diagnosis" || response.type === "risk") {
      // Calculate compliance score from checklist
      const totalItems = Object.keys(checklistData).length;
      const okItems = Object.values(checklistData).filter(v => v === "ok").length;
      const complianceScore = totalItems > 0 ? (okItems / totalItems) * 100 : 0;

      // Extract issues from checklist
      const criticalIssues = Object.entries(checklistData)
        .filter(([_, status]) => status === "fail")
        .map(([id, _]) => `Checklist item ${id} marked as failed`);

      const warnings = Object.entries(checklistData)
        .filter(([_, status]) => status === "warning")
        .map(([id, _]) => `Checklist item ${id} has warnings`);

      const evaluation: AIAuditResponse = {
        overall_compliance: Math.round(complianceScore * 10) / 10,
        critical_issues: criticalIssues.length > 0 ? criticalIssues : ["No critical issues identified"],
        warnings: warnings.length > 0 ? warnings : ["No warnings"],
        recommendations: extractRecommendations(response.message),
        next_steps: extractNextSteps(response.message),
        summary: response.message,
        confidence: response.confidence || 85
      };

      Logger.info("Checklist evaluation completed", { 
        auditType, 
        compliance: evaluation.overall_compliance,
        confidence: evaluation.confidence 
      });

      return evaluation;
    }

    return null;
  } catch (error) {
    Logger.error("AI checklist evaluation failed", error, "compliance-hub");
    return null;
  }
}

/**
 * Analyze risks using AI
 */
export async function analyzeRisksWithAI(
  risks: RiskItem[]
): Promise<{ insights: string; topPriorities: RiskItem[]; confidence: number } | null> {
  try {
    Logger.info("Starting AI risk analysis", { riskCount: risks.length });

    const response = await runAIContext({
      module: "compliance-review",
      action: "risk-analysis",
      context: {
        risks: risks.map(r => ({
          id: r.id,
          title: r.title,
          severity: r.severity,
          status: r.status,
          risk_score: r.risk_score
        }))
      }
    });

    if (response.type === "risk" || response.type === "diagnosis") {
      // Sort risks by score to get top priorities
      const sortedRisks = [...risks].sort((a, b) => b.risk_score - a.risk_score);
      const topPriorities = sortedRisks.slice(0, 3);

      Logger.info("Risk analysis completed", { topPrioritiesCount: topPriorities.length });

      return {
        insights: response.message,
        topPriorities,
        confidence: response.confidence || 85
      };
    }

    return null;
  } catch (error) {
    Logger.error("AI risk analysis failed", error, "compliance-hub");
    return null;
  }
}

/**
 * Get AI-powered compliance insights for dashboard
 */
export async function getComplianceInsights(
  metrics: {
    overall_score: number;
    audits_pending: number;
    risks_critical: number;
    documents_expiring_soon: number;
  }
): Promise<string | null> {
  try {
    Logger.info("Getting compliance insights", { metrics });

    const response = await runAIContext({
      module: "compliance-review",
      action: "dashboard-insights",
      context: { metrics }
    });

    if (response.type === "recommendation" || response.type === "suggestion") {
      Logger.info("Compliance insights generated");
      return response.message;
    }

    return null;
  } catch (error) {
    Logger.error("Failed to get compliance insights", error, "compliance-hub");
    return null;
  }
}

// ==================== HELPER FUNCTIONS ====================

function extractKeyPoints(text: string): string[] {
  // Simple extraction - in real implementation, would use better NLP
  const lines = text.split("\n").filter(line => line.trim());
  return lines.slice(0, 5).map(line => line.trim().replace(/^[-•*]\s*/, ""));
}

function extractComplianceRequirements(text: string): string[] {
  const keywords = ["must", "required", "mandatory", "shall", "compliance"];
  return text
    .split(".")
    .filter(sentence => keywords.some(kw => sentence.toLowerCase().includes(kw)))
    .slice(0, 3)
    .map(s => s.trim());
}

function extractActionItems(text: string): string[] {
  const actionWords = ["implement", "review", "update", "ensure", "verify", "complete"];
  return text
    .split(".")
    .filter(sentence => actionWords.some(word => sentence.toLowerCase().includes(word)))
    .slice(0, 4)
    .map(s => s.trim());
}

function extractRegulations(text: string): string[] {
  // Look for regulation patterns like ISM, ISPS, IMCA, NORMAM, etc.
  const regex = /\b(ISM|ISPS|IMCA|NORMAM|FMEA|STCW|SOLAS|MARPOL)\b/gi;
  const matches = text.match(regex);
  return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
}

function extractRecommendations(text: string): string[] {
  const lines = text.split("\n").filter(line => 
    line.toLowerCase().includes("recommend") || 
    line.toLowerCase().includes("suggest")
  );
  return lines.slice(0, 3).map(line => line.trim());
}

function extractNextSteps(text: string): string[] {
  const actionWords = ["next", "step", "action", "follow"];
  const lines = text.split("\n").filter(line =>
    actionWords.some(word => line.toLowerCase().includes(word))
  );
  return lines.slice(0, 3).map(line => line.trim());
}

/**
 * Fallback evaluation when AI is unavailable
 */
export function fallbackComplianceEvaluation(
  checklistData: Record<string, string>
): AIAuditResponse {
  const totalItems = Object.keys(checklistData).length;
  const okItems = Object.values(checklistData).filter(v => v === "ok").length;
  const failItems = Object.values(checklistData).filter(v => v === "fail").length;
  const warningItems = Object.values(checklistData).filter(v => v === "warning").length;
  
  const complianceScore = totalItems > 0 ? (okItems / totalItems) * 100 : 0;

  return {
    overall_compliance: Math.round(complianceScore * 10) / 10,
    critical_issues: failItems > 0 
      ? [`${failItems} checklist items failed and require immediate attention`]
      : ["No critical issues identified"],
    warnings: warningItems > 0
      ? [`${warningItems} checklist items have warnings`]
      : ["No warnings"],
    recommendations: [
      "Review all failed items and implement corrective actions",
      "Document findings and update compliance records",
      "Schedule follow-up audit within 30 days"
    ],
    next_steps: [
      "Address all critical issues immediately",
      "Create action plan for warning items",
      "Update compliance documentation"
    ],
    summary: `Compliance check completed with ${complianceScore.toFixed(1)}% conformity. ${failItems > 0 ? "Immediate action required for failed items." : "Good compliance status."}`,
    confidence: 75
  };
}
