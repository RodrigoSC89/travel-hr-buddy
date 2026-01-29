/**
 * 🔮 useAuditPrediction Hook
 * React hook for audit predictions with caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictiveAuditEngine, type AuditPrediction } from '../services/PredictiveAuditEngine';
import { auditRiskAnalyzer, type RiskPrediction, type VesselRiskData } from '../ml/RiskAnalysisModel';
import { toast } from 'sonner';

/**
 * Hook to get audit prediction for a vessel
 */
export function useAuditPrediction(vesselId: string | null, auditType: string = 'all') {
  return useQuery<AuditPrediction | null>({
    queryKey: ['audit-prediction', vesselId, auditType],
    queryFn: async () => {
      if (!vesselId) return null;
      return predictiveAuditEngine.predictAuditOutcome(vesselId, auditType);
    },
    enabled: !!vesselId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get fleet-wide predictions
 */
export function useFleetPredictions(auditType: string = 'all') {
  return useQuery<AuditPrediction[]>({
    queryKey: ['fleet-predictions', auditType],
    queryFn: () => predictiveAuditEngine.getFleetPredictions(auditType),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get ML risk prediction for a vessel
 */
export function useRiskPrediction(vesselId: string | null) {
  return useQuery<RiskPrediction | null>({
    queryKey: ['risk-prediction', vesselId],
    queryFn: async () => {
      if (!vesselId) return null;
      return auditRiskAnalyzer.predictRiskForVessel(vesselId);
    },
    enabled: !!vesselId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for custom risk prediction with manual data
 */
export function useCustomRiskPrediction() {
  const queryClient = useQueryClient();

  return useMutation<RiskPrediction, Error, VesselRiskData>({
    mutationFn: (data) => auditRiskAnalyzer.predictRisk(data),
    onSuccess: (result) => {
      toast.success(`Risk analysis complete: ${result.riskLevel} risk (${result.confidence}% confidence)`);
    },
    onError: (error) => {
      toast.error(`Risk analysis failed: ${error.message}`);
    }
  });
}

/**
 * Hook to refresh all predictions
 */
export function useRefreshPredictions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['audit-prediction'] });
      await queryClient.invalidateQueries({ queryKey: ['fleet-predictions'] });
      await queryClient.invalidateQueries({ queryKey: ['risk-prediction'] });
    },
    onSuccess: () => {
      toast.success('Predictions refreshed');
    }
  });
}
