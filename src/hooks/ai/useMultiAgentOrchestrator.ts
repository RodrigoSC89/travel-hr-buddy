/**
 * useMultiAgentOrchestrator Hook
 * Interface para orquestração de múltiplos agentes de IA
 */

import { useState, useCallback } from 'react';
import { 
  multiAgentOrchestrator,
  type Agent,
  type Decision,
  type Situation
} from '@/lib/ai/engines/multi-agent-orchestrator';
import { toast } from 'sonner';

interface UseMultiAgentOrchestratorReturn {
  isLoading: boolean;
  agents: Agent[];
  decisions: Decision[];
  analyzeSituation: (situation: Situation) => Promise<Decision | null>;
  getAgents: () => Agent[];
  clearDecisions: () => void;
}

export function useMultiAgentOrchestrator(): UseMultiAgentOrchestratorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [agents] = useState<Agent[]>(() => {
    // Get agents from the orchestrator by analyzing a dummy situation to trigger initialization
    return [];
  });

  const getAgents = useCallback((): Agent[] => {
    // The orchestrator initializes agents internally
    return agents;
  }, [agents]);

  const analyzeSituation = useCallback(async (situation: Situation): Promise<Decision | null> => {
    setIsLoading(true);
    try {
      const decision = await multiAgentOrchestrator.analyzeSituation(situation);
      setDecisions(prev => [...prev, decision]);
      
      if (decision.consensus.achieved) {
        toast.success(`Consenso alcançado`, {
          description: decision.selectedOption?.description || 'Decisão tomada'
        });
      } else {
        toast.warning(`Decisão tomada sem consenso total`, {
          description: `Método: ${decision.consensus.method}`
        });
      }
      
      return decision;
    } catch (error) {
      console.error('[useMultiAgentOrchestrator] Error:', error);
      toast.error('Erro na análise multi-agente');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDecisions = useCallback(() => {
    setDecisions([]);
  }, []);

  return {
    isLoading,
    agents,
    decisions,
    analyzeSituation,
    getAgents,
    clearDecisions
  };
}
