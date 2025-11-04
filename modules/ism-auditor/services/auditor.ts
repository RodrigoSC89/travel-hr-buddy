/**
 * PATCH 627 - ISM Evidence-Based Auditor
 * Core auditor service
 */

import type {
  OperationalLog,
  ComplianceStandard,
  NonConformity,
  AuditResult,
  AuditReport,
  AuditFinding,
  ActionItem,
  AuditCorrelation,
} from '../types';

/**
 * Compliance standards database
 */
export class ComplianceStandardsDB {
  private static standards: Map<string, ComplianceStandard[]> = new Map();

  static initialize(): void {
    // ISM Code Requirements
    this.standards.set('ISM', [
      {
        code: 'ISM',
        section: '1.2.1',
        requirement: 'Safety and Environmental Protection Policy',
        description: 'The Company should establish a safety and environmental-protection policy',
        mandatory: true,
        checkpoints: [
          'Policy document exists and is approved',
          'Policy is communicated to all personnel',
          'Policy includes commitment to compliance with regulations',
          'Policy is reviewed and updated periodically',
        ],
      },
      {
        code: 'ISM',
        section: '3',
        requirement: 'Company Responsibilities and Authority',
        description: 'Define and document responsibility, authority and interrelation of personnel',
        mandatory: true,
        checkpoints: [
          'Designated Person Ashore (DPA) appointed',
          'Master authority and responsibility defined',
          'Resources and shore-based support provided',
          'Emergency contact procedures established',
        ],
      },
      {
        code: 'ISM',
        section: '6',
        requirement: 'Resources and Personnel',
        description: 'Ensure personnel are qualified and trained',
        mandatory: true,
        checkpoints: [
          'Crew qualifications verified',
          'Training records maintained',
          'Familiarization procedures implemented',
          'Competency assessments conducted',
        ],
      },
      {
        code: 'ISM',
        section: '9',
        requirement: 'Reports and Analysis of Non-conformities',
        description: 'Establish procedures for reporting non-conformities and hazardous occurrences',
        mandatory: true,
        checkpoints: [
          'Non-conformity reporting system in place',
          'Root cause analysis performed',
          'Corrective actions implemented',
          'Trends and patterns analyzed',
        ],
      },
      {
        code: 'ISM',
        section: '12',
        requirement: 'Company Verification, Review and Evaluation',
        description: 'Internal audits and management reviews conducted',
        mandatory: true,
        checkpoints: [
          'Internal audit schedule maintained',
          'Audit reports documented',
          'Management review conducted annually',
          'SMS effectiveness evaluated',
        ],
      },
    ]);

    // MLC Requirements
    this.standards.set('MLC', [
      {
        code: 'MLC',
        section: 'Regulation 2.1',
        requirement: 'Seafarers\' Employment Agreements',
        description: 'Proper employment agreements must be in place',
        mandatory: true,
        checkpoints: [
          'Signed employment agreements on file',
          'Agreements include all required clauses',
          'Seafarers given copy before signing',
          'Agreements available for inspection',
        ],
      },
      {
        code: 'MLC',
        section: 'Regulation 2.3',
        requirement: 'Hours of Work and Hours of Rest',
        description: 'Compliance with working hours requirements',
        mandatory: true,
        checkpoints: [
          'Work/rest hours recorded accurately',
          'Minimum rest periods respected',
          'Exceptions properly documented',
          'Master ensures compliance',
        ],
      },
      {
        code: 'MLC',
        section: 'Regulation 3.1',
        requirement: 'Accommodation and Recreational Facilities',
        description: 'Adequate accommodation provided',
        mandatory: true,
        checkpoints: [
          'Cabins meet minimum standards',
          'Recreation facilities available',
          'Sanitary facilities adequate',
          'Mess rooms properly equipped',
        ],
      },
      {
        code: 'MLC',
        section: 'Regulation 4.1',
        requirement: 'Medical Care On Board Ship',
        description: 'Medical care provisions in place',
        mandatory: true,
        checkpoints: [
          'Medical supplies adequate and current',
          'Medical personnel or trained crew available',
          'Medical logbook maintained',
          'Shore-based medical advice accessible',
        ],
      },
    ]);

    // SOLAS Requirements
    this.standards.set('SOLAS', [
      {
        code: 'SOLAS',
        section: 'Chapter III',
        requirement: 'Life-Saving Appliances',
        description: 'Life-saving equipment properly maintained',
        mandatory: true,
        checkpoints: [
          'Lifeboats and life rafts serviceable',
          'Launch systems tested regularly',
          'Life jackets for all persons on board',
          'Emergency equipment inspected',
        ],
      },
      {
        code: 'SOLAS',
        section: 'Chapter V',
        requirement: 'Safety of Navigation',
        description: 'Navigation equipment and procedures',
        mandatory: true,
        checkpoints: [
          'Charts and publications updated',
          'Navigation equipment operational',
          'Voyage planning documented',
          'Bridge procedures established',
        ],
      },
    ]);

    // MARPOL Requirements
    this.standards.set('MARPOL', [
      {
        code: 'MARPOL',
        section: 'Annex I',
        requirement: 'Prevention of Oil Pollution',
        description: 'Oil pollution prevention measures',
        mandatory: true,
        checkpoints: [
          'Oil Record Book maintained',
          'Oily waste properly managed',
          'SOPEP manual on board',
          'Oil discharge monitoring operational',
        ],
      },
      {
        code: 'MARPOL',
        section: 'Annex V',
        requirement: 'Garbage Management',
        description: 'Garbage disposal procedures',
        mandatory: true,
        checkpoints: [
          'Garbage Management Plan implemented',
          'Garbage Record Book maintained',
          'Garbage segregation practiced',
          'Disposal in port arranged',
        ],
      },
    ]);
  }

