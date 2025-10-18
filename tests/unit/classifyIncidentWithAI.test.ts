import { describe, it, expect } from 'vitest';
import { classifyIncidentWithAI, type Incident } from '../../src/utils/sgso-ai-helpers';

describe('classifyIncidentWithAI', () => {
  it('should classify a critical incident correctly', async () => {
    const incident: Incident = {
      id: '1',
      title: 'Fatal Equipment Failure',
      description: 'Critical equipment failure leading to fatal accident on deck',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.severity).toBe('critical');
    expect(result.risk_level).toBeGreaterThan(8);
    expect(result.category).toBe('Equipment Failure');
    expect(result.recommendations).toHaveLength(4);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should classify a high severity incident', async () => {
    const incident: Incident = {
      id: '2',
      title: 'Crew Injury',
      description: 'Serious injury occurred during equipment operation',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.severity).toBe('high');
    expect(result.risk_level).toBeGreaterThanOrEqual(5);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should classify a medium severity incident', async () => {
    const incident: Incident = {
      id: '3',
      title: 'Near Miss Event',
      description: 'Minor near miss event with no injuries',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.severity).toBe('medium');
    expect(result.risk_level).toBeLessThan(7);
  });

  it('should classify a low severity incident', async () => {
    const incident: Incident = {
      id: '4',
      title: 'Documentation Issue',
      description: 'Missing documentation for routine procedure',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.severity).toBe('low');
    expect(result.risk_level).toBeLessThanOrEqual(4);
  });

  it('should identify equipment failure category', async () => {
    const incident: Incident = {
      id: '5',
      title: 'Machine Breakdown',
      description: 'Machinery malfunction during operations',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.category).toBe('Equipment Failure');
  });

  it('should identify human factor category', async () => {
    const incident: Incident = {
      id: '6',
      title: 'Crew Error',
      description: 'Personnel mistake during routine operations',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.category).toBe('Human Factor');
  });

  it('should identify environmental category', async () => {
    const incident: Incident = {
      id: '7',
      title: 'Weather Related',
      description: 'Incident caused by adverse weather conditions',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.category).toBe('Environmental');
  });

  it('should identify procedural category', async () => {
    const incident: Incident = {
      id: '8',
      title: 'Protocol Violation',
      description: 'Failure to follow established safety procedure',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result.category).toBe('Procedural');
  });

  it('should return valid classification structure', async () => {
    const incident: Incident = {
      id: '9',
      title: 'Test Incident',
      description: 'Test incident for validation',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('risk_level');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('confidence');
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.confidence).toBe('number');
  });

  it('should handle incidents with minimal description', async () => {
    const incident: Incident = {
      id: '10',
      title: 'Brief',
      description: 'Issue',
    };

    const result = await classifyIncidentWithAI(incident);

    expect(result).toBeDefined();
    expect(result.severity).toBeDefined();
    expect(result.category).toBeDefined();
  });
});
