import { describe, it, expect } from 'vitest';
import {
  classifyIncidentWithAI,
  forecastRisk,
  generateCorrectiveAction,
  processNonConformity,
  type Incident,
} from '../lib/sgso-ai-helpers';

describe('SGSO AI Helpers', () => {
  describe('classifyIncidentWithAI', () => {
    it('should classify critical incident correctly', async () => {
      const incident: Incident = {
        id: '1',
        title: 'Critical Equipment Failure',
        description: 'Fatal accident involving critical machinery failure',
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('critical');
      expect(result.risk_level).toBe(10);
      expect(result.category).toBe('Critical Safety');
      expect(result.recommendations).toContain('Immediate investigation required');
    });

    it('should classify high severity incident', async () => {
      const incident: Incident = {
        id: '2',
        title: 'Equipment Failure',
        description: 'Serious injury due to equipment malfunction',
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('high');
      expect(result.risk_level).toBe(7);
      expect(result.category).toBe('Safety Incident');
      expect(result.recommendations).toContain('Conduct thorough investigation');
    });

    it('should classify medium severity incident', async () => {
      const incident: Incident = {
        id: '3',
        title: 'Near Miss',
        description: 'Near miss incident with potential risk',
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('medium');
      expect(result.risk_level).toBe(5);
      expect(result.category).toBe('Near Miss');
      expect(result.recommendations).toContain('Document incident details');
    });

    it('should classify low severity incident', async () => {
      const incident: Incident = {
        id: '4',
        title: 'Minor Issue',
        description: 'Small procedural deviation',
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result.severity).toBe('low');
      expect(result.risk_level).toBe(2);
      expect(result.category).toBe('Minor Incident');
      expect(result.recommendations).toContain('Record for future reference');
    });

    it('should handle incident with missing description', async () => {
      const incident: Incident = {
        id: '5',
        title: 'Test Incident',
        description: '',
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result).toBeDefined();
      expect(result.severity).toBeDefined();
      expect(result.risk_level).toBeGreaterThanOrEqual(1);
    });

    it('should handle incident with undefined description', async () => {
      const incident: Incident = {
        id: '6',
        title: 'Test Incident',
        description: undefined as any,
      };

      const result = await classifyIncidentWithAI(incident);

      expect(result).toBeDefined();
      expect(result.severity).toBeDefined();
    });

    it('should return recommendations array', async () => {
      const incident: Incident = {
        id: '7',
        title: 'Test',
        description: 'Test incident',
      };

      const result = await classifyIncidentWithAI(incident);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('forecastRisk', () => {
    it('should detect increasing trend', async () => {
      const historicalData: Incident[] = [
        ...Array(30).fill(null).map((_, i) => ({
          id: `old-${i}`,
          title: `Old incident ${i}`,
          description: 'Old incident',
        })),
        ...Array(40).fill(null).map((_, i) => ({
          id: `recent-${i}`,
          title: `Recent incident ${i}`,
          description: 'Recent incident',
        })),
      ];

      const result = await forecastRisk(historicalData);

      expect(result.trend).toBe('increasing');
      expect(result.predicted_incidents).toBeGreaterThan(40);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.risk_factors).toContain('Increasing incident frequency');
    });

    it('should detect decreasing trend', async () => {
      const historicalData: Incident[] = [
        ...Array(40).fill(null).map((_, i) => ({
          id: `old-${i}`,
          title: `Old incident ${i}`,
          description: 'Old incident',
        })),
        ...Array(20).fill(null).map((_, i) => ({
          id: `recent-${i}`,
          title: `Recent incident ${i}`,
          description: 'Recent incident',
        })),
      ];

      const result = await forecastRisk(historicalData);

      expect(result.trend).toBe('decreasing');
      expect(result.predicted_incidents).toBeLessThan(20);
      expect(result.risk_factors).toContain('Positive trend in safety');
    });

    it('should detect stable trend', async () => {
      const historicalData: Incident[] = [
        ...Array(30).fill(null).map((_, i) => ({
          id: `old-${i}`,
          title: `Old incident ${i}`,
          description: 'Old incident',
        })),
        ...Array(30).fill(null).map((_, i) => ({
          id: `recent-${i}`,
          title: `Recent incident ${i}`,
          description: 'Recent incident',
        })),
      ];

      const result = await forecastRisk(historicalData);

      expect(result.trend).toBe('stable');
      expect(result.risk_factors).toContain('Consistent incident rate');
    });

    it('should handle small dataset', async () => {
      const historicalData: Incident[] = [
        { id: '1', title: 'Test', description: 'Test' },
        { id: '2', title: 'Test', description: 'Test' },
      ];

      const result = await forecastRisk(historicalData);

      expect(result).toBeDefined();
      expect(result.trend).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle empty dataset', async () => {
      const historicalData: Incident[] = [];

      const result = await forecastRisk(historicalData);

      expect(result).toBeDefined();
      expect(result.predicted_incidents).toBe(0);
    });

    it('should calculate confidence based on data size', async () => {
      const smallDataset: Incident[] = Array(10).fill(null).map((_, i) => ({
        id: `${i}`,
        title: 'Test',
        description: 'Test',
      }));

      const largeDataset: Incident[] = Array(100).fill(null).map((_, i) => ({
        id: `${i}`,
        title: 'Test',
        description: 'Test',
      }));

      const smallResult = await forecastRisk(smallDataset);
      const largeResult = await forecastRisk(largeDataset);

      expect(largeResult.confidence).toBeGreaterThanOrEqual(smallResult.confidence);
    });
  });

  describe('generateCorrectiveAction', () => {
    it('should generate urgent action for critical incident', async () => {
      const incident: Incident = {
        id: '1',
        title: 'Critical Failure',
        description: 'Fatal accident on site',
      };

      const result = await generateCorrectiveAction(incident);

      expect(result.priority).toBe('urgent');
      expect(result.estimated_time).toBe('24 hours');
      expect(result.responsible_party).toBe('Management Team');
      expect(result.resources_needed).toContain('Emergency response team');
    });

    it('should generate high priority action for high severity incident', async () => {
      const incident: Incident = {
        id: '2',
        title: 'Injury',
        description: 'Worker injury due to equipment failure',
      };

      const result = await generateCorrectiveAction(incident);

      expect(result.priority).toBe('high');
      expect(result.estimated_time).toBe('3 days');
      expect(result.responsible_party).toBe('Safety Manager');
    });

    it('should generate medium priority action for medium severity incident', async () => {
      const incident: Incident = {
        id: '3',
        title: 'Near Miss',
        description: 'Near miss with hazard',
      };

      const result = await generateCorrectiveAction(incident);

      expect(result.priority).toBe('medium');
      expect(result.estimated_time).toBe('1 week');
      expect(result.responsible_party).toBe('Safety Officer');
    });

    it('should generate low priority action for low severity incident', async () => {
      const incident: Incident = {
        id: '4',
        title: 'Minor',
        description: 'Minor procedural issue',
      };

      const result = await generateCorrectiveAction(incident);

      expect(result.priority).toBe('low');
      expect(result.estimated_time).toBe('2 weeks');
      expect(result.responsible_party).toBe('Safety Coordinator');
    });

    it('should include action description', async () => {
      const incident: Incident = {
        id: '5',
        title: 'Test',
        description: 'Test incident',
      };

      const result = await generateCorrectiveAction(incident);

      expect(result.action).toBeDefined();
      expect(result.action.length).toBeGreaterThan(0);
    });

    it('should include resources needed', async () => {
      const incident: Incident = {
        id: '6',
        title: 'Test',
        description: 'Test incident',
      };

      const result = await generateCorrectiveAction(incident);

      expect(Array.isArray(result.resources_needed)).toBe(true);
    });
  });

  describe('processNonConformity', () => {
    it('should identify critical non-conformity', async () => {
      const result = await processNonConformity(
        'Critical safety breach detected',
        'ISO 45001'
      );

      expect(result.severity).toBe('critical');
      expect(result.gap).toContain('Critical compliance gap');
      expect(result.compliance_standard).toBe('ISO 45001');
      expect(result.remediation_steps).toContain('Immediate corrective action required');
    });

    it('should identify major non-conformity', async () => {
      const result = await processNonConformity(
        'Significant deviation from standard procedures',
        'SGSO'
      );

      expect(result.severity).toBe('major');
      expect(result.gap).toContain('Significant compliance gap');
      expect(result.remediation_steps).toContain('Develop corrective action plan');
    });

    it('should identify minor non-conformity', async () => {
      const result = await processNonConformity(
        'Small procedural gap identified',
        'IMCA M117'
      );

      expect(result.severity).toBe('minor');
      expect(result.gap).toContain('Minor compliance gap');
      expect(result.remediation_steps).toContain('Review compliance requirements');
    });

    it('should handle repeated violations as major', async () => {
      const result = await processNonConformity(
        'Repeated violation of safety procedures',
        'ISM Code'
      );

      expect(result.severity).toBe('major');
    });

    it('should include compliance standard', async () => {
      const standard = 'ISPS Code';
      const result = await processNonConformity('Test non-conformity', standard);

      expect(result.compliance_standard).toBe(standard);
    });

    it('should provide remediation steps', async () => {
      const result = await processNonConformity(
        'Test non-conformity',
        'Test Standard'
      );

      expect(Array.isArray(result.remediation_steps)).toBe(true);
      expect(result.remediation_steps.length).toBeGreaterThan(0);
    });
  });
});
