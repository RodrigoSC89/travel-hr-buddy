import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AgentDecision {
  agentName: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
  risks: string[];
  actions: string[];
}

interface ConsensusResult {
  situation: string;
  timestamp: string;
  agentDecisions: AgentDecision[];
  consensus: {
    averageConfidence: number;
    aggregatedRisks: string[];
    recommendedActions: string[];
    finalDecision: string;
  };
}

type AgentType = 'captain' | 'engineer' | 'safety' | 'wellness' | 'navigator' | 'economist' | 'predictor' | 'communicator';

export function useAIAgentConsensus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastConsensus, setLastConsensus] = useState<ConsensusResult | null>(null);

  const requestConsensus = useCallback(async (
    situation: string,
    context: Record<string, unknown>,
    requiredAgents: AgentType[] = ['captain', 'safety', 'engineer']
  ): Promise<ConsensusResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      toast.info(`Consulting ${requiredAgents.length} AI agents...`);

      const { data, error: fnError } = await supabase.functions.invoke('ai-agent-consensus', {
        body: { situation, context, requiredAgents }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get consensus');
      }

      const result = data.result as ConsensusResult;
      setLastConsensus(result);

      toast.success(`Consensus achieved: ${result.consensus.averageConfidence}% confidence`);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Agent consensus failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickConsensus = useCallback(async (
    situation: string,
    context: Record<string, unknown> = {}
  ) => {
    return requestConsensus(situation, context, ['captain', 'safety']);
  }, [requestConsensus]);

  const fullConsensus = useCallback(async (
    situation: string,
    context: Record<string, unknown> = {}
  ) => {
    return requestConsensus(
      situation,
      context,
      ['captain', 'engineer', 'safety', 'wellness', 'navigator', 'economist', 'predictor', 'communicator']
    );
  }, [requestConsensus]);

  return {
    requestConsensus,
    quickConsensus,
    fullConsensus,
    isLoading,
    error,
    lastConsensus
  };
}
