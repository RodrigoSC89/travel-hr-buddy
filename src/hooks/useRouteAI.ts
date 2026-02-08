/**
 * Hook for AI-powered route optimization via bunker-ai edge function
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface RouteAIResult {
  optimal_speed_knots?: number;
  estimated_fuel_consumption_tons?: number;
  recommended_stops?: Array<{ port: string; purpose: string; eta: string }>;
  fuel_savings_percent?: number;
  co2_reduction_tons?: number;
  voyage_cost_usd?: number;
  recommendations?: string[];
  raw_response?: string;
}

interface EfficiencyResult {
  eeoi_value?: number;
  eeoi_rating?: string;
  cii_value?: number;
  cii_rating?: string;
  compliance_status?: string;
  improvement_potential_percent?: number;
  recommendations?: string[];
  raw_response?: string;
}

export function useRouteAI() {
  const [result, setResult] = useState<RouteAIResult | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const optimizeRoute = async (params: {
    origin: string;
    destination: string;
    distance_nm: number;
    vessel_type?: string;
    base_consumption?: number;
    eco_speed?: number;
    max_speed?: number;
    weather?: string;
    deadline?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bunker-ai', {
        body: {
          action: 'optimize_route',
          data: params
        }
      });

      if (error) throw error;

      const aiResult = data?.result || data;
      setResult(aiResult);
      
      toast({
        title: '🧠 Rota Otimizada com IA',
        description: `Economia estimada: ${aiResult?.fuel_savings_percent || 0}% de combustível`,
      });

      return aiResult;
    } catch (err) {
      logger.error('Route AI error:', err);
      toast({
        title: 'Erro na Otimização AI',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeEfficiency = async (params: {
    vessel?: Record<string, unknown>;
    voyages?: unknown[];
    total_consumption_tons?: number;
    total_distance_nm?: number;
    cargo_transported_tons?: number;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bunker-ai', {
        body: {
          action: 'efficiency_report',
          data: params
        }
      });

      if (error) throw error;

      const aiResult = data?.result || data;
      setEfficiency(aiResult);
      return aiResult;
    } catch (err) {
      logger.error('Efficiency AI error:', err);
      toast({
        title: 'Erro na Análise de Eficiência',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { result, efficiency, loading, optimizeRoute, analyzeEfficiency };
}
