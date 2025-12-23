import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AIRequestType = 
  | 'emissions_analysis' 
  | 'waste_classification' 
  | 'compliance_check' 
  | 'recommendations' 
  | 'report_generation' 
  | 'predictive_analysis' 
  | 'chat';

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  type: AIRequestType;
  model?: string;
  timestamp?: string;
}

interface UseESGWasteAIReturn {
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
  analyzeEmissions: (data: Record<string, unknown>) => Promise<string | null>;
  classifyWaste: (description: string) => Promise<string | null>;
  checkCompliance: (data: Record<string, unknown>) => Promise<string | null>;
  getRecommendations: (context: string, data: Record<string, unknown>) => Promise<string | null>;
  generateReport: (reportType: string, data: Record<string, unknown>) => Promise<string | null>;
  predictiveAnalysis: (historicalData: Record<string, unknown>) => Promise<string | null>;
  chat: (message: string, context?: Record<string, unknown>) => Promise<string | null>;
}

export function useESGWasteAI(): UseESGWasteAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const callAI = useCallback(async (
    type: AIRequestType, 
    data: Record<string, unknown>, 
    context?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: functionError } = await supabase.functions.invoke<AIResponse>(
        'esg-waste-ai',
        {
          body: { type, data, context }
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!responseData?.success) {
        throw new Error(responseData?.error || 'Erro ao processar requisição');
      }

      const response = responseData.response || null;
      setLastResponse(response);
      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro na IA', { description: errorMessage });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeEmissions = useCallback(async (data: Record<string, unknown>) => {
    return callAI('emissions_analysis', data);
  }, [callAI]);

  const classifyWaste = useCallback(async (description: string) => {
    return callAI('waste_classification', { description });
  }, [callAI]);

  const checkCompliance = useCallback(async (data: Record<string, unknown>) => {
    return callAI('compliance_check', data);
  }, [callAI]);

  const getRecommendations = useCallback(async (context: string, data: Record<string, unknown>) => {
    return callAI('recommendations', data, context);
  }, [callAI]);

  const generateReport = useCallback(async (reportType: string, data: Record<string, unknown>) => {
    return callAI('report_generation', { reportType, ...data });
  }, [callAI]);

  const predictiveAnalysis = useCallback(async (historicalData: Record<string, unknown>) => {
    return callAI('predictive_analysis', historicalData);
  }, [callAI]);

  const chat = useCallback(async (message: string, context?: Record<string, unknown>) => {
    return callAI('chat', { message, ...context }, message);
  }, [callAI]);

  return {
    isLoading,
    error,
    lastResponse,
    analyzeEmissions,
    classifyWaste,
    checkCompliance,
    getRecommendations,
    generateReport,
    predictiveAnalysis,
    chat,
  };
}
