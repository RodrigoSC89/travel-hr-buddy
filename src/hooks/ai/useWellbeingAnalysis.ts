/**
 * useWellbeingAnalysis Hook
 * Interface simplificada para análise de bem-estar da tripulação
 */

import { useState, useCallback } from 'react';
import { 
  wellbeingNLPEngine,
  type CommunicationEntry,
  type WellbeingAnalysis,
  type WellbeingAlert
} from '@/lib/ai/engines/wellbeing-nlp';
import { toast } from 'sonner';

interface UseWellbeingAnalysisReturn {
  isLoading: boolean;
  analyses: WellbeingAnalysis[];
  analyzeCrewMember: (crewMemberId: string, crewMemberName: string, communications: CommunicationEntry[]) => Promise<WellbeingAnalysis | null>;
  getActiveAlerts: () => WellbeingAlert[];
  getHighRiskCrew: () => WellbeingAnalysis[];
  clearAnalyses: () => void;
}

export function useWellbeingAnalysis(): UseWellbeingAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [analyses, setAnalyses] = useState<WellbeingAnalysis[]>([]);

  const analyzeCrewMember = useCallback(async (
    crewMemberId: string,
    crewMemberName: string,
    communications: CommunicationEntry[]
  ): Promise<WellbeingAnalysis | null> => {
    setIsLoading(true);
    try {
      const analysis = await wellbeingNLPEngine.analyzeCrewWellbeing(
        crewMemberId,
        crewMemberName,
        communications
      );
      
      setAnalyses(prev => [...prev.filter(a => a.crewMemberId !== crewMemberId), analysis]);
      
      if (analysis.burnoutRisk === 'critical') {
        toast.error(`⚠️ Risco crítico: ${crewMemberName}`);
      } else if (analysis.burnoutRisk === 'high') {
        toast.warning(`Risco alto: ${crewMemberName}`);
      }
      
      return analysis;
    } catch (error) {
      console.error('[useWellbeingAnalysis] Error:', error);
      toast.error('Erro na análise de bem-estar');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActiveAlerts = useCallback((): WellbeingAlert[] => {
    return analyses.flatMap(a => a.alertsGenerated);
  }, [analyses]);

  const getHighRiskCrew = useCallback((): WellbeingAnalysis[] => {
    return analyses.filter(a => a.burnoutRisk === 'critical' || a.burnoutRisk === 'high');
  }, [analyses]);

  const clearAnalyses = useCallback(() => {
    setAnalyses([]);
  }, []);

  return {
    isLoading,
    analyses,
    analyzeCrewMember,
    getActiveAlerts,
    getHighRiskCrew,
    clearAnalyses
  };
}
