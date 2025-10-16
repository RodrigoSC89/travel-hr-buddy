/**
 * IMCA Audit Component Tests
 * Basic tests for IMCA audit functionality
 */

import { describe, it, expect } from 'vitest';
import {
  isValidDPClass,
  getRiskLevelColor,
  getPriorityColor,
  DP_CLASSES,
  IMCA_STANDARDS,
  DP_MODULES,
} from '@/types/imca-audit';

describe('IMCA Audit Types', () => {
  it('should validate DP classes correctly', () => {
    expect(isValidDPClass('DP1')).toBe(true);
    expect(isValidDPClass('DP2')).toBe(true);
    expect(isValidDPClass('DP3')).toBe(true);
    expect(isValidDPClass('DP4')).toBe(false);
    expect(isValidDPClass('invalid')).toBe(false);
  });

  it('should have all required DP classes', () => {
    expect(DP_CLASSES).toHaveLength(3);
    expect(DP_CLASSES).toContain('DP1');
    expect(DP_CLASSES).toContain('DP2');
    expect(DP_CLASSES).toContain('DP3');
  });

  it('should return correct risk level colors', () => {
    expect(getRiskLevelColor('alto')).toContain('red');
    expect(getRiskLevelColor('medio')).toContain('orange');
    expect(getRiskLevelColor('baixo')).toContain('gray');
  });

  it('should return correct priority colors', () => {
    expect(getPriorityColor('critico')).toContain('red');
    expect(getPriorityColor('alto')).toContain('orange');
    expect(getPriorityColor('medio')).toContain('blue');
    expect(getPriorityColor('baixo')).toContain('green');
  });

  it('should have all 10 IMCA standards defined', () => {
    const standards = Object.keys(IMCA_STANDARDS);
    expect(standards).toHaveLength(10);
    expect(standards).toContain('IMCA M103');
    expect(standards).toContain('IMCA M117');
    expect(standards).toContain('IMCA M190');
    expect(standards).toContain('IMCA M166');
    expect(standards).toContain('IMCA M109');
    expect(standards).toContain('IMCA M220');
    expect(standards).toContain('IMCA M140');
    expect(standards).toContain('MSF 182');
    expect(standards).toContain('MTS DP Operations');
    expect(standards).toContain('IMO MSC.1/Circ.1580');
  });

  it('should have all 12 DP modules defined', () => {
    const modules = Object.keys(DP_MODULES);
    expect(modules).toHaveLength(12);
    expect(modules).toContain('dp_control');
    expect(modules).toContain('propulsion');
    expect(modules).toContain('positioning_sensors');
    expect(modules).toContain('network_communications');
    expect(modules).toContain('dp_personnel');
    expect(modules).toContain('logs_history');
    expect(modules).toContain('fmea');
    expect(modules).toContain('annual_trials');
    expect(modules).toContain('documentation');
    expect(modules).toContain('power_management');
    expect(modules).toContain('capability_plots');
    expect(modules).toContain('operational_planning');
  });

  it('should have proper standard descriptions', () => {
    expect(IMCA_STANDARDS['IMCA M103'].name).toBe('IMCA M103');
    expect(IMCA_STANDARDS['IMCA M103'].description).toContain('Design and Operation');
    expect(IMCA_STANDARDS['IMCA M117'].description).toContain('Training and Experience');
    expect(IMCA_STANDARDS['IMCA M190'].description).toContain('Annual Trials');
  });

  it('should have proper module descriptions', () => {
    expect(DP_MODULES['dp_control'].name).toBe('Sistema de Controle DP');
    expect(DP_MODULES['propulsion'].name).toBe('Sistema de Propulsão');
    expect(DP_MODULES['fmea'].name).toBe('FMEA');
  });
});

describe('IMCA Audit Service Functions', () => {
  it('should export markdown with proper structure', async () => {
    const { exportAuditToMarkdown } = await import('@/services/imca-audit-service');
    
    const mockAudit = {
      context: {
        vessel_name: 'Test Vessel',
        dp_class: 'DP2',
        location: 'Test Location',
        audit_date: '2025-10-16',
        audit_objective: 'Test Objective',
      },
      standards_compliance: {
        standards: [
          {
            code: 'IMCA M103',
            name: 'Test Standard',
            description: 'Test Description',
            compliance_level: 'compliant' as const,
            findings: 'Test findings',
          },
        ],
        overall_compliance_level: 'full' as const,
        summary: 'Test summary',
      },
      modules_evaluation: [
        {
          module_name: 'Test Module',
          module_code: 'dp_control' as const,
          score: 85,
          status: 'adequate' as const,
          findings: 'Test findings',
          recommendations: ['Test recommendation'],
        },
      ],
      non_conformities: [
        {
          id: 'NC001',
          title: 'Test NC',
          description: 'Test description',
          risk_level: 'alto' as const,
          affected_module: 'dp_control' as const,
          related_standards: ['IMCA M103'],
        },
      ],
      action_plan: [
        {
          id: 'AP001',
          title: 'Test Action',
          description: 'Test description',
          priority: 'alto' as const,
          deadline_days: 30,
          responsible: 'Test Responsible',
          related_non_conformities: ['NC001'],
        },
      ],
      overall_score: 85,
      summary: 'Test summary',
    };

    const context = {
      vessel_name: 'Test Vessel',
      dp_class: 'DP2',
      location: 'Test Location',
      audit_date: '2025-10-16',
    };

    const markdown = exportAuditToMarkdown(mockAudit, context);

    expect(markdown).toContain('# Auditoria Técnica IMCA');
    expect(markdown).toContain('Test Vessel');
    expect(markdown).toContain('DP2');
    expect(markdown).toContain('Test Location');
    expect(markdown).toContain('## Contexto da Auditoria');
    expect(markdown).toContain('## Resumo Executivo');
    expect(markdown).toContain('## Conformidade com Normas');
    expect(markdown).toContain('## Avaliação de Módulos');
    expect(markdown).toContain('## Não Conformidades');
    expect(markdown).toContain('## Plano de Ação');
  });
});
