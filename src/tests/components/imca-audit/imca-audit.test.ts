/**
 * IMCA Audit Component Tests
 * 
 * Comprehensive test suite for IMCA DP Technical Audit System
 */

import { describe, it, expect } from 'vitest';
import {
  DPClass,
  RiskLevel,
  PriorityLevel,
  IMCA_STANDARDS,
  DP_MODULES,
  isValidDPClass,
  getRiskLevelColor,
  getPriorityLevelColor,
  getDeadlineForPriority,
  exportAuditToMarkdown
} from '@/types/imca-audit';

describe('IMCA Audit Type Definitions', () => {
  describe('DP Class Validation', () => {
    it('should validate DP1 as valid', () => {
      expect(isValidDPClass('DP1')).toBe(true);
    });

    it('should validate DP2 as valid', () => {
      expect(isValidDPClass('DP2')).toBe(true);
    });

    it('should validate DP3 as valid', () => {
      expect(isValidDPClass('DP3')).toBe(true);
    });

    it('should reject invalid DP class', () => {
      expect(isValidDPClass('DP4')).toBe(false);
      expect(isValidDPClass('invalid')).toBe(false);
    });
  });

  describe('Standards Completeness', () => {
    it('should have exactly 10 IMCA standards', () => {
      expect(IMCA_STANDARDS).toHaveLength(10);
    });

    it('should include all required IMCA standards', () => {
      const codes = IMCA_STANDARDS.map(s => s.code);
      expect(codes).toContain('IMCA M103');
      expect(codes).toContain('IMCA M117');
      expect(codes).toContain('IMCA M190');
      expect(codes).toContain('IMCA M166');
      expect(codes).toContain('IMCA M109');
      expect(codes).toContain('IMCA M220');
      expect(codes).toContain('IMCA M140');
      expect(codes).toContain('MSF 182');
      expect(codes).toContain('MTS DP');
      expect(codes).toContain('IMO MSC.1/Circ.1580');
    });
  });

  describe('Modules Completeness', () => {
    it('should have exactly 12 DP modules', () => {
      expect(DP_MODULES).toHaveLength(12);
    });

    it('should include all critical DP modules', () => {
      const names = DP_MODULES.map(m => m.name);
      expect(names).toContain('Sistemas de Controle');
      expect(names).toContain('Sistema de Propulsão');
      expect(names).toContain('Sistema de Energia');
      expect(names).toContain('Sistemas de Sensores');
      expect(names).toContain('Comunicações');
      expect(names).toContain('Pessoal');
      expect(names).toContain('FMEA');
      expect(names).toContain('Provas Anuais');
      expect(names).toContain('Documentação');
      expect(names).toContain('PMS');
      expect(names).toContain('Capability Plots');
      expect(names).toContain('Planejamento Operacional');
    });
  });

  describe('Risk Level Colors', () => {
    it('should return red color for Alto risk', () => {
      const color = getRiskLevelColor('Alto');
      expect(color).toContain('red');
    });

    it('should return yellow color for Médio risk', () => {
      const color = getRiskLevelColor('Médio');
      expect(color).toContain('yellow');
    });

    it('should return gray color for Baixo risk', () => {
      const color = getRiskLevelColor('Baixo');
      expect(color).toContain('gray');
    });
  });

  describe('Priority Level Colors', () => {
    it('should return red color for Crítico priority', () => {
      const color = getPriorityLevelColor('Crítico');
      expect(color).toContain('red');
    });

    it('should return orange color for Alto priority', () => {
      const color = getPriorityLevelColor('Alto');
      expect(color).toContain('orange');
    });

    it('should return yellow color for Médio priority', () => {
      const color = getPriorityLevelColor('Médio');
      expect(color).toContain('yellow');
    });

    it('should return gray color for Baixo priority', () => {
      const color = getPriorityLevelColor('Baixo');
      expect(color).toContain('gray');
    });
  });

  describe('Deadline Calculation', () => {
    it('should calculate deadline for Crítico priority (7 days)', () => {
      const deadline = getDeadlineForPriority('Crítico');
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(7);
    });

    it('should calculate deadline for Alto priority (30 days)', () => {
      const deadline = getDeadlineForPriority('Alto');
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThanOrEqual(30);
    });

    it('should calculate deadline for Médio priority (90 days)', () => {
      const deadline = getDeadlineForPriority('Médio');
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(89);
      expect(diffDays).toBeLessThanOrEqual(90);
    });

    it('should calculate deadline for Baixo priority (180 days)', () => {
      const deadline = getDeadlineForPriority('Baixo');
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(179);
      expect(diffDays).toBeLessThanOrEqual(180);
    });
  });

  describe('Markdown Export', () => {
    it('should generate markdown with vessel name', () => {
      const mockAudit = {
        id: 'test-1',
        vesselName: 'Test Vessel',
        dpClass: 'DP2' as DPClass,
        location: 'Test Location',
        auditDate: '2025-01-01',
        auditObjective: 'Test Objective',
        overallScore: 85,
        summary: 'Test Summary',
        standards: IMCA_STANDARDS,
        modules: [],
        nonConformities: [],
        actionPlan: [],
        recommendations: ['Test Recommendation'],
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain('Test Vessel');
      expect(markdown).toContain('DP2');
      expect(markdown).toContain('Test Location');
    });

    it('should include all sections in markdown export', () => {
      const mockAudit = {
        id: 'test-1',
        vesselName: 'Test Vessel',
        dpClass: 'DP2' as DPClass,
        location: 'Test Location',
        auditDate: '2025-01-01',
        auditObjective: 'Test Objective',
        overallScore: 85,
        summary: 'Test Summary',
        standards: IMCA_STANDARDS,
        modules: [{
          id: 'test-module',
          name: 'Test Module',
          description: 'Test',
          score: 90,
          findings: ['Finding 1']
        }],
        nonConformities: [{
          id: 'nc-1',
          module: 'Test Module',
          description: 'Test NC',
          standard: 'IMCA M103',
          riskLevel: 'Alto' as RiskLevel,
          recommendation: 'Test Recommendation'
        }],
        actionPlan: [{
          id: 'action-1',
          description: 'Test Action',
          priority: 'Alto' as PriorityLevel,
          deadline: '2025-02-01',
          responsible: 'Test Person'
        }],
        recommendations: ['Test Recommendation'],
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      const markdown = exportAuditToMarkdown(mockAudit);
      expect(markdown).toContain('Objetivo da Auditoria');
      expect(markdown).toContain('Resumo Executivo');
      expect(markdown).toContain('Normas Avaliadas');
      expect(markdown).toContain('Avaliação dos Módulos');
      expect(markdown).toContain('Não Conformidades');
      expect(markdown).toContain('Plano de Ação');
      expect(markdown).toContain('Recomendações Gerais');
    });
  });
});
