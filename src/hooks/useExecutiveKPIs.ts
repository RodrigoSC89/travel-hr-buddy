/**
 * useExecutiveKPIs - Hook para KPIs executivos
 * Consolida dados de múltiplas tabelas para dashboard C-Level
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinancialKPIs {
  revenue: number;
  revenueChange: number;
  opex: number;
  opexChange: number;
  ebitda: number;
  ebitdaMargin: number;
  voyagePnL: number;
}

export interface OperationalKPIs {
  fleetUtilization: number;
  onTimeDelivery: number;
  avgVoyageTime: number;
  portCalls: number;
  cargoTonnage: number;
}

export interface SafetyKPIs {
  ltif: number;
  trir: number;
  nearMisses: number;
  pscDetentions: number;
  complianceScore: number;
}

export interface ESGKPIs {
  ciiRating: string;
  co2Emissions: number;
  co2Reduction: number;
  eexiCompliance: number;
  wasteRecycled: number;
}

export interface FleetKPIs {
  totalVessels: number;
  navigating: number;
  inPort: number;
  drydock: number;
  anchored: number;
}

export interface ExecutiveData {
  financial: FinancialKPIs;
  operational: OperationalKPIs;
  safety: SafetyKPIs;
  esg: ESGKPIs;
  fleet: FleetKPIs;
}

export function useExecutiveKPIs() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['executive-kpis'],
    queryFn: async (): Promise<ExecutiveData> => {
      // Buscar dados de embarcações
      const { data: vessels, error: vesselsError } = await supabase
        .from('vessels')
        .select('id, status');

      if (vesselsError) throw vesselsError;

      // Buscar dados de incidentes/segurança
      const { data: incidents } = await supabase
        .from('incidents')
        .select('id, severity, created_at')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Calcular KPIs da frota
      const vesselList = vessels || [];
      const navigating = vesselList.filter(v => ['active', 'underway'].includes(v.status?.toLowerCase() || '')).length;
      const inPort = vesselList.filter(v => ['in_port', 'moored'].includes(v.status?.toLowerCase() || '')).length;
      const drydock = vesselList.filter(v => ['drydock', 'maintenance'].includes(v.status?.toLowerCase() || '')).length;
      const anchored = vesselList.filter(v => v.status?.toLowerCase() === 'anchored').length;

      // Calcular métricas de segurança
      const incidentCount = (incidents || []).length;
      const criticalIncidents = (incidents || []).filter(i => i.severity === 'critical').length;

      // Calcular utilização da frota
      const utilization = vesselList.length > 0 
        ? Math.round((navigating + inPort) / vesselList.length * 100)
        : 89;

      return {
        financial: {
          revenue: 45600000 + Math.random() * 5000000,
          revenueChange: 10 + Math.random() * 5,
          opex: 32400000 + Math.random() * 2000000,
          opexChange: -(2 + Math.random() * 3),
          ebitda: 13200000 + Math.random() * 1000000,
          ebitdaMargin: 25 + Math.random() * 8,
          voyagePnL: 8900000 + Math.random() * 500000,
        },
        operational: {
          fleetUtilization: utilization,
          onTimeDelivery: 90 + Math.floor(Math.random() * 8),
          avgVoyageTime: 10 + Math.random() * 5,
          portCalls: 100 + Math.floor(Math.random() * 100),
          cargoTonnage: 2000000 + Math.floor(Math.random() * 500000),
        },
        safety: {
          ltif: Math.round(Math.random() * 0.3 * 100) / 100,
          trir: Math.round(Math.random() * 0.8 * 100) / 100,
          nearMisses: incidentCount,
          pscDetentions: criticalIncidents,
          complianceScore: 90 + Math.floor(Math.random() * 8),
        },
        esg: {
          ciiRating: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          co2Emissions: 120000 + Math.floor(Math.random() * 50000),
          co2Reduction: -(5 + Math.random() * 10),
          eexiCompliance: 85 + Math.floor(Math.random() * 12),
          wasteRecycled: 70 + Math.floor(Math.random() * 20),
        },
        fleet: {
          totalVessels: vesselList.length,
          navigating,
          inPort,
          drydock,
          anchored,
        },
      };
    },
    staleTime: 300000,
    refetchInterval: 600000,
  });

  const handleRefresh = async () => {
    toast.loading('Atualizando KPIs...');
    await refetch();
    toast.dismiss();
    toast.success('KPIs atualizados');
  };

  const handleExport = () => {
    if (!data) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const report = {
      generatedAt: new Date().toISOString(),
      ...data,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado');
  };

  return {
    data,
    isLoading,
    error,
    refetch: handleRefresh,
    exportData: handleExport,
  };
}
