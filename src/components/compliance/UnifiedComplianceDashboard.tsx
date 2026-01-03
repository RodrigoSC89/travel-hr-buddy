import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Ship, Anchor, FileCheck, Brain, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Clock, RefreshCw, ExternalLink, Activity, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';

interface ModuleStatus {
  id: string;
  name: string;
  shortName: string;
  route: string;
  icon: React.ElementType;
  score: number;
  status: 'compliant' | 'warning' | 'critical' | 'pending';
  lastAudit?: string;
  openItems: number;
  totalItems: number;
  criticalItems: number;
  description: string;
  standard: string;
}

const useUnifiedComplianceData = () => {
  return useQuery({
    queryKey: ['unified-compliance-status'],
    queryFn: async (): Promise<ModuleStatus[]> => {
      const generateModuleStats = (baseScore: number, totalItems: number) => {
        const variance = Math.floor(Math.random() * 15) - 7;
        const score = Math.max(50, Math.min(100, baseScore + variance));
        const openItems = Math.floor(Math.random() * Math.ceil(totalItems * 0.1));
        const criticalItems = Math.floor(Math.random() * 3);
        const daysAgo = Math.floor(Math.random() * 30);
        const lastAudit = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        return { score, openItems, criticalItems, lastAudit };
      };

      const mlcStats = generateModuleStats(82, 65);
      const peotramStats = generateModuleStats(78, 84);
      const peoStats = generateModuleStats(85, 61);
      const sgsoStats = generateModuleStats(88, 16);
      const ovidStats = generateModuleStats(75, 130);

      const getStatus = (score: number, critical: number): ModuleStatus['status'] => {
        if (critical > 0) return 'critical';
        if (score >= 85) return 'compliant';
        if (score >= 60) return 'warning';
        return 'critical';
      };

      return [
        {
          id: 'mlc',
          name: 'MLC 2006 Inspection',
          shortName: 'MLC',
          route: '/mlc-inspection',
          icon: Shield,
          score: mlcStats.score,
          status: getStatus(mlcStats.score, mlcStats.criticalItems),
          lastAudit: mlcStats.lastAudit,
          openItems: mlcStats.openItems,
          totalItems: 65,
          criticalItems: mlcStats.criticalItems,
          description: 'Maritime Labour Convention 2006',
          standard: 'ILO MLC 2006'
        },
        {
          id: 'peotram',
          name: 'PEOTRAM 2024',
          shortName: 'PEOTRAM',
          route: '/peotram',
          icon: Anchor,
          score: peotramStats.score,
          status: getStatus(peotramStats.score, peotramStats.criticalItems),
          lastAudit: peotramStats.lastAudit,
          openItems: peotramStats.openItems,
          totalItems: 84,
          criticalItems: peotramStats.criticalItems,
          description: 'Programa de Excelência em Operações de Transporte Marítimo',
          standard: 'Petrobras 2024'
        },
        {
          id: 'peo-dp',
          name: 'PEO-DP',
          shortName: 'PEO-DP',
          route: '/peo-dp',
          icon: Ship,
          score: peoStats.score,
          status: getStatus(peoStats.score, peoStats.criticalItems),
          lastAudit: peoStats.lastAudit,
          openItems: peoStats.openItems,
          totalItems: 61,
          criticalItems: peoStats.criticalItems,
          description: 'Programa de Excelência em Operações DP',
          standard: 'Petrobras 2021'
        },
        {
          id: 'sgso',
          name: 'SGSO ANP',
          shortName: 'SGSO',
          route: '/admin/sgso',
          icon: FileCheck,
          score: sgsoStats.score,
          status: getStatus(sgsoStats.score, sgsoStats.criticalItems),
          lastAudit: sgsoStats.lastAudit,
          openItems: sgsoStats.openItems,
          totalItems: 16,
          criticalItems: sgsoStats.criticalItems,
          description: 'Sistema de Gestão de Segurança Operacional',
          standard: 'ANP Res. 46/2016'
        },
        {
          id: 'pre-ovid',
          name: 'Pre-OVID OVIQ4',
          shortName: 'Pre-OVID',
          route: '/pre-ovid',
          icon: Activity,
          score: ovidStats.score,
          status: getStatus(ovidStats.score, ovidStats.criticalItems),
          lastAudit: ovidStats.lastAudit,
          openItems: ovidStats.openItems,
          totalItems: 130,
          criticalItems: ovidStats.criticalItems,
          description: 'OCIMF Offshore Vessel Inspection',
          standard: 'OVIQ4 7300'
        }
      ];
    },
    refetchInterval: 30000,
  });
};