  static getStandards(code: ComplianceStandard['code']): ComplianceStandard[] {
    if (this.standards.size === 0) {
      this.initialize();
    }
    return this.standards.get(code) || [];
  }

  static getAllStandards(): ComplianceStandard[] {
    if (this.standards.size === 0) {
      this.initialize();
    }
    const all: ComplianceStandard[] = [];
    this.standards.forEach((standards) => all.push(...standards));
    return all;
  }
}

/**
 * Operational Log Analyzer
 */
export class OperationalLogAnalyzer {
  /**
   * Analyze logs against compliance standards
   */
  static async analyzeLogs(
    logs: OperationalLog[],
    standards: ComplianceStandard[]
  ): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];

    for (const standard of standards) {
      for (const checkpoint of standard.checkpoints) {
        const finding = await this.checkCompliance(logs, standard, checkpoint);
        findings.push(finding);
      }
    }

    return findings;
  }

  private static async checkCompliance(
    logs: OperationalLog[],
    standard: ComplianceStandard,
    checkpoint: string
  ): Promise<AuditFinding> {
    // Analyze logs for evidence of compliance
    const relatedLogs = logs.filter((log) =>
      this.isLogRelevant(log, standard, checkpoint)
    );

    const evidence = relatedLogs.map((log) => 
      `${log.timestamp}: ${log.operation} - ${log.description}`
    );

    // Determine compliance status
    let status: AuditFinding['status'] = 'not_applicable';
    let comments = '';

    if (relatedLogs.length === 0) {
      status = 'non_compliant';
      comments = 'No evidence found in operational logs';
    } else if (relatedLogs.length < 3) {
      status = 'partial';
      comments = 'Limited evidence found - requires manual verification';
    } else {
      status = 'compliant';
      comments = 'Sufficient evidence of compliance found';
    }

    return {
      checkpoint,
      standard: standard.code,
      status,
      evidence,
      comments,
    };
  }

  private static isLogRelevant(
    log: OperationalLog,
    standard: ComplianceStandard,
    checkpoint: string
  ): boolean {
    // Simple keyword matching - in production, use more sophisticated NLP
    const keywords = this.extractKeywords(checkpoint);
    const logText = `${log.operation} ${log.description}`.toLowerCase();

    return keywords.some((keyword) => logText.includes(keyword.toLowerCase()));
  }

  private static extractKeywords(text: string): string[] {
    // Extract meaningful keywords from checkpoint description
    const stopWords = ['the', 'and', 'or', 'is', 'are', 'in', 'on', 'at', 'to', 'for'];
    const words = text.toLowerCase().split(/\s+/);
    return words.filter((word) => !stopWords.includes(word) && word.length > 3);
  }
}

/**
 * Non-Conformity Detector
 */
