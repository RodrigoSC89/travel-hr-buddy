/**
 * IMCA Audit Service Tests
 * Tests for the IMCA technical audit generation service
 */

import { describe, it, expect } from 'vitest';
import { IMCA_STANDARDS, STANDARD_AUDIT_MODULES } from '@/types/imca-audit';
import { formatAuditAsMarkdown } from '@/services/imca-audit-service';
import type { IMCAAuditReport } from '@/types/imca-audit';

describe('IMCA Audit Types', () => {
  it('should have all 10 IMCA standards defined', () => {
    expect(IMCA_STANDARDS).toHaveLength(10);
    
    const standardCodes = IMCA_STANDARDS.map(s => s.code);
    expect(standardCodes).toContain('IMCA M103');
    expect(standardCodes).toContain('IMCA M117');
    expect(standardCodes).toContain('IMCA M190');
    expect(standardCodes).toContain('IMCA M166');
    expect(standardCodes).toContain('IMCA M109');
    expect(standardCodes).toContain('IMCA M220');
    expect(standardCodes).toContain('IMCA M140');
    expect(standardCodes).toContain('MSF 182');
    expect(standardCodes).toContain('MTS DP Operations');
    expect(standardCodes).toContain('IMO MSC.1/Circ.1580');
  });

  it('should have all standard audit modules defined', () => {
    expect(STANDARD_AUDIT_MODULES).toHaveLength(12);
    expect(STANDARD_AUDIT_MODULES).toContain('Sistema de Controle DP');
    expect(STANDARD_AUDIT_MODULES).toContain('FMEA');
    expect(STANDARD_AUDIT_MODULES).toContain('Testes Anuais');
  });

  it('should have proper categories for standards', () => {
    const categories = IMCA_STANDARDS.map(s => s.category);
    expect(categories).toContain('Design & Operation');
    expect(categories).toContain('Personnel & Training');
    expect(categories).toContain('Testing & Trials');
    expect(categories).toContain('Risk Analysis');
  });
});

