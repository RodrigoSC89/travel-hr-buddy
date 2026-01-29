/**
 * 💰 useFinanceAnalytics Hook
 * Unified access to all finance engines with REAL data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { predictiveCostEngine } from '@/lib/finance/predictive-cost-engine';
import { intelligentProcurement } from '@/lib/finance/intelligent-procurement';
import { invoiceAutomation } from '@/lib/finance/invoice-automation';
import { budgetForecastEngine } from '@/lib/finance/budget-forecast-engine';
import { multiCurrencyEngine } from '@/lib/finance/multi-currency-engine';
import type { FinancialMetrics } from '@/lib/finance/types';

/**
 * Fetch REAL pending invoices from expenses table
 */
async function fetchPendingInvoices(): Promise<{ count: number; amount: number }> {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, status')
    .eq('status', 'pending');

  if (error || !data) {
    return { count: 0, amount: 0 };
  }

  return {
    count: data.length,
    amount: data.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
  };
}

/**
 * Fetch REAL savings implemented from expenses with category analysis
 */
async function fetchSavingsImplemented(): Promise<number> {
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const lastYearStart = `${currentYear - 1}-01-01`;
  const lastYearEnd = `${currentYear - 1}-12-31`;

  // Get this year's expenses
  const { data: thisYear } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', startOfYear)
    .eq('status', 'approved');

  // Get last year's expenses for comparison
  const { data: lastYear } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', lastYearStart)
    .lte('date', lastYearEnd)
    .eq('status', 'approved');

  if (!thisYear || !lastYear || lastYear.length === 0) {
    return 0;
  }

  const thisYearTotal = thisYear.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const lastYearTotal = lastYear.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Calculate savings (positive means we spent less this year per month)
  const thisYearMonths = new Date().getMonth() + 1;
  const monthlyThisYear = thisYearTotal / thisYearMonths;
  const monthlyLastYear = lastYearTotal / 12;

  const savings = Math.max(0, (monthlyLastYear - monthlyThisYear) * 12);
  return savings;
}

export function useFinanceAnalytics() {
  const queryClient = useQueryClient();

  // Cost Predictions with REAL data
  const costPredictions = useQuery({
    queryKey: ['finance', 'cost-predictions'],
    queryFn: () => predictiveCostEngine.predictCosts('quarterly'),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Budget Forecast with REAL data
  const annualBudget = useQuery({
    queryKey: ['finance', 'annual-budget', new Date().getFullYear()],
    queryFn: () => budgetForecastEngine.createAnnualBudget(new Date().getFullYear()),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Budget Variance Alerts with REAL data
  const varianceAlerts = useQuery({
    queryKey: ['finance', 'variance-alerts'],
    queryFn: () => budgetForecastEngine.monitorBudgetRealtime(),
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  // REAL Pending Invoices
  const pendingInvoices = useQuery({
    queryKey: ['finance', 'pending-invoices'],
    queryFn: fetchPendingInvoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // REAL Savings Implemented
  const savingsImplemented = useQuery({
    queryKey: ['finance', 'savings-implemented'],
    queryFn: fetchSavingsImplemented,
    staleTime: 1000 * 60 * 30, // 30 minutes
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

  // Calculate REAL financial metrics
  const metrics: FinancialMetrics | null = annualBudget.data ? {
    total_expenses: Object.values(annualBudget.data.byCategory).reduce((sum, cat) => sum + cat.spent, 0),
    total_budget: annualBudget.data.totalBudget,
    budget_variance: Object.values(annualBudget.data.byCategory).reduce((sum, cat) => sum + cat.variance, 0),
    variance_percentage: Object.values(annualBudget.data.byCategory).reduce((sum, cat) => sum + cat.variancePercentage, 0) / Object.keys(annualBudget.data.byCategory).length,
    pending_invoices: pendingInvoices.data?.count || 0,
    pending_amount: pendingInvoices.data?.amount || 0,
    savings_identified: costPredictions.data?.savingsOpportunities.reduce((sum, s) => sum + s.potential_savings, 0) || 0,
    savings_implemented: savingsImplemented.data || 0,
  } : null;

  return {
    // Data
    costPredictions: costPredictions.data,
    annualBudget: annualBudget.data,
    varianceAlerts: varianceAlerts.data,
    currencyRates: currencyRates.data,
    pendingInvoices: pendingInvoices.data,
    savingsImplemented: savingsImplemented.data,
    metrics,

    // Loading states
    isLoading: costPredictions.isLoading || annualBudget.isLoading || pendingInvoices.isLoading,

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
