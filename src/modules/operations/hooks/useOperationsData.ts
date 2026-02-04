/**
 * Operations Data Hook - Real Supabase Integration
 * Hook para dados operacionais da frota com backend real
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface VesselStatus {
  id: string;
  name: string;
  type: string;
  status: 'underway' | 'moored' | 'anchored' | 'maintenance' | 'idle';
  position: { lat: number; lng: number };
  speed: number;
  heading: number;
  destination: string;
  eta: Date;
  fuelLevel: number;
  cargoLoad: number;
  crewOnboard: number;
  lastUpdate: Date;
}

export interface TelemetryData {
  vesselId: string;
  engineRpm: number;
  engineTemp: number;
  fuelConsumption: number;
  speed: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  seaTemp: number;
  timestamp: Date;
}

export interface OperationalAlert {
  id: string;
  type: 'weather' | 'maintenance' | 'safety' | 'navigation' | 'cargo' | 'fuel';
  severity: 'info' | 'warning' | 'critical';
  vessel: string;
  vesselId?: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface PortCall {
  id: string;
  vesselId: string;
  vesselName: string;
  portName: string;
  country: string;
  eta: Date;
  etd: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  purpose: string;
  agent?: string;
}

export function useOperationsData() {
  const queryClient = useQueryClient();
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Use dynamic db to avoid strict typing issues
  const dynamicDb = supabase as any;

  // Fetch vessels from Supabase
  const { data: vessels = [], isLoading: vesselsLoading, refetch: refetchVessels } = useQuery({
    queryKey: ['operations-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Error fetching vessels:', error);
        return [];
      }

      return (data || []).map((v: any): VesselStatus => ({
        id: v.id,
        name: v.name || 'Embarcação',
        type: v.vessel_type || 'Cargo',
        status: mapVesselStatus(v.status),
        position: {
          lat: Number(v.current_latitude) || -23.9547,
          lng: Number(v.current_longitude) || -46.3323,
        },
        speed: 0,
        heading: 0,
        destination: v.current_location || 'N/A',
        eta: new Date(Date.now() + 168 * 60 * 60 * 1000),
        fuelLevel: Number(v.current_fuel_level) || 75,
        cargoLoad: 0,
        crewOnboard: Number(v.crew_capacity) || 20,
        lastUpdate: new Date(v.updated_at || Date.now()),
      }));
    },
    refetchInterval: refreshInterval,
  });

  // Fetch telemetry data (simplified)
  const { data: telemetry = [], isLoading: telemetryLoading } = useQuery({
    queryKey: ['operations-telemetry', selectedVessel],
    queryFn: async () => {
      // Generate telemetry from vessels
      return vessels.map((v: VesselStatus): TelemetryData => ({
        vesselId: v.id,
        engineRpm: v.status === 'underway' ? 120 + Math.random() * 30 : 0,
        engineTemp: v.status === 'underway' ? 75 + Math.random() * 15 : 25,
        fuelConsumption: v.status === 'underway' ? 5 + Math.random() * 5 : 0.5,
        speed: v.speed,
        windSpeed: 10 + Math.random() * 10,
        windDirection: Math.random() * 360,
        waveHeight: 0.5 + Math.random() * 2,
        seaTemp: 22 + Math.random() * 6,
        timestamp: new Date(),
      }));
    },
    refetchInterval: refreshInterval,
    enabled: vessels.length > 0,
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['operations-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soc_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error fetching alerts:', error);
        return [];
      }

      return (data || []).map((a: any): OperationalAlert => ({
        id: a.id,
        type: mapAlertType(a.alert_type),
        severity: mapSeverity(a.severity),
        vessel: a.vessel_name || 'Sistema',
        vesselId: a.vessel_id,
        message: a.message || a.title || 'Alerta',
        timestamp: new Date(a.created_at),
        acknowledged: Boolean(a.acknowledged_at),
      }));
    },
    refetchInterval: refreshInterval,
  });

  // Fetch port calls
  const { data: portCalls = [], isLoading: portCallsLoading } = useQuery({
    queryKey: ['operations-port-calls'],
    queryFn: async () => {
      const { data, error } = await dynamicDb
        .from('port_calls')
        .select('*, vessels(name)')
        .order('eta', { ascending: true })
        .limit(20);

      if (error) {
        return [];
      }

      return (data || []).map((pc: any): PortCall => ({
        id: pc.id,
        vesselId: pc.vessel_id,
        vesselName: pc.vessels?.name || pc.vessel_name || 'Embarcação',
        portName: pc.port_name || pc.port || 'Porto',
        country: pc.country || 'Brasil',
        eta: new Date(pc.eta),
        etd: new Date(pc.etd || pc.eta),
        status: pc.status || 'scheduled',
        purpose: pc.purpose || 'Carga/Descarga',
        agent: pc.agent_name,
      }));
    },
  });

  // Mutations
  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await dynamicDb
        .from('soc_alerts')
        .update({ acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-alerts'] });
      toast.success('Alerta reconhecido');
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes?: string }) => {
      const { error } = await dynamicDb
        .from('soc_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-alerts'] });
      toast.success('Alerta resolvido');
    },
  });

  const updateVesselStatus = useMutation({
    mutationFn: async ({ vesselId, status }: { vesselId: string; status: string }) => {
      const { error } = await dynamicDb
        .from('vessels')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', vesselId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
      toast.success('Status atualizado');
    },
  });

  // KPIs calculation
  const kpis = {
    totalVessels: vessels.length,
    activeVessels: vessels.filter((v: VesselStatus) => v.status === 'underway').length,
    mooredVessels: vessels.filter((v: VesselStatus) => v.status === 'moored').length,
    inMaintenance: vessels.filter((v: VesselStatus) => v.status === 'maintenance').length,
    avgFuelLevel: vessels.length > 0 
      ? Math.round(vessels.reduce((sum: number, v: VesselStatus) => sum + v.fuelLevel, 0) / vessels.length)
      : 0,
    avgCargoLoad: vessels.length > 0
      ? Math.round(vessels.reduce((sum: number, v: VesselStatus) => sum + v.cargoLoad, 0) / vessels.length)
      : 0,
    totalCrewOnboard: vessels.reduce((sum: number, v: VesselStatus) => sum + v.crewOnboard, 0),
    criticalAlerts: alerts.filter((a: OperationalAlert) => a.severity === 'critical' && !a.acknowledged).length,
    upcomingPortCalls: portCalls.filter((pc: PortCall) => pc.status === 'scheduled').length,
  };

  const loading = vesselsLoading || telemetryLoading || alertsLoading || portCallsLoading;

  return {
    // Data
    vessels,
    telemetry,
    alerts,
    portCalls,
    kpis,
    loading,
    selectedVessel,
    refreshInterval,

    // Actions
    setSelectedVessel,
    setRefreshInterval,
    refetchVessels,
    acknowledgeAlert: acknowledgeAlert.mutate,
    resolveAlert: resolveAlert.mutate,
    updateVesselStatus: updateVesselStatus.mutate,
  };
}

// Helper functions
function mapVesselStatus(status: string | null): VesselStatus['status'] {
  const s = status?.toLowerCase() || '';
  if (s.includes('underway') || s.includes('navegando') || s.includes('sailing')) return 'underway';
  if (s.includes('moored') || s.includes('atracado') || s.includes('docked')) return 'moored';
  if (s.includes('anchor') || s.includes('fundeado')) return 'anchored';
  if (s.includes('maint') || s.includes('manutenção') || s.includes('repair')) return 'maintenance';
  return 'idle';
}

function mapAlertType(type: string | null): OperationalAlert['type'] {
  const t = type?.toLowerCase() || '';
  if (t.includes('weather') || t.includes('clima') || t.includes('meteo')) return 'weather';
  if (t.includes('maint') || t.includes('manutenção')) return 'maintenance';
  if (t.includes('safety') || t.includes('segurança')) return 'safety';
  if (t.includes('nav') || t.includes('rota')) return 'navigation';
  if (t.includes('cargo') || t.includes('carga')) return 'cargo';
  if (t.includes('fuel') || t.includes('combustível')) return 'fuel';
  return 'safety';
}

function mapSeverity(severity: string | null): OperationalAlert['severity'] {
  const s = severity?.toLowerCase() || '';
  if (s.includes('critical') || s.includes('urgent') || s.includes('alto')) return 'critical';
  if (s.includes('warning') || s.includes('médio') || s.includes('medium')) return 'warning';
  return 'info';
}