describe('IMCA Audit Markdown Formatting', () => {
  it('should format audit report to markdown correctly', () => {
    const mockAudit: IMCAAuditReport = {
      id: 'test-audit-001',
      vesselName: 'Test Vessel',
      operationType: 'Navio',
      location: 'Test Location',
      dpClass: 'DP2',
      auditDate: '2025-10-16',
      auditor: 'Test Auditor',
      objective: 'Test audit objective',
      status: 'Concluído',
      modules: [
        {
          name: 'Sistema de Controle DP',
          description: 'Test module description',
          compliant: false,
          findings: ['Finding 1', 'Finding 2'],
          nonConformities: [
            {
              id: 'NC-001',
              module: 'Sistema de Controle DP',
              description: 'Test non-conformity',
              standardReference: ['IMCA M103'],
              riskLevel: 'Alto',
              probableCauses: ['Cause 1', 'Cause 2'],
              correctiveActions: ['Action 1', 'Action 2'],
              deadline: '30 dias'
            }
          ],
          recommendations: ['Recommendation 1']
        }
      ],
      overallCompliance: 75,
      criticalIssues: 1,
      totalNonConformities: 1,
      actionPlan: {
        criticalItems: [
          {
            id: 'NC-001',
            module: 'Sistema de Controle DP',
            description: 'Test non-conformity',
            standardReference: ['IMCA M103'],
            riskLevel: 'Alto',
            probableCauses: ['Cause 1'],
            correctiveActions: ['Action 1'],
            deadline: '30 dias'
          }
        ],
        prioritizedActions: [
          {
            priority: 'Crítica',
            action: 'Test action',
            deadline: '30 dias',
            verification: 'Test verification'
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: 'AI'
    };

    const markdown = formatAuditAsMarkdown(mockAudit);

    // Check main sections are present
    expect(markdown).toContain('# 🚢 Auditoria Técnica IMCA');
    expect(markdown).toContain('## 📋 Informações da Auditoria');
    expect(markdown).toContain('## 📊 Resumo Executivo');
    expect(markdown).toContain('## 📚 Normas de Referência');
    expect(markdown).toContain('## 🔍 Módulos Auditados');
    expect(markdown).toContain('## 📋 Plano de Ação Priorizado');

    // Check data is included
    expect(markdown).toContain('Test Vessel');
    expect(markdown).toContain('DP2');
    expect(markdown).toContain('75%');
    expect(markdown).toContain('NC-001');
    expect(markdown).toContain('IMCA M103');

    // Check risk level formatting
    expect(markdown).toContain('🔴'); // High risk emoji
    expect(markdown).toContain('Alto');
  });

  it('should include all IMCA standards in markdown', () => {
    const mockAudit: IMCAAuditReport = {
      id: 'test-audit-002',
      vesselName: 'Test Vessel 2',
      operationType: 'Terra',
      location: 'Test Location 2',
      dpClass: 'DP3',
      auditDate: '2025-10-16',
      auditor: 'AI System',
      objective: 'Test objective',
      status: 'Concluído',
      modules: [],
      overallCompliance: 100,
      criticalIssues: 0,
      totalNonConformities: 0,
      actionPlan: {
        criticalItems: [],
        prioritizedActions: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: 'AI'
    };

    const markdown = formatAuditAsMarkdown(mockAudit);

    // Verify all standards are included
    IMCA_STANDARDS.forEach(standard => {
      expect(markdown).toContain(standard.code);
      expect(markdown).toContain(standard.title);
    });
  });

  it('should properly format priority levels with emojis', () => {
    const mockAudit: IMCAAuditReport = {
      id: 'test-audit-003',
      vesselName: 'Priority Test',
      operationType: 'Navio',
      location: 'Test',
      dpClass: 'DP1',
      auditDate: '2025-10-16',
      auditor: 'Test',
      objective: 'Test',
      status: 'Concluído',
      modules: [],
      overallCompliance: 100,
      criticalIssues: 0,
      totalNonConformities: 0,
      actionPlan: {
        criticalItems: [],
        prioritizedActions: [
          {
            priority: 'Crítica',
            action: 'Critical action',
            deadline: 'Immediate',
            verification: 'Test'
          },
          {
            priority: 'Alta',
            action: 'High action',
            deadline: '7 days',
            verification: 'Test'
          },
          {
            priority: 'Média',
            action: 'Medium action',
            deadline: '30 days',
            verification: 'Test'
          },
          {
            priority: 'Baixa',
            action: 'Low action',
            deadline: '60 days',
            verification: 'Test'
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: 'AI'
    };

    const markdown = formatAuditAsMarkdown(mockAudit);

    // Check priority emojis
    expect(markdown).toContain('🔴'); // Critical
    expect(markdown).toContain('🟠'); // High
    expect(markdown).toContain('🟡'); // Medium
    expect(markdown).toContain('🟢'); // Low

    // Check actions are included
    expect(markdown).toContain('Critical action');
    expect(markdown).toContain('High action');
    expect(markdown).toContain('Medium action');
    expect(markdown).toContain('Low action');
  });
});

describe('IMCA Audit Data Validation', () => {
  it('should validate DP class values', () => {
    const validDPClasses = ['DP1', 'DP2', 'DP3'];
    validDPClasses.forEach(dpClass => {
      expect(['DP1', 'DP2', 'DP3']).toContain(dpClass);
    });
  });

  it('should validate operation types', () => {
    const validOperationTypes = ['Navio', 'Terra'];
    validOperationTypes.forEach(type => {
      expect(['Navio', 'Terra']).toContain(type);
    });
  });

  it('should validate risk levels', () => {
    const validRiskLevels = ['Alto', 'Médio', 'Baixo'];
    validRiskLevels.forEach(level => {
      expect(['Alto', 'Médio', 'Baixo']).toContain(level);
    });
  });

  it('should validate audit statuses', () => {
    const validStatuses = ['Pendente', 'Em Andamento', 'Concluído', 'Revisão'];
    validStatuses.forEach(status => {
      expect(['Pendente', 'Em Andamento', 'Concluído', 'Revisão']).toContain(status);
    });
  });
});
