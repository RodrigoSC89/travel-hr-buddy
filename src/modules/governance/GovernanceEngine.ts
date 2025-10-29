/**
 * PATCH 515: Governance Engine
 * Ethics-based decision governance with comprehensive audit trail
 */

export type DecisionType = "approve" | "reject" | "escalate" | "modify";
export type GovernanceCategory = "ethics" | "compliance" | "security" | "performance";

export interface GovernanceRequest {
  id?: string;
  involvesPersonalData: boolean;
  hasConsent: boolean;
  securityRisk: number; // 0-1 scale
  transparencyLevel: number; // 0-1 scale
  impactLevel?: "low" | "medium" | "high" | "critical";
  stakeholders?: string[];
  description?: string;
  metadata?: Record<string, any>;
}

export interface GovernanceDecision {
  decision: DecisionType;
  ethicsScore: number; // 0-100 scale
  category: GovernanceCategory;
  justification: string;
  recommendations: string[];
  impactAssessment: {
    dataPrivacy: number;
    security: number;
    transparency: number;
    fairness: number;
  };
  requiresHumanReview: boolean;
  auditTrail: AuditEntry;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  requestId: string;
  decision: DecisionType;
  ethicsScore: number;
  justification: string;
  evaluator: string;
  metadata: Record<string, any>;
}

class GovernanceEngine {
  private static instance: GovernanceEngine;
  private auditLog: AuditEntry[] = [];
  
  // Ethics scoring weights
  private readonly ETHICS_WEIGHTS = {
    consent: 30,
    security: 25,
    transparency: 25,
    privacy: 20,
  };

  // Thresholds
  private readonly APPROVE_THRESHOLD = 75;
  private readonly REJECT_THRESHOLD = 50;
  private readonly HIGH_RISK_THRESHOLD = 0.7;

  private constructor() {}

  static getInstance(): GovernanceEngine {
    if (!GovernanceEngine.instance) {
      GovernanceEngine.instance = new GovernanceEngine();
    }
    return GovernanceEngine.instance;
  }

  /**
   * Evaluate a governance request
   */
  async evaluateRequest(request: GovernanceRequest): Promise<GovernanceDecision> {
    const requestId = request.id || this.generateRequestId();
    
    // Calculate ethics score
    const ethicsScore = this.calculateEthicsScore(request);
    
    // Determine decision type
    const decision = this.determineDecision(request, ethicsScore);
    
    // Assess impact
    const impactAssessment = this.assessImpact(request);
    
    // Generate justification
    const justification = this.generateJustification(request, ethicsScore, decision);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(request, ethicsScore);
    
    // Determine if human review is required
    const requiresHumanReview = this.requiresHumanReview(request, ethicsScore);
    
    // Determine category
    const category = this.determineCategory(request);
    
    // Create audit entry
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      requestId,
      decision,
      ethicsScore,
      justification,
      evaluator: "GovernanceEngine",
      metadata: {
        ...request,
        impactAssessment,
      },
    };
    
    this.auditLog.push(auditEntry);
    
    // Keep audit log limited to last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }

    return {
      decision,
      ethicsScore,
      category,
      justification,
      recommendations,
      impactAssessment,
      requiresHumanReview,
      auditTrail: auditEntry,
    };
  }

  /**
   * Calculate ethics score (0-100)
   */
  private calculateEthicsScore(request: GovernanceRequest): number {
    let score = 0;

    // Consent score
    if (request.involvesPersonalData) {
      score += request.hasConsent ? this.ETHICS_WEIGHTS.consent : 0;
    } else {
      score += this.ETHICS_WEIGHTS.consent; // Full points if no personal data
    }

    // Security score (inverse of risk)
    const securityScore = (1 - request.securityRisk) * this.ETHICS_WEIGHTS.security;
    score += securityScore;

    // Transparency score
    const transparencyScore = request.transparencyLevel * this.ETHICS_WEIGHTS.transparency;
    score += transparencyScore;

    // Privacy score
    let privacyScore = this.ETHICS_WEIGHTS.privacy;
    if (request.involvesPersonalData && !request.hasConsent) {
      privacyScore = 0;
    } else if (request.involvesPersonalData && request.hasConsent) {
      privacyScore *= 0.8; // Reduced score even with consent
    }
    score += privacyScore;

    return Math.round(score);
  }

  /**
   * Determine decision type based on score and request
   */
  private determineDecision(
    request: GovernanceRequest,
    ethicsScore: number
  ): DecisionType {
    // Automatic reject if critical issues
    if (request.involvesPersonalData && !request.hasConsent) {
      return "reject";
    }

    if (request.securityRisk >= this.HIGH_RISK_THRESHOLD) {
      return "escalate";
    }

    // Score-based decision
    if (ethicsScore >= this.APPROVE_THRESHOLD) {
      return "approve";
    } else if (ethicsScore < this.REJECT_THRESHOLD) {
      return "reject";
    } else {
      // Mid-range scores
      if (request.securityRisk > 0.5 || request.transparencyLevel < 0.5) {
        return "modify";
      }
      return "escalate";
    }
  }

  /**
   * Assess impact across multiple dimensions
   */
  private assessImpact(request: GovernanceRequest): GovernanceDecision["impactAssessment"] {
    return {
      dataPrivacy: request.involvesPersonalData ? 
        (request.hasConsent ? 0.5 : 1.0) : 0.0,
      security: request.securityRisk,
      transparency: 1 - request.transparencyLevel,
      fairness: request.involvesPersonalData && !request.hasConsent ? 1.0 : 0.2,
    };
  }

  /**
   * Generate human-readable justification
   */
  private generateJustification(
    request: GovernanceRequest,
    ethicsScore: number,
    decision: DecisionType
  ): string {
    const reasons: string[] = [];

    if (request.involvesPersonalData && !request.hasConsent) {
      reasons.push("Personal data involved without proper consent");
    }

    if (request.securityRisk >= this.HIGH_RISK_THRESHOLD) {
      reasons.push(`High security risk detected (${(request.securityRisk * 100).toFixed(0)}%)`);
    }

    if (request.transparencyLevel < 0.5) {
      reasons.push("Insufficient transparency level");
    }

    if (ethicsScore >= this.APPROVE_THRESHOLD) {
      reasons.push("Meets all ethical guidelines");
    } else if (ethicsScore < this.REJECT_THRESHOLD) {
      reasons.push("Does not meet minimum ethical standards");
    }

    const baseJustification = `Decision: ${decision.toUpperCase()}. Ethics Score: ${ethicsScore}/100.`;
    
    return reasons.length > 0
      ? `${baseJustification} ${reasons.join(". ")}.`
      : baseJustification;
  }

  /**
   * Generate recommendations for improvement
   */
  private generateRecommendations(
    request: GovernanceRequest,
    ethicsScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (request.involvesPersonalData && !request.hasConsent) {
      recommendations.push("Obtain explicit user consent before processing personal data");
    }

    if (request.securityRisk > 0.5) {
      recommendations.push("Implement additional security measures to reduce risk");
    }

    if (request.transparencyLevel < 0.7) {
      recommendations.push("Improve transparency by providing clear documentation and explanations");
    }

    if (ethicsScore < this.APPROVE_THRESHOLD && recommendations.length === 0) {
      recommendations.push("Review and enhance ethical considerations in the request");
    }

    if (request.impactLevel === "critical") {
      recommendations.push("Require human oversight for critical impact decisions");
    }

    return recommendations;
  }

  /**
   * Determine if human review is required
   */
  private requiresHumanReview(
    request: GovernanceRequest,
    ethicsScore: number
  ): boolean {
    return (
      request.impactLevel === "critical" ||
      request.securityRisk >= this.HIGH_RISK_THRESHOLD ||
      ethicsScore < this.REJECT_THRESHOLD ||
      (request.involvesPersonalData && !request.hasConsent)
    );
  }

  /**
   * Determine primary governance category
   */
  private determineCategory(request: GovernanceRequest): GovernanceCategory {
    if (request.securityRisk >= 0.6) {
      return "security";
    }
    
    if (request.involvesPersonalData) {
      return "compliance";
    }

    if (request.transparencyLevel < 0.5) {
      return "ethics";
    }

    return "performance";
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get audit log
   */
  getAuditLog(limit?: number): AuditEntry[] {
    const log = [...this.auditLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  /**
   * Get audit log by category
   */
  getAuditByCategory(category: GovernanceCategory): AuditEntry[] {
    return this.auditLog.filter(entry => {
      const request = entry.metadata as GovernanceRequest;
      return this.determineCategory(request) === category;
    });
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    total: number;
    approved: number;
    rejected: number;
    escalated: number;
    modified: number;
    averageEthicsScore: number;
    } {
    const total = this.auditLog.length;
    const approved = this.auditLog.filter(e => e.decision === "approve").length;
    const rejected = this.auditLog.filter(e => e.decision === "reject").length;
    const escalated = this.auditLog.filter(e => e.decision === "escalate").length;
    const modified = this.auditLog.filter(e => e.decision === "modify").length;
    
    const averageEthicsScore = total > 0
      ? this.auditLog.reduce((sum, e) => sum + e.ethicsScore, 0) / total
      : 0;

    return {
      total,
      approved,
      rejected,
      escalated,
      modified,
      averageEthicsScore: Math.round(averageEthicsScore),
    };
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }
}

// Export singleton instance
export const governanceEngine = GovernanceEngine.getInstance();
