/**
 * Hook for fetching Maritime Logistics data from Supabase
 * Replaces mock vessel/logistics data with real database queries
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: "container" | "tanker" | "bulk" | "general_cargo" | "passenger";
  flag: string;
  status: "at_sea" | "in_port" | "anchored" | "maintenance" | "emergency";
  location: {
    lat: number;
    lng: number;
    port?: string;
    country: string;
  };
  eta?: string;
  etd?: string;
  lastUpdate: string;
}

export interface LogisticsOperation {
  id: string;
  vesselId: string;
  type: "loading" | "unloading" | "bunkering" | "crew_change" | "maintenance";
  port: string;
  scheduled: string;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
}

export function useVessels() {
  return useQuery({
    queryKey: ['vessels-logistics'],
    queryFn: async (): Promise<Vessel[]> => {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map(vessel => ({
        id: vessel.id,
        name: vessel.name || 'Unknown',
        imo: vessel.imo_number || '',
        type: (vessel.vessel_type as Vessel['type']) || 'general_cargo',
        flag: vessel.flag || 'Unknown',
        status: mapVesselStatus(vessel.status),
        location: {
          lat: 0,
          lng: 0,
          port: vessel.current_location || undefined,
          country: 'Unknown'
        },
        eta: vessel.eta || undefined,
        lastUpdate: vessel.updated_at || vessel.created_at || new Date().toISOString()
      }));
    }
  });
}

function mapVesselStatus(status: string | null): Vessel['status'] {
  const statusMap: Record<string, Vessel['status']> = {
    'active': 'at_sea',
    'in_port': 'in_port',
    'anchored': 'anchored',
    'maintenance': 'maintenance',
    'inactive': 'maintenance'
  };
  return statusMap[status || ''] || 'at_sea';
}

export function useLogisticsOperations(vesselId?: string) {
  return useQuery({
    queryKey: ['logistics-operations', vesselId],
    queryFn: async (): Promise<LogisticsOperation[]> => {
      let query = supabase
        .from('logistics_operations')
        .select('id, vessel_id, operation_type, origin_port, destination_port, estimated_departure, status')
        .order('estimated_departure', { ascending: false })
        .limit(50);

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((op) => ({
        id: op.id,
        vesselId: op.vessel_id || '',
        type: mapOperationType(op.operation_type),
        port: op.origin_port || op.destination_port || 'Unknown',
        scheduled: op.estimated_departure || new Date().toISOString(),
        status: mapOpStatus(op.status),
      }));
    }
  });
}

function mapOperationType(type: string | null): LogisticsOperation['type'] {
  const map: Record<string, LogisticsOperation['type']> = {
    'loading': 'loading',
    'unloading': 'unloading',
    'bunkering': 'bunkering',
    'crew_change': 'crew_change',
    'maintenance': 'maintenance',
  };
  return map[type || ''] || 'loading';
}

function mapOpStatus(status: string | null): LogisticsOperation['status'] {
  const map: Record<string, LogisticsOperation['status']> = {
    'scheduled': 'scheduled',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'delayed': 'delayed',
    'pending': 'scheduled',
    'cancelled': 'completed',
  };
  return map[status || ''] || 'scheduled';
}

export function useVesselStats() {
  return useQuery({
    queryKey: ['vessel-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, status');

      if (error) throw error;

      const total = data?.length || 0;
      const atSea = data?.filter(v => v.status === 'active').length || 0;
      const inPort = data?.filter(v => v.status === 'in_port').length || 0;
      const maintenance = data?.filter(v => v.status === 'maintenance').length || 0;

      return { total, atSea, inPort, maintenance };
    }
  });
}
