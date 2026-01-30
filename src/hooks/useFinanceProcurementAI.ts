/**
 * Finance & Procurement AI Hook
 * Predictive costs, intelligent procurement, multi-currency, invoice automation
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CostPrediction {
  fuel: number;
  maintenance: number;
  crew: number;
  port: number;
  insurance: number;
  other: number;
  total: number;
  confidence: number;
  month: string;
}

export interface SavingsOpportunity {
  id: string;
  category: string;
  currentCost: number;
  potentialSavings: number;
  savingsPercentage: number;
  actions: string[];
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  roi: number;
}

export interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  price: number;
  leadTime: number;
  qualityScore: number;
  reliabilityScore: number;
  overallScore: number;
  recommendation: string;
}

export interface InvoiceProcessingResult {
  invoiceNumber: string;
  vendor: string;
  amount: number;
  dueDate: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  validation: { passed: boolean; issues: string[] };
  decision: 'auto_approve' | 'reject' | 'escalate';
  confidence: number;
}

export interface BudgetForecast {
  year: number;
  totalBudget: number;
  byCategory: Record<string, number>;
  byVessel: Record<string, number>;
  byMonth: number[];
  variance: { expected: number; risk: number };
  scenarios: { optimistic: number; baseline: number; pessimistic: number };
}

export function useFinanceProcurementAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictCosts = useCallback(async (
    timeframe: 'monthly' | 'quarterly' | 'yearly',
    vesselId?: string
  ): Promise<CostPrediction[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'predict_costs',
          timeframe,
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Predição de Custos',
        description: `Confiança média: ${(data.avgConfidence * 100 || 85).toFixed(0)}%`,
      });

      return data.predictions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao prever custos';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const identifySavings = useCallback(async (
    vesselId?: string
  ): Promise<SavingsOpportunity[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'identify_savings',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const totalSavings = data.opportunities?.reduce(
        (acc: number, o: SavingsOpportunity) => acc + o.potentialSavings, 0
      ) || 0;

      toast({
        title: 'Oportunidades Identificadas',
        description: `Economia potencial: $${totalSavings.toLocaleString()}`,
      });

      return data.opportunities;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao identificar economias';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getSupplierRecommendations = useCallback(async (
    itemCategory: string,
    quantity: number,
    urgency: 'low' | 'medium' | 'high'
  ): Promise<SupplierRecommendation[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'recommend_suppliers',
          itemCategory,
          quantity,
          urgency
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.recommendations;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao recomendar fornecedores';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processInvoice = useCallback(async (
    fileUrl: string
  ): Promise<InvoiceProcessingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'process_invoice',
          fileUrl
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const result = data.result as InvoiceProcessingResult;
      
      toast({
        title: result.decision === 'auto_approve' ? 'Fatura Aprovada' : 
               result.decision === 'reject' ? 'Fatura Rejeitada' : 'Requer Revisão',
        description: `Invoice #${result.invoiceNumber} - $${result.amount.toLocaleString()}`,
        variant: result.decision === 'reject' ? 'destructive' : 'default'
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar fatura';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateBudgetForecast = useCallback(async (
    year: number,
    vesselIds?: string[]
  ): Promise<BudgetForecast | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'generate_budget_forecast',
          year,
          vesselIds
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Forecast Gerado',
        description: `Orçamento ${year}: $${(data.forecast?.totalBudget || 0).toLocaleString()}`,
      });

      return data.forecast;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar forecast';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const analyzeVendorPerformance = useCallback(async (
    vendorId: string
  ): Promise<{
    score: number;
    onTimeDelivery: number;
    qualityScore: number;
    priceCompetitiveness: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendation: string;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'analyze_vendor',
          vendorId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar fornecedor';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeProcurement = useCallback(async (
    items: Array<{ itemId: string; quantity: number; requiredBy: string }>
  ): Promise<{
    optimizedOrders: Array<{ vendorId: string; items: string[]; totalCost: number; deliveryDate: string }>;
    savings: number;
    consolidationBenefits: string[];
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'optimize_procurement',
          items
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Procurement Otimizado',
        description: `Economia: $${(data.optimization?.savings || 0).toLocaleString()}`,
      });

      return data.optimization;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao otimizar procurement';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getFinancialInsights = useCallback(async (): Promise<{
    kpis: Record<string, number>;
    alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'critical' }>;
    recommendations: string[];
    trends: Array<{ metric: string; direction: 'up' | 'down' | 'stable'; change: number }>;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('finance-procurement-ai', {
        body: { 
          action: 'get_insights'
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.insights;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar insights';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    predictCosts,
    identifySavings,
    getSupplierRecommendations,
    processInvoice,
    generateBudgetForecast,
    analyzeVendorPerformance,
    optimizeProcurement,
    getFinancialInsights
  };
}
