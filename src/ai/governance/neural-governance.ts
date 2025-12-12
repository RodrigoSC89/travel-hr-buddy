
/**
 * PATCH 583 - Neural Governance Module
 * Governance layer for autonomous AI decisions
 * 
 * Features:
 * - Ethical and legal validation of AI decisions
 * - Policy compliance verification
 * - High-risk decision interception
 * - Veto logging and audit trail
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Strategy } from "@/ai/strategy/predictive-engine";
import type { SimulationResult } from "@/ai/decision-simulator";

export type GovernanceDecision = "approved" | "vetoed" | "escalated" | "conditional";
export type RiskCategory = "low" | "medium" | "high" | "critical";
export type ViolationType = "ethical" | "legal" | "policy" | "safety" | "compliance";

export interface GovernancePolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: GovernanceRule[];
  priority: number; // 1-10
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernanceRule {
  id: string;
  policyId: string;
  condition: string;
  action: "block" | "warn" | "escalate" | "require_approval";
  severity: RiskCategory;
  message: string;
}

export interface GovernanceEvaluation {
  id: string;
  strategyId: string;
  decision: GovernanceDecision;
  riskCategory: RiskCategory;
  violations: GovernanceViolation[];
  recommendations: string[];
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  evaluatedAt: Date;
  metadata?: Record<string, any>;
}

export interface GovernanceViolation {
  id: string;
  type: ViolationType;
  policyId: string;
  policyName: string;
  ruleId: string;
  severity: RiskCategory;
  description: string;
  detectedCondition: string;
  remediation?: string;
}

export interface VetoRecord {
  id: string;
  strategyId: string;
  evaluationId: string;
  reason: string;
  violations: GovernanceViolation[];
  vetoedBy: string;
  vetoedAt: Date;
  canOverride: boolean;
  overrideRequirements?: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  entityType: "strategy" | "decision" | "simulation" | "policy";
  entityId: string;
  userId?: string;
  decision: GovernanceDecision;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

class NeuralGovernance {
  private isInitialized = false;
  private policies: Map<string, GovernancePolicy> = new Map();
  private evaluationCache: Map<string, GovernanceEvaluation> = new Map();
  private vetoRecords: Map<string, VetoRecord> = new Map();
  private auditLog: AuditEntry[] = [];

  /**
   * Initialize the neural governance module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[NeuralGovernance] Already initialized");
      return;
    }

    logger.info("[NeuralGovernance] Initializing neural governance module...");

    // Load policies from database or initialize defaults
    await this.loadPolicies();

    // Initialize audit trail
    await this.initializeAuditTrail();

    this.isInitialized = true;
    logger.info("[NeuralGovernance] Initialization complete");
  }

  /**
   * Evaluate a strategy for ethical and legal compliance
   */
  async evaluateStrategy(
    strategy: Strategy,
    simulation?: SimulationResult
  ): Promise<GovernanceEvaluation> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    logger.info("[NeuralGovernance] Evaluating strategy", {
      strategyId: strategy.id,
      type: strategy.type
    });

    const evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check for violations
    const violations = await this.checkViolations(strategy, simulation);

    // Determine risk category
    const riskCategory = this.determineRiskCategory(strategy, simulation, violations);

    // Determine decision
    const decision = this.determineDecision(violations, riskCategory);

    // Generate recommendations
    const recommendations = this.generateRecommendations(strategy, violations, simulation);

    const evaluation: GovernanceEvaluation = {
      id: evaluationId,
      strategyId: strategy.id,
      decision,
      riskCategory,
      violations,
      recommendations,
      approvalRequired: decision === "escalated" || riskCategory === "critical",
      evaluatedAt: new Date(),
      metadata: {
        simulationId: simulation?.id,
        policyCount: this.policies.size,
        violationCount: violations.length
      }
    };

    // Cache evaluation
    this.evaluationCache.set(evaluationId, evaluation);

    // Log to audit trail
    await this.logAuditEntry({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: "strategy_evaluation",
      entityType: "strategy",
      entityId: strategy.id,
      decision,
      details: {
        evaluationId,
        riskCategory,
        violationCount: violations.length
      }
    });

    // If vetoed, create veto record
    if (decision === "vetoed") {
      await this.createVetoRecord(strategy.id, evaluation);
    }

    // Save evaluation to database
    await this.saveEvaluation(evaluation);

    logger.info("[NeuralGovernance] Evaluation complete", {
      evaluationId,
      decision,
      riskCategory,
      violations: violations.length
    });

    return evaluation;
  }

  /**
   * Approve a strategy that requires manual approval
   */
  async approveStrategy(
    evaluationId: string,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    const evaluation = this.evaluationCache.get(evaluationId);
    if (!evaluation) {
      throw new Error(`Evaluation ${evaluationId} not found`);
    }

    if (!evaluation.approvalRequired) {
      throw new Error(`Evaluation ${evaluationId} does not require approval`);
    }

    evaluation.decision = "approved";
    evaluation.approvedBy = approvedBy;
    evaluation.approvedAt = new Date();

    logger.info("[NeuralGovernance] Strategy approved", {
      evaluationId,
      strategyId: evaluation.strategyId,
      approvedBy
    });

    // Log to audit trail
    await this.logAuditEntry({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: "strategy_approval",
      entityType: "strategy",
      entityId: evaluation.strategyId,
      userId: approvedBy,
      decision: "approved",
      details: {
        evaluationId,
        notes
      }
    });

    // Update in database
    await this.saveEvaluation(evaluation);
  }

  /**
   * Override a veto (requires proper authorization)
   */
  async overrideVeto(
    vetoId: string,
    overriddenBy: string,
    justification: string
  ): Promise<void> {
    const veto = this.vetoRecords.get(vetoId);
    if (!veto) {
      throw new Error(`Veto ${vetoId} not found`);
    }

    if (!veto.canOverride) {
      throw new Error(`Veto ${vetoId} cannot be overridden`);
    }

    logger.info("[NeuralGovernance] Veto overridden", {
      vetoId,
      strategyId: veto.strategyId,
      overriddenBy
    });

    // Update evaluation
    const evaluation = this.evaluationCache.get(veto.evaluationId);
    if (evaluation) {
      evaluation.decision = "approved";
      evaluation.approvedBy = overriddenBy;
      evaluation.approvedAt = new Date();
      await this.saveEvaluation(evaluation);
    }

    // Log to audit trail
    await this.logAuditEntry({
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: "veto_override",
      entityType: "strategy",
      entityId: veto.strategyId,
      userId: overriddenBy,
      decision: "approved",
      details: {
        vetoId,
        evaluationId: veto.evaluationId,
        justification
      }
    });

    // Remove veto
    this.vetoRecords.delete(vetoId);
  }

  /**
   * Get evaluation by ID
   */
  getEvaluation(evaluationId: string): GovernanceEvaluation | undefined {
    return this.evaluationCache.get(evaluationId);
  }

  /**
   * Get veto record by ID
   */
  getVeto(vetoId: string): VetoRecord | undefined {
    return this.vetoRecords.get(vetoId);
  }

  /**
   * Get all vetoed strategies
   */
  getVetoedStrategies(): VetoRecord[] {
    return Array.from(this.vetoRecords.values());
  }

  /**
   * Get audit trail
   */
  getAuditTrail(limit?: number): AuditEntry[] {
    if (limit) {
      return this.auditLog.slice(-limit);
    }
    return [...this.auditLog];
  }

  /**
   * Get all active policies
   */
  getActivePolicies(): GovernancePolicy[] {
    return Array.from(this.policies.values()).filter(p => p.active);
  }

  // Private methods

  private async loadPolicies(): Promise<void> {
    // Initialize default policies
    const defaultPolicies: GovernancePolicy[] = [
      {
        id: "policy_safety",
        name: "Safety First Policy",
        category: "safety",
        description: "Ensures all decisions prioritize crew and vessel safety",
        rules: [
          {
            id: "rule_safety_1",
            policyId: "policy_safety",
            condition: "crewImpact > 80",
            action: "block",
            severity: "critical",
            message: "Strategy poses unacceptable risk to crew safety"
          },
          {
            id: "rule_safety_2",
            policyId: "policy_safety",
            condition: "risk > 90",
            action: "escalate",
            severity: "high",
            message: "High risk level requires senior management approval"
          }
        ],
        priority: 10,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "policy_financial",
        name: "Financial Governance Policy",
        category: "financial",
        description: "Controls and validates financial decisions",
        rules: [
          {
            id: "rule_financial_1",
            policyId: "policy_financial",
            condition: "cost > 50000",
            action: "require_approval",
            severity: "high",
            message: "Cost exceeds approval threshold"
          }
        ],
        priority: 8,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "policy_ethical",
        name: "Ethical AI Policy",
        category: "ethical",
        description: "Ensures AI decisions align with ethical standards",
        rules: [
          {
            id: "rule_ethical_1",
            policyId: "policy_ethical",
            condition: "transparency_score < 50",
            action: "warn",
            severity: "medium",
            message: "Decision lacks sufficient transparency"
          }
        ],
        priority: 9,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "policy_operational",
        name: "Operational Compliance Policy",
        category: "compliance",
        description: "Ensures compliance with operational procedures",
        rules: [
          {
            id: "rule_operational_1",
            policyId: "policy_operational",
            condition: "time > 240",
            action: "escalate",
            severity: "medium",
            message: "Extended timeline requires operational review"
          }
        ],
        priority: 7,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const policy of defaultPolicies) {
      this.policies.set(policy.id, policy);
    }

    logger.info(`[NeuralGovernance] Loaded ${this.policies.size} policies`);
  }

  private async initializeAuditTrail(): Promise<void> {
    try {
      const { data, error } = await (supabase as any)
        .from("ai_governance_audit")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        logger.info(`[NeuralGovernance] Loaded ${data.length} audit entries`);
      }
    } catch (error) {
      logger.error("[NeuralGovernance] Failed to load audit trail", error);
    }
  }

  private async checkViolations(
    strategy: Strategy,
    simulation?: SimulationResult
  ): Promise<GovernanceViolation[]> {
    const violations: GovernanceViolation[] = [];

    for (const policy of this.policies.values()) {
      if (!policy.active) continue;

      for (const rule of policy.rules) {
        const violated = await this.evaluateRule(rule, strategy, simulation);
        if (violated) {
          violations.push({
            id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: this.categorizeViolation(policy.category),
            policyId: policy.id,
            policyName: policy.name,
            ruleId: rule.id,
            severity: rule.severity,
            description: rule.message,
            detectedCondition: rule.condition,
            remediation: this.suggestRemediation(rule, strategy)
          });
        }
      }
    }

    return violations;
  }

  private async evaluateRule(
    rule: GovernanceRule,
    strategy: Strategy,
    simulation?: SimulationResult
  ): Promise<boolean> {
    // Simple rule evaluation logic
    // In a real system, this would use a more sophisticated rule engine

    const condition = rule.condition.toLowerCase();

    // Check crew impact
    if (condition.includes("crewimpact")) {
      const threshold = parseInt(condition.match(/\d+/)?.[0] || "0");
      const value = simulation 
        ? simulation.metrics.crewImpact.average 
        : strategy.estimatedImpact.crewImpact;
      
      if (condition.includes(">")) return value > threshold;
      if (condition.includes("<")) return value < threshold;
    }

    // Check risk
    if (condition.includes("risk")) {
      const threshold = parseInt(condition.match(/\d+/)?.[0] || "0");
      const value = simulation 
        ? simulation.metrics.risk.average 
        : strategy.estimatedImpact.risk;
      
      if (condition.includes(">")) return value > threshold;
      if (condition.includes("<")) return value < threshold;
    }

    // Check cost
    if (condition.includes("cost")) {
      const threshold = parseInt(condition.match(/\d+/)?.[0] || "0");
      const value = simulation 
        ? simulation.metrics.cost.average 
        : (strategy.estimatedImpact.cost || 0);
      
      if (condition.includes(">")) return value > threshold;
      if (condition.includes("<")) return value < threshold;
    }

    // Check time
    if (condition.includes("time")) {
      const threshold = parseInt(condition.match(/\d+/)?.[0] || "0");
      const value = simulation 
        ? simulation.metrics.time.average 
        : strategy.estimatedImpact.time;
      
      if (condition.includes(">")) return value > threshold;
      if (condition.includes("<")) return value < threshold;
    }

    return false;
  }

  private categorizeViolation(policyCategory: string): ViolationType {
    switch (policyCategory) {
    case "safety":
      return "safety";
    case "ethical":
      return "ethical";
    case "financial":
    case "compliance":
      return "compliance";
    default:
      return "policy";
    }
  }

  private suggestRemediation(rule: GovernanceRule, strategy: Strategy): string {
    switch (rule.action) {
    case "block":
      return "This strategy cannot proceed. Consider alternative approaches that reduce risk.";
    case "escalate":
      return "Escalate to senior management for review and approval.";
    case "require_approval":
      return "Obtain necessary approvals before proceeding with execution.";
    case "warn":
      return "Proceed with caution and implement additional monitoring.";
    default:
      return "Review and address the identified concerns.";
    }
  }

  private determineRiskCategory(
    strategy: Strategy,
    simulation: SimulationResult | undefined,
    violations: GovernanceViolation[]
  ): RiskCategory {
    // Critical if any critical violations
    if (violations.some(v => v.severity === "critical")) {
      return "critical";
    }

    // High if simulation shows high risk or multiple violations
    if (simulation && simulation.metrics.risk.average > 70) {
      return "high";
    }

    if (violations.filter(v => v.severity === "high").length > 2) {
      return "high";
    }

    // Medium if some violations or moderate risk
    if (violations.length > 0 || (simulation && simulation.metrics.risk.average > 40)) {
      return "medium";
    }

    return "low";
  }

  private determineDecision(
    violations: GovernanceViolation[],
    riskCategory: RiskCategory
  ): GovernanceDecision {
    // Veto if critical violations
    if (violations.some(v => v.severity === "critical")) {
      return "vetoed";
    }

    // Block violations
    if (violations.some(v => {
      const policy = this.policies.get(v.policyId);
      const rule = policy?.rules.find(r => r.id === v.ruleId);
      return rule?.action === "block";
    })) {
      return "vetoed";
    }

    // Escalate if needed
    if (riskCategory === "critical" || riskCategory === "high") {
      return "escalated";
    }

    if (violations.some(v => {
      const policy = this.policies.get(v.policyId);
      const rule = policy?.rules.find(r => r.id === v.ruleId);
      return rule?.action === "escalate" || rule?.action === "require_approval";
    })) {
      return "escalated";
    }

    // Conditional if medium risk with warnings
    if (riskCategory === "medium" && violations.length > 0) {
      return "conditional";
    }

    return "approved";
  }

  private generateRecommendations(
    strategy: Strategy,
    violations: GovernanceViolation[],
    simulation?: SimulationResult
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length > 0) {
      recommendations.push(`Address ${violations.length} policy violation(s) before proceeding`);
    }

    for (const violation of violations) {
      if (violation.remediation) {
        recommendations.push(violation.remediation);
      }
    }

    if (simulation && simulation.warnings.length > 0) {
      recommendations.push("Review simulation warnings carefully");
    }

    if (strategy.estimatedImpact.crewImpact > 50) {
      recommendations.push("Implement crew welfare support measures");
    }

    return recommendations;
  }

  private async createVetoRecord(
    strategyId: string,
    evaluation: GovernanceEvaluation
  ): Promise<void> {
    const vetoId = `veto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const veto: VetoRecord = {
      id: vetoId,
      strategyId,
      evaluationId: evaluation.id,
      reason: evaluation.violations.map(v => v.description).join("; "),
      violations: evaluation.violations,
      vetoedBy: "neural_governance_system",
      vetoedAt: new Date(),
      canOverride: evaluation.riskCategory !== "critical",
      overrideRequirements: evaluation.riskCategory === "high" 
        ? ["senior_management_approval", "safety_review"] 
        : ["management_approval"]
    });

    this.vetoRecords.set(vetoId, veto);

    logger.info("[NeuralGovernance] Veto created", {
      vetoId,
      strategyId,
      violationCount: veto.violations.length
    });

    // Save to database
    try {
      await (supabase as any).from("ai_governance_vetoes").insert({
        veto_id: veto.id,
        strategy_id: veto.strategyId,
        evaluation_id: veto.evaluationId,
        reason: veto.reason,
        violations: veto.violations,
        vetoed_by: veto.vetoedBy,
        can_override: veto.canOverride,
        override_requirements: veto.overrideRequirements,
        created_at: veto.vetoedAt.toISOString()
      });
    } catch (error) {
      logger.error("[NeuralGovernance] Failed to save veto record", error);
    }
  }

  private async saveEvaluation(evaluation: GovernanceEvaluation): Promise<void> {
    try {
      await (supabase as any).from("ai_governance_evaluations").insert({
        evaluation_id: evaluation.id,
        strategy_id: evaluation.strategyId,
        decision: evaluation.decision,
        risk_category: evaluation.riskCategory,
        violations: evaluation.violations,
        recommendations: evaluation.recommendations,
        approval_required: evaluation.approvalRequired,
        approved_by: evaluation.approvedBy,
        approved_at: evaluation.approvedAt?.toISOString(),
        metadata: evaluation.metadata,
        created_at: evaluation.evaluatedAt.toISOString()
      });
    } catch (error) {
      logger.error("[NeuralGovernance] Failed to save evaluation", error);
    }
  }

  private async logAuditEntry(entry: AuditEntry): Promise<void> {
    this.auditLog.push(entry);

    // Keep only last 1000 entries in memory
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    try {
      await (supabase as any).from("ai_governance_audit").insert({
        audit_id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        user_id: entry.userId,
        decision: entry.decision,
        details: entry.details,
        metadata: entry.metadata
      });
    } catch (error) {
      logger.error("[NeuralGovernance] Failed to log audit entry", error);
    }
  }
}

// Export singleton instance
export const neuralGovernance = new NeuralGovernance();

// Export class for testing
export { NeuralGovernance };
