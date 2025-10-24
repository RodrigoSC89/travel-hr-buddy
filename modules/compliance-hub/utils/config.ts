/**
 * Compliance Hub - Configuration
 * PATCH 92.0 - Unified compliance configuration
 */

export const COMPLIANCE_CONFIG = {
  // Compliance thresholds
  compliance: {
    excellent: 95,
    good: 85,
    acceptable: 75,
    critical: 60
  },

  // Audit frequencies (in days)
  frequency: {
    IMCA: 90,      // Quarterly
    ISM: 365,      // Annually
    ISPS: 180,     // Semi-annually
    FMEA: 180,     // Semi-annually
    NORMAM: 365    // Annually
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx"]
  },

  // Risk scoring
  risk: {
    severityThresholds: {
      critical: 20,  // likelihood * impact >= 20
      high: 15,
      medium: 8,
      low: 0
    },
    colors: {
      critical: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950",
      high: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950",
      medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950",
      low: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
    }
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
  },

  // AI prompts for compliance review
  aiPrompts: {
    systemPrompt: `You are a maritime compliance expert specializing in IMCA, ISM Code, ISPS, FMEA, and NORMAM regulations. 
Analyze compliance documents, audit checklists, and risk assessments to provide clear, actionable feedback on compliance status, 
critical issues, and recommendations for improvement. Always reference specific regulation sections when applicable.`,
    
    documentAnalysis: (documentText: string, category: string) => 
      `Analyze this ${category} compliance document and provide a structured assessment:

Document Content:
${documentText}

Please provide:
1. Executive summary (2-3 sentences)
2. Key compliance requirements identified
3. Action items required
4. Related regulations or standards
5. Risk areas or gaps
6. Recommendations for compliance

Format your response as structured JSON.`,

    checklistEvaluation: (checklistData: Record<string, string>, auditType: string) => 
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

Format your response as structured JSON.`,

    riskAnalysis: (riskItems: any[]) => 
      `Analyze these operational risks and provide strategic insights:

Risk Data:
${JSON.stringify(riskItems, null, 2)}

Please provide:
1. Overall risk profile assessment
2. Top 3 priority risks requiring immediate attention
3. Risk trends and patterns
4. Mitigation strategy recommendations
5. Predicted impact if unaddressed
6. Compliance implications

Format your response as structured JSON.`
  }
} as const;

/**
 * Get compliance level from score
 */
export function getComplianceLevel(score: number): keyof typeof COMPLIANCE_CONFIG.compliance {
  if (score >= COMPLIANCE_CONFIG.compliance.excellent) return "excellent";
  if (score >= COMPLIANCE_CONFIG.compliance.good) return "good";
  if (score >= COMPLIANCE_CONFIG.compliance.acceptable) return "acceptable";
  return "critical";
}

/**
 * Get next audit date based on type
 */
export function getNextAuditDate(type: keyof typeof COMPLIANCE_CONFIG.frequency, lastAuditDate?: Date): Date {
  const today = lastAuditDate || new Date();
  const daysToAdd = COMPLIANCE_CONFIG.frequency[type];
  
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate;
}

/**
 * Calculate risk severity from likelihood and impact
 */
export function calculateRiskSeverity(likelihood: number, impact: number): "critical" | "high" | "medium" | "low" {
  const score = likelihood * impact;
  const thresholds = COMPLIANCE_CONFIG.risk.severityThresholds;
  
  if (score >= thresholds.critical) return "critical";
  if (score >= thresholds.high) return "high";
  if (score >= thresholds.medium) return "medium";
  return "low";
}

/**
 * Check if document is expiring soon (within 30 days)
 */
export function isDocumentExpiringSoon(expiryDate: string): boolean {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
}

/**
 * Validate file upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > COMPLIANCE_CONFIG.upload.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds ${COMPLIANCE_CONFIG.upload.maxFileSize / (1024 * 1024)}MB limit`
    };
  }

  // Check file type
  if (!COMPLIANCE_CONFIG.upload.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF, images, Word, and Excel documents allowed"
    };
  }

  return { valid: true };
}
