/**
 * Hook for SEVI Learning Engine
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { useState, useCallback, useEffect } from 'react';
import { seviEngine, type EvolutionMetrics, type PatternRecognition } from '@/lib/ai/sevi-learning';
import { toast } from 'sonner';

export function useSEVI() {
  const [metrics, setMetrics] = useState<EvolutionMetrics | null>(null);
  const [patterns, setPatterns] = useState<PatternRecognition[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setMetrics(seviEngine.getEvolutionMetrics());
    setPatterns(seviEngine.getPatterns());
    setRecommendations(seviEngine.getRecommendations());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitFeedback = useCallback((
    moduleId: string,
    actionType: string,
    originalPrediction: number,
    actualOutcome: number,
    context: Record<string, unknown> = {}
  ) => {
    seviEngine.processFeedback({
      moduleId,
      actionType,
      originalPrediction,
      actualOutcome,
      wasCorrect: Math.abs(originalPrediction - actualOutcome) < 0.2,
      context
    });
    
    refresh();
    toast.success('Feedback processado pelo SEVI');
  }, [refresh]);

  const predict = useCallback((moduleId: string, context: Record<string, number>): number => {
    return seviEngine.predict(moduleId, context);
  }, []);

  const reset = useCallback(() => {
    seviEngine.reset();
    refresh();
    toast.info('SEVI resetado');
  }, [refresh]);

  return {
    metrics,
    patterns,
    recommendations,
    submitFeedback,
    predict,
    refresh,
    reset
  };
}
