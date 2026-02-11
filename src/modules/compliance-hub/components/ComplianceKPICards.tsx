/**
 * Compliance KPI Cards Component
 * Cards de métricas principais do módulo de conformidade
 */

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  CheckCircle2 
} from 'lucide-react';
import type { ComplianceKPIs } from '../types';

interface ComplianceKPICardsProps {
  kpis: ComplianceKPIs;
}

export function ComplianceKPICards({ kpis }: ComplianceKPICardsProps) {
  const TrendIcon = kpis.trendDirection === 'up' ? TrendingUp : 
                    kpis.trendDirection === 'down' ? TrendingDown : TrendingUp;
  
  const trendColor = kpis.trendDirection === 'up' ? 'text-success' : 
                     kpis.trendDirection === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const scoreColor = kpis.overallScore >= 90 ? 'text-success' : 
                     kpis.overallScore >= 75 ? 'text-warning' : 'text-destructive';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Compliance Score */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
          <Shield className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {kpis.overallScore}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            <span className={`text-xs ${trendColor}`}>
              {kpis.trendDirection === 'up' ? '+' : kpis.trendDirection === 'down' ? '-' : ''}
              {kpis.trendPercentage}% este mês
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Status */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-success/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certificados</CardTitle>
          <Award className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {kpis.certificatesValid}/{kpis.certificatesTotal}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Válidos</span>
            {kpis.certificatesValid === kpis.certificatesTotal && (
              <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                100%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Open Findings */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Findings Abertos</CardTitle>
          <FileCheck className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{kpis.openFindings}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {kpis.closedFindings} fechados
            </span>
            {kpis.openFindings === 0 && (
              <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                Nenhum pendente
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Items */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-20 h-20 ${kpis.overdueItems > 0 ? 'bg-destructive/10' : 'bg-info/10'} rounded-full -mr-10 -mt-10`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Itens Vencidos</CardTitle>
          {kpis.overdueItems > 0 ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className="h-4 w-4 text-info" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${kpis.overdueItems > 0 ? 'text-destructive' : ''}`}>
            {kpis.overdueItems}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {kpis.upcomingAudits} auditorias agendadas
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