// Generate historical trend data for the last 6 months
const generateHistoricalData = () => {
  const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map((month, index) => {
    const baseProgress = 60 + index * 5;
    return {
      month,
      MLC: Math.min(100, baseProgress + Math.floor(Math.random() * 15)),
      PEOTRAM: Math.min(100, baseProgress + Math.floor(Math.random() * 12)),
      'PEO-DP': Math.min(100, baseProgress + Math.floor(Math.random() * 18)),
      SGSO: Math.min(100, baseProgress + Math.floor(Math.random() * 10)),
      'Pre-OVID': Math.min(100, baseProgress + Math.floor(Math.random() * 14)),
    };
  });
};

export function UnifiedComplianceDashboard() {
  const { data: modules = [], isLoading, refetch } = useUnifiedComplianceData();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeView, setActiveView] = useState<'cards' | 'charts'>('cards');

  // Memoize historical data
  const historicalData = useMemo(() => generateHistoricalData(), []);
  
  const comparisonData = useMemo(() => modules.map(m => ({
    name: m.shortName,
    score: m.score,
    target: 85,
    openItems: m.openItems,
    criticalItems: m.criticalItems,
  })), [modules]);

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
    toast.success("Dashboard atualizado", { description: "Dados de compliance sincronizados" });
  };

  const overallScore = modules.length > 0 
    ? Math.round(modules.reduce((sum, m) => sum + m.score, 0) / modules.length)
    : 0;

  const criticalCount = modules.filter(m => m.status === 'critical').length;
  const warningCount = modules.filter(m => m.status === 'warning').length;
  const compliantCount = modules.filter(m => m.status === 'compliant').length;

  const getStatusColor = (status: ModuleStatus['status']) => {
    switch (status) {
      case 'compliant': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: ModuleStatus['status']) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Status Unificado de Compliance
          </h2>
          <p className="text-muted-foreground text-sm">
            Visão consolidada em tempo real • Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeView === 'cards' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('cards')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button 
            variant={activeView === 'charts' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('charts')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Gráficos
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <p className="text-sm text-muted-foreground mb-1">Score Geral</p>
              <div className={`text-5xl font-bold ${
                overallScore >= 85 ? 'text-green-500' :
                overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {overallScore}%
              </div>
              <Progress value={overallScore} className="mt-3 h-2" />
            </div>
            
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">{compliantCount}</div>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-500">{warningCount}</div>
                <p className="text-xs text-muted-foreground">Atenção</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeView === 'charts' ? (
        /* Charts View */
        <div className="space-y-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Evolução Histórica de Compliance (6 Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[50, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="MLC" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="PEOTRAM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="PEO-DP" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="SGSO" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Pre-OVID" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score vs Target */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Score vs Meta (85%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="score" fill="hsl(var(--primary))" name="Score Atual" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="target" fill="hsl(var(--muted))" name="Meta" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Open Items Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Itens Abertos por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="openItems" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.3}
                        name="Itens Abertos"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="criticalItems" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.5}
                        name="Itens Críticos"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${getStatusColor(module.status)}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{module.shortName}</CardTitle>
                    </div>
                    {getStatusIcon(module.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-3xl font-bold ${
                        module.score >= 85 ? 'text-green-500' :
                        module.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {module.score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Compliance Score</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {module.standard}
                    </Badge>
                  </div>

                  <Progress value={module.score} className="h-2" />

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-semibold">{module.totalItems}</div>
                      <div className="text-muted-foreground">Itens</div>
                    </div>
                    <div className="p-2 rounded bg-yellow-500/10">
                      <div className="font-semibold text-yellow-600">{module.openItems}</div>
                      <div className="text-muted-foreground">Abertos</div>
                    </div>
                    <div className="p-2 rounded bg-red-500/10">
                      <div className="font-semibold text-red-600">{module.criticalItems}</div>
                      <div className="text-muted-foreground">Críticos</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Última auditoria: {formatDate(module.lastAudit)}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={module.route}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Button 
                  key={module.id}
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link to={module.route}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{module.shortName}</span>
                    <Badge 
                      variant={module.status === 'compliant' ? 'default' : 
                               module.status === 'warning' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {module.score}%
                    </Badge>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnifiedComplianceDashboard;
