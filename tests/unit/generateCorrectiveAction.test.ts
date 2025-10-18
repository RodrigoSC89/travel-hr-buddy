import { describe, it, expect } from 'vitest';
import { generateCorrectiveAction, type Incident, type IncidentClassification } from '../../src/utils/sgso-ai-helpers';

describe('generateCorrectiveAction', () => {
  it('should generate urgent actions for critical incidents', async () => {
    const incident: Incident = {
      id: '1',
      title: 'Critical Incident',
      description: 'Critical safety incident',
    };

    const classification: IncidentClassification = {
      severity: 'critical',
      category: 'Equipment Failure',
      risk_level: 10,
      recommendations: [],
      confidence: 0.9,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.priority).toBe('urgent');
    expect(result.deadline).toBe('24 hours');
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions.some(a => a.includes('immediate') || a.includes('emergency'))).toBe(true);
  });

  it('should generate high priority actions for high severity incidents', async () => {
    const incident: Incident = {
      id: '2',
      title: 'High Severity Incident',
      description: 'Serious equipment malfunction',
    };

    const classification: IncidentClassification = {
      severity: 'high',
      category: 'Equipment Failure',
      risk_level: 8,
      recommendations: [],
      confidence: 0.85,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.priority).toBe('high');
    expect(result.deadline).toBe('7 days');
    expect(result.actions.length).toBeGreaterThan(3);
  });

  it('should generate medium priority actions for medium severity incidents', async () => {
    const incident: Incident = {
      id: '3',
      title: 'Medium Incident',
      description: 'Near miss event',
    };

    const classification: IncidentClassification = {
      severity: 'medium',
      category: 'Procedural',
      risk_level: 5,
      recommendations: [],
      confidence: 0.8,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.priority).toBe('medium');
    expect(result.deadline).toBe('30 days');
  });

  it('should generate low priority actions for low severity incidents', async () => {
    const incident: Incident = {
      id: '4',
      title: 'Minor Issue',
      description: 'Documentation update needed',
    };

    const classification: IncidentClassification = {
      severity: 'low',
      category: 'General',
      risk_level: 2,
      recommendations: [],
      confidence: 0.75,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.priority).toBe('low');
    expect(result.deadline).toBe('90 days');
  });

  it('should include documentation action', async () => {
    const incident: Incident = {
      id: '5',
      title: 'Test Incident',
      description: 'Test',
    };

    const classification: IncidentClassification = {
      severity: 'medium',
      category: 'General',
      risk_level: 5,
      recommendations: [],
      confidence: 0.8,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.actions.some(a => a.toLowerCase().includes('document'))).toBe(true);
  });

  it('should include training recommendation', async () => {
    const incident: Incident = {
      id: '6',
      title: 'Training Issue',
      description: 'Crew needs additional training',
    };

    const classification: IncidentClassification = {
      severity: 'medium',
      category: 'Human Factor',
      risk_level: 6,
      recommendations: [],
      confidence: 0.8,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.actions.some(a => a.toLowerCase().includes('training'))).toBe(true);
  });

  it('should specify resources needed', async () => {
    const incident: Incident = {
      id: '7',
      title: 'Resource Intensive',
      description: 'Complex incident requiring multiple resources',
    };

    const classification: IncidentClassification = {
      severity: 'high',
      category: 'Equipment Failure',
      risk_level: 8,
      recommendations: [],
      confidence: 0.85,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.resources_needed.length).toBeGreaterThan(0);
    expect(Array.isArray(result.resources_needed)).toBe(true);
  });

  it('should return valid structure', async () => {
    const incident: Incident = {
      id: '8',
      title: 'Validation Test',
      description: 'Testing structure',
    };

    const classification: IncidentClassification = {
      severity: 'medium',
      category: 'General',
      risk_level: 5,
      recommendations: [],
      confidence: 0.8,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result).toHaveProperty('priority');
    expect(result).toHaveProperty('actions');
    expect(result).toHaveProperty('responsible');
    expect(result).toHaveProperty('deadline');
    expect(result).toHaveProperty('resources_needed');
    expect(Array.isArray(result.actions)).toBe(true);
    expect(Array.isArray(result.resources_needed)).toBe(true);
    expect(typeof result.responsible).toBe('string');
    expect(typeof result.deadline).toBe('string');
  });

  it('should require investigation for critical incidents', async () => {
    const incident: Incident = {
      id: '9',
      title: 'Critical Event',
      description: 'Critical incident requiring investigation',
    };

    const classification: IncidentClassification = {
      severity: 'critical',
      category: 'Equipment Failure',
      risk_level: 10,
      recommendations: [],
      confidence: 0.9,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.actions.some(a => a.toLowerCase().includes('investigation'))).toBe(true);
  });

  it('should include procedure updates', async () => {
    const incident: Incident = {
      id: '10',
      title: 'Procedure Gap',
      description: 'Safety procedure needs update',
    };

    const classification: IncidentClassification = {
      severity: 'medium',
      category: 'Procedural',
      risk_level: 6,
      recommendations: [],
      confidence: 0.8,
    };

    const result = await generateCorrectiveAction(incident, classification);

    expect(result.actions.some(a => a.toLowerCase().includes('procedure') || a.toLowerCase().includes('protocol'))).toBe(true);
  });
});
