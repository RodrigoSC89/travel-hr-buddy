/**
 * 🚢 useOperationsIntelligence Hook
 * React hook for voyage optimization and fleet monitoring
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  operationalIntelligenceEngine, 
  type VoyageOptimization,
  type VoyageData
} from '../ai/OperationalIntelligenceEngine';
import { toast } from 'sonner';

export interface UseOperationsIntelligenceOptions {
  voyageId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOperationsIntelligence(options: UseOperationsIntelligenceOptions = {}) {
  const { voyageId, autoRefresh = true, refreshInterval = 30000 } = options;
  const queryClient = useQueryClient();

  // Query for voyage data
  const {
    data: voyageData,
    isLoading: isLoadingVoyage
  } = useQuery({
    queryKey: ['voyage-data', voyageId],
    queryFn: async (): Promise<VoyageData | null> => {
      if (!voyageId) return null;
      return operationalIntelligenceEngine.getVoyageData(voyageId);
    },
    enabled: !!voyageId,
    staleTime: 1000 * 60 * 5
  });

  // Query for voyage optimization
  const {
    data: voyageOptimization,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['voyage-optimization', voyageId],
    queryFn: async (): Promise<VoyageOptimization | null> => {
      if (!voyageId) return null;
      return operationalIntelligenceEngine.optimizeVoyage(voyageId);
    },
    enabled: !!voyageId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 1000 * 60 * 5
  });

  // Query for real-time monitoring
  const {
    data: realtimeStatus,
    isLoading: isLoadingRealtime
  } = useQuery({
    queryKey: ['voyage-realtime', voyageId],
    queryFn: async () => {
      if (!voyageId) return null;
      return operationalIntelligenceEngine.monitorVoyageRealtime(voyageId);
    },
    enabled: !!voyageId && !!voyageOptimization,
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Mutation for optimizing voyage
  const optimizeVoyageMutation = useMutation({
    mutationFn: async (vId: string) => {
      return operationalIntelligenceEngine.optimizeVoyage(vId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['voyage-optimization', voyageId], data);
      toast.success(`Route optimized! Savings: $${data.savings.costReductionUSD.toLocaleString()}`);
    },
    onError: (error) => {
      toast.error('Failed to optimize voyage: ' + (error as Error).message);
    }
  });

  // Get route efficiency
  const routeEfficiency = useMemo(() => {
    if (!voyageOptimization) return null;
    return {
      fuelSavingsPercent: voyageOptimization.savings.fuelSavingsPercent,
      fuelSavingsTons: voyageOptimization.savings.fuelSavingsTons,
      timeSavingsHours: voyageOptimization.savings.timeOptimizationHours,
      costSavings: voyageOptimization.savings.costReductionUSD,
      confidence: voyageOptimization.confidence
    };
  }, [voyageOptimization]);

  // Get waypoints for map
  const waypointData = useMemo(() => {
    if (!voyageOptimization) return [];
    return voyageOptimization.route.waypoints.map((wp, index) => ({
      id: index,
      position: [wp.position.lat, wp.position.lng] as [number, number],
      eta: wp.eta,
      speed: wp.speed,
      note: wp.note
    }));
  }, [voyageOptimization]);

  // Get risks summary
  const risksSummary = useMemo(() => {
    if (!voyageOptimization) return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    const risks = voyageOptimization.risks;
    return {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length,
      total: risks.length
    };
  }, [voyageOptimization]);

  // Optimize voyage
  const optimizeVoyage = useCallback(async (vId: string) => {
    return optimizeVoyageMutation.mutateAsync(vId);
  }, [optimizeVoyageMutation]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['voyage-optimization'] }),
      queryClient.invalidateQueries({ queryKey: ['voyage-data'] }),
      queryClient.invalidateQueries({ queryKey: ['voyage-realtime'] })
    ]);
    toast.success('Operations data refreshed');
  }, [queryClient]);

  return {
    // State
    voyageData,
    voyageOptimization,
    realtimeStatus,
    isLoading: isLoading || optimizeVoyageMutation.isPending,
    isLoadingVoyage,
    isLoadingRealtime,
    error,

    // Computed
    routeEfficiency,
    waypointData,
    risksSummary,

    // Actions
    optimizeVoyage,
    refreshData,
    refetch
  };
}

export default useOperationsIntelligence;
