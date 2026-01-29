/**
 * 💰 useFinanceAnalytics Hook
 * Unified access to all finance engines
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictiveCostEngine } from '@/lib/finance/predictive-cost-engine';
import { intelligentProcurement } from '@/lib/finance/intelligent-procurement';
import { invoiceAutomation } from '@/lib/finance/invoice-automation';
import { budgetForecastEngine } from '@/lib/finance/budget-forecast-engine';
import { multiCurrencyEngine } from '@/lib/finance/multi-currency-engine';
import type { FinancialMetrics } from '@/lib/finance/types';

export function useFinanceAnalytics() {
  const queryClient = useQueryClient();

  // Cost Predictions
  const costPredictions = useQuery({
    queryKey: ['finance', 'cost-predictions'],
    queryFn: () => predictiveCostEngine.predictCosts('quarterly'),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Budget Forecast
  const annualBudget = useQuery({
    queryKey: ['finance', 'annual-budget', new Date().getFullYear()],
    queryFn: () => budgetForecastEngine.createAnnualBudget(new Date().getFullYear()),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Budget Variance Alerts
  const varianceAlerts = useQuery({
    queryKey: ['finance', 'variance-alerts'],
    queryFn: () => budgetForecastEngine.monitorBudgetRealtime(),
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  // Currency Rates
  const currencyRates = useQuery({
    queryKey: ['finance', 'currency-rates'],
    queryFn: () => {
      const currencies = multiCurrencyEngine.getSupportedCurrencies();
      return currencies.map(currency => ({
        currency,
        rateToUSD: multiCurrencyEngine.getRate(currency, 'USD'),
      }));
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Procurement Request
  const createProcurement = useMutation({
    mutationFn: (request: Parameters<typeof intelligentProcurement.automateProcurement>[0]) =>
      intelligentProcurement.automateProcurement(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });

  // Invoice Processing
  const processInvoice = useMutation({
    mutationFn: (file: File) => invoiceAutomation.processInvoice(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });

  // Currency Optimization
  const optimizeCurrency = useMutation({
    mutationFn: ({ amount, currencies }: { amount: number; currencies: string[] }) =>
      multiCurrencyEngine.optimizeCurrencyAllocation(amount, currencies),
  });

  // Demand Forecast
  const getDemandForecast = useMutation({
    mutationFn: (category: string) => intelligentProcurement.predictDemand(category),
  });

  // Calculate financial metrics
  const metrics: FinancialMetrics | null = annualBudget.data ? {
    total_expenses: Object.values(annualBudget.data.byCategory).reduce((sum, cat) => sum + cat.spent, 0),
    total_budget: annualBudget.data.totalBudget,
    budget_variance: Object.values(annualBudget.data.byCategory).reduce((sum, cat) => sum + cat.variance, 0),
    variance_percentage: Object.values(annualBudget.data.byCategory).reduce((sum, cat) => sum + cat.variancePercentage, 0) / Object.keys(annualBudget.data.byCategory).length,
    pending_invoices: 5, // Mock
    pending_amount: 45000, // Mock
    savings_identified: costPredictions.data?.savingsOpportunities.reduce((sum, s) => sum + s.potential_savings, 0) || 0,
    savings_implemented: 0, // Mock
  } : null;

  return {
    // Data
    costPredictions: costPredictions.data,
    annualBudget: annualBudget.data,
    varianceAlerts: varianceAlerts.data,
    currencyRates: currencyRates.data,
    metrics,

    // Loading states
    isLoading: costPredictions.isLoading || annualBudget.isLoading,

    // Actions
    createProcurement,
    processInvoice,
    optimizeCurrency,
    getDemandForecast,

    // Refetch
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  };
}

export function useCurrencyConverter() {
  const convert = (amount: number, from: string, to: string): number => {
    return multiCurrencyEngine.convert(amount, from, to);
  };

  const getRate = (from: string, to: string): number => {
    return multiCurrencyEngine.getRate(from, to);
  };

  const predictRates = useMutation({
    mutationFn: ({ currencies, days }: { currencies: string[]; days: number }) =>
      multiCurrencyEngine.predictRates(currencies, days),
  });

  return {
    convert,
    getRate,
    predictRates,
    supportedCurrencies: multiCurrencyEngine.getSupportedCurrencies(),
  };
}
