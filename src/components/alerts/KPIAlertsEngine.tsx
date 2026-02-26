/**
 * Real-time KPI Alerts Engine
 * Monitors KPIs against thresholds and generates smart alerts
 * with suggested actions
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle, TrendingUp, Fuel, Users, DollarSign,
  Bell, BellOff, Zap, Shield, Activity, ChevronRight
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";

interface KPIThreshold {
  id: string;
  name: string;
  icon: React.ElementType;
  unit: string;
  threshold: number;
  currentValue: number;
  direction: 'above' | 'below';
  severity: 'info' | 'warning' | 'critical';
  suggestedAction: string;
  enabled: boolean;
}

export function KPIAlertsEngine() {
  const [enabledAlerts, setEnabledAlerts] = useState<Record<string, boolean>>({
    fuel: true, opex: true, crew_hours: true,
    certs: true, maintenance: true, ncs: true,
  });

  const queryClient = useQueryClient();

  // Fetch current KPI values
  const { data: kpiData } = useQuery({
    queryKey: ['kpi-alerts-engine'],
    queryFn: async () => {
      const [expensesRes, certsRes, maintenanceRes, ncsRes, crewHoursRes] = await Promise.all([
        fromUntyped('expenses').select('amount').gte('created_at', subDays(new Date(), 30).toISOString()),
        fromUntyped('crew_certifications').select('id').lt('expiry_date', subDays(new Date(), -30).toISOString()).gt('expiry_date', new Date().toISOString()),
        fromUntyped('maintenance_tasks').select('id').eq('status', 'overdue'),
        fromUntyped('non_conformities').select('id, severity').eq('status', 'open'),
        fromUntyped('noon_reports').select('id').gte('report_date', subDays(new Date(), 7).toISOString()),
      ]);
      const expenses = (expensesRes.data || []) as any[];
      const certs = (certsRes.data || []) as any[];
      const maintenance = (maintenanceRes.data || []) as any[];
      const ncs = (ncsRes.data || []) as any[];
      const crewHours = (crewHoursRes.data || []) as any[];

      const totalOpex = (expenses as any[]).reduce((s, e) => s + Number(e.amount || 0), 0);
      const criticalNCs = (ncs as any[]).filter(n => n.severity === 'critical').length;

      return {
        opex_30d: totalOpex,
        certs_expiring: (certs as any[]).length,
        overdue_maintenance: (maintenance as any[]).length,
        open_ncs: (ncs as any[]).length,
        critical_ncs: criticalNCs,
        noon_reports_7d: (crewHours as any[]).length,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 min
  });

  // Build thresholds
  const thresholds: KPIThreshold[] = useMemo(() => {
    if (!kpiData) return [];
    return [
      {
        id: 'opex', name: 'OPEX Mensal', icon: DollarSign, unit: 'USD',
        threshold: 200000, currentValue: kpiData.opex_30d, direction: 'above',
        severity: kpiData.opex_30d > 250000 ? 'critical' : kpiData.opex_30d > 200000 ? 'warning' : 'info',
        suggestedAction: 'Revisar categorias de despesa e identificar oportunidades de redução',
        enabled: enabledAlerts.opex,
      },
      {
        id: 'certs', name: 'Certificados Expirando', icon: Shield, unit: 'cert.',
        threshold: 5, currentValue: kpiData.certs_expiring, direction: 'above',
        severity: kpiData.certs_expiring > 10 ? 'critical' : kpiData.certs_expiring > 5 ? 'warning' : 'info',
        suggestedAction: 'Iniciar processo de renovação prioritária para certificados STCW/MLC',
        enabled: enabledAlerts.certs,
      },
      {
        id: 'maintenance', name: 'Manutenção Atrasada', icon: Activity, unit: 'tarefas',
        threshold: 3, currentValue: kpiData.overdue_maintenance, direction: 'above',
        severity: kpiData.overdue_maintenance > 5 ? 'critical' : kpiData.overdue_maintenance > 3 ? 'warning' : 'info',
        suggestedAction: 'Priorizar ordens de serviço atrasadas e verificar disponibilidade de peças',
        enabled: enabledAlerts.maintenance,
      },
      {
        id: 'ncs', name: 'Não-Conformidades Abertas', icon: AlertTriangle, unit: 'NCs',
        threshold: 5, currentValue: kpiData.open_ncs, direction: 'above',
        severity: kpiData.critical_ncs > 0 ? 'critical' : kpiData.open_ncs > 5 ? 'warning' : 'info',
        suggestedAction: kpiData.critical_ncs > 0 ? 'URGENTE: Tratar NCs críticas imediatamente' : 'Atribuir responsáveis e prazos para CAPAs',
        enabled: enabledAlerts.ncs,
      },
    ];
  }, [kpiData, enabledAlerts]);

  const activeAlerts = thresholds.filter(t =>
    t.enabled && (
      (t.direction === 'above' && t.currentValue > t.threshold) ||
      (t.direction === 'below' && t.currentValue < t.threshold)
    )
  );

  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  // Generate SOC alerts from KPI breaches
  const generateAlerts = useMutation({
    mutationFn: async () => {
      let created = 0;
      for (const alert of activeAlerts) {
        await fromUntyped('soc_alerts').insert({
          alert_type: `kpi_breach_${alert.id}`,
          severity: alert.severity === 'critical' ? 'critical' : 'high',
          title: `KPI: ${alert.name} acima do limiar (${alert.currentValue}/${alert.threshold})`,
          description: alert.suggestedAction,
          status: 'active',
        });
        created++;
      }
      return created;
    },
    onSuccess: (count) => {
      toast.success(`${count} alerta(s) KPI gerado(s)`);
      queryClient.invalidateQueries({ queryKey: ['kpi-alerts-engine'] });
    },
  });

  const toggleAlert = (id: string) => {
    setEnabledAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Motor de Alertas KPI
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-[10px] animate-pulse">
                {criticalCount} crítico(s)
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {warningCount} aviso(s)
              </Badge>
            )}
            <Button
              size="sm" variant="outline"
              onClick={() => generateAlerts.mutate()}
              disabled={generateAlerts.isPending || activeAlerts.length === 0}
            >
              <Bell className="h-3 w-3 mr-1" /> Disparar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {thresholds.map(kpi => {
          const breached = (kpi.direction === 'above' && kpi.currentValue > kpi.threshold) ||
                          (kpi.direction === 'below' && kpi.currentValue < kpi.threshold);
          const pct = Math.min((kpi.currentValue / kpi.threshold) * 100, 150);

          return (
            <div key={kpi.id} className={`p-3 rounded-lg border ${breached && kpi.enabled ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <kpi.icon className={`h-4 w-4 ${breached && kpi.enabled ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{kpi.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">
                    {kpi.id === 'opex' ? `$${(kpi.currentValue / 1000).toFixed(0)}k` : kpi.currentValue}
                    <span className="text-muted-foreground font-normal">
                      /{kpi.id === 'opex' ? `$${(kpi.threshold / 1000).toFixed(0)}k` : kpi.threshold}
                    </span>
                  </span>
                  <Switch
                    checked={kpi.enabled}
                    onCheckedChange={() => toggleAlert(kpi.id)}
                    className="scale-75"
                  />
                </div>
              </div>
              <Progress value={Math.min(pct, 100)} className="h-1.5 mb-1" />
              {breached && kpi.enabled && (
                <div className="flex items-start gap-1.5 mt-2">
                  <ChevronRight className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                  <span className="text-[10px] text-muted-foreground">{kpi.suggestedAction}</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default KPIAlertsEngine;
