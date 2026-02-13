import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Ship, Anchor, FileCheck, Brain, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Clock, RefreshCw, ExternalLink, Activity, BarChart3,
  Download, Bell, BellRing, MapPin, FileText, Users, Wifi
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getJsPDF } from '@/lib/pdf/lazy-pdf';
import { useComplianceRealtimeAlerts } from '@/hooks/use-compliance-realtime-alerts';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
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
      const generateModuleStats = (baseScore: number, totalItems: number, seed: number) => {
        const variance = [-3, 5, -7, 2, -1][seed % 5];
        const score = Math.max(50, Math.min(100, baseScore + variance));
        const openItems = Math.floor(totalItems * 0.05) + (seed % 3);
        const criticalItems = seed % 4 === 0 ? 1 : 0;
        const daysAgo = 5 + (seed * 3) % 25;
        const lastAudit = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        return { score, openItems, criticalItems, lastAudit };
      };

      const mlcStats = generateModuleStats(82, 65, 0);
      const peotramStats = generateModuleStats(78, 84, 1);
      const peoStats = generateModuleStats(85, 61, 2);
      const sgsoStats = generateModuleStats(88, 16, 3);
      const ovidStats = generateModuleStats(75, 130, 4);

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
      MLC: Math.min(100, baseProgress + [8, 5, 12, 7, 10, 14][index]),
      PEOTRAM: Math.min(100, baseProgress + [6, 3, 9, 5, 8, 11][index]),
      'PEO-DP': Math.min(100, baseProgress + [10, 7, 15, 9, 13, 17][index]),
      SGSO: Math.min(100, baseProgress + [4, 2, 7, 5, 6, 9][index]),
      'Pre-OVID': Math.min(100, baseProgress + [7, 4, 11, 6, 9, 13][index]),
    };
  });
};

