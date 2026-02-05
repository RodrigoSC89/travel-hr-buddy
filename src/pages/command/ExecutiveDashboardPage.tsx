/**
 * Executive Dashboard Page - Visão C-Level
 * Dashboard executivo com KPIs estratégicos conectados ao Supabase
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Ship, 
  Shield, Fuel, AlertTriangle, AlertCircle,
  Download, RefreshCw, Target, Award, Leaf
} from 'lucide-react';
import { useExecutiveKPIs } from '@/hooks/useExecutiveKPIs';

export default function ExecutiveDashboardPage() {
  const { data, isLoading, error, refetch, exportData } = useExecutiveKPIs();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar KPIs</h3>
            <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { financial, operational, safety, esg, fleet } = data;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita YTD</p>
                <p className="text-2xl font-bold">${(financial.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span>+{financial.revenueChange.toFixed(1)}% vs ano anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OPEX YTD</p>
                <p className="text-2xl font-bold">${(financial.opex / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <TrendingDown className="h-3 w-3" />
              <span>{financial.opexChange.toFixed(1)}% redução</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">EBITDA</p>
                <p className="text-2xl font-bold">${(financial.ebitda / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Margem: {financial.ebitdaMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Voyage P&L</p>
                <p className="text-2xl font-bold">${(financial.voyagePnL / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Ship className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Lucro acumulado
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Operacional
                </CardTitle>
                <CardDescription>KPIs operacionais consolidados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilização da Frota</span>
                  <span className="font-medium">{operational.fleetUtilization}%</span>
                </div>
                <Progress value={operational.fleetUtilization} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On-Time Delivery</span>
                  <span className="font-medium">{operational.onTimeDelivery}%</span>
                </div>
                <Progress value={operational.onTimeDelivery} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium">{safety.complianceScore}%</span>
                </div>
                <Progress value={safety.complianceScore} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-3xl font-bold">{operational.portCalls}</p>
                <p className="text-sm text-muted-foreground">Port Calls</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{operational.avgVoyageTime.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Days/Voyage</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{(operational.cargoTonnage / 1000000).toFixed(2)}M</p>
                <p className="text-sm text-muted-foreground">Cargo (MT)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{safety.pscDetentions}</p>
                <p className="text-sm text-muted-foreground">PSC Detentions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Status da Frota
            </CardTitle>
            <CardDescription>{fleet.totalVessels} embarcações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Navegando</span>
                </div>
                <span className="font-bold">{fleet.navigating}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Em Porto</span>
                </div>
                <span className="font-bold">{fleet.inPort}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Fundeados</span>
                </div>
                <span className="font-bold">{fleet.anchored}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Drydock</span>
                </div>
                <span className="font-bold">{fleet.drydock}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety & ESG Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Safety KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Indicadores de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-3xl font-bold text-green-500">{safety.ltif}</p>
                <p className="text-sm text-muted-foreground">LTIF</p>
                <p className="text-xs text-green-500 mt-1">Excelente</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-3xl font-bold text-blue-500">{safety.trir}</p>
                <p className="text-sm text-muted-foreground">TRIR</p>
                <p className="text-xs text-blue-500 mt-1">Meta: 0.50</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-3xl font-bold text-yellow-500">{safety.nearMisses}</p>
                <p className="text-sm text-muted-foreground">Near Misses</p>
                <p className="text-xs text-muted-foreground mt-1">Este ano</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold">{safety.complianceScore}%</p>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-xs text-green-500 mt-1">Acima da meta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ESG Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              ESG & Sustentabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Badge className="mb-2 bg-blue-500">
                  CII Rating: {esg.ciiRating}
                </Badge>
                <p className="text-2xl font-bold mt-2">{esg.co2Emissions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tons CO₂</p>
                <div className="flex items-center justify-center gap-1 text-xs text-green-500 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>{esg.co2Reduction.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">EEXI</span>
                </div>
                <p className="text-2xl font-bold">{esg.eexiCompliance}%</p>
                <p className="text-xs text-muted-foreground">Conformidade</p>
                <Progress value={esg.eexiCompliance} className="mt-2 h-1.5" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Resíduos Reciclados</span>
                <span className="font-medium">{esg.wasteRecycled}%</span>
              </div>
              <Progress value={esg.wasteRecycled} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
