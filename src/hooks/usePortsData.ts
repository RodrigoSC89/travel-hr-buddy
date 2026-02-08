/**
 * Ports Real Data Hook
 * Fetches ports from Supabase ports table
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface Port {
  id: string;
  name: string;
  country: string;
  code: string;
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'waypoint';
}

// Maps Supabase ports table to our Port interface
function mapDbPortToPort(dbPort: {
  id: string;
  name: string;
  country: string;
  code: string;
  coordinates: unknown;
  facilities: string[] | null;
  timezone: string | null;
  created_at: string | null;
  updated_at: string | null;
}): Port {
  // Parse coordinates if available
  let lat = 0;
  let lng = 0;
  
  if (dbPort.coordinates && typeof dbPort.coordinates === 'object') {
    const coords = dbPort.coordinates as { lat?: number; lng?: number; latitude?: number; longitude?: number };
    lat = coords.lat ?? coords.latitude ?? 0;
    lng = coords.lng ?? coords.longitude ?? 0;
  }

  return {
    id: dbPort.id,
    name: dbPort.name,
    country: dbPort.country || '',
    code: dbPort.code || '',
    lat,
    lng,
    type: 'destination' // Default type, could be enhanced with metadata
  };
}

export function usePorts() {
  return useQuery({
    queryKey: ['ports'],
    queryFn: async (): Promise<Port[]> => {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        logger.error('[usePorts] Error fetching ports:', error);
        throw error;
      }

      return (data || []).map(mapDbPortToPort);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreatePort() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (port: Omit<Port, 'id'>) => {
      const { data, error } = await supabase
        .from('ports')
        .insert({
          name: port.name,
          country: port.country,
          code: port.code,
          coordinates: { lat: port.lat, lng: port.lng }
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbPortToPort(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      toast.success('Porto criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar porto: ' + error.message);
    }
  });
}