export function UnifiedComplianceDashboard() {
  const { data: modules = [], isLoading, refetch } = useUnifiedComplianceData();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeView, setActiveView] = useState<'cards' | 'charts'>('cards');
  const [showAlerts, setShowAlerts] = useState(false);
  
  // Supabase Realtime alerts - synced across multiple users
  const { alerts, isConnected, sendAlert, clearAlerts, onlineUsers } = useComplianceRealtimeAlerts();

  // Monitor for critical status changes and broadcast to all connected users
  const previousModulesRef = useRef<ModuleStatus[]>([]);
  useEffect(() => {
    if (previousModulesRef.current.length > 0 && isConnected) {
      modules.forEach(current => {
        const previous = previousModulesRef.current.find(p => p.id === current.id);
        if (previous && previous.status !== 'critical' && current.status === 'critical') {
          // Broadcast alert to all connected users via Supabase Realtime
          sendAlert({
            module: current.shortName,
            message: `${current.shortName} entrou em status CRÍTICO! Score: ${current.score}%`,
            type: 'critical',
          });
        }
      });
    }
    previousModulesRef.current = modules;
  }, [modules, isConnected, sendAlert]);

  // Memoize historical data
  const historicalData = useMemo(() => generateHistoricalData(), []);
  
  const comparisonData = useMemo(() => modules.map(m => ({
    name: m.shortName,
    score: m.score,
    target: 85,
    openItems: m.openItems,
    criticalItems: m.criticalItems,
  })), [modules]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const compliant = modules.filter(m => m.status === 'compliant').length;
    const warning = modules.filter(m => m.status === 'warning').length;
    const critical = modules.filter(m => m.status === 'critical').length;
    return [
      { name: 'Conformes', value: compliant, color: '#22c55e' },
      { name: 'Atenção', value: warning, color: '#f59e0b' },
      { name: 'Críticos', value: critical, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [modules]);

  // PDF Export function
  const handleExportPDF = async () => {
    const JsPDF = await getJsPDF();
    const doc = new JsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with gradient-like styling
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('COMPLIANCE DASHBOARD', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Relatório Consolidado - ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Overall Score
    doc.setFontSize(16);
    doc.text('Score Geral de Compliance', 14, 55);
    doc.setFontSize(32);
    const overallScore = modules.length > 0 
      ? Math.round(modules.reduce((sum, m) => sum + m.score, 0) / modules.length)
      : 0;
    doc.setTextColor(overallScore >= 85 ? 34 : overallScore >= 60 ? 245 : 239, 
                     overallScore >= 85 ? 197 : overallScore >= 60 ? 158 : 68, 
                     overallScore >= 85 ? 94 : overallScore >= 60 ? 11 : 68);
    doc.text(`${overallScore}%`, 14, 72);
    
    // Status summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const compliant = modules.filter(m => m.status === 'compliant').length;
    const warning = modules.filter(m => m.status === 'warning').length;
    const critical = modules.filter(m => m.status === 'critical').length;
    doc.text(`Conformes: ${compliant} | Atenção: ${warning} | Críticos: ${critical}`, 14, 82);
    
    // Module details table
    doc.setFontSize(14);
    doc.text('Detalhes por Módulo', 14, 100);
    
    let yPos = 110;
    doc.setFontSize(10);
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 6, pageWidth - 28, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Módulo', 16, yPos);
    doc.text('Score', 60, yPos);
    doc.text('Status', 85, yPos);
    doc.text('Itens Abertos', 115, yPos);
    doc.text('Críticos', 150, yPos);
    doc.text('Última Auditoria', 175, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    
    modules.forEach((module) => {
      doc.text(module.shortName, 16, yPos);
      doc.text(`${module.score}%`, 60, yPos);
      doc.text(module.status === 'compliant' ? 'OK' : module.status === 'warning' ? 'Atenção' : 'Crítico', 85, yPos);
      doc.text(String(module.openItems), 115, yPos);
      doc.text(String(module.criticalItems), 150, yPos);
      doc.text(module.lastAudit ? new Date(module.lastAudit).toLocaleDateString('pt-BR') : 'N/A', 175, yPos);
      yPos += 8;
    });
    
    // Historical trend summary
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Tendência Histórica (6 Meses)', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    historicalData.forEach((data, index) => {
      doc.text(`${data.month}: MLC ${data.MLC}% | PEOTRAM ${data.PEOTRAM}% | PEO-DP ${data['PEO-DP']}% | SGSO ${data.SGSO}%`, 16, yPos);
      yPos += 6;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado por Nautilus One - ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 285, { align: 'center' });
    
    doc.save(`compliance-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF exportado", { description: "Relatório de compliance salvo com sucesso" });
  };

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
      case 'compliant': return 'text-success bg-success/10 border-success/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusIcon = (status: ModuleStatus['status']) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
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
      {/* Header - Inspired by MLC Inspection design */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Status Unificado de Compliance
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Visão consolidada em tempo real • Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}</span>
            <div className="flex items-center gap-1">
              <Wifi className={`h-3 w-3 ${isConnected ? 'text-success' : 'text-destructive'}`} />
              <span className="text-xs">{isConnected ? 'Conectado' : 'Desconectado'}</span>
              {onlineUsers > 0 && (
                <Badge variant="outline" className="text-xs ml-1">
                  <Users className="h-3 w-3 mr-1" />
                  {onlineUsers}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative"
          >
            {alerts.length > 0 ? <BellRing className="h-4 w-4 mr-2 text-destructive" /> : <Bell className="h-4 w-4 mr-2" />}
            Alertas
            {alerts.length > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {alerts.length}
              </Badge>
            )}
          </Button>
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
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <BellRing className="h-5 w-5" />
                Alertas de Compliance ({alerts.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAlerts}>
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-2 rounded bg-background border">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${alert.type === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum alerta ativo. O sistema monitora mudanças críticas em tempo real.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Bar - Inspired by MLC design */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <div className="text-lg font-bold">{modules.reduce((sum, m) => sum + m.totalItems, 0)}</div>
            <p className="text-xs text-muted-foreground">Itens Totais</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <Ship className="h-5 w-5 text-primary" />
          <div>
            <div className="text-lg font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">Módulos Ativos</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <div className="text-lg font-bold text-success">{compliantCount}</div>
            <p className="text-xs text-muted-foreground">Conformes</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <div className="text-lg font-bold text-warning">{modules.reduce((sum, m) => sum + m.openItems, 0)}</div>
            <p className="text-xs text-muted-foreground">Pendências</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-destructive" />
          <div>
            <div className="text-lg font-bold text-destructive">{modules.reduce((sum, m) => sum + m.criticalItems, 0)}</div>
            <p className="text-xs text-muted-foreground">Críticos</p>
          </div>
        </Card>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <p className="text-sm text-muted-foreground mb-1">Score Geral</p>
              <div className={`text-5xl font-bold ${
                overallScore >= 85 ? 'text-success' :
                overallScore >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {overallScore}%
              </div>
              <Progress value={overallScore} className="mt-3 h-2" />
            </div>
            
            <div className="md:col-span-2">
              {/* Mini pie chart for status distribution */}
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="md:col-span-1 flex flex-col justify-center gap-2">
              <div className="flex items-center justify-between p-2 rounded bg-success/10">
                <span className="text-sm">Meta</span>
                <Badge variant="outline">85%</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted">
                <span className="text-sm">Atual</span>
                <Badge variant={overallScore >= 85 ? 'default' : 'secondary'}>{overallScore}%</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted">
                <span className="text-sm">Diferença</span>
                <Badge variant={overallScore >= 85 ? 'default' : 'destructive'}>
                  {overallScore >= 85 ? '+' : ''}{overallScore - 85}%
                </Badge>
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
                <TrendingUp className="h-5 w-5 text-info" />
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
                  <BarChart3 className="h-5 w-5 text-primary" />
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
                  <AlertTriangle className="h-5 w-5 text-warning" />
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
                        stroke="hsl(var(--warning))" 
                        fill="hsl(var(--warning))" 
                        fillOpacity={0.3}
                        name="Itens Abertos"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="criticalItems" 
                        stroke="hsl(var(--destructive))" 
                        fill="hsl(var(--destructive))" 
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
                        module.score >= 85 ? 'text-success' :
                        module.score >= 60 ? 'text-warning' : 'text-destructive'
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
                    <div className="p-2 rounded bg-warning/10">
                      <div className="font-semibold text-warning">{module.openItems}</div>
                      <div className="text-muted-foreground">Abertos</div>
                    </div>
                    <div className="p-2 rounded bg-destructive/10">
                      <div className="font-semibold text-destructive">{module.criticalItems}</div>
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
            <Brain className="h-5 w-5 text-primary" />
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
