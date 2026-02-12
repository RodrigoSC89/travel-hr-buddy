/**
 * SLADashboardCard - Dashboard de SLA em tempo real
 * Monitoramento de compliance de SLA com métricas e alertas
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, DollarSign, BarChart3, Target
} from "lucide-react";

interface Contract {
  id: string;
  contract_number: string;
  client_name: string;
  start_date: string;
  end_date: string;
  sla_downtime_percent: number | null;
  penalty_per_hour: number | null;
  status: string | null;
}

interface DowntimeEvent {
  id: string;
  start_time: string;
  end_time?: string | null;
  duration_hours?: number | null;
  reason_category: string | null;
  impact_level: string | null;
  justification_status: string | null;
  contract_id?: string | null;
}

interface SLADashboardCardProps {
  contracts: Contract[];
  downtimeEvents: DowntimeEvent[];
}

export function SLADashboardCard({ contracts, downtimeEvents }: SLADashboardCardProps) {
  const slaMetrics = useMemo(() => {
    const activeContracts = contracts.filter(c => c.status === 'active');
    
    // Calculate total contract hours (from start to end or now)
    const now = new Date();
    let totalContractHours = 0;
    let totalDowntimeHours = 0;
    let totalPenalties = 0;
    
    activeContracts.forEach(contract => {
      const start = new Date(contract.start_date);
      const end = contract.end_date ? new Date(contract.end_date) : now;
      const contractHours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
      totalContractHours += contractHours;
      
      // Get downtimes for this contract
      const contractDowntimes = downtimeEvents.filter(d => 
        d.contract_id === contract.id ||
        (new Date(d.start_time) >= start && new Date(d.start_time) <= end)
      );
      
      const downtimeHours = contractDowntimes.reduce((acc, d) => acc + (d.duration_hours || 0), 0);
      totalDowntimeHours += downtimeHours;
      
      // Calculate penalties for unjustified downtimes
      const unjustifiedHours = contractDowntimes
        .filter(d => d.justification_status !== 'approved')
        .reduce((acc, d) => acc + (d.duration_hours || 0), 0);
      
      totalPenalties += unjustifiedHours * (contract.penalty_per_hour || 0);
    });
    
    const uptime = totalContractHours > 0 
      ? ((totalContractHours - totalDowntimeHours) / totalContractHours) * 100 
      : 100;
    
    const avgSLATarget = activeContracts.length > 0
      ? activeContracts.reduce((acc, c) => acc + (100 - (c.sla_downtime_percent || 5)), 0) / activeContracts.length
      : 95;
    
    const slaCompliance = uptime >= avgSLATarget;
    
    // Categorize downtimes
    const categoryBreakdown = downtimeEvents.reduce((acc, d) => {
      const cat = d.reason_category || 'other';
      acc[cat] = (acc[cat] || 0) + (d.duration_hours || 0);
      return acc;
    }, {} as Record<string, number>);
    
    // Count by justification status
    const justifiedCount = downtimeEvents.filter(d => d.justification_status === 'approved').length;
    const unjustifiedCount = downtimeEvents.filter(d => d.justification_status === 'rejected').length;
    const pendingCount = downtimeEvents.filter(d => d.justification_status === 'pending' || !d.justification_status).length;
    
    return {
      totalContracts: contracts.length,
      activeContracts: activeContracts.length,
      totalDowntimeHours,
      totalContractHours,
      uptime,
      avgSLATarget,
      slaCompliance,
      totalPenalties,
      categoryBreakdown,
      justifiedCount,
      unjustifiedCount,
      pendingCount,
      criticalDowntimes: downtimeEvents.filter(d => d.impact_level === 'critical').length
    };
  }, [contracts, downtimeEvents]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'mechanical': 'Mecânico',
      'electrical': 'Elétrico',
      'weather': 'Clima',
      'operational': 'Operacional',
      'regulatory': 'Regulatório',
      'other': 'Outro'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'mechanical': 'bg-warning',
      'electrical': 'bg-warning',
      'weather': 'bg-info',
      'operational': 'bg-accent',
      'regulatory': 'bg-destructive',
      'other': 'bg-muted'
    };
    return colors[category] || 'bg-muted';
  };

  const topCategories = Object.entries(slaMetrics.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalCategoryHours = Object.values(slaMetrics.categoryBreakdown).reduce((a, b) => a + b, 0);

  return (
    <Card className="border-info/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-info" />
          Dashboard SLA
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitoramento em tempo real de compliance e disponibilidade
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-info" />
              <span className="text-xs text-muted-foreground">Uptime Atual</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{slaMetrics.uptime.toFixed(1)}%</span>
              {slaMetrics.slaCompliance ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta: {slaMetrics.avgSLATarget.toFixed(1)}%
            </p>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Total Downtime</span>
            </div>
            <span className="text-2xl font-bold">{slaMetrics.totalDowntimeHours.toFixed(1)}h</span>
            <p className="text-xs text-muted-foreground mt-1">
              {slaMetrics.criticalDowntimes} críticos
            </p>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Penalidades Est.</span>
            </div>
            <span className="text-2xl font-bold">
              ${slaMetrics.totalPenalties.toLocaleString()}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {slaMetrics.unjustifiedCount} não justificados
            </p>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-info" />
              <span className="text-xs text-muted-foreground">Status SLA</span>
            </div>
            <Badge 
              variant={slaMetrics.slaCompliance ? 'default' : 'destructive'}
              className="text-lg px-3 py-1"
            >
              {slaMetrics.slaCompliance ? 'CONFORME' : 'VIOLAÇÃO'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {slaMetrics.activeContracts} contratos ativos
            </p>
          </div>
        </div>

        {/* SLA Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Compliance SLA</h4>
            <Badge variant={slaMetrics.slaCompliance ? 'outline' : 'destructive'}>
              {slaMetrics.uptime >= slaMetrics.avgSLATarget ? '+' : '-'}
              {Math.abs(slaMetrics.uptime - slaMetrics.avgSLATarget).toFixed(2)}%
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress 
              value={Math.min(100, (slaMetrics.uptime / slaMetrics.avgSLATarget) * 100)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-info">Meta: {slaMetrics.avgSLATarget.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Justification Status */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20 text-center">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold">{slaMetrics.justifiedCount}</p>
            <p className="text-xs text-muted-foreground">Justificados</p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 text-center">
            <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold">{slaMetrics.pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
            <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold">{slaMetrics.unjustifiedCount}</p>
            <p className="text-xs text-muted-foreground">Rejeitados</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {topCategories.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Downtime por Categoria
            </h4>
            <div className="space-y-2">
              {topCategories.map(([category, hours]) => {
                const percentage = totalCategoryHours > 0 
                  ? (hours / totalCategoryHours) * 100 
                  : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`} />
                        {getCategoryLabel(category)}
                      </span>
                      <span className="text-muted-foreground">
                        {hours.toFixed(1)}h ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alerts */}
        {!slaMetrics.slaCompliance && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Alerta de Violação SLA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              O uptime atual ({slaMetrics.uptime.toFixed(2)}%) está abaixo da meta de {slaMetrics.avgSLATarget.toFixed(2)}%. 
              Revise os eventos de downtime e tome ações corretivas imediatas.
            </p>
          </div>
        )}

        {slaMetrics.criticalDowntimes > 0 && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium text-warning">Atenção</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {slaMetrics.criticalDowntimes} evento(s) de downtime crítico detectado(s). 
              Priorize a análise e documentação via BROA.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SLADashboardCard;
