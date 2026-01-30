/**
 * Hook for Inventory & Spares AI Module
 * Smart inventory, demand forecasting, auto-reordering, cost optimization
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  location: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  lastOrderDate?: string;
  leadTime: number;
  criticality: 'critical' | 'essential' | 'standard';
  abcClass: 'A' | 'B' | 'C';
  usageRate: number;
}

export interface DemandForecast {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  recommendedOrder: number;
  optimalOrderDate: string;
  factors: Array<{ name: string; impact: number }>;
  seasonalAdjustment: number;
  maintenanceCorrelation: number;
}

export interface ReorderSuggestion {
  itemId: string;
  itemName: string;
  currentStock: number;
  reorderPoint: number;
  eoq: number; // Economic Order Quantity
  suppliers: Array<{ name: string; price: number; leadTime: number; rating: number }>;
  recommendedSupplier: string;
  estimatedSavings: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface CostAnalysis {
  totalInventoryValue: number;
  turnoverRate: number;
  carryingCost: number;
  stockoutCost: number;
  obsolescenceRisk: number;
  optimizationOpportunities: Array<{ item: string; action: string; potentialSavings: number }>;
  abcAnalysis: { A: number; B: number; C: number };
}

export function useInventorySparesAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInventoryStatus = useCallback(async (
    vesselId?: string,
    category?: string
  ): Promise<InventoryItem[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-spares-ai', {
        body: { 
          action: 'get_inventory_status',
          vesselId,
          category
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.inventoryItems;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar inventário';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forecastDemand = useCallback(async (
    vesselId: string,
    itemIds?: string[],
    horizonDays: number = 90
  ): Promise<DemandForecast[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-spares-ai', {
        body: { 
          action: 'forecast_demand',
          vesselId,
          itemIds,
          horizonDays
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Previsão Gerada',
        description: `${data.demandForecasts?.length || 0} itens analisados`,
      });

      return data.demandForecasts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao prever demanda';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getReorderSuggestions = useCallback(async (
    vesselId: string
  ): Promise<ReorderSuggestion[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-spares-ai', {
        body: { 
          action: 'get_reorder_suggestions',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const critical = data.reorderSuggestions?.filter(
        (s: ReorderSuggestion) => s.urgency === 'critical'
      ).length || 0;

      if (critical > 0) {
        toast({
          title: 'Reabastecimento Urgente',
          description: `${critical} itens críticos precisam de reposição`,
          variant: 'destructive',
        });
      }

      return data.reorderSuggestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar sugestões';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const analyzeCosts = useCallback(async (
    vesselId?: string
  ): Promise<CostAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-spares-ai', {
        body: { 
          action: 'analyze_costs',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Análise de Custos',
        description: `Valor total: $${(data.costAnalysis?.totalInventoryValue || 0).toLocaleString()}`,
      });

      return data.costAnalysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar custos';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const optimizeInventory = useCallback(async (
    vesselId: string
  ): Promise<{ 
    recommendations: Array<{ item: string; action: string; impact: string }>; 
    potentialSavings: number 
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-spares-ai', {
        body: { 
          action: 'optimize_inventory',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Otimização Completa',
        description: `Economia potencial: $${(data.optimization?.potentialSavings || 0).toLocaleString()}`,
      });

      return data.optimization;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao otimizar inventário';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const findAlternatives = useCallback(async (
    partNumber: string
  ): Promise<Array<{ partNumber: string; name: string; compatibility: number; priceDiff: number; supplier: string }> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-spares-ai', {
        body: { 
          action: 'find_alternatives',
          partNumber
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.alternatives;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar alternativas';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getInventoryStatus,
    forecastDemand,
    getReorderSuggestions,
    analyzeCosts,
    optimizeInventory,
    findAlternatives
  };
}
