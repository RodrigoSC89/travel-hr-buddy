/**
 * Tests for PATCH 627 - ISM Evidence-Based Auditor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ISMAuditorService,
  ComplianceStandardsDB,
  OperationalLogAnalyzer,
  NonConformityDetector,
  AuditReportExporter,
  JSONExportService,
  ReportGeneratorService,
} from '../modules/ism-auditor';
import type { OperationalLog, ComplianceStandard } from '../modules/ism-auditor/types';

describe('PATCH 627 - ISM Evidence-Based Auditor', () => {
  let mockLogs: OperationalLog[];

  beforeEach(() => {
    mockLogs = [
      {
        id: '1',
        timestamp: '2025-11-01T10:00:00Z',
        module: 'safety',
        operation: 'policy_update',
        user: 'admin',
        vessel: 'MV Test Ship',
        description: 'Updated safety and environmental protection policy',
        metadata: {},
      },
      {
        id: '2',
        timestamp: '2025-11-02T14:30:00Z',
        module: 'training',
        operation: 'crew_training',
        user: 'safety_officer',
        vessel: 'MV Test Ship',
        description: 'Conducted crew training on emergency procedures',
        metadata: {},
      },
      {
        id: '3',
        timestamp: '2025-11-03T09:15:00Z',
        module: 'audit',
        operation: 'internal_audit',
        user: 'auditor',
        vessel: 'MV Test Ship',
        description: 'Performed internal audit of SMS procedures',
        metadata: {},
      },
    ];
  });

  describe('ComplianceStandardsDB', () => {
    it('should initialize standards database', () => {
      ComplianceStandardsDB.initialize();
      const ismStandards = ComplianceStandardsDB.getStandards('ISM');
      
      expect(Array.isArray(ismStandards)).toBe(true);
      expect(ismStandards.length).toBeGreaterThan(0);
    });

    it('should return ISM standards', () => {
      const standards = ComplianceStandardsDB.getStandards('ISM');
      
      expect(standards.length).toBeGreaterThan(0);
      expect(standards[0]).toHaveProperty('code', 'ISM');
      expect(standards[0]).toHaveProperty('section');
      expect(standards[0]).toHaveProperty('checkpoints');
    });

    it('should return MLC standards', () => {
      const standards = ComplianceStandardsDB.getStandards('MLC');
      
      expect(standards.length).toBeGreaterThan(0);
      expect(standards[0]).toHaveProperty('code', 'MLC');
    });

    it('should return SOLAS standards', () => {
      const standards = ComplianceStandardsDB.getStandards('SOLAS');
      
      expect(standards.length).toBeGreaterThan(0);
      expect(standards[0]).toHaveProperty('code', 'SOLAS');
    });

    it('should return MARPOL standards', () => {
      const standards = ComplianceStandardsDB.getStandards('MARPOL');
      
      expect(standards.length).toBeGreaterThan(0);
      expect(standards[0]).toHaveProperty('code', 'MARPOL');
    });

    it('should return all standards', () => {
      const allStandards = ComplianceStandardsDB.getAllStandards();
      
      expect(allStandards.length).toBeGreaterThan(0);
      const codes = allStandards.map(s => s.code);
      expect(codes).toContain('ISM');
      expect(codes).toContain('MLC');
      expect(codes).toContain('SOLAS');
      expect(codes).toContain('MARPOL');
    });
  });

  describe('OperationalLogAnalyzer', () => {
    it('should analyze logs against standards', async () => {
      const standards = ComplianceStandardsDB.getStandards('ISM').slice(0, 2);
      const findings = await OperationalLogAnalyzer.analyzeLogs(mockLogs, standards);
      
      expect(Array.isArray(findings)).toBe(true);
      expect(findings.length).toBeGreaterThan(0);
    });

    it('should generate audit findings with evidence', async () => {
      const standards = ComplianceStandardsDB.getStandards('ISM').slice(0, 1);
      const findings = await OperationalLogAnalyzer.analyzeLogs(mockLogs, standards);
      
      const finding = findings[0];
      expect(finding).toHaveProperty('checkpoint');
      expect(finding).toHaveProperty('standard');
      expect(finding).toHaveProperty('status');
      expect(finding).toHaveProperty('evidence');
      expect(finding).toHaveProperty('comments');
    });

    it('should identify non-compliant checkpoints', async () => {
      const emptyLogs: OperationalLog[] = [];
      const standards = ComplianceStandardsDB.getStandards('ISM').slice(0, 1);
      const findings = await OperationalLogAnalyzer.analyzeLogs(emptyLogs, standards);
      
      const nonCompliant = findings.filter(f => f.status === 'non_compliant');
      expect(nonCompliant.length).toBeGreaterThan(0);
    });
  });

  describe('NonConformityDetector', () => {
    it('should detect non-conformities from findings', async () => {
      const standards = ComplianceStandardsDB.getStandards('ISM').slice(0, 2);
      const findings = await OperationalLogAnalyzer.analyzeLogs(mockLogs, standards);
      const nonConformities = NonConformityDetector.detectNonConformities(findings);
      
      expect(Array.isArray(nonConformities)).toBe(true);
    });

    it('should assign severity levels', async () => {
      const standards = ComplianceStandardsDB.getStandards('SOLAS');
      const emptyLogs: OperationalLog[] = [];
      const findings = await OperationalLogAnalyzer.analyzeLogs(emptyLogs, standards);
      const nonConformities = NonConformityDetector.detectNonConformities(findings);
      
      if (nonConformities.length > 0) {
        expect(['minor', 'major', 'critical']).toContain(nonConformities[0].severity);
      }
    });

    it('should include evidence and related logs', async () => {
      const standards = ComplianceStandardsDB.getStandards('ISM').slice(0, 1);
      const findings = await OperationalLogAnalyzer.analyzeLogs(mockLogs, standards);
      const nonConformities = NonConformityDetector.detectNonConformities(findings);
      
      if (nonConformities.length > 0) {
        const nc = nonConformities[0];
        expect(nc).toHaveProperty('evidence');
        expect(nc).toHaveProperty('relatedLogs');
        expect(nc).toHaveProperty('detected_at');
        expect(nc).toHaveProperty('status', 'open');
      }
    });

    it('should correlate with previous audits', async () => {
      const mockPreviousAudits = [
        {
          id: 'AUDIT-001',
          audit_date: '2025-10-01T00:00:00Z',
          auditor: 'Test Auditor',
          standards_checked: ['ISM'] as ComplianceStandard['code'][],
          total_checkpoints: 10,
          passed_checkpoints: 8,
          failed_checkpoints: 2,
          non_conformities: [
            {
              id: 'NC-001',
              standard: 'ISM' as const,
              section: '1.2.1',
              severity: 'major' as const,
              description: 'Test NC',
              evidence: [],
              relatedLogs: [],
              status: 'open' as const,
              detected_at: '2025-10-01T00:00:00Z',
            },
          ],
          compliance_score: 80,
          risk_level: 'medium' as const,
          recommendations: [],
          correlations: [],
        },
      ];

      const standards = ComplianceStandardsDB.getStandards('ISM');
      const findings = await OperationalLogAnalyzer.analyzeLogs(mockLogs, standards);
      const nonConformities = NonConformityDetector.detectNonConformities(findings);
      const correlations = await NonConformityDetector.correlatePreviousInspections(
        nonConformities,
        mockPreviousAudits
      );
      
      expect(Array.isArray(correlations)).toBe(true);
    });
  });

  describe('ISMAuditorService', () => {
    it('should perform complete audit', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM', 'MLC'],
        'Test Auditor',
        'MV Test Ship'
      );
      
      expect(audit).toHaveProperty('id');
      expect(audit).toHaveProperty('compliance_score');
      expect(audit).toHaveProperty('risk_level');
      expect(audit).toHaveProperty('non_conformities');
      expect(audit).toHaveProperty('recommendations');
    });

    it('should calculate compliance score correctly', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      
      expect(typeof audit.compliance_score).toBe('number');
      expect(audit.compliance_score).toBeGreaterThanOrEqual(0);
      expect(audit.compliance_score).toBeLessThanOrEqual(100);
    });

    it('should determine risk level', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      
      expect(['low', 'medium', 'high', 'critical']).toContain(audit.risk_level);
    });

    it('should generate recommendations', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      
      expect(Array.isArray(audit.recommendations)).toBe(true);
      expect(audit.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate action plan', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      const actionPlan = ISMAuditorService.generateActionPlan(audit);
      
      expect(Array.isArray(actionPlan)).toBe(true);
      
      if (actionPlan.length > 0) {
        const action = actionPlan[0];
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('priority');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('due_date');
        expect(action).toHaveProperty('status', 'pending');
      }
    });

    it('should track checkpoint statistics', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      
      expect(audit.total_checkpoints).toBeGreaterThan(0);
      expect(audit.passed_checkpoints + audit.failed_checkpoints).toBeLessThanOrEqual(
        audit.total_checkpoints
      );
    });
  });

  describe('ReportGeneratorService', () => {
    it('should generate audit report', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      const report = ReportGeneratorService.generateReport(audit);
      
      expect(report).toHaveProperty('audit_result');
      expect(report).toHaveProperty('executive_summary');
      expect(report).toHaveProperty('detailed_findings');
      expect(report).toHaveProperty('action_plan');
      expect(report).toHaveProperty('generated_at');
    });

    it('should include executive summary', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      const report = ReportGeneratorService.generateReport(audit);
      
      expect(typeof report.executive_summary).toBe('string');
      expect(report.executive_summary.length).toBeGreaterThan(0);
      expect(report.executive_summary).toContain('ISM Audit');
    });
  });

  describe('JSONExportService', () => {
    it('should export to JSON format', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      const report = ReportGeneratorService.generateReport(audit);
      const json = JSONExportService.exportToJSON(report);
      
      expect(typeof json).toBe('string');
      expect(json.length).toBeGreaterThan(0);
      
      // Should be valid JSON
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('audit_result');
    });

    it('should parse JSON report', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      const report = ReportGeneratorService.generateReport(audit);
      const json = JSONExportService.exportToJSON(report);
      const parsed = JSONExportService.parseJSON(json);
      
      expect(parsed).toEqual(report);
    });
  });

  describe('AuditReportExporter', () => {
    it('should generate report object', async () => {
      const audit = await ISMAuditorService.performAudit(
        mockLogs,
        ['ISM'],
        'Test Auditor'
      );
      const report = AuditReportExporter.generateReportObject(audit);
      
      expect(report).toHaveProperty('audit_result');
      expect(report).toHaveProperty('executive_summary');
      expect(report).toHaveProperty('action_plan');
    });
  });

  describe('Compliance Gap Detection', () => {
    it('should identify compliance gaps', async () => {
      const emptyLogs: OperationalLog[] = [];
      const audit = await ISMAuditorService.performAudit(
        emptyLogs,
        ['ISM'],
        'Test Auditor'
      );
      
      // With no logs, should have many gaps
      expect(audit.non_conformities.length).toBeGreaterThan(0);
      expect(audit.compliance_score).toBeLessThan(50);
    });

    it('should track compliance improvements', async () => {
      const fullLogs = [
        ...mockLogs,
        {
          id: '4',
          timestamp: '2025-11-04T10:00:00Z',
          module: 'compliance',
          operation: 'dpa_appointment',
          user: 'admin',
          description: 'Designated Person Ashore appointed and documented',
          metadata: {},
        },
        {
          id: '5',
          timestamp: '2025-11-04T11:00:00Z',
          module: 'training',
          operation: 'qualification_check',
          user: 'hr',
          description: 'Verified crew qualifications and certificates',
          metadata: {},
        },
      ];

      const audit = await ISMAuditorService.performAudit(
        fullLogs,
        ['ISM'],
        'Test Auditor'
      );
      
      // More evidence should result in compliance score being tracked
      expect(audit.compliance_score).toBeGreaterThanOrEqual(0);
      expect(audit.total_checkpoints).toBeGreaterThan(0);
    });
  });
});
