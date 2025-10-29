/**
 * PATCH 515 - AI Governance Engine
 * AI-driven governance system with advanced rule engine, ethics layer, and decision justifications
 */

export interface GovernanceRule {
  id: string;
  name: string;
  category: "ethics" | "compliance" | "security" | "performance" | "custom";
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
}

export interface GovernanceDecision {
  id: string;
  ruleId: string;
  context: Record<string, any>;
  decision: "approve" | "reject" | "escalate" | "modify";
  justification: string;
  ethicsScore: number;
  impactAssessment: {
    immediate: string;
    longTerm: string;
    stakeholders: string[];
  };
  timestamp: string;
}

class GovernanceEngine {
  private rules: Map<string, GovernanceRule> = new Map();
  private decisionHistory: GovernanceDecision[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    const defaultRules: GovernanceRule[] = [
      {
        id: "rule-ethics-1",
        name: "Data Privacy Protection",
        category: "ethics",
        condition: "involves_personal_data === true",
        action: "require_consent_and_encryption",
        priority: 10,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "rule-compliance-1",
        name: "Regulatory Compliance Check",
        category: "compliance",
        condition: "requires_audit === true",
        action: "log_and_review",
        priority: 9,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "rule-security-1",
        name: "Security Threat Assessment",
        category: "security",
        condition: "security_risk > 0.7",
        action: "escalate_to_security_team",
        priority: 10,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "rule-performance-1",
        name: "Resource Optimization",
        category: "performance",
        condition: "resource_usage > 0.8",
        action: "optimize_or_scale",
        priority: 5,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ];

    defaultRules.forEach((rule) => this.rules.set(rule.id, rule));
  }

  /**
   * Evaluate a request against governance rules
   */
  async evaluateRequest(context: Record<string, any>): Promise<GovernanceDecision> {
    const applicableRules = this.getApplicableRules(context);

    // Evaluate ethics
    const ethicsScore = this.calculateEthicsScore(context, applicableRules);

    // Make decision
    const decision = this.makeDecision(context, applicableRules, ethicsScore);

    // Generate justification
    const justification = this.generateJustification(decision, applicableRules, ethicsScore);

    // Assess impact
    const impactAssessment = this.assessImpact(context, decision);

    const governanceDecision: GovernanceDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: applicableRules[0]?.id || "none",
      context,
      decision: decision.action,
      justification,
      ethicsScore,
      impactAssessment,
      timestamp: new Date().toISOString(),
    };

    this.decisionHistory.push(governanceDecision);
    return governanceDecision;
  }

  private getApplicableRules(context: Record<string, any>): GovernanceRule[] {
    return Array.from(this.rules.values())
      .filter((rule) => rule.enabled)
      .filter((rule) => this.evaluateCondition(rule.condition, context))
      .sort((a, b) => b.priority - a.priority);
  }

  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation - in production use a safe evaluator
      if (condition.includes("involves_personal_data")) {
        return context.involvesPersonalData === true;
      }
      if (condition.includes("requires_audit")) {
        return context.requiresAudit === true;
      }
      if (condition.includes("security_risk")) {
        return (context.securityRisk || 0) > 0.7;
      }
      if (condition.includes("resource_usage")) {
        return (context.resourceUsage || 0) > 0.8;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private calculateEthicsScore(context: Record<string, any>, rules: GovernanceRule[]): number {
    let score = 100;

    // Deduct points for ethical concerns
    if (context.involvesPersonalData && !context.hasConsent) {
      score -= 30;
    }
    if (context.securityRisk > 0.5) {
      score -= 20;
    }
    if (!context.transparencyLevel || context.transparencyLevel < 0.7) {
      score -= 15;
    }
    if (context.potentialHarm && context.potentialHarm > 0) {
      score -= context.potentialHarm * 50;
    }

    return Math.max(0, score);
  }

  private makeDecision(
    context: Record<string, any>,
    rules: GovernanceRule[],
    ethicsScore: number
  ): { action: "approve" | "reject" | "escalate" | "modify"; reason: string } {
    // Critical ethics threshold
    if (ethicsScore < 50) {
      return { action: "reject", reason: "Ethics score below acceptable threshold" };
    }

    // High-priority rules trigger escalation
    const criticalRule = rules.find((r) => r.priority >= 9 && r.category === "security");
    if (criticalRule) {
      return { action: "escalate", reason: "Critical security or compliance rule triggered" };
    }

    // Moderate concerns require modification
    if (ethicsScore < 80 || rules.some((r) => r.category === "ethics")) {
      return {
        action: "modify",
        reason: "Request requires modifications to meet governance standards",
      };
    }

    return { action: "approve", reason: "All governance checks passed" };
  }

  private generateJustification(
    decision: { action: string; reason: string },
    rules: GovernanceRule[],
    ethicsScore: number
  ): string {
    const parts: string[] = [];

    parts.push(`Decision: ${decision.action.toUpperCase()}`);
    parts.push(`Reason: ${decision.reason}`);
    parts.push(`Ethics Score: ${ethicsScore}/100`);

    if (rules.length > 0) {
      parts.push(`Applied Rules: ${rules.map((r) => r.name).join(", ")}`);
    }

    if (ethicsScore < 80) {
      parts.push("Ethical concerns identified and addressed in decision.");
    }

    return parts.join(" | ");
  }

  private assessImpact(
    context: Record<string, any>,
    decision: { action: string; reason: string }
  ): { immediate: string; longTerm: string; stakeholders: string[] } {
    return {
      immediate: `Decision to ${decision.action} will take effect immediately`,
      longTerm: "Long-term impact depends on execution and monitoring",
      stakeholders: context.stakeholders || ["system", "users", "administrators"],
    };
  }

  /**
   * Add a new governance rule
   */
  addRule(rule: Omit<GovernanceRule, "id" | "createdAt">): GovernanceRule {
    const newRule: GovernanceRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Get all rules
   */
  getRules(): GovernanceRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 100): GovernanceDecision[] {
    return this.decisionHistory.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const total = this.decisionHistory.length;
    const approved = this.decisionHistory.filter((d) => d.decision === "approve").length;
    const rejected = this.decisionHistory.filter((d) => d.decision === "reject").length;
    const escalated = this.decisionHistory.filter((d) => d.decision === "escalate").length;
    const modified = this.decisionHistory.filter((d) => d.decision === "modify").length;

    const avgEthicsScore =
      this.decisionHistory.reduce((sum, d) => sum + d.ethicsScore, 0) / total || 0;

    return {
      total,
      approved,
      rejected,
      escalated,
      modified,
      averageEthicsScore: Number(avgEthicsScore.toFixed(2)),
    };
  }
}

// Singleton instance
export const governanceEngine = new GovernanceEngine();
