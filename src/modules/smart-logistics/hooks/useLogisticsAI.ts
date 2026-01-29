/**
 * 🚚 useLogisticsAI Hook
 * React hooks for AI-powered logistics intelligence
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  autonomousLogisticsEngine,
  type InventoryPrediction,
  type SupplyChainOptimization,
  type DemandForecast,
  type AutoOrderRecommendation,
  type LogisticsMetrics
} from '../ai/AutonomousLogisticsEngine';
import { toast } from 'sonner';

export interface UseLogisticsAIOptions {
  vesselId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useInventoryPrediction(
  items?: { id: string; name: string; currentStock: number; dailyUsage: number }[]
) {
  return useQuery({
    queryKey: ['inventory-prediction', items?.map(i => i.id).join(',')],
    queryFn: async (): Promise<InventoryPrediction[]> => {
      if (!items || items.length === 0) return [];
      return autonomousLogisticsEngine.predictInventory(items);
    },
    enabled: !!items && items.length > 0,
    staleTime: 1000 * 60 * 15
  });
}

export function useSupplyChainOptimization(vesselId?: string) {
  return useQuery({
    queryKey: ['supply-chain-optimization', vesselId],
    queryFn: async (): Promise<SupplyChainOptimization | null> => {
      if (!vesselId) return null;
      return autonomousLogisticsEngine.optimizeSupplyChain(vesselId);
    },
    enabled: !!vesselId,
    staleTime: 1000 * 60 * 30
  });
}

export function useDemandForecast(
  itemId?: string,
  itemName?: string,
  historicalData?: number[]
) {
  return useQuery({
    queryKey: ['demand-forecast', itemId],
    queryFn: async (): Promise<DemandForecast | null> => {
      if (!itemId || !itemName || !historicalData) return null;
      return autonomousLogisticsEngine.forecastDemand(itemId, itemName, historicalData);
    },
    enabled: !!itemId && !!itemName && !!historicalData,
    staleTime: 1000 * 60 * 60
  });
}

export function useLogisticsMetrics() {
  return useQuery({
    queryKey: ['logistics-metrics'],
    queryFn: () => autonomousLogisticsEngine.getLogisticsMetrics(),
    staleTime: 1000 * 60 * 5
  });
}

export function useAutoOrderGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (predictions: InventoryPrediction[]) => {
      return autonomousLogisticsEngine.generateAutoOrders(predictions);
    },
    onSuccess: (orders) => {
      const autoApproved = orders.filter(o => o.autoApproved).length;
      const needsReview = orders.length - autoApproved;

      if (autoApproved > 0) {
        toast.success(`${autoApproved} orders auto-approved and sent`);
      }
      if (needsReview > 0) {
        toast.info(`${needsReview} orders pending review`);
      }
      if (orders.length === 0) {
        toast.info('No reorders needed at this time');
      }
    },
    onError: (error) => {
      toast.error('Failed to generate orders: ' + (error as Error).message);
    }
  });
}

export function useRefreshLogisticsData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory-prediction'] }),
        queryClient.invalidateQueries({ queryKey: ['supply-chain-optimization'] }),
        queryClient.invalidateQueries({ queryKey: ['demand-forecast'] }),
        queryClient.invalidateQueries({ queryKey: ['logistics-metrics'] })
      ]);
    },
    onSuccess: () => {
      toast.success('Logistics data refreshed');
    }
  });
}

export function useLogisticsAI(options: UseLogisticsAIOptions = {}) {
  const { vesselId } = options;
  const queryClient = useQueryClient();

  const { data: metrics, isLoading: isLoadingMetrics } = useLogisticsMetrics();
  const { data: optimization, isLoading: isLoadingOptimization } = useSupplyChainOptimization(vesselId);

  const autoOrderMutation = useAutoOrderGeneration();
  const refreshMutation = useRefreshLogisticsData();

  // Computed: Optimization summary
  const optimizationSummary = useMemo(() => {
    if (!optimization) return null;
    return {
      savingsPercent: optimization.savingsPercent,
      potentialSavings: optimization.currentCost - optimization.optimizedCost,
      topRecommendation: optimization.recommendations[0]?.description || 'No recommendations',
      recommendationsCount: optimization.recommendations.length
    };
  }, [optimization]);

  // Computed: Metrics summary
  const metricsSummary = useMemo(() => {
    if (!metrics) return null;
    const avgScore = (
      metrics.orderFulfillmentRate + 
      metrics.supplierPerformance + 
      metrics.costEfficiency
    ) / 3;

    return {
      overallScore: Math.round(avgScore),
      status: avgScore >= 90 ? 'excellent' : avgScore >= 75 ? 'good' : avgScore >= 60 ? 'fair' : 'poor',
      criticalMetric: metrics.stockoutRate > 5 ? 'High stockout rate' : null
    };
  }, [metrics]);

  return {
    // State
    metrics,
    optimization,
    isLoading: isLoadingMetrics || isLoadingOptimization,

    // Computed
    optimizationSummary,
    metricsSummary,

    // Actions
    generateAutoOrders: autoOrderMutation.mutateAsync,
    isGeneratingOrders: autoOrderMutation.isPending,
    refreshData: refreshMutation.mutateAsync
  };
}

export default useLogisticsAI;
