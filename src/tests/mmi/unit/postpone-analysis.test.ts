import { describe, it, expect, beforeEach } from 'vitest';

// Types for postponement analysis
interface PostponementRequest {
  jobId: string;
  reason: string;
  requested_new_date: string;
  context?: string;
}

interface ImpactAssessment {
  safety: string;
  operational: string;
  financial: string;
  compliance: string;
}

interface PostponementAnalysis {
  recommendation: 'approve' | 'conditional' | 'reject';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  conditions?: string[];
  impact_assessment: ImpactAssessment;
  max_postponement_days?: number;
  new_recommended_date?: string;
  confidence_score: number;
  timestamp: string;
}

// Mock postponement analysis service
class PostponementService {
  analyzePostponement(request: PostponementRequest, jobPriority: string, jobType: string): PostponementAnalysis {
    // Validation
    if (!request.jobId || !request.reason || !request.requested_new_date) {
      throw new Error('Missing required fields');
    }

    // Parse dates
    const requestedDate = new Date(request.requested_new_date);
    if (isNaN(requestedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const currentDate = new Date();
    const daysDifference = Math.ceil((requestedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    // Critical jobs cannot be postponed
    if (jobPriority === 'critical') {
      return {
        recommendation: 'reject',
        risk_level: 'critical',
        conditions: ['Manutenção crítica não pode ser postergada'],
        impact_assessment: {
          safety: 'Risco crítico - falha pode causar acidentes graves',
          operational: 'Operação pode ser comprometida a qualquer momento',
          financial: 'Custo de falha pode ser extremamente alto',
          compliance: 'Violação de normas de segurança marítima',
        },
        confidence_score: 0.95,
        timestamp: new Date().toISOString(),
      };
    }

    // Analyze based on priority and postponement period
    let recommendation: 'approve' | 'conditional' | 'reject' = 'approve';
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let conditions: string[] = [];
    let max_postponement_days = 30;

    if (jobPriority === 'high') {
      if (daysDifference > 30) {
        recommendation = 'reject';
        risk_level = 'high';
      } else if (daysDifference > 15) {
        recommendation = 'conditional';
        risk_level = 'medium';
        conditions = [
          'Monitorar diariamente o componente',
          'Limitar operação a 80% da capacidade',
          'Ter peças de reposição disponíveis',
        ];
      } else {
        recommendation = 'conditional';
        risk_level = 'low';
        conditions = ['Monitorar semanalmente o componente'];
      }
      max_postponement_days = 30;
    } else if (jobPriority === 'medium') {
      if (daysDifference > 60) {
        recommendation = 'reject';
        risk_level = 'medium';
      } else if (daysDifference > 30) {
        recommendation = 'conditional';
        risk_level = 'medium';
        conditions = ['Realizar inspeção visual semanal'];
      } else {
        recommendation = 'approve';
        risk_level = 'low';
      }
      max_postponement_days = 60;
    } else {
      // Low priority
      recommendation = 'approve';
      risk_level = 'low';
      max_postponement_days = 90;
    }

    // Generate impact assessment
    const impact_assessment: ImpactAssessment = {
      safety: this.generateSafetyImpact(risk_level),
      operational: this.generateOperationalImpact(risk_level),
      financial: this.generateFinancialImpact(risk_level, jobType),
      compliance: this.generateComplianceImpact(risk_level, daysDifference),
    };

    // Calculate confidence score
    const confidence_score = this.calculateConfidence(jobPriority, daysDifference, jobType);

    return {
      recommendation,
      risk_level,
      conditions: conditions.length > 0 ? conditions : undefined,
      impact_assessment,
      max_postponement_days,
      new_recommended_date: requestedDate.toISOString(),
      confidence_score,
      timestamp: new Date().toISOString(),
    };
  }

  private generateSafetyImpact(risk_level: string): string {
    const impacts = {
      low: 'Risco baixo - componente pode operar com segurança',
      medium: 'Risco moderado - monitoramento necessário',
      high: 'Risco alto - operação não recomendada',
      critical: 'Risco crítico - operação deve ser interrompida',
    };
    return impacts[risk_level as keyof typeof impacts];
  }

  private generateOperationalImpact(risk_level: string): string {
    const impacts = {
      low: 'Impacto operacional mínimo',
      medium: 'Possível redução de eficiência em 10-15%',
      high: 'Redução significativa de performance',
      critical: 'Operação comprometida',
    };
    return impacts[risk_level as keyof typeof impacts];
  }

  private generateFinancialImpact(risk_level: string, jobType: string): string {
    const multiplier = jobType === 'preventive' ? 1 : 2;
    const impacts = {
      low: `Custo adicional estimado: ${multiplier * 5}%`,
      medium: `Custo pode aumentar ${multiplier * 20}% se falha ocorrer`,
      high: `Custo pode aumentar ${multiplier * 50}% ou mais`,
      critical: 'Custo de falha catastrófica',
    };
    return impacts[risk_level as keyof typeof impacts];
  }

  private generateComplianceImpact(risk_level: string, days: number): string {
    if (days <= 30) {
      return 'Dentro dos limites NORMAM para postponamento de 30 dias';
    } else if (days <= 60) {
      return 'Requer justificativa conforme SOLAS e MARPOL';
    } else {
      return 'Pode violar regulamentações marítimas';
    }
  }

  private calculateConfidence(priority: string, days: number, jobType: string): number {
    let base = 0.9;
    
    if (priority === 'critical') base = 0.95;
    if (days > 60) base -= 0.2;
    if (jobType === 'corrective') base -= 0.1;
    
    return Math.max(0.5, Math.min(0.99, base));
  }
}

describe('MMI Unit Tests: Postponement Analysis', () => {
  let service: PostponementService;

  beforeEach(() => {
    service = new PostponementService();
  });

  describe('Basic Analysis', () => {
    it('should analyze postponement request successfully', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Embarcação em viagem crítica',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.risk_level).toBeDefined();
      expect(result.impact_assessment).toBeDefined();
      expect(result.confidence_score).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should return proper structure for impact assessment', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test reason',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'low', 'preventive');

      expect(result.impact_assessment).toHaveProperty('safety');
      expect(result.impact_assessment).toHaveProperty('operational');
      expect(result.impact_assessment).toHaveProperty('financial');
      expect(result.impact_assessment).toHaveProperty('compliance');
    });

    it('should include confidence score between 0 and 1', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test reason',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.confidence_score).toBeGreaterThanOrEqual(0.5);
      expect(result.confidence_score).toBeLessThanOrEqual(0.99);
    });
  });

  describe('Validation Tests', () => {
    it('should throw error for missing jobId', () => {
      expect(() => {
        service.analyzePostponement({
          jobId: '',
          reason: 'Test',
          requested_new_date: new Date().toISOString(),
        }, 'medium', 'preventive');
      }).toThrow('Missing required fields');
    });

    it('should throw error for missing reason', () => {
      expect(() => {
        service.analyzePostponement({
          jobId: 'job-001',
          reason: '',
          requested_new_date: new Date().toISOString(),
        }, 'medium', 'preventive');
      }).toThrow('Missing required fields');
    });

    it('should throw error for invalid date', () => {
      expect(() => {
        service.analyzePostponement({
          jobId: 'job-001',
          reason: 'Test',
          requested_new_date: 'invalid-date',
        }, 'medium', 'preventive');
      }).toThrow('Invalid date format');
    });
  });

  describe('Critical Priority Handling', () => {
    it('should reject critical priority jobs', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Embarcação em viagem',
        requested_new_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'critical', 'preventive');

      expect(result.recommendation).toBe('reject');
      expect(result.risk_level).toBe('critical');
      expect(result.conditions).toContain('Manutenção crítica não pode ser postergada');
    });

    it('should have high confidence score for critical rejection', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'critical', 'preventive');

      expect(result.confidence_score).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('High Priority Analysis', () => {
    it('should conditionally approve short postponement for high priority', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Missão urgente',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'high', 'preventive');

      expect(result.recommendation).toBe('conditional');
      expect(result.risk_level).toBe('low');
      expect(result.conditions).toBeDefined();
    });

    it('should require more conditions for longer postponement', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Missão urgente',
        requested_new_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'high', 'preventive');

      expect(result.recommendation).toBe('conditional');
      expect(result.risk_level).toBe('medium');
      expect(result.conditions?.length).toBeGreaterThan(1);
    });

    it('should reject very long postponement for high priority', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Missão urgente',
        requested_new_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'high', 'preventive');

      expect(result.recommendation).toBe('reject');
      expect(result.risk_level).toBe('high');
    });
  });

  describe('Medium Priority Analysis', () => {
    it('should approve short postponement for medium priority', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Viagem programada',
        requested_new_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.recommendation).toBe('approve');
      expect(result.risk_level).toBe('low');
    });

    it('should conditionally approve medium-term postponement', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Viagem programada',
        requested_new_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.recommendation).toBe('conditional');
      expect(result.conditions).toBeDefined();
    });

    it('should set max postponement days to 60 for medium priority', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.max_postponement_days).toBe(60);
    });
  });

  describe('Low Priority Analysis', () => {
    it('should approve postponement for low priority jobs', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Rotina de manutenção',
        requested_new_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'low', 'inspection');

      expect(result.recommendation).toBe('approve');
      expect(result.risk_level).toBe('low');
    });

    it('should set max postponement days to 90 for low priority', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'low', 'inspection');

      expect(result.max_postponement_days).toBe(90);
    });
  });

  describe('Impact Assessment Details', () => {
    it('should provide safety impact description', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.impact_assessment.safety).toBeDefined();
      expect(result.impact_assessment.safety.length).toBeGreaterThan(0);
    });

    it('should provide operational impact description', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.impact_assessment.operational).toBeDefined();
      expect(result.impact_assessment.operational.length).toBeGreaterThan(0);
    });

    it('should provide financial impact with cost estimates', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.impact_assessment.financial).toBeDefined();
      expect(result.impact_assessment.financial).toMatch(/\d+%|custo/i);
    });

    it('should provide compliance impact with maritime norms', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'preventive');

      expect(result.impact_assessment.compliance).toBeDefined();
      expect(result.impact_assessment.compliance).toMatch(/NORMAM|SOLAS|MARPOL|regulament/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle same-day postponement request', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Emergency',
        requested_new_date: new Date().toISOString(),
      };

      const result = service.analyzePostponement(request, 'low', 'preventive');

      expect(result).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });

    it('should handle very long postponement request', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Long-term plan',
        requested_new_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'low', 'preventive');

      expect(result).toBeDefined();
    });

    it('should handle corrective maintenance type', () => {
      const request: PostponementRequest = {
        jobId: 'job-001',
        reason: 'Test',
        requested_new_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = service.analyzePostponement(request, 'medium', 'corrective');

      expect(result.confidence_score).toBeLessThan(0.9);
      expect(result.impact_assessment.financial).toMatch(/\d+%/);
    });
  });
});
