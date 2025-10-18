import { describe, it, expect } from 'vitest';
import {
  classifyIncidentWithAI,
  forecastRisk,
  generateCorrectiveAction,
  processNonConformity,
  type Incident,
  type IncidentClassification
} from '../lib/sgso-ai-helpers';

describe('SGSO AI Helpers', () => {
  describe('classifyIncidentWithAI', () => {
    it('should classify critical incident correctly', async () => {
      const incident: Incident = {
        id: '1',
        title: 'Critical Equipment Failure',
        description: 'Critical failure on main deck causing emergency situation'
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('critical');
      expect(result.risk_level).toBeGreaterThanOrEqual(8);
      expect(result.requires_immediate_action).toBe(true);
      expect(result.recommendations).toHaveLength(5);
    });

    it('should classify high severity incident', async () => {
      const incident: Incident = {
        id: '2',
        title: 'High Risk Situation',
        description: 'Important safety issue requiring high priority attention'
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('high');
      expect(result.risk_level).toBeGreaterThanOrEqual(6);
      expect(result.requires_immediate_action).toBe(true);
    });

    it('should classify medium severity incident', async () => {
      const incident: Incident = {
        id: '3',
        title: 'Moderate Issue',
        description: 'Medium priority operational deviation'
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('medium');
      expect(result.risk_level).toBeGreaterThanOrEqual(4);
      expect(result.risk_level).toBeLessThanOrEqual(6);
    });

    it('should classify low severity incident by default', async () => {
      const incident: Incident = {
        id: '4',
        title: 'Minor Issue',
        description: 'Small procedural deviation'
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('low');
      expect(result.risk_level).toBeLessThanOrEqual(4);
      expect(result.requires_immediate_action).toBe(false);
    });

    it('should provide category classification', async () => {
      const incident: Incident = {
        id: '5',
        title: 'Test Incident',
        description: 'Test description',
        type: 'Equipment Failure'
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.category).toBeTruthy();
      expect(typeof result.category).toBe('string');
    });

    it('should provide recommendations array', async () => {
      const incident: Incident = {
        id: '6',
        title: 'Test Incident',
        description: 'Test description'
      };

      const result = await classifyIncidentWithAI(incident);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('forecastRisk', () => {
    it('should forecast increasing trend with many incidents', async () => {
      const incidents: Incident[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `Incident ${i}`,
        description: `Description ${i}`
      }));

      const result = await forecastRisk(incidents);

      expect(result.trend).toBe('increasing');
      expect(result.probability).toBeGreaterThan(0.5);
      expect(result.potential_incidents).toBeGreaterThan(3);
    });

    it('should forecast stable trend with moderate incidents', async () => {
      const incidents: Incident[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${i}`,
        title: `Incident ${i}`,
        description: `Description ${i}`
      }));

      const result = await forecastRisk(incidents);

      expect(result.trend).toBe('stable');
      expect(result.probability).toBeGreaterThan(0);
      expect(result.probability).toBeLessThanOrEqual(0.5);
    });

    it('should forecast decreasing trend with no incidents', async () => {
      const incidents: Incident[] = [];

      const result = await forecastRisk(incidents);

      expect(result.trend).toBe('decreasing');
      expect(result.probability).toBeLessThanOrEqual(0.2);
      expect(result.potential_incidents).toBe(0);
    });

    it('should provide risk factors', async () => {
      const incidents: Incident[] = [
        { id: '1', title: 'Test', description: 'Test' }
      ];

      const result = await forecastRisk(incidents);

      expect(Array.isArray(result.risk_factors)).toBe(true);
      expect(result.risk_factors.length).toBeGreaterThan(0);
    });

    it('should provide preventive actions', async () => {
      const incidents: Incident[] = [
        { id: '1', title: 'Test', description: 'Test' }
      ];

      const result = await forecastRisk(incidents);

      expect(Array.isArray(result.preventive_actions)).toBe(true);
      expect(result.preventive_actions.length).toBeGreaterThan(0);
    });

    it('should accept different timeframes', async () => {
      const incidents: Incident[] = [
        { id: '1', title: 'Test', description: 'Test' }
      ];

      const weekResult = await forecastRisk(incidents, 'week');
      const monthResult = await forecastRisk(incidents, 'month');
      const quarterResult = await forecastRisk(incidents, 'quarter');

      expect(weekResult).toBeTruthy();
      expect(monthResult).toBeTruthy();
      expect(quarterResult).toBeTruthy();
    });
  });

  describe('generateCorrectiveAction', () => {
    it('should generate urgent priority for critical incidents', async () => {
      const incident: Incident = {
        id: '1',
        title: 'Critical Issue',
        description: 'Critical situation'
      };

      const classification: IncidentClassification = {
        severity: 'critical',
        category: 'Safety',
        risk_level: 10,
        recommendations: ['Test'],
        requires_immediate_action: true
      };

      const result = await generateCorrectiveAction(incident, classification);

      expect(result.priority).toBe('urgent');
      expect(result.responsible).toBe('Safety Manager');
    });

    it('should generate high priority for high severity incidents', async () => {
      const incident: Incident = {
        id: '2',
        title: 'High Priority Issue',
        description: 'High severity situation'
      };

      const classification: IncidentClassification = {
        severity: 'high',
        category: 'Safety',
        risk_level: 8,
        recommendations: ['Test'],
        requires_immediate_action: true
      };

      const result = await generateCorrectiveAction(incident, classification);

      expect(result.priority).toBe('high');
      expect(result.responsible).toBe('Department Head');
    });

    it('should provide actionable steps', async () => {
      const incident: Incident = {
        id: '3',
        title: 'Test Issue',
        description: 'Test description'
      };

      const classification: IncidentClassification = {
        severity: 'medium',
        category: 'Process',
        risk_level: 5,
        recommendations: ['Test'],
        requires_immediate_action: false
      };

      const result = await generateCorrectiveAction(incident, classification);

      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('should set appropriate deadline based on priority', async () => {
      const incident: Incident = {
        id: '4',
        title: 'Test',
        description: 'Test'
      };

      const classification: IncidentClassification = {
        severity: 'critical',
        category: 'Safety',
        risk_level: 10,
        recommendations: ['Test'],
        requires_immediate_action: true
      };

      const result = await generateCorrectiveAction(incident, classification);

      expect(result.deadline).toBeTruthy();
      expect(typeof result.deadline).toBe('string');
      expect(result.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should provide success metrics', async () => {
      const incident: Incident = {
        id: '5',
        title: 'Test',
        description: 'Test'
      };

      const classification: IncidentClassification = {
        severity: 'low',
        category: 'Process',
        risk_level: 2,
        recommendations: ['Test'],
        requires_immediate_action: false
      };

      const result = await generateCorrectiveAction(incident, classification);

      expect(Array.isArray(result.success_metrics)).toBe(true);
      expect(result.success_metrics.length).toBeGreaterThan(0);
    });

    it('should estimate cost for critical incidents', async () => {
      const incident: Incident = {
        id: '6',
        title: 'Critical',
        description: 'Critical'
      };

      const classification: IncidentClassification = {
        severity: 'critical',
        category: 'Safety',
        risk_level: 10,
        recommendations: ['Test'],
        requires_immediate_action: true
      };

      const result = await generateCorrectiveAction(incident, classification);

      expect(result.estimated_cost).toBeTruthy();
      expect(result.estimated_cost).toBeGreaterThan(0);
    });
  });

  describe('processNonConformity', () => {
    it('should identify critical non-conformity', async () => {
      const description = 'Critical violation of major safety requirements';
      
      const result = await processNonConformity(description);

      expect(result.severity_score).toBeGreaterThanOrEqual(7);
      expect(result.compliance_gaps.length).toBeGreaterThan(2);
    });

    it('should identify moderate non-conformity', async () => {
      const description = 'Minor procedural deviation noted';
      
      const result = await processNonConformity(description);

      expect(result.severity_score).toBeLessThanOrEqual(6);
    });

    it('should list affected clauses', async () => {
      const description = 'Documentation missing';
      const norms = ['ISO 9001', 'ISM Code'];
      
      const result = await processNonConformity(description, norms);

      expect(Array.isArray(result.affected_clauses)).toBe(true);
      expect(result.affected_clauses.length).toBeGreaterThan(0);
    });

    it('should provide default clauses when not specified', async () => {
      const description = 'Documentation missing';
      
      const result = await processNonConformity(description);

      expect(Array.isArray(result.affected_clauses)).toBe(true);
      expect(result.affected_clauses.length).toBeGreaterThan(0);
    });

    it('should generate remediation plan', async () => {
      const description = 'Procedure not followed correctly';
      
      const result = await processNonConformity(description);

      expect(Array.isArray(result.remediation_plan)).toBe(true);
      expect(result.remediation_plan.length).toBeGreaterThan(0);
    });

    it('should provide estimated timeline', async () => {
      const description = 'Test non-conformity';
      
      const result = await processNonConformity(description);

      expect(result.estimated_timeline).toBeTruthy();
      expect(typeof result.estimated_timeline).toBe('string');
    });

    it('should identify compliance gaps', async () => {
      const description = 'Multiple issues identified';
      
      const result = await processNonConformity(description);

      expect(Array.isArray(result.compliance_gaps)).toBe(true);
      expect(result.compliance_gaps.length).toBeGreaterThan(0);
    });

    it('should handle empty norm array', async () => {
      const description = 'Test issue';
      
      const result = await processNonConformity(description, []);

      expect(result).toBeTruthy();
      expect(result.affected_clauses.length).toBeGreaterThan(0);
    });
  });
});
