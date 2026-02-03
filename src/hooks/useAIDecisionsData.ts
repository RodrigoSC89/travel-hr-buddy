/**
 * AI Decisions Real Data Hook
 * Fetches AI decisions and explainability data from Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIDecision {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  created_at: string;
  justification_reasoning: string;
  justification_evidence?: Record<string, unknown>[];
  justification_risks?: string[];
  feedback_was_correct?: boolean;
  feedback_notes?: string;
}

export interface InfluenceFactors {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export function useAIDecisions(limit = 20) {
  return useQuery({
    queryKey: ['ai-decisions', limit],
    queryFn: async (): Promise<AIDecision[]> => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[useAIDecisions] Error:', error);
        throw error;
      }

      return (data || []).map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        confidence: d.confidence,
        type: d.type,
        status: (d.status as AIDecision['status']) || 'pending',
        created_at: d.created_at,
        justification_reasoning: d.justification_reasoning,
        justification_evidence: d.justification_evidence as Record<string, unknown>[] | undefined,
        justification_risks: d.justification_risks as string[] | undefined,
        feedback_was_correct: d.feedback_was_correct ?? undefined,
        feedback_notes: d.feedback_notes ?? undefined
      }));
    },
    staleTime: 30 * 1000,
  });
}

export function useAIInfluenceFactors(decisionId?: string) {
  return useQuery({
    queryKey: ['ai-influence-factors', decisionId],
    queryFn: async (): Promise<InfluenceFactors[]> => {
      // Influence factors are derived from AI behavior snapshots
      const { data, error } = await supabase
        .from('ai_behavior_snapshots')
        .select('metadata')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        // Return empty array - no mock data
        return [];
      }

      const metadata = data[0].metadata as Record<string, unknown> | null;
      if (metadata?.influence_factors && Array.isArray(metadata.influence_factors)) {
        return metadata.influence_factors as InfluenceFactors[];
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProvideAIFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      decisionId, 
      wasCorrect, 
      notes 
    }: { 
      decisionId: string; 
      wasCorrect: boolean; 
      notes?: string 
    }) => {
      const { error } = await supabase
        .from('ai_decisions')
        .update({
          feedback_was_correct: wasCorrect,
          feedback_notes: notes,
          feedback_provided_at: new Date().toISOString()
        })
        .eq('id', decisionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions'] });
      toast.success('Feedback registrado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao registrar feedback: ' + error.message);
    }
  });
}

export function useAILearningMetrics() {
  return useQuery({
    queryKey: ['ai-learning-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_learning_metrics')
        .select('*')
        .order('period_end', { ascending: false })
        .limit(30);

      if (error) {
        console.error('[useAILearningMetrics] Error:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
