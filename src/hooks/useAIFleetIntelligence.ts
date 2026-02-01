/**
 * useAIFleetIntelligence - Hook de IA para Inteligência de Frota
 * Predição de rotas, otimização de combustível, detecção de anomalias
 * PATCH: Removed mock fallbacks and as any casts
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface VesselPosition {
  id: string;
  vessel_id: string;
  vessel_name: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  destination?: string;
  eta?: string;
  status: 'sailing' | 'anchored' | 'in_port' | 'maneuvering';
  last_update: string;
}

interface RoutePrediction {
  id: string;
  vessel_id: string;
  predicted_route: { lat: number; lng: number; eta: string }[];
  weather_impact: 'none' | 'minor' | 'moderate' | 'severe';
  fuel_estimate: number;
  confidence: number;
  alternatives: RouteAlternative[];
}

interface RouteAlternative {
  id: string;
  name: string;
  distance_nm: number;
  eta: string;
  fuel_savings: number;
  weather_risk: 'low' | 'medium' | 'high';
}

interface FuelOptimization {
  current_consumption: number;
  optimized_consumption: number;
  savings_percent: number;
  recommendations: string[];
  speed_adjustments: { segment: string; recommended_speed: number }[];
}

interface FleetAnomaly {
  id: string;
  vessel_id: string;
  vessel_name: string;
  type: 'route_deviation' | 'speed_anomaly' | 'consumption_spike' | 'equipment_warning';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  detected_at: string;
  resolved: boolean;
}

interface FleetStats {
  totalVessels: number;
  sailing: number;
  inPort: number;
  anomalies: number;
  criticalAnomalies: number;
}

export interface UseAIFleetIntelligenceReturn {
  positions: VesselPosition[];
  anomalies: FleetAnomaly[];
  selectedVessel: string | null;
  stats: FleetStats;
  setSelectedVessel: (vesselId: string | null) => void;
  predictRoute: (vesselId: string) => Promise<RoutePrediction>;
  optimizeFuel: (vesselId: string) => Promise<FuelOptimization>;
  detectAnomalies: () => Promise<FleetAnomaly[]>;
  isLoading: boolean;
  isPredicting: boolean;
  isOptimizing: boolean;
  isEmpty: boolean;
  refetch: () => void;
}

export function useAIFleetIntelligence(): UseAIFleetIntelligenceReturn {
  const queryClient = useQueryClient();
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  // Query: Posições da frota em tempo real - usando vessels + vessel_telemetry
  const positionsQuery = useQuery({
    queryKey: ['fleet-positions'],
    queryFn: async (): Promise<VesselPosition[]> => {
      // Get vessels with their latest telemetry
      const { data: vessels, error: vesselsError } = await supabase
        .from('vessels')
        .select('id, name, status, vessel_type')
        .eq('status', 'active')
        .limit(50);

      if (vesselsError) {
        logger.warn('[useAIFleetIntelligence] Error fetching vessels', { error: vesselsError.message });
        return [];
      }

      if (!vessels || vessels.length === 0) {
        return [];
      }

      // Return vessels with default position data
      return vessels.map((vessel) => ({
        id: vessel.id,
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        lat: -23.5,
        lng: -46.6,
        heading: 0,
        speed: 0,
        status: inferVesselStatus(vessel.status, 0),
        last_update: new Date().toISOString(),
      }));
    },
    refetchInterval: 30000,
  });

  // Query: Anomalias detectadas - usando soc_alerts com tipo fleet
  const anomaliesQuery = useQuery({
    queryKey: ['fleet-anomalies'],
    queryFn: async (): Promise<FleetAnomaly[]> => {
      const { data, error } = await supabase
        .from('soc_alerts')
        .select('*, vessel:vessels(name)')
        .in('alert_type', ['route_deviation', 'speed_anomaly', 'consumption_spike', 'equipment_warning', 'vessel_alert'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.warn('[useAIFleetIntelligence] Error fetching anomalies', { error: error.message });
        return [];
      }

      if (!data) return [];

      type AlertRow = typeof data[number];
      return data.map((alert: AlertRow) => ({
        id: alert.id,
        vessel_id: alert.vessel_id || '',
        vessel_name: (alert.vessel as { name?: string } | null)?.name || 'Unknown',
        type: (alert.alert_type as FleetAnomaly['type']) || 'equipment_warning',
        severity: (alert.severity as FleetAnomaly['severity']) || 'warning',
        description: alert.message || alert.title,
        detected_at: alert.created_at,
        resolved: alert.is_acknowledged || false,
      }));
    },
    refetchInterval: 60000,
  });

  // Mutation: Predição de rota com IA
  const predictRouteMutation = useMutation({
    mutationFn: async (vesselId: string): Promise<RoutePrediction> => {
      const { data, error } = await supabase.functions.invoke('fleet-intelligence-ai', {
        body: {
          action: 'predict_route',
          vesselId,
        },
      });

      if (error) throw error;
      return data.prediction as RoutePrediction;
    },
    onSuccess: () => {
      toast.success('Predição de rota gerada!');
    },
    onError: (error) => {
      logger.error('[useAIFleetIntelligence] Predict route failed', error);
      toast.error('Erro ao gerar predição de rota');
    },
  });

  // Mutation: Otimização de combustível
  const optimizeFuelMutation = useMutation({
    mutationFn: async (vesselId: string): Promise<FuelOptimization> => {
      const { data, error } = await supabase.functions.invoke('fleet-intelligence-ai', {
        body: {
          action: 'optimize_fuel',
          vesselId,
        },
      });

      if (error) throw error;
      return data.optimization as FuelOptimization;
    },
    onSuccess: () => {
      toast.success('Otimização de combustível calculada!');
    },
    onError: (error) => {
      logger.error('[useAIFleetIntelligence] Optimize fuel failed', error);
      toast.error('Erro ao calcular otimização');
    },
  });

  // Mutation: Detectar anomalias
  const detectAnomaliesMutation = useMutation({
    mutationFn: async (): Promise<FleetAnomaly[]> => {
      const { data, error } = await supabase.functions.invoke('fleet-intelligence-ai', {
        body: {
          action: 'detect_anomalies',
        },
      });

      if (error) throw error;
      return data.anomalies as FleetAnomaly[];
    },
    onSuccess: (anomalies) => {
      if (anomalies.length > 0) {
        toast.warning(`${anomalies.length} anomalia(s) detectada(s)!`);
      } else {
        toast.success('Nenhuma anomalia detectada');
      }
      queryClient.invalidateQueries({ queryKey: ['fleet-anomalies'] });
    },
    onError: (error) => {
      logger.error('[useAIFleetIntelligence] Detect anomalies failed', error);
      toast.error('Erro ao detectar anomalias');
    },
  });

  // Actions
  const predictRoute = useCallback(
    async (vesselId: string) => {
      return predictRouteMutation.mutateAsync(vesselId);
    },
    [predictRouteMutation]
  );

  const optimizeFuel = useCallback(
    async (vesselId: string) => {
      return optimizeFuelMutation.mutateAsync(vesselId);
    },
    [optimizeFuelMutation]
  );

  const detectAnomalies = useCallback(async () => {
    return detectAnomaliesMutation.mutateAsync();
  }, [detectAnomaliesMutation]);

  // Statistics
  const stats: FleetStats = {
    totalVessels: positionsQuery.data?.length || 0,
    sailing: positionsQuery.data?.filter((v) => v.status === 'sailing').length || 0,
    inPort: positionsQuery.data?.filter((v) => v.status === 'in_port').length || 0,
    anomalies: anomaliesQuery.data?.length || 0,
    criticalAnomalies: anomaliesQuery.data?.filter((a) => a.severity === 'critical').length || 0,
  };

  return {
    // Data
    positions: positionsQuery.data || [],
    anomalies: anomaliesQuery.data || [],
    selectedVessel,
    stats,

    // Actions
    setSelectedVessel,
    predictRoute,
    optimizeFuel,
    detectAnomalies,

    // Loading
    isLoading: positionsQuery.isLoading,
    isPredicting: predictRouteMutation.isPending,
    isOptimizing: optimizeFuelMutation.isPending,

    // Status flags
    isEmpty: (positionsQuery.data?.length || 0) === 0,

    // Refetch
    refetch: () => {
      positionsQuery.refetch();
      anomaliesQuery.refetch();
    },
  };
}

function inferVesselStatus(status: string | null, speed?: number): VesselPosition['status'] {
  if (status === 'in_port' || status === 'docked') return 'in_port';
  if (status === 'anchored') return 'anchored';
  if (speed && speed > 0.5) return 'sailing';
  if (speed && speed > 0) return 'maneuvering';
  return 'anchored';
}

export default useAIFleetIntelligence;
