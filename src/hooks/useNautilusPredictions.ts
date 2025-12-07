/**
 * useNautilusPredictions - Hook for AI-powered predictions
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Prediction {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability?: number;
  recommendedAction: string;
  deadline?: string;
  impact?: string;
}

export interface PredictionResult {
  predictions: Prediction[];
  summary: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
}

type PredictionType = 'maintenance' | 'inventory' | 'route' | 'compliance';

interface UseNautilusPredictionsReturn {
  isLoading: boolean;
  error: string | null;
  getPredictions: (type: PredictionType, data: Record<string, any>) => Promise<PredictionResult | null>;
}

export function useNautilusPredictions(): UseNautilusPredictionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPredictions = useCallback(async (
    type: PredictionType, 
    data: Record<string, any>
  ): Promise<PredictionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke('nautilus-predict', {
        body: { type, data }
      });

      if (invokeError) {
        throw invokeError;
      }

      if (result.error) {
        if (result.error.includes('Rate limit') || result.error.includes('429')) {
          toast.error('Limite de requisições excedido. Aguarde um momento.');
        }
        throw new Error(result.error);
      }

      return result as PredictionResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao obter predições';
      setError(message);
      console.error('Prediction error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getPredictions,
  };
}
