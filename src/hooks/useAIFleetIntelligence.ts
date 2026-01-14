/**
 * useAIFleetIntelligence - Hook de IA para Inteligência de Frota
 * Predição de rotas, otimização de combustível, detecção de anomalias
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function useAIFleetIntelligence() {
  const queryClient = useQueryClient();
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  // Query: Posições da frota em tempo real
  const positionsQuery = useQuery({
    queryKey: ['fleet-positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessel_positions')
        .select('*')
        .order('last_update', { ascending: false });

      if (error) return getMockPositions();
      return data?.length ? data : getMockPositions();
    },
    refetchInterval: 30000, // Atualizar a cada 30s
  });

  // Query: Anomalias detectadas
  const anomaliesQuery = useQuery({
    queryKey: ['fleet-anomalies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_anomalies')
        .select('*')
        .eq('resolved', false)
        .order('detected_at', { ascending: false });

      if (error) return getMockAnomalies();
      return data || [];
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
  });

  // Mutation: Detectar anomalias
  const detectAnomaliesMutation = useMutation({
    mutationFn: async () => {
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
  const stats = {
    totalVessels: positionsQuery.data?.length || 0,
    sailing: positionsQuery.data?.filter((v: any) => v.status === 'sailing').length || 0,
    inPort: positionsQuery.data?.filter((v: any) => v.status === 'in_port').length || 0,
    anomalies: anomaliesQuery.data?.length || 0,
    criticalAnomalies: anomaliesQuery.data?.filter((a: any) => a.severity === 'critical').length || 0,
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

    // Refetch
    refetch: () => {
      positionsQuery.refetch();
      anomaliesQuery.refetch();
    },
  };
}

function getMockPositions(): VesselPosition[] {
  return [
    {
      id: '1',
      vessel_id: 'v1',
      vessel_name: 'Nauti Alpha',
      lat: -22.9068,
      lng: -43.1729,
      heading: 45,
      speed: 12.5,
      destination: 'Santos',
      eta: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'sailing',
      last_update: new Date().toISOString(),
    },
    {
      id: '2',
      vessel_id: 'v2',
      vessel_name: 'Nauti Beta',
      lat: -23.9618,
      lng: -46.3322,
      heading: 0,
      speed: 0,
      status: 'in_port',
      last_update: new Date().toISOString(),
    },
    {
      id: '3',
      vessel_id: 'v3',
      vessel_name: 'Nauti Gamma',
      lat: -25.4284,
      lng: -49.2733,
      heading: 180,
      speed: 8.2,
      destination: 'Paranaguá',
      status: 'sailing',
      last_update: new Date().toISOString(),
    },
  ];
}

function getMockAnomalies(): FleetAnomaly[] {
  return [
    {
      id: '1',
      vessel_id: 'v1',
      vessel_name: 'Nauti Alpha',
      type: 'consumption_spike',
      severity: 'warning',
      description: 'Consumo de combustível 15% acima do esperado',
      detected_at: new Date().toISOString(),
      resolved: false,
    },
  ];
}

export default useAIFleetIntelligence;
