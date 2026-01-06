/**
 * useWeatherRouting Hook
 * React hook for weather-based route optimization
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  calculateWeatherRouting,
  storeRouteCalculation,
  WeatherRoutingResult,
  RouteRequest,
  AlternativeRoute,
} from "@/lib/routing/weather-routing";
import { useToast } from "@/hooks/use-toast";

interface UseWeatherRoutingOptions {
  autoStore?: boolean;
  vesselId?: string;
}

interface UseWeatherRoutingResult {
  result: WeatherRoutingResult | null;
  isCalculating: boolean;
  error: Error | null;
  calculateRoute: (request: RouteRequest) => Promise<WeatherRoutingResult | null>;
  selectRoute: (route: AlternativeRoute) => void;
  selectedRoute: AlternativeRoute | null;
  refetch: () => void;
}

export function useWeatherRouting(
  options: UseWeatherRoutingOptions = {}
): UseWeatherRoutingResult {
  const { autoStore = true, vesselId } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentRequest, setCurrentRequest] = useState<RouteRequest | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<AlternativeRoute | null>(null);

  // Query for route calculation
  const {
    data: result,
    isLoading: isCalculating,
    error,
    refetch,
  } = useQuery({
    queryKey: ["weather-routing", currentRequest],
    queryFn: async () => {
      if (!currentRequest) return null;
      
      const routingResult = await calculateWeatherRouting(currentRequest);
      
      // Store if enabled
      if (autoStore) {
        await storeRouteCalculation(routingResult, vesselId);
      }
      
      // Auto-select recommended route
      setSelectedRoute(routingResult.recommendedRoute);
      
      return routingResult;
    },
    enabled: !!currentRequest,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate route mutation
  const calculateMutation = useMutation({
    mutationFn: async (request: RouteRequest) => {
      setCurrentRequest(request);
      return calculateWeatherRouting(request);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["weather-routing", currentRequest], data);
      setSelectedRoute(data.recommendedRoute);
      
      toast({
        title: "Rotas Calculadas",
        description: `${data.alternatives.length + 1} rotas disponíveis. ${data.hazardZones.length} zonas de risco identificadas.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Erro no Cálculo",
        description: err instanceof Error ? err.message : "Falha ao calcular rotas",
        variant: "destructive",
      });
    },
  });

  const calculateRoute = useCallback(
    async (request: RouteRequest): Promise<WeatherRoutingResult | null> => {
      try {
        const result = await calculateMutation.mutateAsync(request);
        return result;
      } catch {
        return null;
      }
    },
    [calculateMutation]
  );

  const selectRoute = useCallback((route: AlternativeRoute) => {
    setSelectedRoute(route);
    toast({
      title: "Rota Selecionada",
      description: `${route.name} - ${route.totalDistance.toFixed(0)} nm, ETA: ${route.eta.toLocaleString("pt-BR")}`,
    });
  }, [toast]);

  return {
    result: result ?? null,
    isCalculating: isCalculating || calculateMutation.isPending,
    error: error as Error | null,
    calculateRoute,
    selectRoute,
    selectedRoute,
    refetch,
  };
}

export default useWeatherRouting;
