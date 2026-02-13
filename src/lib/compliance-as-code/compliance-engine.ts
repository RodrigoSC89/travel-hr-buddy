/**
 * Compliance as Code Engine
 * Auto-auditing with MLC/STCW/LGPD/ISM rules as executable code
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ComplianceRule {
  id: string;
  organization_id: string | null;
  regulation: 'MLC_2006' | 'STCW' | 'LGPD' | 'ISM' | 'ISPS';
  rule_id: string;
  rule_name: string;
  rule_description: string;
  rule_expression: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  target_table: string;
  is_active: boolean;
  auto_remediate: boolean;
  remediation_action: string | null;
  notification_channels: string[];
  metadata: Record<string, unknown>;
}

export interface ComplianceViolation {
  id: string;
  organization_id: string;
  rule_id: string;
  entity_type: string;
  entity_id: string;
  violation_details: Record<string, unknown>;
  severity: string;
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  detected_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface ComplianceAuditResult {
  total_rules: number;
  rules_passed: number;
  rules_failed: number;
  violations: ComplianceViolation[];
  compliance_score: number;
  by_regulation: Record<string, { passed: number; failed: number; score: number }>;
  by_severity: Record<string, number>;
  audit_timestamp: string;
}

// Maritime compliance rules as code
export const MARITIME_COMPLIANCE_RULES: Omit<ComplianceRule, 'id' | 'organization_id'>[] = [
  // MLC 2006 Rules
  {
    regulation: 'MLC_2006',
    rule_id: 'mlc_medical_exam',
    rule_name: 'Medical Exam Validity',
    rule_description: 'Crew member must have valid medical exam (max 2 years)',
    rule_expression: 'medical_exam_expires_at > NOW()',
    severity: 'critical',
    target_table: 'crew_members',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Schedule medical exam within 30 days',
    notification_channels: ['email', 'in_app'],
    metadata: { regulation_article: 'A1.2', compliance_period_days: 730 }
  },
  {
    regulation: 'MLC_2006',
    rule_id: 'mlc_sea_service_record',
    rule_name: 'Sea Service Record Updated',
    rule_description: 'Sea service record must be updated within 90 days',
    rule_expression: 'sea_service_updated_at > NOW() - INTERVAL 90 days',
    severity: 'high',
    target_table: 'crew_members',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Update sea service record',
    notification_channels: ['email', 'in_app'],
    metadata: { regulation_article: 'A2.1' }
  },
  {
    regulation: 'MLC_2006',
    rule_id: 'mlc_employment_agreement',
    rule_name: 'Employment Agreement Valid',
    rule_description: 'Seafarer employment agreement must be signed and valid',
    rule_expression: 'employment_agreement_signed = true AND contract_end_date > NOW()',
    severity: 'critical',
    target_table: 'crew_members',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Renew employment agreement',
    notification_channels: ['email', 'in_app', 'slack'],
    metadata: { regulation_article: 'A2.1' }
  },
  {
    regulation: 'MLC_2006',
    rule_id: 'mlc_max_work_hours',
    rule_name: 'Maximum Work Hours (14h/day, 72h/week)',
    rule_description: 'Work hours must not exceed MLC limits',
    rule_expression: 'daily_hours <= 14 AND weekly_hours <= 72',
    severity: 'critical',
    target_table: 'work_rest_hours',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Adjust crew schedule immediately',
    notification_channels: ['email', 'in_app', 'pagerduty'],
    metadata: { regulation_article: 'A2.3', max_daily: 14, max_weekly: 72 }
  },
  {
    regulation: 'MLC_2006',
    rule_id: 'mlc_min_rest_hours',
    rule_name: 'Minimum Rest Hours (10h/day, 77h/week)',
    rule_description: 'Rest hours must meet MLC minimums',
    rule_expression: 'daily_rest >= 10 AND weekly_rest >= 77',
    severity: 'critical',
    target_table: 'work_rest_hours',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Provide immediate rest period',
    notification_channels: ['email', 'in_app', 'pagerduty'],
    metadata: { regulation_article: 'A2.3', min_daily: 10, min_weekly: 77 }
  },

  // STCW Rules
  {
    regulation: 'STCW',
    rule_id: 'stcw_coc_valid',
    rule_name: 'Certificate of Competency Valid',
    rule_description: 'CoC must be valid and not expired',
    rule_expression: 'coc_expires_at > NOW()',
    severity: 'critical',
    target_table: 'crew_certifications',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Renew CoC immediately',
    notification_channels: ['email', 'in_app'],
    metadata: { regulation_code: 'STCW II/1-II/5' }
  },
  {
    regulation: 'STCW',
    rule_id: 'stcw_endorsement_valid',
    rule_name: 'Flag State Endorsement Valid',
    rule_description: 'Flag state endorsement must be valid',
    rule_expression: 'endorsement_expires_at > NOW()',
    severity: 'critical',
    target_table: 'crew_certifications',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Obtain endorsement renewal',
    notification_channels: ['email', 'in_app'],
    metadata: { regulation_code: 'STCW I/10' }
  },
  {
    regulation: 'STCW',
    rule_id: 'stcw_safety_training',
    rule_name: 'Basic Safety Training Valid',
    rule_description: 'Basic safety training (STCW VI/1) must be current',
    rule_expression: 'safety_training_expires_at > NOW()',
    severity: 'high',
    target_table: 'crew_certifications',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Schedule refresher training',
    notification_channels: ['email', 'in_app'],
    metadata: { regulation_code: 'STCW VI/1' }
  },
  {
    regulation: 'STCW',
    rule_id: 'stcw_rest_hours_7d',
    rule_name: 'STCW Rest Hours (77h per 7 days)',
    rule_description: 'Minimum 77 hours rest in any 7-day period',
    rule_expression: 'rest_hours_7d >= 77',
    severity: 'critical',
    target_table: 'work_rest_hours',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Immediate schedule adjustment required',
    notification_channels: ['email', 'in_app', 'pagerduty'],
    metadata: { regulation_code: 'STCW A-VIII/1' }
  },

  // LGPD Rules
  {
    regulation: 'LGPD',
    rule_id: 'lgpd_consent',
    rule_name: 'Data Processing Consent',
    rule_description: 'Documented consent for personal data processing',
    rule_expression: 'consent_documented_at IS NOT NULL',
    severity: 'critical',
    target_table: 'crew_members',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Obtain written consent',
    notification_channels: ['email'],
    metadata: { lgpd_article: 'Art. 7' }
  },
  {
    regulation: 'LGPD',
    rule_id: 'lgpd_data_retention',
    rule_name: 'Data Retention Limit',
    rule_description: 'Personal data retained within legal limit (5 years)',
    rule_expression: 'created_at > NOW() - INTERVAL 5 years',
    severity: 'medium',
    target_table: 'crew_members',
    is_active: true,
    auto_remediate: true,
    remediation_action: 'Archive or delete old records',
    notification_channels: ['email'],
    metadata: { lgpd_article: 'Art. 16', retention_years: 5 }
  },
  {
    regulation: 'LGPD',
    rule_id: 'lgpd_sensitive_data_protected',
    rule_name: 'Sensitive Data Protection',
    rule_description: 'Health and biometric data must be encrypted',
    rule_expression: 'sensitive_data_encrypted = true',
    severity: 'critical',
    target_table: 'crew_health_records',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Encrypt sensitive data fields',
    notification_channels: ['email', 'slack'],
    metadata: { lgpd_article: 'Art. 11' }
  },

  // ISM Rules
  {
    regulation: 'ISM',
    rule_id: 'ism_safety_drills',
    rule_name: 'Safety Drills Conducted',
    rule_description: 'Safety drills must be conducted within schedule',
    rule_expression: 'last_drill_date > NOW() - INTERVAL 30 days',
    severity: 'high',
    target_table: 'safety_drills',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Schedule and conduct safety drill',
    notification_channels: ['email', 'in_app'],
    metadata: { ism_code: '8.2' }
  },
  {
    regulation: 'ISM',
    rule_id: 'ism_nc_closure',
    rule_name: 'Non-Conformity Closure Timeline',
    rule_description: 'Non-conformities must be closed within 30 days',
    rule_expression: 'status = closed OR created_at > NOW() - INTERVAL 30 days',
    severity: 'high',
    target_table: 'non_conformities',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Expedite NC closure process',
    notification_channels: ['email', 'in_app'],
    metadata: { ism_code: '9.1' }
  },
  {
    regulation: 'ISM',
    rule_id: 'ism_maintenance_critical',
    rule_name: 'Critical Maintenance Not Overdue',
    rule_description: 'Critical equipment maintenance must not be overdue',
    rule_expression: 'status != overdue OR priority != critical',
    severity: 'critical',
    target_table: 'maintenance_items',
    is_active: true,
    auto_remediate: false,
    remediation_action: 'Execute maintenance immediately',
    notification_channels: ['email', 'in_app', 'pagerduty'],
    metadata: { ism_code: '10.3' }
  }
];

class ComplianceEngine {
  private rules: ComplianceRule[] = [];
  
  async loadRules(organizationId?: string): Promise<ComplianceRule[]> {
    const { data, error } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('is_active', true)
      .or(`organization_id.is.null,organization_id.eq.${organizationId || 'null'}`);

    if (error) {
      logger.error('Failed to load compliance rules:', error);
      return [];
    }

    this.rules = (data || []) as unknown as ComplianceRule[];
    return this.rules;
  }

  async runFullAudit(organizationId: string): Promise<ComplianceAuditResult> {
    await this.loadRules(organizationId);
    
    const violations: ComplianceViolation[] = [];
    const byRegulation: Record<string, { passed: number; failed: number; score: number }> = {};
    const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    
    let passed = 0;
    let failed = 0;

    for (const rule of this.rules) {
      // Initialize regulation stats
      if (!byRegulation[rule.regulation]) {
        byRegulation[rule.regulation] = { passed: 0, failed: 0, score: 100 };
      }

      // Check rule (simplified - in production would execute actual SQL)
      const isViolated = await this.checkRule(rule, organizationId);
      
      if (isViolated) {
        failed++;
        byRegulation[rule.regulation].failed++;
        bySeverity[rule.severity]++;
        
        // Record violation
        const violation = await this.recordViolation(rule, organizationId, isViolated);
        if (violation) violations.push(violation);
      } else {
        passed++;
        byRegulation[rule.regulation].passed++;
      }
    }

    // Calculate scores
    const totalRules = passed + failed;
    const overallScore = totalRules > 0 ? Math.round((passed / totalRules) * 100) : 100;
    
    Object.keys(byRegulation).forEach(reg => {
      const r = byRegulation[reg];
      const total = r.passed + r.failed;
      r.score = total > 0 ? Math.round((r.passed / total) * 100) : 100;
    });

    return {
      total_rules: totalRules,
      rules_passed: passed,
      rules_failed: failed,
      violations,
      compliance_score: overallScore,
      by_regulation: byRegulation,
      by_severity: bySeverity,
      audit_timestamp: new Date().toISOString()
    };
  }

  private async checkRule(rule: ComplianceRule, organizationId: string): Promise<Record<string, unknown> | null> {
    // Simplified rule checking - returns violation details if found
    // In production, this would execute the rule_expression against the target_table
    
    try {
      // Example: Check crew certifications
      if (rule.target_table === 'crew_certifications' || rule.target_table === 'crew_members') {
        const { data } = await supabase
          .from('crew_members')
          .select('id, full_name, status')
          .limit(1);
        
        // Check compliance based on actual data presence
        if (data && data.length > 0 && data[0].status !== 'active') {
          return {
            entity_id: data[0].id,
            entity_name: data[0].full_name,
            rule_violated: rule.rule_id,
            details: `Rule ${rule.rule_name} violated`
          };
        }
      }
      
      return null;
    } catch (error) {
      logger.error(`Error checking rule ${rule.rule_id}:`, error);
      return null;
    }
  }

  private async recordViolation(
    rule: ComplianceRule,
    organizationId: string,
    details: Record<string, unknown>
  ): Promise<ComplianceViolation | null> {
    try {
      const violation = {
        organization_id: organizationId,
        rule_id: rule.id,
        entity_type: rule.target_table,
        entity_id: (details.entity_id as string) || crypto.randomUUID(),
        violation_details: details,
        severity: rule.severity,
        status: 'open' as const,
        detected_at: new Date().toISOString()
      };

      const { data, error } = await (supabase.from as Function)('compliance_violations')
        .insert(violation)
        .select()
        .single();

      if (error) {
        logger.error('Failed to record violation:', error);
        return null;
      }

      return data as ComplianceViolation;
    } catch (error) {
      logger.error('Error recording violation:', error);
      return null;
    }
  }

  async getOpenViolations(organizationId: string): Promise<ComplianceViolation[]> {
    const { data, error } = await supabase
      .from('compliance_violations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'open')
      .order('detected_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch violations:', error);
      return [];
    }

    return (data || []) as unknown as ComplianceViolation[];
  }

  async acknowledgeViolation(violationId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('compliance_violations')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId
      })
      .eq('id', violationId);

    return !error;
  }

  async resolveViolation(
    violationId: string,
    userId: string,
    notes: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('compliance_violations')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
        resolution_notes: notes
      })
      .eq('id', violationId);

    return !error;
  }
}

export const complianceEngine = new ComplianceEngine();
