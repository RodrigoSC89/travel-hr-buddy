/**
 * Safety KPI Cards Component
 * Cards de métricas de segurança
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  AlertTriangle,
  Activity,
  FileText,
  TrendingDown,
  CheckCircle,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import type { SafetyMetrics } from '../types';

interface SafetyKPICardsProps {
  metrics: SafetyMetrics;
  loading?: boolean;
}

export const SafetyKPICards: React.FC<SafetyKPICardsProps> = ({ metrics, loading }) => {
  const kpis = [
    {
      title: 'Incidentes (YTD)',
      value: metrics.totalIncidentsYTD,
      icon: AlertCircle,
      color: 'border-l-destructive',
      trend: '-42%',
      trendPositive: true,
      subtitle: 'vs. mesmo período ano anterior',
    },
    {
      title: 'Near Misses',
      value: metrics.nearMissesYTD,
      icon: AlertTriangle,
      color: 'border-l-warning',
      trend: '-28%',
      trendPositive: true,
    },
    {
      title: 'TRIR',
      value: metrics.trir.toFixed(2),
      icon: Activity,
      color: 'border-l-primary',
      badge: metrics.trir < metrics.trirTarget ? 'Abaixo da meta' : 'Acima da meta',
      badgePositive: metrics.trir < metrics.trirTarget,
      subtitle: `Meta: < ${metrics.trirTarget}`,
    },
    {
      title: 'DDS Realizados',
      value: metrics.totalDDS.toLocaleString(),
      icon: FileText,
      color: 'border-l-secondary',
      badge: `${metrics.ddsCompliance}%`,
      badgePositive: true,
      subtitle: 'Compliance DDS',
    },
    {
      title: 'Investigações Abertas',
      value: metrics.openInvestigations,
      icon: ClipboardCheck,
      color: 'border-l-warning',
    },
    {
      title: 'Ações Pendentes',
      value: metrics.pendingActions,
      icon: AlertCircle,
      color: 'border-l-destructive',
    },
    {
      title: 'Compliance Treinamento',
      value: `${metrics.trainingCompliance}%`,
      icon: Users,
      color: 'border-l-success',
      badgePositive: metrics.trainingCompliance >= 90,
    },
    {
      title: 'Alertas Críticos',
      value: metrics.criticalAlerts,
      icon: AlertTriangle,
      color: metrics.criticalAlerts > 0 ? 'border-l-destructive' : 'border-l-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.slice(0, 4).map((kpi, index) => (
        <Card key={index} className={`border-l-4 ${kpi.color}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <kpi.icon className="h-4 w-4" />
              {kpi.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold">{loading ? '...' : kpi.value}</div>
              {kpi.trend && (
                <Badge className={kpi.trendPositive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive'}>
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {kpi.trend}
                </Badge>
              )}
              {kpi.badge && (
                <Badge className={kpi.badgePositive ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning'}>
                  {kpi.badgePositive && <CheckCircle className="h-3 w-3 mr-1" />}
                  {kpi.badge}
                </Badge>
              )}
            </div>
            {kpi.subtitle && (
              <p className="text-xs text-muted-foreground mt-2">{kpi.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
