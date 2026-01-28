/**
 * useRouteOptimization Hook
 * Interface para o engine de otimização de rotas
 */

import { useState, useCallback } from 'react';
import { 
  routeOptimizationEngine,
  type VesselPosition,
  type WeatherCondition,
  type OptimizedRoute,
  type SpeedAdjustment
} from '@/lib/ai/engines/route-optimization';
import { toast } from 'sonner';

interface VesselConfig {
  id: string;
  currentPosition: VesselPosition;
  fuelCapacity: number;
  currentFuel: number;
  averageConsumption: number;
  maxSpeed: number;
  economicalSpeed: number;
}

interface RouteOptions {
  optimizationType: OptimizedRoute['optimizationType'];
  maxDeviationNm?: number;
  requiredArrivalTime?: Date;
  avoidAreas?: Array<{ lat: number; lon: number; radius: number }>;
}

interface UseRouteOptimizationReturn {
  isLoading: boolean;
  route: OptimizedRoute | null;
  adjustments: { speedAdjustments: SpeedAdjustment[]; urgency: string; reason: string } | null;
  optimizeRoute: (vessel: VesselConfig, destination: { latitude: number; longitude: number; name: string }, options: RouteOptions) => Promise<OptimizedRoute | null>;
  getRealTimeAdjustments: (route: OptimizedRoute, currentPosition: VesselPosition, weather: WeatherCondition) => void;
  clearRoute: () => void;
}

export function useRouteOptimization(): UseRouteOptimizationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [adjustments, setAdjustments] = useState<{ speedAdjustments: SpeedAdjustment[]; urgency: string; reason: string } | null>(null);

  const optimizeRoute = useCallback(async (
    vessel: VesselConfig,
    destination: { latitude: number; longitude: number; name: string },
    options: RouteOptions
  ): Promise<OptimizedRoute | null> => {
    setIsLoading(true);
    try {
      const optimizedRoute = await routeOptimizationEngine.optimizeRoute(
        vessel,
        destination,
        options
      );
      
      setRoute(optimizedRoute);
      
      toast.success(`Rota otimizada: ${optimizedRoute.totalDistance.toFixed(0)} nm`, {
        description: `Economia: ${optimizedRoute.savings.fuel.toFixed(1)}% combustível`
      });
      
      return optimizedRoute;
    } catch (error) {
      console.error('[useRouteOptimization] Error:', error);
      toast.error('Erro ao otimizar rota');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRealTimeAdjustments = useCallback((
    routeData: OptimizedRoute,
    currentPosition: VesselPosition,
    weather: WeatherCondition
  ) => {
    const result = routeOptimizationEngine.calculateRealTimeAdjustments(
      routeData,
      currentPosition,
      weather
    );
    setAdjustments(result);
    
    if (result.urgency === 'high') {
      toast.error(`⚠️ Ajuste urgente: ${result.reason}`);
    } else if (result.urgency === 'medium') {
      toast.warning(result.reason);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setAdjustments(null);
  }, []);

  return {
    isLoading,
    route,
    adjustments,
    optimizeRoute,
    getRealTimeAdjustments,
    clearRoute
  };
}
