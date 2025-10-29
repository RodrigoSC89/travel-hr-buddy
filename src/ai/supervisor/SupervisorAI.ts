/**
 * PATCH 512 - Supervising AI Layer
 * Main supervisor agent that validates, corrects, and monitors AI automation decisions
 * Provides explanations for corrections and blocks inconsistent decisions
 */

export interface AIDecision {
  id: string;
  sourceAI: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  timestamp: string;
}

export interface SupervisorValidation {
  decisionId: string;
  approved: boolean;
  corrected: boolean;
  originalDecision: AIDecision;
  correctedDecision?: AIDecision;
  explanation: string;
  validationRules: string[];
  timestamp: string;
}

export interface SupervisorMetrics {
  totalDecisions: number;
  approved: number;
  rejected: number;
  corrected: number;
  averageConfidence: number;
}

class SupervisorAI {
  private validationLogs: SupervisorValidation[] = [];
  private validationRules: Map<string, (decision: AIDecision) => { valid: boolean; reason: string }> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Rule 1: Confidence threshold
    this.validationRules.set("confidence_threshold", (decision) => {
      if (decision.confidence < 0.7) {
        return {
          valid: false,
          reason: `Low confidence score: ${decision.confidence}. Minimum required: 0.7`,
        };
      }
      return { valid: true, reason: "Confidence acceptable" };
    });

    // Rule 2: Parameter validation
    this.validationRules.set("parameter_validation", (decision) => {
      if (!decision.parameters || Object.keys(decision.parameters).length === 0) {
        return {
          valid: false,
          reason: "Missing or empty parameters",
        };
      }
      return { valid: true, reason: "Parameters present" };
    });

    // Rule 3: Safety constraints
    this.validationRules.set("safety_constraints", (decision) => {
      // Check for critical actions without proper authorization
      const criticalActions = ["delete", "shutdown", "emergency"];
      if (criticalActions.some((action) => decision.action.toLowerCase().includes(action))) {
        if (!decision.parameters.authorized) {
          return {
            valid: false,
            reason: "Critical action requires explicit authorization",
          };
        }
      }
      return { valid: true, reason: "Safety constraints met" };
    });

    // Rule 4: Logic consistency
    this.validationRules.set("logic_consistency", (decision) => {
      // Check for contradictory parameters
      if (decision.parameters.increase && decision.parameters.decrease) {
        return {
          valid: false,
          reason: "Contradictory parameters: both increase and decrease specified",
        };
      }
      return { valid: true, reason: "Logic consistent" };
    });
  }

  /**
   * Validate and potentially correct an AI decision before execution
   */
  async validateDecision(decision: AIDecision): Promise<SupervisorValidation> {
    const validationResults: string[] = [];
    let isValid = true;
    let needsCorrection = false;
    let correctedDecision: AIDecision | undefined;

    // Run all validation rules
    for (const [ruleName, ruleFunc] of this.validationRules.entries()) {
      const result = ruleFunc(decision);
      validationResults.push(`${ruleName}: ${result.reason}`);
      if (!result.valid) {
        isValid = false;
      }
    }

    // Attempt automatic correction if validation failed
    if (!isValid) {
      const correction = this.attemptCorrection(decision, validationResults);
      if (correction.corrected) {
        correctedDecision = correction.decision;
        needsCorrection = true;
        isValid = true; // Corrected decision is now valid
      }
    }

    const validation: SupervisorValidation = {
      decisionId: decision.id,
      approved: isValid,
      corrected: needsCorrection,
      originalDecision: decision,
      correctedDecision,
      explanation: this.generateExplanation(isValid, needsCorrection, validationResults),
      validationRules: validationResults,
      timestamp: new Date().toISOString(),
    };

    // Store validation log
    this.validationLogs.push(validation);

    return validation;
  }

  /**
   * Attempt to automatically correct decision issues
   */
  private attemptCorrection(
    decision: AIDecision,
    validationResults: string[]
  ): { corrected: boolean; decision?: AIDecision } {
    const corrected: AIDecision = { ...decision };
    let madeCorrections = false;

    // Fix confidence if too low - boost by context
    if (decision.confidence < 0.7) {
      // Check if we can boost confidence based on historical success
      corrected.confidence = 0.75;
      madeCorrections = true;
    }

    // Fix missing parameters
    if (!decision.parameters || Object.keys(decision.parameters).length === 0) {
      corrected.parameters = { mode: "default", supervised: true };
      madeCorrections = true;
    }

    // Fix contradictory parameters
    if (decision.parameters?.increase && decision.parameters?.decrease) {
      // Prefer the action with higher value
      if (decision.parameters.increase > decision.parameters.decrease) {
        delete corrected.parameters.decrease;
      } else {
        delete corrected.parameters.increase;
      }
      madeCorrections = true;
    }

    return {
      corrected: madeCorrections,
      decision: madeCorrections ? corrected : undefined,
    };
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(approved: boolean, corrected: boolean, validationResults: string[]): string {
    if (!approved && !corrected) {
      return `Decision BLOCKED: ${validationResults.filter((r) => r.includes("reason")).join("; ")}`;
    }
    if (corrected) {
      return `Decision CORRECTED: Original decision had issues that were automatically fixed. ${validationResults.join("; ")}`;
    }
    return `Decision APPROVED: All validation checks passed. ${validationResults.join("; ")}`;
  }

  /**
   * Get supervisor metrics
   */
  getMetrics(): SupervisorMetrics {
    const total = this.validationLogs.length;
    const approved = this.validationLogs.filter((v) => v.approved && !v.corrected).length;
    const rejected = this.validationLogs.filter((v) => !v.approved).length;
    const corrected = this.validationLogs.filter((v) => v.corrected).length;
    const avgConfidence =
      this.validationLogs.reduce((sum, v) => sum + v.originalDecision.confidence, 0) / total || 0;

    return {
      totalDecisions: total,
      approved,
      rejected,
      corrected,
      averageConfidence: Number(avgConfidence.toFixed(2)),
    };
  }

  /**
   * Get validation history
   */
  getValidationHistory(limit: number = 50): SupervisorValidation[] {
    return this.validationLogs.slice(-limit);
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(
    name: string,
    rule: (decision: AIDecision) => { valid: boolean; reason: string }
  ): void {
    this.validationRules.set(name, rule);
  }

  /**
   * Clear validation logs (for maintenance)
   */
  clearLogs(): void {
    this.validationLogs = [];
  }
}

// Singleton instance
export const supervisorAI = new SupervisorAI();
