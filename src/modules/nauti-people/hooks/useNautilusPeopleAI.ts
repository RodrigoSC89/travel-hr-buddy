/**
 * Hook para integração com a IA do Nautilus People Hub
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIResponse {
  success: boolean;
  result: string;
  action: string;
  error?: string;
}

export const useNautilusPeopleAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(async (action: string, data: Record<string, unknown>): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke<AIResponse>(
        'nautilus-people-ai',
        { body: { action, data } }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Erro desconhecido');
      }

      return response.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar IA';
      setError(errorMessage);
      
      if (errorMessage.includes('429') || errorMessage.includes('limite')) {
        toast.error('Limite de requisições excedido. Aguarde alguns minutos.');
      } else if (errorMessage.includes('402') || errorMessage.includes('créditos')) {
        toast.error('Créditos de IA esgotados. Adicione créditos ao workspace.');
      } else {
        toast.error(`Erro na IA: ${errorMessage}`);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chat = useCallback(async (message: string) => {
    return callAI('chat', { message });
  }, [callAI]);

  const screenCandidate = useCallback(async (candidate: Record<string, unknown>, job: Record<string, unknown>) => {
    return callAI('screenCandidate', { candidate, job });
  }, [callAI]);

  const generateJobDescription = useCallback(async (title: string, department: string, level: string, details?: string) => {
    return callAI('generateJobDescription', { title, department, level, details });
  }, [callAI]);

  const analyzePerformance = useCallback(async (employee: Record<string, unknown>, goals: unknown[], feedbacks?: unknown[]) => {
    return callAI('analyzePerformance', { employee, goals, feedbacks });
  }, [callAI]);

  const generateOKR = useCallback(async (context: string, department: string, period: string) => {
    return callAI('generateOKR', { context, department, period });
  }, [callAI]);

  const analyzeFeedback = useCallback(async (feedback: string, department: string) => {
    return callAI('analyzeFeedback', { feedback, department });
  }, [callAI]);

  const generateInsights = useCallback(async (metrics: Record<string, unknown>) => {
    return callAI('generateInsights', { metrics });
  }, [callAI]);

  const predictTurnover = useCallback(async (employee: Record<string, unknown>, history?: Record<string, unknown>) => {
    return callAI('predictTurnover', { employee, history });
  }, [callAI]);

  const suggestTraining = useCallback(async (
    employee: Record<string, unknown>,
    currentRole: string,
    targetRole?: string,
    evaluations?: unknown[]
  ) => {
    return callAI('suggestTraining', { employee, currentRole, targetRole, evaluations });
  }, [callAI]);

  const analyzeClimate = useCallback(async (climateData: Record<string, unknown>) => {
    return callAI('analyzeClimate', { climateData });
  }, [callAI]);

  return {
    isLoading,
    error,
    chat,
    screenCandidate,
    generateJobDescription,
    analyzePerformance,
    generateOKR,
    analyzeFeedback,
    generateInsights,
    predictTurnover,
    suggestTraining,
    analyzeClimate,
  };
};
