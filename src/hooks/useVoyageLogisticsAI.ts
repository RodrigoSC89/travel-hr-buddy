/**
 * Hook for Voyage & Logistics AI Module
 * Route optimization, port operations, cargo tracking, bunker management
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RouteOptimization {
  optimizedRoute: Array<{ lat: number; lng: number; name: string }>;
  totalDistance: number;
  estimatedDuration: number;
  fuelConsumption: number;
  co2Emissions: number;
  costEstimate: number;
  weatherWindows: Array<{ start: string; end: string; conditions: string }>;
  ecaZones: string[];
  piracyRisk: 'low' | 'medium' | 'high';
}

export interface PortOperation {
  portCode: string;
  portName: string;
  berthAllocation: string;
  arrivalPlanned: string;
  departurePlanned: string;
  cargoOperations: Array<{ type: string; cargo: string; quantity: number }>;
  estimatedCosts: number;
  documentation: string[];
  agentContact: { name: string; phone: string; email: string };
}

export interface CargoTracking {
  cargoId: string;
  cargoType: string;
  status: 'loading' | 'in_transit' | 'unloading' | 'delivered';
  currentLocation: { lat: number; lng: number };
  temperature?: number;
  humidity?: number;
  eta: string;
  condition: 'good' | 'warning' | 'damaged';
  stakeholderNotifications: string[];
}

export interface BunkerPlan {
  optimalPort: string;
  predictedPrice: number;
  quantity: number;
  qualityVerification: { sulfurContent: number; density: number };
  consumptionMonitoring: { daily: number; projected: number };
  surveyAnalysis: string;
}

export function useVoyageLogisticsAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeRoute = useCallback(async (
    origin: { lat: number; lng: number; name: string },
    destination: { lat: number; lng: number; name: string },
    vessel: { id: string; type: string; speed: number; fuelConsumption: number },
    constraints?: { avoidECA?: boolean; avoidPiracy?: boolean; weatherOptimize?: boolean }
  ): Promise<RouteOptimization | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voyage-logistics-ai', {
        body: { 
          action: 'optimize_route',
          origin,
          destination,
          vessel,
          constraints
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Rota Otimizada',
        description: `Economia estimada: ${data.costSavings || '15%'}`,
      });

      return data.optimization;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao otimizar rota';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const planPortCall = useCallback(async (
    vesselId: string,
    portCode: string,
    plannedArrival: string,
    operations: Array<{ type: 'loading' | 'unloading' | 'bunkering'; cargo?: string; quantity?: number }>
  ): Promise<PortOperation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voyage-logistics-ai', {
        body: { 
          action: 'plan_port_call',
          vesselId,
          portCode,
          plannedArrival,
          operations
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Port Call Planejado',
        description: `Berço alocado: ${data.portOperation?.berthAllocation || 'Berth A'}`,
      });

      return data.portOperation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao planejar port call';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const trackCargo = useCallback(async (
    cargoId: string
  ): Promise<CargoTracking | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voyage-logistics-ai', {
        body: { 
          action: 'track_cargo',
          cargoId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.cargoTracking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao rastrear carga';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeBunker = useCallback(async (
    vesselId: string,
    currentFuel: number,
    plannedRoute: string[]
  ): Promise<BunkerPlan | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voyage-logistics-ai', {
        body: { 
          action: 'optimize_bunker',
          vesselId,
          currentFuel,
          plannedRoute
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Bunker Otimizado',
        description: `Porto recomendado: ${data.bunkerPlan?.optimalPort || 'Singapore'}`,
      });

      return data.bunkerPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao otimizar bunker';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const calculateDemurrage = useCallback(async (
    voyageId: string,
    laytimeUsed: number,
    laytimeAllowed: number,
    demurrageRate: number
  ): Promise<{ demurrageAmount: number; despatchAmount: number; balance: number } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voyage-logistics-ai', {
        body: { 
          action: 'calculate_demurrage',
          voyageId,
          laytimeUsed,
          laytimeAllowed,
          demurrageRate
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.demurrageCalculation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular demurrage';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictETA = useCallback(async (
    vesselId: string,
    destination: string
  ): Promise<{ eta: string; confidence: number; delays: string[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('voyage-logistics-ai', {
        body: { 
          action: 'predict_eta',
          vesselId,
          destination
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.etaPrediction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao prever ETA';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    optimizeRoute,
    planPortCall,
    trackCargo,
    optimizeBunker,
    calculateDemurrage,
    predictETA
  };
}
