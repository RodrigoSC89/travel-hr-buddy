/**
 * Hook para dados de performance de embarcações
 * Substitui dados mockados por queries reais
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VesselPerformanceData {
  id: string;
  vesselId: string;
  vesselName: string;
  fuelConsumption: number;
  averageSpeed: number;
  engineHours: number;
  maintenanceScore: number;
  efficiency: number;
  lastUpdate: string;
  status: 'optimal' | 'warning' | 'critical';
  trends: {
    fuelTrend: 'up' | 'down' | 'stable';
    speedTrend: 'up' | 'down' | 'stable';
    efficiencyTrend: 'up' | 'down' | 'stable';
  };
}

export interface VesselPerformanceStats {
  avgEfficiency: number;
  totalFuelConsumption: number;
  avgMaintenanceScore: number;
  vesselsOptimal: number;
  vesselsWarning: number;
  vesselsCritical: number;
}

interface FleetLogData {
  fuel_consumption?: number;
  average_speed?: number;
  engine_hours?: number;
  [key: string]: unknown;
}

export function useVesselPerformanceData(vesselId?: string) {
  const performanceQuery = useQuery({
    queryKey: ['vessel-performance', vesselId],
    queryFn: async (): Promise<VesselPerformanceData[]> => {
      let vesselQuery = supabase
        .from('vessels')
        .select('id, name, status, imo_number');
      
      if (vesselId) {
        vesselQuery = vesselQuery.eq('id', vesselId);
      }

      const { data: vessels, error: vesselError } = await vesselQuery;
      if (vesselError) throw vesselError;

      if (!vessels?.length) return [];

      const vesselIds = vessels.map(v => v.id);
      const { data: logs, error: logsError } = await supabase
        .from('fleet_logs')
        .select('*')
        .in('vessel_id', vesselIds)
        .order('recorded_at', { ascending: false });

      if (logsError) throw logsError;

      const { data: maintenance } = await supabase
        .from('maintenance_tasks')
        .select('vessel_id, status, priority')
        .in('vessel_id', vesselIds);

      const maintenanceScores = new Map<string, number>();
      vesselIds.forEach(id => {
        const vesselMaintenance = maintenance?.filter(m => m.vessel_id === id) || [];
        const completed = vesselMaintenance.filter(m => m.status === 'completed').length;
        const total = vesselMaintenance.length || 1;
        maintenanceScores.set(id, Math.round((completed / total) * 100));
      });

      const latestLogs = new Map<string, any>();
      const previousLogs = new Map<string, any>();
      
      logs?.forEach(log => {
        if (log.vessel_id) {
          if (!latestLogs.has(log.vessel_id)) {
            latestLogs.set(log.vessel_id, log);
          } else if (!previousLogs.has(log.vessel_id)) {
            previousLogs.set(log.vessel_id, log);
          }
        }
      });

      return vessels.map(vessel => {
        const latest = latestLogs.get(vessel.id);
        const previous = previousLogs.get(vessel.id);
        
        const logData = (latest?.data || {}) as FleetLogData;
        const prevLogData = (previous?.data || {}) as FleetLogData;
        
        const fuelConsumption = logData.fuel_consumption || 0;
        const avgSpeed = logData.average_speed || 0;
        const engineHours = logData.engine_hours || 0;
        const maintenanceScore = maintenanceScores.get(vessel.id) || 85;
        
        const efficiency = calculateEfficiency(fuelConsumption, avgSpeed, maintenanceScore);
        const status = efficiency >= 80 ? 'optimal' : efficiency >= 60 ? 'warning' : 'critical';
        
        const prevFuel = prevLogData.fuel_consumption || fuelConsumption;
        const prevSpeed = prevLogData.average_speed || avgSpeed;
        const prevEfficiency = previous ? calculateEfficiency(prevFuel, prevSpeed, maintenanceScore) : efficiency;

        return {
          id: `perf-${vessel.id}`,
          vesselId: vessel.id,
          vesselName: vessel.name,
          fuelConsumption,
          averageSpeed: avgSpeed,
          engineHours,
          maintenanceScore,
          efficiency,
          lastUpdate: latest?.recorded_at || new Date().toISOString(),
          status,
          trends: {
            fuelTrend: getTrend(fuelConsumption, prevFuel, true),
            speedTrend: getTrend(avgSpeed, prevSpeed),
            efficiencyTrend: getTrend(efficiency, prevEfficiency),
          },
        };
      });
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ['vessel-performance-stats', vesselId],
    queryFn: async (): Promise<VesselPerformanceStats> => {
      const data = performanceQuery.data || [];
      
      if (!data.length) {
        return {
          avgEfficiency: 0,
          totalFuelConsumption: 0,
          avgMaintenanceScore: 0,
          vesselsOptimal: 0,
          vesselsWarning: 0,
          vesselsCritical: 0,
        };
      }

      return {
        avgEfficiency: Math.round(data.reduce((sum, v) => sum + v.efficiency, 0) / data.length),
        totalFuelConsumption: data.reduce((sum, v) => sum + v.fuelConsumption, 0),
        avgMaintenanceScore: Math.round(data.reduce((sum, v) => sum + v.maintenanceScore, 0) / data.length),
        vesselsOptimal: data.filter(v => v.status === 'optimal').length,
        vesselsWarning: data.filter(v => v.status === 'warning').length,
        vesselsCritical: data.filter(v => v.status === 'critical').length,
      };
    },
    enabled: !!performanceQuery.data,
  });

  return {
    vessels: performanceQuery.data || [],
    stats: statsQuery.data,
    isLoading: performanceQuery.isLoading,
    error: performanceQuery.error,
    refetch: performanceQuery.refetch,
  };
}

function calculateEfficiency(fuel: number, speed: number, maintenance: number): number {
  const fuelScore = Math.max(0, 100 - (fuel / 10));
  const speedScore = Math.min(100, speed * 5);
  const maintenanceWeight = maintenance / 100;
  
  return Math.round((fuelScore * 0.4 + speedScore * 0.3 + maintenance * 0.3) * maintenanceWeight);
}

function getTrend(current: number, previous: number, invertBetter = false): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  const threshold = previous * 0.05;
  
  if (Math.abs(diff) < threshold) return 'stable';
  
  if (invertBetter) {
    return diff < 0 ? 'up' : 'down';
  }
  return diff > 0 ? 'up' : 'down';
}
