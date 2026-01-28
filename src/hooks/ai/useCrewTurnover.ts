/**
 * useCrewTurnover Hook
 * Interface para predição de turnover e análise de retenção
 */

import { useState, useCallback } from 'react';
import { 
  turnoverPredictionEngine,
  type CrewMemberProfile,
  type TurnoverPrediction,
  type RetentionAction,
  type TeamTurnoverAnalysis
} from '@/lib/ai/engines/turnover-prediction';
import { toast } from 'sonner';

interface UseCrewTurnoverReturn {
  isLoading: boolean;
  predictions: TurnoverPrediction[];
  teamAnalysis: TeamTurnoverAnalysis | null;
  predictTurnover: (profile: CrewMemberProfile) => TurnoverPrediction;
  analyzeTeam: (profiles: CrewMemberProfile[], department?: string) => TeamTurnoverAnalysis;
  getRetentionActions: (prediction: TurnoverPrediction) => RetentionAction[];
  getHighRiskCrew: () => TurnoverPrediction[];
  clearAnalysis: () => void;
}

export function useCrewTurnover(): UseCrewTurnoverReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<TurnoverPrediction[]>([]);
  const [teamAnalysis, setTeamAnalysis] = useState<TeamTurnoverAnalysis | null>(null);

  const predictTurnover = useCallback((profile: CrewMemberProfile): TurnoverPrediction => {
    setIsLoading(true);
    try {
      const prediction = turnoverPredictionEngine.predictTurnover(profile);
      setPredictions(prev => {
        const existing = prev.findIndex(p => p.crewMemberId === prediction.crewMemberId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = prediction;
          return updated;
        }
        return [...prev, prediction];
      });
      
      if (prediction.riskLevel === 'critical') {
        toast.error(`⚠️ Risco crítico de turnover: ${profile.name}`, {
          description: `${prediction.turnoverRisk}% de probabilidade`
        });
      } else if (prediction.riskLevel === 'high') {
        toast.warning(`Risco alto de turnover: ${profile.name}`);
      }
      
      return prediction;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeTeam = useCallback((profiles: CrewMemberProfile[], department?: string): TeamTurnoverAnalysis => {
    setIsLoading(true);
    try {
      const analysis = turnoverPredictionEngine.analyzeTeam(profiles, department);
      setTeamAnalysis(analysis);
      
      // Also store individual predictions
      const individualPredictions = profiles.map(p => turnoverPredictionEngine.predictTurnover(p));
      setPredictions(individualPredictions);
      
      toast.success(`Análise concluída: ${profiles.length} tripulantes`, {
        description: `${analysis.atRiskCount} em risco, custo potencial: $${(analysis.estimatedImpact.replacementCost / 1000).toFixed(0)}k`
      });
      
      return analysis;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRetentionActions = useCallback((prediction: TurnoverPrediction): RetentionAction[] => {
    return prediction.retentionRecommendations;
  }, []);

  const getHighRiskCrew = useCallback((): TurnoverPrediction[] => {
    return predictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
  }, [predictions]);

  const clearAnalysis = useCallback(() => {
    setPredictions([]);
    setTeamAnalysis(null);
  }, []);

  return {
    isLoading,
    predictions,
    teamAnalysis,
    predictTurnover,
    analyzeTeam,
    getRetentionActions,
    getHighRiskCrew,
    clearAnalysis
  };
}
