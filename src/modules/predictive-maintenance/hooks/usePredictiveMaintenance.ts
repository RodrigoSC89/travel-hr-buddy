/**
 * 🔧 usePredictiveMaintenance Hook
 * React hook for ML-powered equipment failure prediction
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  predictiveMaintenanceMLEngine,
  type FailurePrediction,
  type MaintenancePlan,
  type SensorReading
} from '../ai/PredictiveMaintenanceEngine';
import { toast } from 'sonner';

export interface UsePredictiveMaintenanceOptions {
  vesselId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function usePredictiveMaintenance(options: UsePredictiveMaintenanceOptions = {}) {
  const { vesselId, autoRefresh = true, refreshInterval = 60000 } = options;
  const queryClient = useQueryClient();

  // Query for failure predictions
  const {
    data: predictions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['failure-predictions', vesselId],
    queryFn: async (): Promise<FailurePrediction[]> => {
      if (!vesselId) return [];
      return predictiveMaintenanceMLEngine.predictAllFailures(vesselId);
    },
    enabled: !!vesselId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 1000 * 60 * 10
  });

  // Query for maintenance plan
  const {
    data: maintenancePlan,
    isLoading: isLoadingPlan
  } = useQuery({
    queryKey: ['maintenance-plan', vesselId],
    queryFn: async (): Promise<MaintenancePlan | null> => {
      if (!vesselId) return null;
      return predictiveMaintenanceMLEngine.generateMaintenancePlan(vesselId);
    },
    enabled: !!vesselId,
    staleTime: 1000 * 60 * 30
  });

  // Mutation for adding sensor reading
  const addSensorMutation = useMutation({
    mutationFn: async (reading: SensorReading) => {
      predictiveMaintenanceMLEngine.addSensorReading(reading);
      return reading;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['failure-predictions'] });
    }
  });

  // High risk equipment
  const highRiskEquipment = useMemo(() => {
    if (!predictions) return [];
    return predictions
      .filter(p => p.failureProbability >= 70 || p.urgency === 'critical')
      .sort((a, b) => b.failureProbability - a.failureProbability);
  }, [predictions]);

  // Risk distribution
  const riskDistribution = useMemo(() => {
    if (!predictions) return { critical: 0, high: 0, medium: 0, low: 0 };
    
    return {
      critical: predictions.filter(p => p.urgency === 'critical').length,
      high: predictions.filter(p => p.urgency === 'high').length,
      medium: predictions.filter(p => p.urgency === 'medium').length,
      low: predictions.filter(p => p.urgency === 'low').length
    };
  }, [predictions]);

  // Average health score
  const averageHealthScore = useMemo(() => {
    if (!predictions || predictions.length === 0) return 100;
    
    const avgRisk = predictions.reduce((sum, p) => sum + p.failureProbability, 0) / predictions.length;
    return Math.round(100 - avgRisk);
  }, [predictions]);

  // Upcoming maintenance tasks
  const upcomingMaintenance = useMemo(() => {
    if (!maintenancePlan) return [];
    return maintenancePlan.schedule
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
  }, [maintenancePlan]);

  // Total savings
  const totalSavings = useMemo(() => {
    if (!maintenancePlan) return null;
    return maintenancePlan.savings;
  }, [maintenancePlan]);

  // Add sensor reading
  const addSensorReading = useCallback(async (reading: SensorReading) => {
    return addSensorMutation.mutateAsync(reading);
  }, [addSensorMutation]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['failure-predictions'] }),
      queryClient.invalidateQueries({ queryKey: ['maintenance-plan'] })
    ]);
    toast.success('Maintenance data refreshed');
  }, [queryClient]);

  // Get prediction for specific equipment
  const getPrediction = useCallback((equipmentId: string): FailurePrediction | undefined => {
    return predictions?.find(p => p.equipmentId === equipmentId);
  }, [predictions]);

  return {
    // State
    predictions: predictions || [],
    maintenancePlan,
    isLoading: isLoading || addSensorMutation.isPending,
    isLoadingPlan,
    error,

    // Computed
    highRiskEquipment,
    riskDistribution,
    averageHealthScore,
    upcomingMaintenance,
    totalSavings,

    // Actions
    addSensorReading,
    refreshData,
    refetch,
    getPrediction
  };
}

export default usePredictiveMaintenance;
