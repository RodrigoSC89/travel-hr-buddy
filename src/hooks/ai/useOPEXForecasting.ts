/**
 * useOPEXForecasting Hook
 * Interface for operational expense forecasting
 */

import { useState, useCallback } from 'react';
import { 
  opexForecastingEngine,
  type HistoricalExpense,
  type OPEXForecast
} from '@/lib/ai/engines';
import { toast } from 'sonner';

export function useOPEXForecasting() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<OPEXForecast | null>(null);

  const generateForecast = useCallback((
    historicalData: HistoricalExpense[],
    vesselId: string,
    vesselName: string,
    horizon: number = 90
  ) => {
    setIsLoading(true);
    try {
      const result = opexForecastingEngine.generateForecast(
        historicalData, vesselId, vesselName, horizon
      );
      setForecast(result);
      
      toast.success(`Previsão gerada: $${result.totalNext30Days.toLocaleString()} próximos 30 dias`);
      return result;
    } catch (error) {
      console.error('[useOPEXForecasting] Error:', error);
      toast.error('Erro na previsão de custos');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTopCategories = useCallback(() => {
    if (!forecast) return [];
    return forecast.categoryBreakdown.slice(0, 5);
  }, [forecast]);

  const getRecommendations = useCallback(() => {
    if (!forecast) return [];
    return forecast.recommendations;
  }, [forecast]);

  return {
    isLoading,
    forecast,
    generateForecast,
    getTopCategories,
    getRecommendations
  };
}
