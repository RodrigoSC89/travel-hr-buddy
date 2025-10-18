import { describe, it, expect } from 'vitest';
import { processNonConformity, type NonConformity } from '../../src/utils/sgso-ai-helpers';

describe('processNonConformity', () => {
  it('should process major non-conformity', async () => {
    const nonConformity: NonConformity = {
      id: '1',
      norm: 'IMCA M117',
      clause: '4.2.1',
      description: 'Critical failure in DP system compliance',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.severity).toBe('Major');
    expect(result.compliance_gap).toBeGreaterThan(50);
  });

  it('should process significant non-conformity', async () => {
    const nonConformity: NonConformity = {
      id: '2',
      norm: 'ISO 9001',
      clause: '8.3',
      description: 'Significant gap in quality management procedures',
      status: 'in_progress',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.severity).toBe('Significant');
    expect(result.compliance_gap).toBeLessThan(75);
    expect(result.compliance_gap).toBeGreaterThan(25);
  });

  it('should process minor non-conformity', async () => {
    const nonConformity: NonConformity = {
      id: '3',
      norm: 'ISO 14001',
      clause: '6.1.2',
      description: 'Documentation needs minor update',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.severity).toBe('Minor');
    expect(result.compliance_gap).toBeLessThanOrEqual(50);
  });

  it('should generate impact assessment', async () => {
    const nonConformity: NonConformity = {
      id: '4',
      norm: 'IMCA M190',
      clause: '5.1',
      description: 'Non-compliance with safety procedures',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.impact_assessment).toBeDefined();
    expect(result.impact_assessment.length).toBeGreaterThan(0);
    expect(result.impact_assessment).toContain(nonConformity.norm);
    expect(result.impact_assessment).toContain(nonConformity.clause);
  });

  it('should generate corrective plan', async () => {
    const nonConformity: NonConformity = {
      id: '5',
      norm: 'IMCA M103',
      clause: '3.2',
      description: 'Training requirements not met',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.corrective_plan).toBeDefined();
    expect(Array.isArray(result.corrective_plan)).toBe(true);
    expect(result.corrective_plan.length).toBeGreaterThan(0);
    expect(result.corrective_plan.some(item => item.includes('Review'))).toBe(true);
  });

  it('should generate preventive measures', async () => {
    const nonConformity: NonConformity = {
      id: '6',
      norm: 'ISO 45001',
      clause: '9.1',
      description: 'Monitoring procedures inadequate',
      status: 'in_progress',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.preventive_measures).toBeDefined();
    expect(Array.isArray(result.preventive_measures)).toBe(true);
    expect(result.preventive_measures.length).toBeGreaterThan(0);
  });

  it('should include compliance audit in preventive measures', async () => {
    const nonConformity: NonConformity = {
      id: '7',
      norm: 'IMCA M117',
      clause: '2.1',
      description: 'System audit required',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.preventive_measures.some(m => m.toLowerCase().includes('audit'))).toBe(true);
  });

  it('should include training in preventive measures', async () => {
    const nonConformity: NonConformity = {
      id: '8',
      norm: 'ISO 9001',
      clause: '7.2',
      description: 'Competency requirements not documented',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.preventive_measures.some(m => m.toLowerCase().includes('training'))).toBe(true);
  });

  it('should return valid processing structure', async () => {
    const nonConformity: NonConformity = {
      id: '9',
      norm: 'IMCA M140',
      clause: '4.5',
      description: 'Test non-conformity',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('impact_assessment');
    expect(result).toHaveProperty('corrective_plan');
    expect(result).toHaveProperty('preventive_measures');
    expect(result).toHaveProperty('compliance_gap');
    expect(typeof result.severity).toBe('string');
    expect(typeof result.impact_assessment).toBe('string');
    expect(Array.isArray(result.corrective_plan)).toBe(true);
    expect(Array.isArray(result.preventive_measures)).toBe(true);
    expect(typeof result.compliance_gap).toBe('number');
  });

  it('should calculate compliance gap between 0 and 100', async () => {
    const nonConformity: NonConformity = {
      id: '10',
      norm: 'ISO 27001',
      clause: '5.1',
      description: 'Information security policy gap',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.compliance_gap).toBeGreaterThanOrEqual(0);
    expect(result.compliance_gap).toBeLessThanOrEqual(100);
  });

  it('should include gap analysis in corrective plan', async () => {
    const nonConformity: NonConformity = {
      id: '11',
      norm: 'IMCA M103',
      clause: '6.1',
      description: 'Certification requirements not met',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.corrective_plan.some(item => item.toLowerCase().includes('gap analysis'))).toBe(true);
  });

  it('should include action plan in corrective measures', async () => {
    const nonConformity: NonConformity = {
      id: '12',
      norm: 'ISO 50001',
      clause: '4.4',
      description: 'Energy management procedures missing',
      status: 'open',
    };

    const result = await processNonConformity(nonConformity);

    expect(result.corrective_plan.some(item => item.toLowerCase().includes('action plan'))).toBe(true);
  });

  it('should handle resolved non-conformities', async () => {
    const nonConformity: NonConformity = {
      id: '13',
      norm: 'IMCA M117',
      clause: '3.1',
      description: 'Previously resolved issue',
      status: 'resolved',
    };

    const result = await processNonConformity(nonConformity);

    expect(result).toBeDefined();
    expect(result.corrective_plan.length).toBeGreaterThan(0);
    expect(result.preventive_measures.length).toBeGreaterThan(0);
  });
});
