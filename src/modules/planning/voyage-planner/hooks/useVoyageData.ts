/**
 * Voyage Planner Hooks - Connected to Supabase
 * PATCH P0: Removido fallback para DEMO_PORTS
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VoyageRoute, Port } from '../types';

// Default empty ports when none configured
const EMPTY_PORTS: Port[] = [];

export function useVoyageRoutes() {
  return useQuery({
    queryKey: ['voyage-routes'],
    queryFn: async (): Promise<VoyageRoute[]> => {
      const { data, error } = await supabase
        .from('voyage_routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => {
        const origin = String(row.origin || '');
        const destination = String(row.destination || '');
        const routeData = row.route_data as Record<string, unknown> || {};
        
        return {
          id: row.id,
          name: row.name || '',
          origin: { 
            id: '1', 
            name: origin, 
            country: '', 
            code: '', 
            lat: 0, 
            lng: 0, 
            type: 'origin' as const 
          },
          destination: { 
            id: '2', 
            name: destination, 
            country: '', 
            code: '', 
            lat: 0, 
            lng: 0, 
            type: 'destination' as const 
          },
          waypoints: (routeData.waypoints as Port[]) || [],
          distanceNm: (routeData.distanceNm as number) || 0,
          estimatedDays: (routeData.estimatedDays as number) || 0,
          fuelConsumption: (routeData.fuelConsumption as number) || 0,
          status: 'planned' as const,
          vesselName: row.notes || '',
          departureDate: String(routeData.departureDate || ''),
          arrivalDate: String(routeData.arrivalDate || ''),
          weatherRisk: (routeData.weatherRisk as VoyageRoute['weatherRisk']) || 'low',
          createdAt: row.created_at || '',
        };
      });
    },
    staleTime: 5 * 60 * 1000
  });
}

export function usePorts() {
  return useQuery({
    queryKey: ['ports'],
    queryFn: async (): Promise<Port[]> => {
      const { data, error } = await supabase
        .from('ports')
        .select('id, name, code, country, coordinates, timezone')
        .order('name');

      if (error) {
        // Return empty - no fallback to demo data
        console.warn('Ports table not accessible:', error.message);
        return EMPTY_PORTS;
      }

      if (!data || data.length === 0) {
        // Return empty - no fallback to demo data
        return EMPTY_PORTS;
      }

      return data.map(row => {
        // Parse coordinates from point type "(lng,lat)" or use defaults
        let lat = 0, lng = 0;
        const coords = row.coordinates;
        if (coords && typeof coords === 'object' && 'x' in coords && 'y' in coords) {
          lng = (coords as { x: number; y: number }).x;
          lat = (coords as { x: number; y: number }).y;
        }

        return {
          id: row.id,
          name: row.name,
          country: row.country,
          code: row.code,
          lat,
          lng,
          type: 'destination' as Port['type']
        };
      });
    },
    staleTime: 30 * 60 * 1000
  });
}

export function useCreateVoyageRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voyage: Partial<VoyageRoute>) => {
      const insertData = {
        name: voyage.name || null,
        origin: voyage.origin?.name || '',
        destination: voyage.destination?.name || '',
        route_data: {
          waypoints: voyage.waypoints,
          distanceNm: voyage.distanceNm,
          estimatedDays: voyage.estimatedDays,
          fuelConsumption: voyage.fuelConsumption,
          weatherRisk: voyage.weatherRisk,
          departureDate: voyage.departureDate,
          arrivalDate: voyage.arrivalDate,
          vesselName: voyage.vesselName,
        },
        notes: voyage.vesselName || null,
      };

      const { data, error } = await supabase
        .from('voyage_routes')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voyage-routes'] });
    }
  });
}

export function useDeleteVoyageRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voyage_routes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voyage-routes'] });
    }
  });
}

export function useWeatherConditions() {
  return useQuery({
    queryKey: ['weather-conditions'],
    queryFn: async () => {
      // Fetch real weather from edge function or return empty
      try {
        const { data, error } = await supabase.functions.invoke('maritime-weather', {
          body: { regions: ['atlantic-north', 'atlantic-south', 'indian', 'north-sea'] }
        });
        
        if (error) throw error;
        return data?.conditions || [];
      } catch {
        // No fallback to mock - return empty
        return [];
      }
    },
    staleTime: 10 * 60 * 1000 // 10 min
  });
}