export class NonConformityDetector {
  /**
   * Detect non-conformities from audit findings
   */
  static detectNonConformities(findings: AuditFinding[]): NonConformity[] {
    const nonConformities: NonConformity[] = [];

    findings.forEach((finding) => {
      if (finding.status === 'non_compliant' || finding.status === 'partial') {
        const severity = this.determineSeverity(finding);
        
        nonConformities.push({
          id: `NC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          standard: finding.standard,
          section: finding.checkpoint,
          severity,
          description: `${finding.checkpoint}: ${finding.comments}`,
          evidence: finding.evidence,
          relatedLogs: [],
          status: 'open',
          detected_at: new Date().toISOString(),
        });
      }
    });

    return nonConformities;
  }

  private static determineSeverity(
    finding: AuditFinding
  ): NonConformity['severity'] {
    if (finding.status === 'non_compliant') {
      // Critical standards
      if (finding.standard === 'SOLAS' || finding.checkpoint.includes('emergency')) {
        return 'critical';
      }
      return 'major';
    }
    return 'minor';
  }

  /**
   * Correlate with previous inspections
   */
  static async correlatePreviousInspections(
    nonConformities: NonConformity[],
    previousAudits: AuditResult[]
  ): Promise<AuditCorrelation[]> {
    const correlations: AuditCorrelation[] = [];

    for (const nc of nonConformities) {
      for (const audit of previousAudits) {
        const relatedNCs = audit.non_conformities.filter(
          (prevNC) => prevNC.standard === nc.standard && prevNC.section === nc.section
        );

        if (relatedNCs.length > 0) {
          correlations.push({
            type: 'previous_audit',
            reference_id: audit.id,
            description: `Similar non-conformity found in previous audit (${audit.audit_date})`,
            relevance: 0.9,
          });
        }
      }
    }

    return correlations;
  }
}

/**
 * Main Auditor Service
 */
export class ISMAuditorService {
  /**
   * Perform complete audit
   */
  static async performAudit(
    logs: OperationalLog[],
    standardCodes: ComplianceStandard['code'][],
    auditor: string,
    vessel?: string
  ): Promise<AuditResult> {
    // Get relevant standards
    const standards: ComplianceStandard[] = [];
    standardCodes.forEach((code) => {
      standards.push(...ComplianceStandardsDB.getStandards(code));
    });

    // Analyze logs
    const findings = await OperationalLogAnalyzer.analyzeLogs(logs, standards);

    // Detect non-conformities
    const nonConformities = NonConformityDetector.detectNonConformities(findings);

    // Calculate compliance metrics
    const totalCheckpoints = findings.length;
    const passedCheckpoints = findings.filter(
      (f) => f.status === 'compliant'
    ).length;
    const failedCheckpoints = findings.filter(
      (f) => f.status === 'non_compliant'
    ).length;

    const complianceScore = totalCheckpoints > 0
      ? (passedCheckpoints / totalCheckpoints) * 100
      : 0;

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(complianceScore, nonConformities);

    // Generate recommendations
    const recommendations = this.generateRecommendations(nonConformities, findings);

    return {
      id: `AUDIT-${Date.now()}`,
      vessel,
      audit_date: new Date().toISOString(),
      auditor,
      standards_checked: standardCodes,
      total_checkpoints: totalCheckpoints,
      passed_checkpoints: passedCheckpoints,
      failed_checkpoints: failedCheckpoints,
      non_conformities: nonConformities,
      compliance_score: Math.round(complianceScore * 10) / 10,
      risk_level: riskLevel,
      recommendations,
      correlations: [],
    };
  }

  private static calculateRiskLevel(
    complianceScore: number,
    nonConformities: NonConformity[]
  ): AuditResult['risk_level'] {
    const hasCriticalNC = nonConformities.some((nc) => nc.severity === 'critical');
    const majorNCCount = nonConformities.filter((nc) => nc.severity === 'major').length;

    if (hasCriticalNC || complianceScore < 50) {
      return 'critical';
    } else if (majorNCCount > 3 || complianceScore < 70) {
      return 'high';
    } else if (majorNCCount > 0 || complianceScore < 85) {
      return 'medium';
    }
    return 'low';
  }

  private static generateRecommendations(
    nonConformities: NonConformity[],
    findings: AuditFinding[]
  ): string[] {
    const recommendations: string[] = [];

    // Critical non-conformities
    const criticalNCs = nonConformities.filter((nc) => nc.severity === 'critical');
    if (criticalNCs.length > 0) {
      recommendations.push(
        `Immediate action required: ${criticalNCs.length} critical non-conformit${criticalNCs.length > 1 ? 'ies' : 'y'} identified`
      );
    }

    // Major non-conformities
    const majorNCs = nonConformities.filter((nc) => nc.severity === 'major');
    if (majorNCs.length > 0) {
      recommendations.push(
        `Priority actions needed: ${majorNCs.length} major non-conformit${majorNCs.length > 1 ? 'ies' : 'y'} requiring attention`
      );
    }

    // Partial compliance
    const partialFindings = findings.filter((f) => f.status === 'partial');
    if (partialFindings.length > 5) {
      recommendations.push(
        'Improve documentation: Multiple areas show insufficient evidence of compliance'
      );
    }

    // General recommendations
    recommendations.push('Schedule follow-up audit in 3 months to verify corrective actions');
    recommendations.push('Provide additional training to crew on compliance procedures');

    return recommendations;
  }

  /**
   * Generate action plan
   */
  static generateActionPlan(auditResult: AuditResult): ActionItem[] {
    const actions: ActionItem[] = [];

    auditResult.non_conformities.forEach((nc, index) => {
      const daysToResolve = nc.severity === 'critical' ? 7 : nc.severity === 'major' ? 30 : 90;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToResolve);

      actions.push({
        id: `ACTION-${Date.now()}-${index}`,
        priority: nc.severity === 'critical' || nc.severity === 'major' ? 'critical' : 'medium',
        description: `Address non-conformity: ${nc.description}`,
        responsible: 'Safety Officer',
        due_date: dueDate.toISOString(),
        status: 'pending',
        related_non_conformity: nc.id,
      });
    });

    return actions;
  }
}

export default ISMAuditorService;
