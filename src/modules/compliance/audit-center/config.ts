/**
 * Audit Center - Configuration
 * PATCH 62.0
 */

export const AUDIT_CONFIG = {
  // Compliance thresholds
  compliance: {
    excellent: 95,
    good: 85,
    acceptable: 75,
    critical: 60
  },

  // Audit frequencies (in days)
  frequency: {
    IMCA: 90,  // Quarterly
    ISM: 365,  // Annually
    ISPS: 180  // Semi-annually
  },

  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]
  },

  // AI evaluation prompts
  aiPrompts: {
    systemPrompt: `You are a maritime compliance expert specializing in IMCA, ISM Code, and ISPS regulations. 
Analyze audit checklists and provide clear, actionable feedback on compliance status, 
critical issues, and recommendations for improvement. Always reference specific regulation sections.`,
    
    evaluationPrompt: (checklistData: Record<string, string>, auditType: string) => 
      `Analyze this ${auditType} audit checklist and provide a compliance assessment:

Checklist Data:
${JSON.stringify(checklistData, null, 2)}

Please provide:
1. Overall compliance percentage
2. Critical issues (items marked as 'fail')
3. Warnings (items marked as 'warning')
4. Specific recommendations with regulation references
5. Next steps for achieving full compliance
6. Executive summary

Format your response as structured JSON with these fields:
{
  "overall_compliance": number,
  "critical_issues": string[],
  "warnings": string[],
  "recommendations": string[],
  "next_steps": string[],
  "summary": string
}`
  },

  // Status colors
  statusColors: {
    ok: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    fail: "text-red-600 dark:text-red-400",
    not_checked: "text-gray-400 dark:text-gray-500"
  },

  // Badge variants
  statusBadges: {
    scheduled: "secondary",
    in_progress: "default",
    completed: "outline",
    overdue: "destructive"
  }
} as const;

/**
 * Get compliance level from score
 */
export function getComplianceLevel(score: number): keyof typeof AUDIT_CONFIG.compliance {
  if (score >= AUDIT_CONFIG.compliance.excellent) return "excellent";
  if (score >= AUDIT_CONFIG.compliance.good) return "good";
  if (score >= AUDIT_CONFIG.compliance.acceptable) return "acceptable";
  return "critical";
}

/**
 * Get next audit date based on type
 */
export function getNextAuditDate(type: "IMCA" | "ISM" | "ISPS", lastAuditDate?: Date): Date {
  const today = lastAuditDate || new Date();
  const daysToAdd = AUDIT_CONFIG.frequency[type];
  
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate;
}
