/**
 * Audit Center - AI Evaluation Integration
 * PATCH 62.0
 */

import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";
import { AUDIT_CONFIG } from "./config";
import { AIAuditResponse, ChecklistStatus } from "./types";

/**
 * Evaluate audit checklist using AI
 */
export async function evaluateAuditWithAI(
  checklistData: Record<string, ChecklistStatus>,
  auditType: "IMCA" | "ISM" | "ISPS",
  auditId: string
): Promise<{ success: boolean; data?: AIAuditResponse; error?: string }> {
  try {
    Logger.ai("Starting AI audit evaluation", { auditType, auditId });

    const timer = Logger.startTimer("AI Audit Evaluation");

    // Call Supabase Edge Function for AI evaluation
    const { data, error } = await supabase.functions.invoke("evaluate-audit", {
      body: {
        checklistData,
        auditType,
        auditId,
        prompt: AUDIT_CONFIG.aiPrompts.evaluationPrompt(checklistData, auditType)
      }
    });

    timer();

    if (error) {
      Logger.error("AI evaluation failed", error, "audit-center");
      return { 
        success: false, 
        error: error.message 
      };
    }

    Logger.ai("AI evaluation completed", { auditId, response: data });

    // Parse AI response
    const aiResponse: AIAuditResponse = {
      overall_compliance: data.overall_compliance || 0,
      critical_issues: data.critical_issues || [],
      warnings: data.warnings || [],
      recommendations: data.recommendations || [],
      next_steps: data.next_steps || [],
      summary: data.summary || "No summary available"
    };

    return { 
      success: true, 
      data: aiResponse 
    };

  } catch (error) {
    Logger.error("Unexpected error during AI evaluation", error, "audit-center");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Fallback AI evaluation (client-side logic when edge function unavailable)
 */
export function fallbackEvaluation(
  checklistData: Record<string, ChecklistStatus>,
  auditType: "IMCA" | "ISM" | "ISPS"
): AIAuditResponse {
  Logger.warn("Using fallback AI evaluation", { auditType });

  const items = Object.entries(checklistData);
  const total = items.length;
  
  const okCount = items.filter(([_, status]) => status === "ok").length;
  const warningCount = items.filter(([_, status]) => status === "warning").length;
  const failCount = items.filter(([_, status]) => status === "fail").length;
  
  const compliance = Math.round((okCount / total) * 100);

  const critical_issues: string[] = [];
  const warnings: string[] = [];

  items.forEach(([key, status]) => {
    if (status === "fail") {
      critical_issues.push(`Critical: ${key} marked as failed - requires immediate attention`);
    } else if (status === "warning") {
      warnings.push(`Warning: ${key} requires review and corrective action`);
    }
  });

  const recommendations = [
    failCount > 0 ? `Address ${failCount} critical failure(s) immediately` : null,
    warningCount > 0 ? `Review and resolve ${warningCount} warning(s)` : null,
    compliance < 100 ? "Schedule follow-up audit within 30 days" : null,
    "Ensure all documentation is properly filed and signed",
    "Conduct crew briefing on findings"
  ].filter(Boolean) as string[];

  const next_steps = [
    "Create corrective action plan for all non-conformities",
    "Assign responsibility and deadlines for each action",
    "Document all corrective measures taken",
    "Schedule verification audit"
  ];

  const summary = `${auditType} Audit completed with ${compliance}% compliance. ${
    failCount > 0 ? `${failCount} critical issue(s) identified. ` : ""
  }${
    warningCount > 0 ? `${warningCount} warning(s) require attention. ` : ""
  }${
    compliance >= 95 ? "Excellent compliance status maintained." : 
    compliance >= 85 ? "Good compliance, minor improvements needed." :
    compliance >= 75 ? "Acceptable compliance, corrective actions required." :
    "Critical compliance level, immediate action required."
  }`;

  return {
    overall_compliance: compliance,
    critical_issues,
    warnings,
    recommendations,
    next_steps,
    summary
  };
}
