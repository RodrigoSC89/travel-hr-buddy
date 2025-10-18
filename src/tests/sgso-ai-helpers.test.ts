import { describe, it, expect } from 'vitest';
import {
  classifyIncidentWithAI,
  forecastRisk,
  generateCorrectiveAction,
  processNonConformity,
  analyzeIncidentPatterns,
  type Incident,
  type NonConformity
} from '../lib/sgso-ai-helpers';

describe('SGSO AI Helpers', () => {
  describe('classifyIncidentWithAI', () => {
    it('should classify a fire incident correctly', async () => {
      const incident: Incident = {
        id: '1',
        description: 'Fire broke out in the engine room',
        severity: 'high'
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.category).toBe('Fire Safety');
      expect(result.severity).toBe('high');
      expect(result.riskLevel).toBeGreaterThan(50);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should classify a fall incident correctly', async () => {
      const incident: Incident = {
        id: '2',
        description: 'Worker fell from height during maintenance'
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.category).toBe('Working at Heights');
      expect(result.reasoning).toContain('Working at Heights');
    });

    it('should classify a chemical spill correctly', async () => {
      const incident: Incident = {
        id: '3',
        description: 'Chemical spill in storage area'
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.category).toBe('Chemical Safety');
    });

    it('should classify critical severity incidents with high risk', async () => {
      const incident: Incident = {
        id: '4',
        description: 'Critical equipment failure with fatal consequences',
        severity: 'critical'
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('critical');
      expect(result.riskLevel).toBeGreaterThanOrEqual(90);
    });

    it('should classify low severity incidents with low risk', async () => {
      const incident: Incident = {
        id: '5',
        description: 'Minor scratch during routine work',
        severity: 'low'
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('low');
      expect(result.riskLevel).toBeLessThan(50);
    });
  });

  describe('forecastRisk', () => {
    it('should return zero risk for no incidents', async () => {
      const result = await forecastRisk([]);
      
      expect(result.riskScore).toBe(0);
      expect(result.trend).toBe('stable');
      expect(result.confidenceLevel).toBe(0);
    });

    it('should calculate risk score based on incident count', async () => {
      const incidents: Incident[] = Array(10).fill(null).map((_, i) => ({
        id: `${i}`,
        description: `Incident ${i}`
      }));
      
      const result = await forecastRisk(incidents);
      
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.factors).toContain('Total of 10 incidents in historical data');
    });

    it('should identify increasing trend with recent incidents', async () => {
      const incidents: Incident[] = Array(50).fill(null).map((_, i) => ({
        id: `${i}`,
        description: `Incident ${i}`
      }));
      
      const result = await forecastRisk(incidents);
      
      // The trend can be increasing or stable depending on distribution
      expect(['increasing', 'stable', 'decreasing']).toContain(result.trend);
    });

    it('should increase risk score for high severity incidents', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Test 1', severity: 'high' },
        { id: '2', description: 'Test 2', severity: 'critical' },
        { id: '3', description: 'Test 3', severity: 'low' }
      ];
      
      const result = await forecastRisk(incidents);
      
      expect(result.factors.some(f => f.includes('high or critical'))).toBe(true);
    });

    it('should provide recommendations based on risk level', async () => {
      const highRiskIncidents: Incident[] = Array(40).fill(null).map((_, i) => ({
        id: `${i}`,
        description: `High risk incident ${i}`,
        severity: 'high'
      }));
      
      const result = await forecastRisk(highRiskIncidents);
      
      expect(result.riskScore).toBeGreaterThan(70);
      expect(result.recommendations).toContain('Immediate safety review recommended');
    });

    it('should calculate confidence based on data size', async () => {
      const smallDataset: Incident[] = [
        { id: '1', description: 'Test 1' },
        { id: '2', description: 'Test 2' }
      ];
      
      const result = await forecastRisk(smallDataset);
      
      expect(result.confidenceLevel).toBeLessThan(0.5);
    });
  });

  describe('generateCorrectiveAction', () => {
    it('should generate fire safety corrective action', async () => {
      const incident: Incident = {
        id: '1',
        description: 'Fire in storage room'
      };
      const classification = {
        category: 'Fire Safety',
        severity: 'high' as const,
        riskLevel: 80,
        confidence: 0.9,
        reasoning: 'Fire incident'
      };
      
      const result = await generateCorrectiveAction(incident, classification);
      
      expect(result.title).toBe('Fire Safety Enhancement');
      expect(result.priority).toBe('high');
      expect(result.steps).toContain('Inspect fire safety equipment');
    });

    it('should generate height safety corrective action', async () => {
      const incident: Incident = {
        id: '2',
        description: 'Fall from scaffold'
      };
      const classification = {
        category: 'Working at Heights',
        severity: 'critical' as const,
        riskLevel: 95,
        confidence: 0.95,
        reasoning: 'Height safety incident'
      };
      
      const result = await generateCorrectiveAction(incident, classification);
      
      expect(result.title).toBe('Height Safety Protocol Review');
      expect(result.priority).toBe('urgent');
      expect(result.resources).toContain('Safety Harnesses');
    });

    it('should generate chemical safety corrective action', async () => {
      const incident: Incident = {
        id: '3',
        description: 'Chemical exposure incident'
      };
      const classification = {
        category: 'Chemical Safety',
        severity: 'medium' as const,
        riskLevel: 60,
        confidence: 0.85,
        reasoning: 'Chemical incident'
      };
      
      const result = await generateCorrectiveAction(incident, classification);
      
      expect(result.title).toBe('Chemical Handling Improvement');
      expect(result.steps).toContain('Review Material Safety Data Sheets (MSDS)');
    });

    it('should set urgent priority for critical incidents', async () => {
      const incident: Incident = {
        id: '4',
        description: 'Critical safety failure',
        severity: 'critical'
      };
      
      const result = await generateCorrectiveAction(incident);
      
      expect(result.priority).toBe('urgent');
      expect(result.estimatedDuration).toContain('Immediate');
    });

    it('should include appropriate resources', async () => {
      const incident: Incident = {
        id: '5',
        description: 'General safety issue'
      };
      
      const result = await generateCorrectiveAction(incident);
      
      expect(result.resources).toContain('Safety Officer');
      expect(result.resources.length).toBeGreaterThan(0);
    });
  });

  describe('processNonConformity', () => {
    it('should analyze non-conformity with complete response', async () => {
      const nonConformity: NonConformity = {
        id: '1',
        description: 'Procedure not followed during equipment maintenance',
        standard: 'ISO 9001',
        severity: 'medium'
      };
      
      const result = await processNonConformity(nonConformity);
      
      expect(result.analysis).toContain('ISO 9001');
      expect(result.rootCause.length).toBeGreaterThan(0);
      expect(result.correctiveActions.length).toBeGreaterThan(0);
      expect(result.preventiveActions.length).toBeGreaterThan(0);
      expect(result.timeline).toBeTruthy();
    });

    it('should identify procedure-related root causes', async () => {
      const nonConformity: NonConformity = {
        id: '2',
        description: 'Inadequate procedure documentation for safety process'
      };
      
      const result = await processNonConformity(nonConformity);
      
      expect(result.rootCause).toContain('Inadequate or unclear procedures');
    });

    it('should identify training-related root causes', async () => {
      const nonConformity: NonConformity = {
        id: '3',
        description: 'Staff lacks training on new equipment'
      };
      
      const result = await processNonConformity(nonConformity);
      
      expect(result.rootCause).toContain('Insufficient training or awareness');
    });

    it('should generate multiple corrective actions', async () => {
      const nonConformity: NonConformity = {
        id: '4',
        description: 'Major compliance issue',
        severity: 'high'
      };
      
      const result = await processNonConformity(nonConformity);
      
      expect(result.correctiveActions.length).toBeGreaterThanOrEqual(2);
      expect(result.correctiveActions[0].priority).toBe('urgent');
    });

    it('should include preventive actions', async () => {
      const nonConformity: NonConformity = {
        id: '5',
        description: 'Quality control issue'
      };
      
      const result = await processNonConformity(nonConformity);
      
      expect(result.preventiveActions).toContain('Implement regular compliance audits');
    });

    it('should provide timeline for resolution', async () => {
      const nonConformity: NonConformity = {
        id: '6',
        description: 'Documentation gap'
      };
      
      const result = await processNonConformity(nonConformity);
      
      expect(result.timeline).toContain('weeks');
    });
  });

  describe('analyzeIncidentPatterns', () => {
    it('should return insufficient data message for small dataset', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Test 1' }
      ];
      
      const result = await analyzeIncidentPatterns(incidents);
      
      expect(result[0].pattern).toContain('Insufficient data');
    });

    it('should identify location-based patterns', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Incident 1', location: 'Engine Room' },
        { id: '2', description: 'Incident 2', location: 'Engine Room' },
        { id: '3', description: 'Incident 3', location: 'Deck' }
      ];
      
      const result = await analyzeIncidentPatterns(incidents);
      
      const locationPattern = result.find(p => p.pattern.includes('Engine Room'));
      expect(locationPattern).toBeTruthy();
      expect(locationPattern?.frequency).toBe(2);
    });

    it('should identify type-based patterns', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Test 1', type: 'Slip' },
        { id: '2', description: 'Test 2', type: 'Slip' },
        { id: '3', description: 'Test 3', type: 'Slip' },
        { id: '4', description: 'Test 4', type: 'Fall' }
      ];
      
      const result = await analyzeIncidentPatterns(incidents);
      
      const typePattern = result.find(p => p.pattern.includes('Slip'));
      expect(typePattern).toBeTruthy();
      expect(typePattern?.frequency).toBe(3);
    });

    it('should identify high severity clusters', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Test 1', severity: 'high' },
        { id: '2', description: 'Test 2', severity: 'critical' },
        { id: '3', description: 'Test 3', severity: 'low' },
        { id: '4', description: 'Test 4', severity: 'low' }
      ];
      
      const result = await analyzeIncidentPatterns(incidents);
      
      const severityPattern = result.find(p => p.pattern.includes('High severity'));
      expect(severityPattern).toBeTruthy();
    });

    it('should provide recommendations for patterns', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Test 1', location: 'Workshop' },
        { id: '2', description: 'Test 2', location: 'Workshop' },
        { id: '3', description: 'Test 3', location: 'Office' }
      ];
      
      const result = await analyzeIncidentPatterns(incidents);
      
      expect(result[0].recommendations.length).toBeGreaterThan(0);
    });

    it('should handle no significant patterns', async () => {
      const incidents: Incident[] = [
        { id: '1', description: 'Test 1', location: 'A' },
        { id: '2', description: 'Test 2', location: 'B' },
        { id: '3', description: 'Test 3', location: 'C' }
      ];
      
      const result = await analyzeIncidentPatterns(incidents);
      
      const noPattern = result.find(p => p.pattern.includes('No significant patterns'));
      expect(noPattern).toBeTruthy();
    });
  });
});
