/**
 * useRiskScoring Hook
 * React interface for dynamic risk scoring engine
 */

import { useState, useCallback } from 'react';
import { 
  riskScoringEngine, 
  type RiskAssessmentInput, 
  type RiskScore
} from '@/lib/ai/engines/risk-scoring';

export interface UseRiskScoringReturn {
  isProcessing: boolean;
  lastAssessment: RiskScore | null;
  assessRisk: (input: RiskAssessmentInput) => RiskScore;
}

export function useRiskScoring(): UseRiskScoringReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAssessment, setLastAssessment] = useState<RiskScore | null>(null);

  const assessRisk = useCallback((input: RiskAssessmentInput): RiskScore => {
    setIsProcessing(true);
    try {
      const assessment = riskScoringEngine.assessRisk(input);
      setLastAssessment(assessment);
      return assessment;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    lastAssessment,
    assessRisk
  };
}
