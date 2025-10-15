import { describe, it, expect } from 'vitest';

/**
 * MMI Postponement Analysis - Unit Tests
 * Tests for AI-powered risk assessment and postponement decisions
 */

// Type definitions
interface PostponementRequest {
  job_id: string;
  current_priority: 'low' | 'medium' | 'high' | 'critical';
  current_due_date: string;
  requested_new_date: string;
  reason: string;
  component_hours?: number;
  maintenance_interval?: number;
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  confidence: number;
}

interface PostponementResult {
  recommendation: 'approved' | 'conditional' | 'denied';
  risk_assessment: RiskAssessment;
  new_date?: string;
  message: string;
}

// Business logic functions
function calculatePostponementDays(currentDate: string, newDate: string): number {
  const current = new Date(currentDate);
  const requested = new Date(newDate);
  return Math.ceil((requested.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateComponentUsagePercentage(currentHours?: number, interval?: number): number {
  if (!currentHours || !interval) return 0;
  return (currentHours / interval) * 100;
}

function analyzePostponement(request: PostponementRequest): PostponementResult {
  const factors: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let confidence = 0.95;

  // Critical priority jobs cannot be postponed
  if (request.current_priority === 'critical') {
    return {
      recommendation: 'denied',
      risk_assessment: {
        level: 'critical',
        factors: ['critical_priority', 'safety_impact'],
        confidence: 0.99
      },
      message: 'Jobs críticos não podem ser adiados devido ao impacto na segurança operacional.'
    };
  }

  // Calculate postponement duration
  const postponementDays = calculatePostponementDays(
    request.current_due_date,
    request.requested_new_date
  );

  // Component hourometer analysis
  const usagePercentage = calculateComponentUsagePercentage(
    request.component_hours,
    request.maintenance_interval
  );

  // Risk factor: Component near maintenance threshold
  if (usagePercentage >= 95) {
    factors.push('component_near_limit');
    riskLevel = 'high';
    confidence = 0.75;
  } else if (usagePercentage >= 85) {
    factors.push('component_approaching_limit');
    riskLevel = usagePercentage >= 90 ? 'high' : 'medium';
    confidence = 0.85;
  }

  // Risk factor: Long postponement period
  if (postponementDays > 30) {
    factors.push('extended_postponement');
    riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    confidence -= 0.1;
  } else if (postponementDays > 14) {
    factors.push('moderate_postponement');
  }

  // Risk factor: High priority
  if (request.current_priority === 'high') {
    factors.push('high_priority');
    riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    confidence -= 0.05;
  }

  // Risk factor: Valid operational reason
  const validReasons = ['viagem crítica', 'operação especial', 'condições climáticas'];
  const hasValidReason = validReasons.some(r => 
    request.reason.toLowerCase().includes(r)
  );

  if (hasValidReason) {
    factors.push('valid_operational_reason');
    confidence += 0.05;
  }

  // Determine recommendation
  let recommendation: 'approved' | 'conditional' | 'denied' = 'approved';
  let message = 'Postergamento aprovado com baixo risco.';

  if (riskLevel === 'high' && usagePercentage >= 90) {
    recommendation = 'denied';
    message = 'Postergamento negado devido ao alto risco operacional.';
  } else if (riskLevel === 'medium' || (riskLevel === 'high' && usagePercentage < 90)) {
    recommendation = 'conditional';
    message = 'Postergamento aprovado condicionalmente. Monitoramento adicional recomendado.';
  }

  return {
    recommendation,
    risk_assessment: {
      level: riskLevel,
      factors,
      confidence: Math.max(0.5, Math.min(0.99, confidence))
    },
    new_date: recommendation !== 'denied' ? request.requested_new_date : undefined,
    message
  };
}

describe('MMI Postponement Analysis', () => {
  describe('Risk Assessment Logic', () => {
    it('should approve low-risk postponement', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Embarcação em viagem crítica',
        component_hours: 500,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('approved');
      expect(result.risk_assessment.level).toBe('low');
    });

    it('should deny critical priority jobs', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'critical',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Qualquer razão'
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('denied');
      expect(result.risk_assessment.level).toBe('critical');
    });

    it('should flag component near limit', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Viagem programada',
        component_hours: 960,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.risk_assessment.factors).toContain('component_near_limit');
      expect(result.risk_assessment.level).toBe('high');
    });

    it('should flag extended postponement', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'low',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-12-20',
        reason: 'Planejamento operacional',
        component_hours: 500,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.risk_assessment.factors).toContain('extended_postponement');
    });

    it('should provide conditional approval for medium risk', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-25',
        reason: 'Operação especial',
        component_hours: 850,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('conditional');
      expect(result.risk_assessment.level).toBe('medium');
    });
  });

  describe('Impact Analysis', () => {
    it('should consider component hours vs maintenance interval', () => {
      const highUsage: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Teste',
        component_hours: 950,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(highUsage);
      expect(result.risk_assessment.factors).toContain('component_near_limit');
    });

    it('should calculate postponement duration correctly', () => {
      const days = calculatePostponementDays('2025-11-15', '2025-11-30');
      expect(days).toBe(15);
    });

    it('should calculate component usage percentage', () => {
      const percentage = calculateComponentUsagePercentage(850, 1000);
      expect(percentage).toBe(85);
    });

    it('should handle missing component data gracefully', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Teste'
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('approved');
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for clear cases', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'low',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-18',
        reason: 'Pequeno ajuste',
        component_hours: 300,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.risk_assessment.confidence).toBeGreaterThan(0.9);
    });

    it('should have lower confidence for complex scenarios', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'high',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-12-15',
        reason: 'Motivo complexo',
        component_hours: 900,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.risk_assessment.confidence).toBeLessThan(0.85);
    });

    it('should adjust confidence based on valid reasons', () => {
      const validReason: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Embarcação em viagem crítica',
        component_hours: 700,
        maintenance_interval: 1000
      };

      const invalidReason: PostponementRequest = {
        ...validReason,
        reason: 'Sem motivo específico'
      };

      const resultValid = analyzePostponement(validReason);
      const resultInvalid = analyzePostponement(invalidReason);

      expect(resultValid.risk_assessment.confidence).toBeGreaterThan(
        resultInvalid.risk_assessment.confidence
      );
    });

    it('should keep confidence within valid range', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'high',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-12-30',
        reason: 'Longo adiamento',
        component_hours: 980,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.risk_assessment.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.risk_assessment.confidence).toBeLessThanOrEqual(0.99);
    });
  });

  describe('Priority-Based Logic', () => {
    it('should treat critical priority specially', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'critical',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-16',
        reason: 'Emergência operacional',
        component_hours: 100,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('denied');
      expect(result.risk_assessment.confidence).toBeGreaterThan(0.95);
    });

    it('should increase risk for high priority jobs', () => {
      const highPriority: PostponementRequest = {
        job_id: '123',
        current_priority: 'high',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Teste',
        component_hours: 500,
        maintenance_interval: 1000
      };

      const mediumPriority: PostponementRequest = {
        ...highPriority,
        current_priority: 'medium'
      };

      const resultHigh = analyzePostponement(highPriority);
      const resultMedium = analyzePostponement(mediumPriority);

      expect(resultHigh.risk_assessment.level).not.toBe('low');
      expect(resultMedium.risk_assessment.level).toBe('low');
    });

    it('should allow low priority postponements more easily', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'low',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-25',
        reason: 'Planejamento',
        component_hours: 700,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('approved');
    });
  });

  describe('Edge Cases', () => {
    it('should handle same-day postponement', () => {
      const today = new Date().toISOString().split('T')[0];
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: today,
        requested_new_date: today,
        reason: 'Mesmo dia'
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('approved');
    });

    it('should handle very long postponement', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'low',
        current_due_date: '2025-11-15',
        requested_new_date: '2026-01-15',
        reason: 'Adiamento longo'
      };

      const result = analyzePostponement(request);
      expect(result.risk_assessment.factors).toContain('extended_postponement');
    });

    it('should handle component at exactly 95% usage', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'medium',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Teste limite',
        component_hours: 950,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.recommendation).toBe('denied');
    });
  });

  describe('Message Generation', () => {
    it('should provide appropriate message for approved', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'low',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-18',
        reason: 'Ajuste'
      };

      const result = analyzePostponement(request);
      expect(result.message).toContain('aprovado');
    });

    it('should provide appropriate message for denied', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'critical',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-20',
        reason: 'Tentativa'
      };

      const result = analyzePostponement(request);
      expect(result.message).toContain('não podem ser adiados');
    });

    it('should provide appropriate message for conditional', () => {
      const request: PostponementRequest = {
        job_id: '123',
        current_priority: 'high',
        current_due_date: '2025-11-15',
        requested_new_date: '2025-11-22',
        reason: 'Operação especial',
        component_hours: 850,
        maintenance_interval: 1000
      };

      const result = analyzePostponement(request);
      expect(result.message).toContain('condicionalmente');
    });
  });
});
