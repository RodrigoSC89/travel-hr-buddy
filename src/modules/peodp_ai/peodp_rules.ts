/**
 * PEO-DP Rules Engine
 * Evaluates compliance against NORMAM-101 and IMCA M117 standards
 */

import { logger } from "@/lib/logger";
import type { ComplianceProfile, ComplianceRule, RuleViolation, ComplianceStatus } from "./types";
import normam101Profile from "./profiles/normam_101.json";
import imcaM117Profile from "./profiles/imca_m117.json";

export class PEODPRules {
  private profiles: Map<string, ComplianceProfile>;

  constructor() {
    this.profiles = new Map();
    this.loadProfiles();
  }

  /**
   * Load compliance profiles from JSON configurations
   */
  private loadProfiles(): void {
    try {
      this.profiles.set("NORMAM-101", normam101Profile as ComplianceProfile);
      this.profiles.set("IMCA M117", imcaM117Profile as ComplianceProfile);
      logger.info("Compliance profiles loaded successfully", {
        profiles: Array.from(this.profiles.keys())
      });
    } catch (error) {
      logger.error("Failed to load compliance profiles", error);
      throw error;
    }
  }

  /**
   * Get a specific compliance profile
   */
  getProfile(profileName: string): ComplianceProfile | undefined {
    return this.profiles.get(profileName);
  }

  /**
   * Get all available profiles
   */
  getAllProfiles(): ComplianceProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Evaluate compliance against a specific rule
   */
  evaluateRule(rule: ComplianceRule, currentState: Record<string, unknown>): boolean {
    // Simplified evaluation logic - in production, this would be more sophisticated
    logger.debug(`Evaluating rule: ${rule.id}`, { rule, currentState });
    
    // This is a placeholder - actual implementation would check currentState
    // against specific rule requirements
    return Math.random() > 0.2; // Simulate 80% compliance rate
  }

  /**
   * Run full audit against a profile
   */
  auditProfile(
    profileName: string, 
    vesselState: Record<string, unknown>
  ): {
    compliant: ComplianceRule[];
    violations: RuleViolation[];
    compliance_percentage: number;
    status: ComplianceStatus;
  } {
    const profile = this.profiles.get(profileName);
    
    if (!profile) {
      logger.error(`Profile not found: ${profileName}`);
      throw new Error(`Profile not found: ${profileName}`);
    }

    logger.info(`Starting audit for profile: ${profileName}`);

    const compliant: ComplianceRule[] = [];
    const violations: RuleViolation[] = [];

    // Evaluate each rule
    profile.rules.forEach(rule => {
      const isCompliant = this.evaluateRule(rule, vesselState);
      
      if (isCompliant) {
        compliant.push(rule);
      } else {
        violations.push({
          rule_id: rule.id,
          category: rule.category,
          severity: rule.severity,
          description: rule.rule,
          action_required: rule.action
        });
      }
    });

    const compliance_percentage = (compliant.length / profile.rules.length) * 100;
    const status = this.determineComplianceStatus(compliance_percentage, profile);

    logger.info(`Audit complete for ${profileName}`, {
      total_rules: profile.rules.length,
      compliant: compliant.length,
      violations: violations.length,
      compliance_percentage,
      status
    });

    return {
      compliant,
      violations,
      compliance_percentage,
      status
    };
  }

  /**
   * Determine overall compliance status based on percentage
   */
  private determineComplianceStatus(
    percentage: number, 
    profile: ComplianceProfile
  ): ComplianceStatus {
    if (percentage >= profile.compliance_levels.green.threshold) {
      return "green";
    } else if (percentage >= profile.compliance_levels.yellow.threshold) {
      return "yellow";
    } else {
      return "red";
    }
  }

  /**
   * Get recommended actions for violations
   */
  getRecommendations(violations: RuleViolation[]): string[] {
    const recommendations: string[] = [];
    
    // Group by severity
    const critical = violations.filter(v => v.severity === "critical");
    const high = violations.filter(v => v.severity === "high");
    const medium = violations.filter(v => v.severity === "medium");

    if (critical.length > 0) {
      recommendations.push(
        `⚠️ URGENTE: ${critical.length} violações críticas detectadas - ação imediata necessária`
      );
      critical.forEach(v => {
        recommendations.push(`  - ${v.category}: ${v.action_required}`);
      });
    }

    if (high.length > 0) {
      recommendations.push(
        `⚡ Alta Prioridade: ${high.length} violações de alta gravidade`
      );
      high.forEach(v => {
        recommendations.push(`  - ${v.category}: ${v.action_required}`);
      });
    }

    if (medium.length > 0) {
      recommendations.push(
        `📋 Média Prioridade: ${medium.length} violações a serem corrigidas`
      );
    }

    return recommendations;
  }

  /**
   * Check if an event violates any rules
   */
  checkEventCompliance(eventType: string, profileName: string): ComplianceRule | null {
    const profile = this.profiles.get(profileName);
    if (!profile) return null;

    // Map event types to rule categories
    const eventRuleMapping: Record<string, string[]> = {
      "Loss of DP Reference": ["Sensores de Posição", "Position Reference Systems"],
      "Thruster Fault": ["Redundância de Sistema", "Thruster Redundancy"],
      "UPS Alarm": ["UPS e Alimentação", "Power Management"],
      "Manual Override": ["Manual Override", "Watch Keeping"],
      "Position Drift": ["Sistema DP", "DP Operations Manual"],
      "Power Failure": ["Power Management", "UPS e Alimentação"]
    };

    const relevantCategories = eventRuleMapping[eventType] || [];
    
    // Find first matching rule
    const violatedRule = profile.rules.find(rule => 
      relevantCategories.some(cat => rule.category.includes(cat))
    );

    return violatedRule || null;
  }
}
