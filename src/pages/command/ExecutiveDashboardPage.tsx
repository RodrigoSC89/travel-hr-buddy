/**
 * Executive Dashboard Page - Visão C-Level
 * Dashboard executivo com KPIs estratégicos
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Ship, 
  Shield, Users, Fuel, AlertTriangle, CheckCircle2, Clock,
  Download, RefreshCw, Calendar, Target, Award, Leaf
} from 'lucide-react';

const executiveKPIs = {
  financial: {
    revenue: 45600000,
    revenueChange: 12.5,
    opex: 32400000,
    opexChange: -3.2,
    ebitda: 13200000,
    ebitdaMargin: 28.9,
    voyagePnL: 8900000
  },
  operational: {
    fleetUtilization: 89,
    onTimeDelivery: 94,
    avgVoyageTime: 12.5,
    portCalls: 156,
    cargoTonnage: 2450000
  },
  safety: {
    ltif: 0.12,
    trir: 0.45,
    nearMisses: 23,
    pscDetentions: 0,
    complianceScore: 97
  },
  esg: {
    ciiRating: 'B',
    co2Emissions: 145000,
    co2Reduction: -8.3,
    eexiCompliance: 92,
    wasteRecycled: 78
  },
  fleet: {
    totalVessels: 45,
    navigating: 28,
    inPort: 12,
    drydock: 2,
    anchored: 3
  }
};

export default function ExecutiveDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita YTD</p>
                <p className="text-2xl font-bold">${(executiveKPIs.financial.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span>+{executiveKPIs.financial.revenueChange}% vs ano anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OPEX YTD</p>
                <p className="text-2xl font-bold">${(executiveKPIs.financial.opex / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <TrendingDown className="h-3 w-3" />
              <span>{executiveKPIs.financial.opexChange}% redução</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">EBITDA</p>
                <p className="text-2xl font-bold">${(executiveKPIs.financial.ebitda / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Margem: {executiveKPIs.financial.ebitdaMargin}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Voyage P&L</p>
                <p className="text-2xl font-bold">${(executiveKPIs.financial.voyagePnL / 1000000).toFixed(1)}M</p>
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilização da Frota</span>
                  <span className="font-medium">{executiveKPIs.operational.fleetUtilization}%</span>
                </div>
                <Progress value={executiveKPIs.operational.fleetUtilization} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On-Time Delivery</span>
                  <span className="font-medium">{executiveKPIs.operational.onTimeDelivery}%</span>
                </div>
                <Progress value={executiveKPIs.operational.onTimeDelivery} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium">{executiveKPIs.safety.complianceScore}%</span>
                </div>
                <Progress value={executiveKPIs.safety.complianceScore} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-3xl font-bold">{executiveKPIs.operational.portCalls}</p>
                <p className="text-sm text-muted-foreground">Port Calls</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{executiveKPIs.operational.avgVoyageTime}</p>
                <p className="text-sm text-muted-foreground">Avg Days/Voyage</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{(executiveKPIs.operational.cargoTonnage / 1000000).toFixed(2)}M</p>
                <p className="text-sm text-muted-foreground">Cargo (MT)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{executiveKPIs.safety.pscDetentions}</p>
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
            <CardDescription>{executiveKPIs.fleet.totalVessels} embarcações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Navegando</span>
                </div>
                <span className="font-bold">{executiveKPIs.fleet.navigating}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Em Porto</span>
                </div>
                <span className="font-bold">{executiveKPIs.fleet.inPort}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Fundeados</span>
                </div>
                <span className="font-bold">{executiveKPIs.fleet.anchored}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Drydock</span>
                </div>
                <span className="font-bold">{executiveKPIs.fleet.drydock}</span>
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
                <p className="text-3xl font-bold text-green-500">{executiveKPIs.safety.ltif}</p>
                <p className="text-sm text-muted-foreground">LTIF</p>
                <p className="text-xs text-green-500 mt-1">Excelente</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-3xl font-bold text-blue-500">{executiveKPIs.safety.trir}</p>
                <p className="text-sm text-muted-foreground">TRIR</p>
                <p className="text-xs text-blue-500 mt-1">Meta: 0.50</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-3xl font-bold text-yellow-500">{executiveKPIs.safety.nearMisses}</p>
                <p className="text-sm text-muted-foreground">Near Misses</p>
                <p className="text-xs text-muted-foreground mt-1">Este mês</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold">{executiveKPIs.safety.complianceScore}%</p>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-xs text-green-500 mt-1">+2% vs meta</p>
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
                  CII Rating: {executiveKPIs.esg.ciiRating}
                </Badge>
                <p className="text-2xl font-bold mt-2">{executiveKPIs.esg.co2Emissions}</p>
                <p className="text-xs text-muted-foreground">Tons CO₂</p>
                <div className="flex items-center justify-center gap-1 text-xs text-green-500 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>{executiveKPIs.esg.co2Reduction}%</span>
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">EEXI</span>
                </div>
                <p className="text-2xl font-bold">{executiveKPIs.esg.eexiCompliance}%</p>
                <p className="text-xs text-muted-foreground">Conformidade</p>
                <Progress value={executiveKPIs.esg.eexiCompliance} className="mt-2 h-1.5" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Resíduos Reciclados</span>
                <span className="font-medium">{executiveKPIs.esg.wasteRecycled}%</span>
              </div>
              <Progress value={executiveKPIs.esg.wasteRecycled} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
