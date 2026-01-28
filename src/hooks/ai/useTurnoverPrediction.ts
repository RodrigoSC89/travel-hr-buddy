/**
 * useTurnoverPrediction Hook
 * Interface for crew turnover prediction
 */

import { useState, useCallback } from 'react';
import { 
  turnoverPredictionEngine,
  type CrewMember,
  type TurnoverPrediction,
  type TurnoverAnalytics
} from '@/lib/ai/engines/turnover-prediction';
import { toast } from 'sonner';

export function useTurnoverPrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<TurnoverPrediction[]>([]);
  const [analytics, setAnalytics] = useState<TurnoverAnalytics | null>(null);

  const analyzeCrew = useCallback((crewMembers: CrewMember[]) => {
    setIsLoading(true);
    try {
      const results = turnoverPredictionEngine.predictTurnover(crewMembers);
      setPredictions(results);
      
      const highRisk = results.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high');
      if (highRisk.length > 0) {
        toast.warning(`${highRisk.length} tripulante(s) em risco de saída`);
      }
      
      const analyticsResult = turnoverPredictionEngine.generateAnalytics(results);
      setAnalytics(analyticsResult);
      
      return results;
    } catch (error) {
      console.error('[useTurnoverPrediction] Error:', error);
      toast.error('Erro na análise de turnover');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHighRiskCrew = useCallback(() => {
    return predictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
  }, [predictions]);

  const getRetentionActions = useCallback(() => {
    return predictions.flatMap(p => p.retentionActions);
  }, [predictions]);

  return {
    isLoading,
    predictions,
    analytics,
    analyzeCrew,
    getHighRiskCrew,
    getRetentionActions
  };
}
