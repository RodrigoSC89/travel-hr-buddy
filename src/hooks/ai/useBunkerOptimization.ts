/**
 * useBunkerOptimization Hook
 * Interface for ML-based bunker procurement optimization
 */

import { useState, useCallback } from 'react';
import { 
  bunkerOptimizationEngine,
  type VesselFuelRequirement,
  type BunkerPort,
  type BunkerPlan
} from '@/lib/ai/engines';
import { toast } from 'sonner';

export function useBunkerOptimization() {
  const [isLoading, setIsLoading] = useState(false);
  const [bunkerPlan, setBunkerPlan] = useState<BunkerPlan | null>(null);

  const optimizeBunkering = useCallback(async (
    requirement: VesselFuelRequirement,
    availablePorts: BunkerPort[]
  ) => {
    setIsLoading(true);
    try {
      const plan = await bunkerOptimizationEngine.optimizeBunkering(requirement, availablePorts);
      setBunkerPlan(plan);
      
      if (plan.primaryRecommendation) {
        toast.success(
          `Melhor opção: ${plan.primaryRecommendation.port.name} - ` +
          `$${plan.primaryRecommendation.estimatedCost.toLocaleString()} ` +
          `(${plan.primaryRecommendation.savingsPercent.toFixed(1)}% economia)`
        );
      }
      
      if (plan.alerts.some(a => a.severity === 'critical')) {
        toast.warning('Alertas críticos de bunkering detectados');
      }
      
      return plan;
    } catch (error) {
      console.error('[useBunkerOptimization] Error:', error);
      toast.error('Erro na otimização de bunkering');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMarketAnalysis = useCallback(() => {
    return bunkerPlan?.marketAnalysis || null;
  }, [bunkerPlan]);

  const getAlternatives = useCallback(() => {
    return bunkerPlan?.alternatives || [];
  }, [bunkerPlan]);

  return {
    isLoading,
    bunkerPlan,
    optimizeBunkering,
    getMarketAnalysis,
    getAlternatives
  };
}
