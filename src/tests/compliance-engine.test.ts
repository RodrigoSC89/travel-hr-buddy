/**
 * Tests for Compliance Engine
 * ETAPA 33 - Módulo de Conformidade Viva
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  processNonConformity,
  matchLogToNorm,
  generateCorrectivePlanFromGap,
  calculateComplianceScore,
  type NonConformityLog,
  type NormReference
} from '@/services/compliance-engine';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-nc-id',
              title: 'Test Non-Conformity',
              status: 'detected'
            },
            error: null
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  norm_type: 'IMCA',
                  norm_reference: 'IMCA M 103',
                  norm_clause: 'Section 4.2',
                  description: 'DP Incident Reporting and Investigation'
                })
              }
            }
          ]
        }))
      }
    }
  }))
}));

describe('Compliance Engine', () => {
  describe('matchLogToNorm', () => {
    it('should match a DP incident to IMCA M 103', async () => {
      const log: NonConformityLog = {
        source_type: 'incident',
        description: 'Loss of position during DP operations due to sensor failure',
        severity: 'high'
      };

      const norm = await matchLogToNorm(log);

      expect(norm).toBeDefined();
      expect(norm?.norm_type).toBe('IMCA');
      expect(norm?.norm_reference).toContain('IMCA');
    });

    it('should return null for logs without matching norms', async () => {
      const log: NonConformityLog = {
        source_type: 'manual',
        description: 'Random test log without specific technical content'
      };

      // Mock OpenAI to return "none"
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.OpenAI).mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: vi.fn(async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({ norm_type: 'none' })
                  }
                }
              ]
            }))
          }
        }
      } as any));

      const norm = await matchLogToNorm(log);
      expect(norm).toBeNull();
    });
  });

  describe('generateCorrectivePlanFromGap', () => {
    it('should generate a corrective action plan', async () => {
      const description = 'Gyro sensor drift detected during operations';
      const norm: NormReference = {
        norm_type: 'IMCA',
        norm_reference: 'IMCA M 103',
        norm_clause: 'Section 4.2',
        description: 'DP Incident Reporting and Investigation'
      };

      const plan = await generateCorrectivePlanFromGap(description, norm);

      expect(plan).toBeDefined();
      expect(plan.title).toBeTruthy();
      expect(plan.description).toBeTruthy();
      expect(plan.action_type).toMatch(/immediate|corrective|preventive|training/);
      expect(plan.priority).toMatch(/critical|high|medium|low/);
      expect(plan.planned_completion_days).toBeGreaterThan(0);
    });

    it('should return a fallback plan on error', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.OpenAI).mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: vi.fn(async () => {
              throw new Error('API Error');
            })
          }
        }
      } as any));

      const description = 'Test incident';
      const norm: NormReference = {
        norm_type: 'IMCA',
        norm_reference: 'IMCA M 103'
      };

      const plan = await generateCorrectivePlanFromGap(description, norm);

      expect(plan).toBeDefined();
      expect(plan.title).toBe('Corrective Action Required');
      expect(plan.action_type).toBe('corrective');
    });
  });

  describe('calculateComplianceScore', () => {
    it('should return a score between 0 and 100', async () => {
      const result = await calculateComplianceScore();

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.total_non_conformities).toBeGreaterThanOrEqual(0);
    });

    it('should return 100 when there are no non-conformities', async () => {
      const result = await calculateComplianceScore();

      // With mocked empty data, score should be 100
      expect(result.score).toBe(100);
      expect(result.breakdown.total_non_conformities).toBe(0);
    });
  });

  describe('processNonConformity', () => {
    it('should process a complete non-conformity workflow', async () => {
      const log: NonConformityLog = {
        source_type: 'incident',
        description: 'DP system malfunction during critical operations',
        severity: 'high',
        vessel_id: 'vessel-123'
      };

      const result = await processNonConformity(log);

      expect(result.success).toBe(true);
      expect(result.non_conformity_id).toBeDefined();
      expect(result.actions_created).toBeGreaterThan(0);
      expect(result.evidence_stored).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock OpenAI to return no matching norm
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.OpenAI).mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: vi.fn(async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({ norm_type: 'none' })
                  }
                }
              ]
            }))
          }
        }
      } as any));

      const log: NonConformityLog = {
        source_type: 'manual',
        description: 'Test log without norm'
      };

      const result = await processNonConformity(log);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
