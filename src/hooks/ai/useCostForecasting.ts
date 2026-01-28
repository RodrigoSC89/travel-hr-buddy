/**
 * useCostForecasting Hook
 * Interface para previsão de custos operacionais
 */

import { useState, useCallback } from 'react';
import { 
  costForecastingEngine,
  type HistoricalCost,
  type CostForecast,
  type SavingsOpportunity,
  type BunkerOptimization
} from '@/lib/ai/engines/cost-forecasting';
import { toast } from 'sonner';

interface UseCostForecastingReturn {
  isLoading: boolean;
  forecast: CostForecast | null;
  bunkerOptimization: BunkerOptimization | null;
  generateForecast: (historicalData: HistoricalCost[], forecastDays?: number) => Promise<CostForecast | null>;
  optimizeBunker: (currentPrice: number, historicalPrices: Array<{ date: Date; price: number; port: string }>, availablePorts: Array<{ code: string; name: string; price: number }>) => Promise<BunkerOptimization | null>;
  getSavingsOpportunities: () => SavingsOpportunity[];
  getTotalForecastedCost: () => number;
  clearForecasts: () => void;
}

export function useCostForecasting(): UseCostForecastingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<CostForecast | null>(null);
  const [bunkerOptimization, setBunkerOptimization] = useState<BunkerOptimization | null>(null);

  const generateForecast = useCallback(async (
    historicalData: HistoricalCost[],
    forecastDays: number = 90
  ): Promise<CostForecast | null> => {
    setIsLoading(true);
    try {
      const result = await costForecastingEngine.forecastCosts(historicalData, forecastDays);
      setForecast(result);
      
      toast.success(`Previsão gerada: ${forecastDays} dias`, {
        description: `Total previsto: $${(result.totalForecast / 1000).toFixed(0)}k`
      });
      
      return result;
    } catch (error) {
      console.error('[useCostForecasting] Error:', error);
      toast.error('Erro ao gerar previsão');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeBunker = useCallback(async (
    currentPrice: number,
    historicalPrices: Array<{ date: Date; price: number; port: string }>,
    availablePorts: Array<{ code: string; name: string; price: number }>
  ): Promise<BunkerOptimization | null> => {
    setIsLoading(true);
    try {
      const optimization = await costForecastingEngine.optimizeBunker(
        currentPrice,
        historicalPrices,
        availablePorts
      );
      setBunkerOptimization(optimization);
      
      toast.success(`Bunker otimizado: ${optimization.buySignal}`, {
        description: `Direção de preço: ${optimization.priceDirection}`
      });
      
      return optimization;
    } catch (error) {
      console.error('[useCostForecasting] Bunker error:', error);
      toast.error('Erro na otimização de bunker');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSavingsOpportunities = useCallback((): SavingsOpportunity[] => {
    return forecast?.savings || [];
  }, [forecast]);

  const getTotalForecastedCost = useCallback((): number => {
    return forecast?.totalForecast || 0;
  }, [forecast]);

  const clearForecasts = useCallback(() => {
    setForecast(null);
    setBunkerOptimization(null);
  }, []);

  return {
    isLoading,
    forecast,
    bunkerOptimization,
    generateForecast,
    optimizeBunker,
    getSavingsOpportunities,
    getTotalForecastedCost,
    clearForecasts
  };
}
