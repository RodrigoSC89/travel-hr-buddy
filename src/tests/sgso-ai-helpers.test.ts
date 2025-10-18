import { describe, it, expect } from 'vitest';
import {
  classifyIncidentWithAI,
  forecastRisk,
  generateCorrectiveAction,
  processNonConformity,
  analyzeIncidentPatterns,
  type Incident
} from '../lib/sgso-ai-helpers';

describe('SGSO AI Helpers', () => {
  describe('classifyIncidentWithAI', () => {
    it('should classify critical incident correctly', async () => {
      const incident: Incident = {
        description: 'Fatal accident with explosion on deck',
        type: 'Safety',
        date: new Date()
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('critical');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.reasoning).toBeTruthy();
    });
    
    it('should classify high severity incident', async () => {
      const incident: Incident = {
        description: 'Worker injury during maintenance operation',
        type: 'Safety',
        date: new Date()
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('high');
      expect(result.confidence).toBeGreaterThan(0.7);
    });
    
    it('should classify medium severity incident', async () => {
      const incident: Incident = {
        description: 'Near miss incident with minor damage',
        type: 'Safety',
        date: new Date()
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('medium');
      expect(result.confidence).toBeGreaterThan(0.6);
    });
    
    it('should classify low severity incident', async () => {
      const incident: Incident = {
        description: 'Equipment malfunction without safety impact',
        type: 'Operational',
        date: new Date()
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('low');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
    
    it('should handle empty description', async () => {
      const incident: Incident = {
        description: '',
        type: 'Unknown',
        date: new Date()
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result).toBeDefined();
      expect(result.severity).toBeTruthy();
    });
    
    it('should handle Portuguese keywords', async () => {
      const incident: Incident = {
        description: 'Acidente grave com lesão',
        type: 'Safety',
        date: new Date()
      };
      
      const result = await classifyIncidentWithAI(incident);
      
      expect(result.severity).toBe('critical');
    });
  });
  
  describe('forecastRisk', () => {
    it('should forecast increasing risk with high incident rate', async () => {
      const incidents: Incident[] = Array.from({ length: 20 }, (_, i) => ({
        description: `Incident ${i}`,
        type: 'Safety',
        severity: i % 5 === 0 ? 'critical' : 'medium',
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }));
      
      const forecast = await forecastRisk(incidents, 30);
      
      expect(forecast.trend).toBe('increasing');
      expect(forecast.riskLevel).toBe('critical');
      expect(forecast.recommendations.length).toBeGreaterThan(0);
      expect(forecast.confidence).toBeGreaterThan(0);
    });
    
    it('should forecast stable risk with moderate incident rate', async () => {
      const incidents: Incident[] = Array.from({ length: 8 }, (_, i) => ({
        description: `Incident ${i}`,
        type: 'Safety',
        severity: 'medium',
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }));
      
      const forecast = await forecastRisk(incidents, 30);
      
      expect(forecast.trend).toBe('stable');
      expect(['medium', 'low']).toContain(forecast.riskLevel);
      expect(forecast.recommendations.length).toBeGreaterThan(0);
    });
    
    it('should forecast decreasing risk with low incident rate', async () => {
      const incidents: Incident[] = Array.from({ length: 3 }, (_, i) => ({
        description: `Incident ${i}`,
        type: 'Safety',
        severity: 'low',
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }));
      
      const forecast = await forecastRisk(incidents, 30);
      
      expect(forecast.trend).toBe('decreasing');
      expect(forecast.riskLevel).toBe('low');
      expect(forecast.recommendations.length).toBeGreaterThan(0);
    });
    
    it('should handle empty incident array', async () => {
      const forecast = await forecastRisk([], 30);
      
      expect(forecast.trend).toBe('stable');
      expect(forecast.confidence).toBe(0.5);
      expect(forecast.predictedIncidents).toBe(0);
      expect(forecast.recommendations).toContain('Insufficient data for accurate forecasting');
    });
    
    it('should filter incidents by timeframe', async () => {
      const oldIncidents: Incident[] = Array.from({ length: 10 }, (_, i) => ({
        description: `Old incident ${i}`,
        type: 'Safety',
        severity: 'medium',
        date: new Date(Date.now() - (60 + i) * 24 * 60 * 60 * 1000) // 60+ days old
      }));
      
      const forecast = await forecastRisk(oldIncidents, 30);
      
      expect(forecast.predictedIncidents).toBe(0);
      expect(forecast.riskLevel).toBe('low');
    });
    
    it('should calculate predicted incidents', async () => {
      const incidents: Incident[] = Array.from({ length: 10 }, (_, i) => ({
        description: `Incident ${i}`,
        type: 'Safety',
        severity: 'medium',
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }));
      
      const forecast = await forecastRisk(incidents, 30);
      
      expect(forecast.predictedIncidents).toBeGreaterThan(0);
    });
  });
  
  describe('generateCorrectiveAction', () => {
    it('should generate critical priority action for critical incident', async () => {
      const incident: Incident = {
        description: 'Fatal accident with fire on vessel',
        type: 'Safety',
        date: new Date()
      };
      
      const action = await generateCorrectiveAction(incident);
      
      expect(action.priority).toBe('critical');
      expect(action.actions.length).toBeGreaterThan(5);
      expect(action.timeline).toContain('Immediate');
      expect(action.responsible).toBeTruthy();
      expect(action.expectedOutcome).toBeTruthy();
    });
    
    it('should generate high priority action for high severity incident', async () => {
      const incident: Incident = {
        description: 'Serious injury during operations',
        type: 'Safety',
        date: new Date()
      };
      
      const action = await generateCorrectiveAction(incident);
      
      // injury is a critical keyword, so expect critical
      expect(['critical', 'high']).toContain(action.priority);
      expect(action.actions.length).toBeGreaterThan(4);
      expect(action.timeline).toBeTruthy();
    });
    
    it('should generate medium priority action for medium severity incident', async () => {
      const incident: Incident = {
        description: 'Near miss incident reported',
        type: 'Safety',
        date: new Date()
      };
      
      const action = await generateCorrectiveAction(incident);
      
      expect(action.priority).toBe('medium');
      expect(action.actions.length).toBeGreaterThan(3);
    });
    
    it('should generate low priority action for low severity incident', async () => {
      const incident: Incident = {
        description: 'Equipment malfunction without safety impact',
        type: 'Operational',
        date: new Date()
      };
      
      const action = await generateCorrectiveAction(incident);
      
      expect(['low', 'medium']).toContain(action.priority);
      expect(action.actions.length).toBeGreaterThan(0);
      expect(action.expectedOutcome).toBeTruthy();
    });
    
    it('should include timeline in corrective action', async () => {
      const incident: Incident = {
        description: 'Safety protocol violation',
        type: 'Safety',
        date: new Date()
      };
      
      const action = await generateCorrectiveAction(incident);
      
      expect(action.timeline).toBeTruthy();
      expect(action.timeline.length).toBeGreaterThan(0);
    });
    
    it('should assign responsible parties', async () => {
      const incident: Incident = {
        description: 'Environmental compliance issue',
        type: 'Environmental',
        date: new Date()
      };
      
      const action = await generateCorrectiveAction(incident);
      
      expect(action.responsible).toBeTruthy();
      expect(action.responsible.length).toBeGreaterThan(0);
    });
  });
  
  describe('processNonConformity', () => {
    it('should identify critical non-conformity', async () => {
      const nonConformity = await processNonConformity(
        'Safety procedure violation with environmental impact',
        'SGSO'
      );
      
      expect(nonConformity.severity).toBe('critical');
      expect(nonConformity.requiresImmediateAction).toBe(true);
      expect(nonConformity.suggestedActions.length).toBeGreaterThan(4);
      expect(nonConformity.complianceStandard).toBe('SGSO');
    });
    
    it('should identify major non-conformity', async () => {
      const nonConformity = await processNonConformity(
        'Missing documentation for equipment maintenance',
        'ISO'
      );
      
      expect(nonConformity.severity).toBe('major');
      expect(nonConformity.requiresImmediateAction).toBe(false);
      expect(nonConformity.suggestedActions.length).toBeGreaterThan(3);
    });
    
    it('should identify minor non-conformity', async () => {
      const nonConformity = await processNonConformity(
        'Incorrect form filing',
        'IMCA'
      );
      
      expect(nonConformity.severity).toBe('minor');
      expect(nonConformity.requiresImmediateAction).toBe(false);
      expect(nonConformity.suggestedActions.length).toBeGreaterThan(0);
    });
    
    it('should categorize by type', async () => {
      const docNonConformity = await processNonConformity(
        'Missing documentation',
        'SGSO'
      );
      
      expect(docNonConformity.type).toBe('Documentation');
    });
    
    it('should handle different compliance standards', async () => {
      const standards = ['SGSO', 'IMCA', 'ISO', 'ANP'];
      
      for (const standard of standards) {
        const nonConformity = await processNonConformity(
          'Test non-conformity',
          standard
        );
        
        expect(nonConformity.complianceStandard).toBe(standard);
      }
    });
    
    it('should provide actionable suggestions', async () => {
      const nonConformity = await processNonConformity(
        'Training records incomplete',
        'SGSO'
      );
      
      expect(nonConformity.suggestedActions.length).toBeGreaterThan(0);
      nonConformity.suggestedActions.forEach(action => {
        expect(action.length).toBeGreaterThan(0);
      });
    });
  });
  
  describe('analyzeIncidentPatterns', () => {
    it('should identify common incident types', async () => {
      const incidents: Incident[] = [
        { description: 'Slip and fall', type: 'Safety', date: new Date() },
        { description: 'Equipment failure', type: 'Mechanical', date: new Date() },
        { description: 'Another slip', type: 'Safety', date: new Date() },
        { description: 'Tool malfunction', type: 'Mechanical', date: new Date() },
        { description: 'Safety issue', type: 'Safety', date: new Date() }
      ];
      
      const analysis = await analyzeIncidentPatterns(incidents);
      
      expect(analysis.commonTypes).toContain('Safety');
      expect(analysis.commonTypes).toContain('Mechanical');
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
    
    it('should identify hotspot locations', async () => {
      const incidents: Incident[] = [
        { description: 'Incident 1', type: 'Safety', location: 'Deck', date: new Date() },
        { description: 'Incident 2', type: 'Safety', location: 'Engine Room', date: new Date() },
        { description: 'Incident 3', type: 'Safety', location: 'Deck', date: new Date() },
        { description: 'Incident 4', type: 'Safety', location: 'Deck', date: new Date() }
      ];
      
      const analysis = await analyzeIncidentPatterns(incidents);
      
      expect(analysis.hotspots).toContain('Deck');
      expect(analysis.hotspots.length).toBeGreaterThan(0);
    });
    
    it('should handle empty incident array', async () => {
      const analysis = await analyzeIncidentPatterns([]);
      
      expect(analysis.commonTypes).toEqual([]);
      expect(analysis.hotspots).toEqual([]);
      expect(analysis.recommendations).toContain('Insufficient data for pattern analysis');
    });
    
    it('should provide recommendations based on patterns', async () => {
      const incidents: Incident[] = Array.from({ length: 5 }, (_, i) => ({
        description: `Incident ${i}`,
        type: 'Safety',
        location: 'Workshop',
        date: new Date()
      }));
      
      const analysis = await analyzeIncidentPatterns(incidents);
      
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(r => r.includes('Safety'))).toBe(true);
    });
    
    it('should limit common types to top 5', async () => {
      const types = ['Type1', 'Type2', 'Type3', 'Type4', 'Type5', 'Type6', 'Type7'];
      const incidents: Incident[] = types.flatMap((type, idx) => 
        Array.from({ length: 10 - idx }, () => ({
          description: `Incident of ${type}`,
          type,
          date: new Date()
        }))
      );
      
      const analysis = await analyzeIncidentPatterns(incidents);
      
      expect(analysis.commonTypes.length).toBeLessThanOrEqual(5);
    });
    
    it('should limit hotspots to top 3', async () => {
      const locations = ['Location1', 'Location2', 'Location3', 'Location4', 'Location5'];
      const incidents: Incident[] = locations.flatMap((location, idx) => 
        Array.from({ length: 10 - idx }, () => ({
          description: `Incident at ${location}`,
          type: 'Safety',
          location,
          date: new Date()
        }))
      );
      
      const analysis = await analyzeIncidentPatterns(incidents);
      
      expect(analysis.hotspots.length).toBeLessThanOrEqual(3);
    });
  });
});
