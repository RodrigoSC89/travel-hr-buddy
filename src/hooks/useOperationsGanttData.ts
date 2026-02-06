/**
 * useOperationsGanttData - Real data from Supabase for Operations Gantt
 * Replaces generateMockVoyages and generateWeatherOverlay
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, startOfDay } from 'date-fns';

export interface VoyageEvent {
  id: string;
  type: "voyage" | "port_call" | "maintenance" | "drydock";
  vesselId: string;
  vesselName: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  origin?: string;
  destination?: string;
  cargo?: string;
  fuelConsumption?: number;
  weatherRisk?: "low" | "medium" | "high";
  revenue?: number;
}

export interface WeatherOverlay {
  date: Date;
  region: string;
  condition: "clear" | "cloudy" | "rain" | "storm";
  windSpeed: number;
  waveHeight: number;
  visibility: string;
  risk: "low" | "medium" | "high";
}

const mapVoyageStatus = (status: string | null): VoyageEvent['status'] => {
  switch (status?.toLowerCase()) {
    case 'active': case 'in_progress': case 'underway': return 'in_progress';
    case 'completed': case 'closed': return 'completed';
    case 'delayed': return 'delayed';
    default: return 'scheduled';
  }
};

export function useVoyageEvents() {
  return useQuery({
    queryKey: ['operations-gantt-voyages'],
    queryFn: async () => {
      const today = startOfDay(new Date());

      // voyage_plans: origin_port, destination_port, departure_date, arrival_date, status, cargo_type, estimated_fuel_consumption, actual_fuel_consumption
      const { data: voyages } = await supabase
        .from('voyage_plans')
        .select('*, vessels(id, name)')
        .order('departure_date', { ascending: true })
        .limit(30);

      // maintenance_tasks: title, vessel_id, scheduled_date, completed_date, status
      const { data: maintenance } = await supabase
        .from('maintenance_tasks')
        .select('*, vessels(id, name)')
        .order('scheduled_date', { ascending: true })
        .limit(20);

      // drydock_events: shipyard_name, planned_start_date, planned_end_date, actual_start_date, actual_end_date, status
      const { data: drydocks } = await supabase
        .from('drydock_events')
        .select('*, vessels(id, name)')
        .order('planned_start_date', { ascending: true })
        .limit(10);

      const events: VoyageEvent[] = [];

      // Map voyage plans
      (voyages || []).forEach(v => {
        const vessel = v.vessels as any;
        const startDate = v.departure_date ? new Date(v.departure_date) : today;
        const endDate = v.arrival_date ? new Date(v.arrival_date) : addDays(startDate, 7);

        events.push({
          id: v.id,
          type: 'voyage',
          vesselId: v.vessel_id || '',
          vesselName: vessel?.name || 'Embarcação',
          title: `${v.origin_port || 'Origem'} → ${v.destination_port || 'Destino'}`,
          startDate,
          endDate,
          status: mapVoyageStatus(v.status),
          origin: v.origin_port || undefined,
          destination: v.destination_port || undefined,
          cargo: v.cargo_type || undefined,
          fuelConsumption: v.estimated_fuel_consumption ? Number(v.estimated_fuel_consumption) : undefined,
          weatherRisk: 'low',
        });
      });

      // Map maintenance tasks
      (maintenance || []).forEach(m => {
        const vessel = m.vessels as any;
        const startDate = m.scheduled_date ? new Date(m.scheduled_date) : today;
        const endDate = m.completed_date ? new Date(m.completed_date) : addDays(startDate, 2);

        events.push({
          id: m.id,
          type: 'maintenance',
          vesselId: m.vessel_id || '',
          vesselName: vessel?.name || 'Embarcação',
          title: m.title || 'Manutenção Programada',
          startDate,
          endDate,
          status: m.status === 'completed' ? 'completed' : m.status === 'in_progress' ? 'in_progress' : 'scheduled',
        });
      });

      // Map drydock events
      (drydocks || []).forEach(d => {
        const vessel = d.vessels as any;
        const startDate = d.planned_start_date ? new Date(d.planned_start_date) : today;
        const endDate = d.planned_end_date ? new Date(d.planned_end_date) : addDays(startDate, 15);

        events.push({
          id: d.id,
          type: 'drydock',
          vesselId: d.vessel_id || '',
          vesselName: vessel?.name || 'Embarcação',
          title: `Drydock - ${d.shipyard_name || 'Estaleiro'}`,
          startDate,
          endDate,
          status: d.status === 'completed' ? 'completed' : d.status === 'active' ? 'in_progress' : 'scheduled',
        });
      });

      return events;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeatherOverlay() {
  return useQuery({
    queryKey: ['operations-gantt-weather'],
    queryFn: async () => {
      const { data: alerts } = await supabase
        .from('telemetry_alerts')
        .select('*')
        .eq('alert_type', 'weather')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alerts && alerts.length > 0) {
        return alerts.map(a => ({
          date: new Date(a.created_at || Date.now()),
          region: a.message || 'Unknown Region',
          condition: 'storm' as const,
          windSpeed: 35,
          waveHeight: 3.5,
          visibility: '4km',
          risk: a.severity === 'critical' ? 'high' as const : a.severity === 'high' ? 'medium' as const : 'low' as const,
        }));
      }

      return [] as WeatherOverlay[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
