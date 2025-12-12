
/**
 * PATCH 512: AI Supervisor Layer
 * Validates, corrects, and monitors decisions from secondary AI systems
 */

export interface AIDecision {
  sourceAI: string;
  action: string;
  confidence: number;
  parameters: Record<string, any>;
  timestamp?: Date;
}

export interface ValidationResult {
  approved: boolean;
  corrected: boolean;
  blocked: boolean;
  confidence: number;
  explanation: string;
  originalDecision: AIDecision;
  correctedDecision?: AIDecision;
  validationRules: {
    confidenceCheck: boolean;
    parameterCheck: boolean;
    safetyCheck: boolean;
    logicCheck: boolean;
  };
}

export interface SupervisorMetrics {
  totalDecisions: number;
  approved: number;
  rejected: number;
  corrected: number;
  approvalRate: number;
  correctionRate: number;
  rejectionRate: number;
}

class SupervisorAI {
  private static instance: SupervisorAI;
  private metrics: SupervisorMetrics = {
    totalDecisions: 0,
    approved: 0,
    rejected: 0,
    corrected: 0,
    approvalRate: 0,
    correctionRate: 0,
    rejectionRate: 0,
  };

  private readonly CONFIDENCE_THRESHOLD = 0.70;
  private readonly MIN_CONFIDENCE = 0.50;
  private readonly BOOST_AMOUNT = 0.10;

  private constructor() {}

  static getInstance(): SupervisorAI {
    if (!SupervisorAI.instance) {
      SupervisorAI.instance = new SupervisorAI();
    }
    return SupervisorAI.instance;
  }

  /**
   * Core validation method for AI decisions
   */
  async validateDecision(decision: AIDecision): Promise<ValidationResult> {
    this.metrics.totalDecisions++;

    const validationRules = {
      confidenceCheck: this.checkConfidence(decision.confidence),
      parameterCheck: this.checkParameters(decision.parameters),
      safetyCheck: this.checkSafety(decision.action, decision.parameters),
      logicCheck: this.checkLogic(decision),
    };

    // Determine if decision should be approved, corrected, or blocked
    const allPassed = Object.values(validationRules).every((check) => check);

    if (allPassed) {
      this.metrics.approved++;
      this.updateMetrics();
      return {
        approved: true,
        corrected: false,
        blocked: false,
        confidence: decision.confidence,
        explanation: "Decision approved. All validation rules passed.",
        originalDecision: decision,
        validationRules,
      };
    }

    // Try to correct the decision
    if (!validationRules.confidenceCheck && decision.confidence >= this.MIN_CONFIDENCE) {
      const correctedDecision = this.correctConfidence(decision);
      this.metrics.corrected++;
      this.updateMetrics();
      return {
        approved: true,
        corrected: true,
        blocked: false,
        confidence: correctedDecision.confidence,
        explanation: `Low confidence boosted from ${decision.confidence.toFixed(2)} to ${correctedDecision.confidence.toFixed(2)}`,
        originalDecision: decision,
        correctedDecision,
        validationRules,
      };
    }

    // Block unsafe or inconsistent decisions
    this.metrics.rejected++;
    this.updateMetrics();
    return {
      approved: false,
      corrected: false,
      blocked: true,
      confidence: decision.confidence,
      explanation: this.getBlockReason(validationRules),
      originalDecision: decision,
      validationRules,
    };
  }

  /**
   * Check if confidence meets threshold
   */
  private checkConfidence(confidence: number): boolean {
    return confidence >= this.CONFIDENCE_THRESHOLD;
  }

  /**
   * Validate decision parameters
   */
  private checkParameters(parameters: Record<string, any>): boolean {
    if (!parameters || typeof parameters !== "object") {
      return false;
    }

    // Ensure parameters are valid and within reasonable bounds
    for (const [key, value] of Object.entries(parameters)) {
      if (value === null || value === undefined) {
        return false;
      }
      
      // Check for reasonable numeric values
      if (typeof value === "number") {
        if (!isFinite(value) || value < 0 || value > 1000000) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Safety check for critical actions
   */
  private checkSafety(action: string, parameters: Record<string, any>): boolean {
    const criticalActions = ["delete", "shutdown", "terminate", "emergency_stop"];
    
    if (criticalActions.some(critical => action.toLowerCase().includes(critical))) {
      // Critical actions require explicit confirmation parameter
      return parameters.confirmed === true;
    }

    return true;
  }

  /**
   * Logic consistency check
   */
  private checkLogic(decision: AIDecision): boolean {
    // Check for logical inconsistencies in the decision
    const { action, parameters } = decision;

    // Example: scaling down when already at minimum
    if (action === "scale_resources" && parameters.to <= parameters.from) {
      if (parameters.to === 0) return false; // Don't scale to zero
    }

    return true;
  }

  /**
   * Correct low confidence decisions
   */
  private correctConfidence(decision: AIDecision): AIDecision {
    return {
      ...decision,
      confidence: Math.min(decision.confidence + this.BOOST_AMOUNT, 1.0),
      timestamp: new Date(),
    };
  }

  /**
   * Get explanation for blocked decisions
   */
  private getBlockReason(validationRules: ValidationResult["validationRules"]): string {
    const failures = [];
    
    if (!validationRules.confidenceCheck) {
      failures.push("confidence too low");
    }
    if (!validationRules.parameterCheck) {
      failures.push("invalid parameters");
    }
    if (!validationRules.safetyCheck) {
      failures.push("safety check failed");
    }
    if (!validationRules.logicCheck) {
      failures.push("logic inconsistency detected");
    }

    return `Decision blocked: ${failures.join(", ")}`;
  }

  /**
   * Update metrics with calculated rates
   */
  private updateMetrics(): void {
    const { totalDecisions, approved, rejected, corrected } = this.metrics;
    
    if (totalDecisions > 0) {
      this.metrics.approvalRate = approved / totalDecisions;
      this.metrics.rejectionRate = rejected / totalDecisions;
      this.metrics.correctionRate = corrected / totalDecisions;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): SupervisorMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalDecisions: 0,
      approved: 0,
      rejected: 0,
      corrected: 0,
      approvalRate: 0,
      correctionRate: 0,
      rejectionRate: 0,
    };
  }

  /**
   * Batch validate multiple decisions
   */
  async validateBatch(decisions: AIDecision[]): Promise<ValidationResult[]> {
    return Promise.all(decisions.map(decision => this.validateDecision(decision)));
  }
}

// Export singleton instance
export const supervisorAI = SupervisorAI.getInstance();
