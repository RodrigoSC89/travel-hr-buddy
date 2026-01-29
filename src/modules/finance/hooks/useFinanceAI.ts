/**
 * 💰 useFinanceAI Hook
 * React hooks for AI-powered financial intelligence
 */

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  predictiveAccountingEngine,
  type CashFlowPrediction,
  type FraudAlert,
  type BudgetOptimization,
  type FinancialRiskAssessment,
  type FinancialMetrics
} from '../ai/PredictiveAccountingEngine';
import { toast } from 'sonner';

export interface UseFinanceAIOptions {
  vesselId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useCashFlowPrediction(options: UseFinanceAIOptions = {}) {
  const { vesselId, autoRefresh = true, refreshInterval = 60000 } = options;

  return useQuery({
    queryKey: ['cash-flow-prediction', vesselId],
    queryFn: async (): Promise<CashFlowPrediction[]> => {
      if (!vesselId) return [];
      return predictiveAccountingEngine.predictCashFlow(vesselId, 30);
    },
    enabled: !!vesselId,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 1000 * 60 * 10
  });
}

export function useFinancialMetrics() {
  return useQuery({
    queryKey: ['financial-metrics'],
    queryFn: () => predictiveAccountingEngine.getFinancialSummary(),
    staleTime: 1000 * 60 * 5
  });
}

export function useFinancialRisk(vesselId?: string) {
  const { data: metrics } = useFinancialMetrics();

  return useQuery({
    queryKey: ['financial-risk', vesselId],
    queryFn: async (): Promise<FinancialRiskAssessment | null> => {
      if (!vesselId || !metrics) return null;
      return predictiveAccountingEngine.assessFinancialRisk(vesselId, metrics);
    },
    enabled: !!vesselId && !!metrics,
    staleTime: 1000 * 60 * 15
  });
}

export function useFraudDetection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactions: {
      id: string;
      amount: number;
      vendor: string;
      category: string;
      date: Date;
    }[]) => {
      return predictiveAccountingEngine.detectFraud(transactions);
    },
    onSuccess: (alerts) => {
      if (alerts.length > 0) {
        const critical = alerts.filter(a => a.severity === 'critical').length;
        const high = alerts.filter(a => a.severity === 'high').length;
        
        if (critical > 0) {
          toast.error(`${critical} critical fraud alerts detected!`);
        } else if (high > 0) {
          toast.warning(`${high} high-priority fraud alerts detected`);
        } else {
          toast.info(`${alerts.length} potential anomalies detected`);
        }
      } else {
        toast.success('No fraud detected in transactions');
      }
    },
    onError: (error) => {
      toast.error('Fraud detection failed: ' + (error as Error).message);
    }
  });
}

export function useBudgetOptimization(budgets?: {
  categoryId: string;
  categoryName: string;
  budget: number;
  actualSpend: number[];
}[]) {
  return useQuery({
    queryKey: ['budget-optimization', budgets?.map(b => b.categoryId).join(',')],
    queryFn: async (): Promise<BudgetOptimization[]> => {
      if (!budgets || budgets.length === 0) return [];
      return predictiveAccountingEngine.optimizeBudget(budgets);
    },
    enabled: !!budgets && budgets.length > 0,
    staleTime: 1000 * 60 * 30
  });
}

export function useRefreshFinanceData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cash-flow-prediction'] }),
        queryClient.invalidateQueries({ queryKey: ['financial-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['financial-risk'] }),
        queryClient.invalidateQueries({ queryKey: ['budget-optimization'] })
      ]);
    },
    onSuccess: () => {
      toast.success('Financial data refreshed');
    }
  });
}

export function useFinanceAI(options: UseFinanceAIOptions = {}) {
  const { vesselId } = options;
  const queryClient = useQueryClient();

  const { data: cashFlow, isLoading: isLoadingCashFlow } = useCashFlowPrediction(options);
  const { data: metrics, isLoading: isLoadingMetrics } = useFinancialMetrics();
  const { data: risk, isLoading: isLoadingRisk } = useFinancialRisk(vesselId);

  const fraudDetection = useFraudDetection();
  const refreshData = useRefreshFinanceData();

  // Computed: Cash flow summary
  const cashFlowSummary = useMemo(() => {
    if (!cashFlow || cashFlow.length === 0) return null;

    const totalInflow = cashFlow.reduce((sum, cf) => sum + cf.predictedInflow, 0);
    const totalOutflow = cashFlow.reduce((sum, cf) => sum + cf.predictedOutflow, 0);
    const avgConfidence = cashFlow.reduce((sum, cf) => sum + cf.confidence, 0) / cashFlow.length;

    return {
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      avgConfidence: Math.round(avgConfidence),
      days: cashFlow.length
    };
  }, [cashFlow]);

  // Computed: Risk summary
  const riskSummary = useMemo(() => {
    if (!risk) return null;
    return {
      score: risk.overallScore,
      level: risk.riskLevel,
      topRecommendation: risk.recommendations[0] || 'No recommendations',
      factorsCount: risk.factors.length
    };
  }, [risk]);

  return {
    // State
    cashFlow: cashFlow || [],
    metrics,
    risk,
    isLoading: isLoadingCashFlow || isLoadingMetrics || isLoadingRisk,

    // Computed
    cashFlowSummary,
    riskSummary,

    // Actions
    detectFraud: fraudDetection.mutateAsync,
    isFraudDetecting: fraudDetection.isPending,
    refreshData: refreshData.mutateAsync
  };
}

export default useFinanceAI;
