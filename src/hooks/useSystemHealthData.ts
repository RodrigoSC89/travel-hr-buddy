/**
 * System Health Data Hook - P0 Fix
 * Substitui mockSystemHealth por dados reais agregados
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemHealthMetrics {
  overall_score: number;
  fleet: {
    total: number;
    active: number;
    maintenance: number;
    utilization: number;
  };
  crew: {
    total: number;
    onboard: number;
    available: number;
    expiringCerts: number;
  };
  maintenance: {
    scheduled: number;
    overdue: number;
    completed: number;
    efficiency: number;
  };
  compliance: {
    score: number;
    pendingAudits: number;
    expiringDocs: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
  lastUpdated: string;
}

export function useSystemHealthData() {
  return useQuery({
    queryKey: ['system-health-metrics'],
    queryFn: async (): Promise<SystemHealthMetrics> => {
      // Fetch vessel data
      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, status');

      const totalVessels = vessels?.length || 0;
      const activeVessels = vessels?.filter(v => 
        ['active', 'operational', 'underway'].includes(v.status?.toLowerCase() || '')
      ).length || 0;
      const maintenanceVessels = vessels?.filter(v => 
        ['drydock', 'maintenance'].includes(v.status?.toLowerCase() || '')
      ).length || 0;

      // Fetch crew data
      const { data: crew } = await supabase
        .from('crew_members')
        .select('id, status, contract_end');

      const totalCrew = crew?.length || 0;
      const onboardCrew = crew?.filter(c => c.status === 'active' || c.status === 'onboard').length || 0;
      
      // Calculate expiring contracts (within 30 days)
      const expiringContracts = crew?.filter(c => {
        if (!c.contract_end) return false;
        const daysUntil = Math.ceil((new Date(c.contract_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 30;
      }).length || 0;

      // Fetch maintenance data
      const { data: maintenance } = await supabase
        .from('maintenance_records')
        .select('id, status, scheduled_date');

      const totalMaintenance = maintenance?.length || 0;
      const completedMaintenance = maintenance?.filter(m => m.status === 'completed').length || 0;
      const overdueMaintenance = maintenance?.filter(m => {
        if (m.status === 'completed') return false;
        if (!m.scheduled_date) return false;
        return new Date(m.scheduled_date) < new Date();
      }).length || 0;
      const scheduledMaintenance = maintenance?.filter(m => 
        ['scheduled', 'pending', 'planned'].includes(m.status || '')
      ).length || 0;

      // Fetch alert data
      const { data: telemetryAlerts } = await supabase
        .from('telemetry_alerts')
        .select('id, severity')
        .eq('resolved', false);

      const criticalAlerts = telemetryAlerts?.filter(a => a.severity === 'critical').length || 0;
      const warningAlerts = telemetryAlerts?.filter(a => a.severity === 'warning' || a.severity === 'high').length || 0;
      const infoAlerts = telemetryAlerts?.filter(a => a.severity === 'info' || a.severity === 'low').length || 0;

      // Calculate scores
      const fleetUtilization = totalVessels > 0 ? Math.round((activeVessels / totalVessels) * 100) : 0;
      const maintenanceEfficiency = totalMaintenance > 0 
        ? Math.round((completedMaintenance / totalMaintenance) * 100) 
        : 100;
      
      const complianceScore = Math.max(0, 100 - (expiringContracts * 3) - (overdueMaintenance * 5) - (criticalAlerts * 10));
      const overallScore = Math.round((fleetUtilization + maintenanceEfficiency + complianceScore) / 3);

      return {
        overall_score: Math.max(0, Math.min(100, overallScore)),
        fleet: {
          total: totalVessels,
          active: activeVessels,
          maintenance: maintenanceVessels,
          utilization: fleetUtilization,
        },
        crew: {
          total: totalCrew,
          onboard: onboardCrew,
          available: totalCrew - onboardCrew,
          expiringCerts: expiringContracts,
        },
        maintenance: {
          scheduled: scheduledMaintenance,
          overdue: overdueMaintenance,
          completed: completedMaintenance,
          efficiency: maintenanceEfficiency,
        },
        compliance: {
          score: Math.max(0, Math.min(100, complianceScore)),
          pendingAudits: overdueMaintenance,
          expiringDocs: expiringContracts,
        },
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          info: infoAlerts,
          total: (telemetryAlerts?.length || 0),
        },
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export default useSystemHealthData;
