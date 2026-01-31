/**
 * useAIDecisionsSupabase Hook - PATCH 852
 * Real Supabase integration for AI decisions persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface AIDecisionDB {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  confidence: number;
  confidence_level: string;
  impact: string;
  justification_reasoning: string;
  justification_evidence: string[];
  justification_risks: string[];
  justification_expected_outcome: string | null;
  action_type: string | null;
  action_payload: Record<string, unknown> | null;
  executed_at: string | null;
  rolled_back_at: string | null;
  rejected_reason: string | null;
  feedback_was_correct: boolean | null;
  feedback_actual_outcome: string | null;
  feedback_notes: string | null;
  feedback_provided_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIConfigurationDB {
  id: string;
  config_key: string;
  config_value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AILearningMetricDB {
  id: string;
  period_start: string;
  period_end: string;
  total_decisions: number;
  correct_decisions: number;
  accuracy_rate: number | null;
  decisions_by_type: Record<string, number>;
  decisions_by_confidence: Record<string, number>;
  average_confidence: number | null;
  created_at: string;
}

export function useAIDecisionsSupabase() {
  const [decisions, setDecisions] = useState<AIDecisionDB[]>([]);
  const [configurations, setConfigurations] = useState<AIConfigurationDB[]>([]);
  const [metrics, setMetrics] = useState<AILearningMetricDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all decisions
  const fetchDecisions = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setDecisions((data || []) as unknown as AIDecisionDB[]);
    } catch (err) {
      logger.error('Error fetching AI decisions:', err);
      setError('Erro ao carregar decisões da IA');
    }
  }, []);

  // Fetch configurations
  const fetchConfigurations = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_configurations')
        .select('*');

      if (fetchError) throw fetchError;
      setConfigurations((data || []) as unknown as AIConfigurationDB[]);
    } catch (err) {
      logger.error('Error fetching AI configurations:', err);
    }
  }, []);

  // Fetch learning metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_learning_metrics')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(30);

      if (fetchError) throw fetchError;
      setMetrics((data || []) as unknown as AILearningMetricDB[]);
    } catch (err) {
      logger.error('Error fetching AI metrics:', err);
    }
  }, []);

  // Create new decision
  const createDecision = useCallback(async (decision: Partial<AIDecisionDB>) => {
    try {
      const insertData = {
        type: decision.type || 'optimization',
        title: decision.title || 'Nova Decisão',
        description: decision.description || '',
        status: 'pending',
        confidence: decision.confidence || 75,
        confidence_level: decision.confidence_level || 'medium',
        impact: decision.impact || 'medium',
        justification_reasoning: decision.justification_reasoning || '',
        justification_evidence: (decision.justification_evidence || []) as unknown as null,
        justification_risks: (decision.justification_risks || []) as unknown as null,
        justification_expected_outcome: decision.justification_expected_outcome,
        action_type: decision.action_type,
        action_payload: decision.action_payload as unknown as null
      };

      const { data, error: insertError } = await supabase
        .from('ai_decisions')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Decisão criada",
        description: "Nova decisão da IA registrada com sucesso"
      });

      await fetchDecisions();
      return data;
    } catch (err) {
      logger.error('Error creating AI decision:', err);
      toast({
        title: "Erro",
        description: "Falha ao criar decisão",
        variant: "destructive"
      });
      return null;
    }
  }, [fetchDecisions, toast]);

  // Update decision status
  const updateDecisionStatus = useCallback(async (
    id: string, 
    status: string, 
    additionalData?: Partial<AIDecisionDB>
  ) => {
    try {
      const updateData: Record<string, unknown> = { status, ...additionalData };
      
      if (status === 'executed') {
        updateData.executed_at = new Date().toISOString();
      } else if (status === 'rolled_back') {
        updateData.rolled_back_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('ai_decisions')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Status atualizado",
        description: `Decisão ${status === 'approved' ? 'aprovada' : status === 'rejected' ? 'rejeitada' : status}`
      });

      await fetchDecisions();
      return true;
    } catch (err) {
      logger.error('Error updating AI decision:', err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar decisão",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchDecisions, toast]);

  // Provide feedback
  const provideFeedback = useCallback(async (
    id: string,
    wasCorrect: boolean,
    actualOutcome?: string,
    notes?: string
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_decisions')
        .update({
          feedback_was_correct: wasCorrect,
          feedback_actual_outcome: actualOutcome,
          feedback_notes: notes,
          feedback_provided_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Feedback registrado",
        description: "Obrigado pelo feedback! A IA aprenderá com isso."
      });

      await fetchDecisions();
      return true;
    } catch (err) {
      logger.error('Error providing feedback:', err);
      return false;
    }
  }, [fetchDecisions, toast]);

  // Update configuration
  const updateConfiguration = useCallback(async (
    configKey: string,
    configValue: Record<string, unknown>
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({ config_value: configValue as unknown as null })
        .eq('config_key', configKey);

      if (updateError) throw updateError;

      toast({
        title: "Configuração salva",
        description: `${configKey} atualizado com sucesso`
      });

      await fetchConfigurations();
      return true;
    } catch (err) {
      logger.error('Error updating configuration:', err);
      toast({
        title: "Erro",
        description: "Falha ao salvar configuração",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchConfigurations, toast]);

  // Get configuration by key
  const getConfiguration = useCallback((key: string) => {
    const config = configurations.find(c => c.config_key === key);
    return config?.config_value || null;
  }, [configurations]);

  // Calculate stats
  const getStats = useCallback(() => {
    const pending = decisions.filter(d => d.status === 'pending').length;
    const approved = decisions.filter(d => d.status === 'approved').length;
    const executed = decisions.filter(d => d.status === 'executed').length;
    const rejected = decisions.filter(d => d.status === 'rejected').length;
    
    const withFeedback = decisions.filter(d => d.feedback_was_correct !== null);
    const correct = withFeedback.filter(d => d.feedback_was_correct === true).length;
    const accuracy = withFeedback.length > 0 ? (correct / withFeedback.length) * 100 : 0;

    return {
      total: decisions.length,
      pending,
      approved,
      executed,
      rejected,
      accuracy: Math.round(accuracy * 10) / 10
    };
  }, [decisions]);

  // Initial fetch
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchDecisions(),
        fetchConfigurations(),
        fetchMetrics()
      ]);
      setLoading(false);
    };

    loadAll();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('ai-decisions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_decisions' },
        () => {
          fetchDecisions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDecisions, fetchConfigurations, fetchMetrics]);

  return {
    decisions,
    configurations,
    metrics,
    loading,
    error,
    stats: getStats(),
    // Actions
    createDecision,
    updateDecisionStatus,
    provideFeedback,
    updateConfiguration,
    getConfiguration,
    // Refresh
    refresh: async () => {
      await Promise.all([
        fetchDecisions(),
        fetchConfigurations(),
        fetchMetrics()
      ]);
    }
  };
}
