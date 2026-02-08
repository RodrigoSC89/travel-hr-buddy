/**
 * Hook for AI-powered fuel consumption prediction via bunker-ai edge function
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface FuelPrediction {
  predicted_consumption_tons?: number;
  confidence_score?: number;
  recommended_refuel_date?: string;
  optimal_refuel_port?: string;
  estimated_cost_usd?: number;
  potential_savings_usd?: number;
  optimization_tips?: string[];
  factors?: Array<{ factor: string; impact: string }>;
  raw_response?: string;
}

interface PriceComparison {
  recommended_port?: string;
  price_per_ton_usd?: number;
  savings_vs_average_usd?: number;
  price_trend?: string;
  confidence?: number;
  port_rankings?: Array<{ port: string; price: number; score: number }>;
  analysis?: string;
  raw_response?: string;
}

export function useFuelAI() {
  const [prediction, setPrediction] = useState<FuelPrediction | null>(null);
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const predictConsumption = async (params: {
    history?: unknown[];
    origin?: string;
    destination?: string;
    distance_nm?: number;
    planned_speed?: number;
    weather_forecast?: string;
    cargo_weight?: number;
    fuel_type?: string;
    current_stock_tons?: number;
    min_rob_tons?: number;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bunker-ai', {
        body: {
          action: 'predict_consumption',
          data: params
        }
      });

      if (error) throw error;

      const aiResult = data?.result || data;
      setPrediction(aiResult);
      
      toast({
        title: '🧠 Previsão de Consumo Gerada',
        description: `Consumo estimado: ${aiResult?.predicted_consumption_tons || '?'} tons`,
      });

      return aiResult;
    } catch (err) {
      logger.error('Fuel AI prediction error', err as Error);
      toast({
        title: 'Erro na Previsão AI',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const comparePrices = async (params: {
    ports?: unknown[];
    current_position?: string;
    quantity_tons?: number;
    fuel_type?: string;
    urgency?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bunker-ai', {
        body: {
          action: 'compare_prices',
          data: params
        }
      });

      if (error) throw error;

      const aiResult = data?.result || data;
      setPriceComparison(aiResult);
      return aiResult;
    } catch (err) {
      logger.error('Fuel AI price comparison error', err as Error);
      toast({
        title: 'Erro na Comparação de Preços',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { prediction, priceComparison, loading, predictConsumption, comparePrices };
}
