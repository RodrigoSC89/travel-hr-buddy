/**
 * Executive Compliance Dashboard
 * Consolidated KPIs for PEOTRAM, PEO-DP, MLC, SGSO modules
 * Phase 7: Compliance Roadmap Implementation
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, Ship, Anchor, FileCheck, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, 
  Download, Target, Award, BarChart3, PieChart as PieChartIcon,
  Calendar, Users, FileText, Activity, Zap, AlertCircle, Info
} from "lucide-react";
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart
} from 'recharts';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

// Types
interface ModuleKPI {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  score: number;
  previousScore: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'acceptable' | 'inadequate' | 'critical';
  totalItems: number;
  conformeItems: number;
  ncItems: number;
  pendingItems: number;
  criticalNCs: number;
  lastAudit: string;
  nextAudit: string;
  riskLevel: number;
  maturityLevel: string;
  color: string;
}

interface ExecutiveMetrics {
  overallScore: number;
  overallTrend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  totalModules: number;
  modulesCompliant: number;
  modulesAtRisk: number;
  modulesCritical: number;
  totalNCs: number;
  criticalNCs: number;
  pendingActions: number;
  averageResolutionDays: number;
  complianceROI: number;
}

interface TrendDataPoint {
  month: string;
  PEOTRAM: number;
  'PEO-DP': number;
  MLC: number;
  SGSO: number;
  average: number;
}

interface OAuthStatus {
  googleConfigured: boolean;
  microsoftConfigured: boolean;
}

// OAuth Status Check
const useOAuthStatus = (): OAuthStatus => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  
  return {
    googleConfigured: !!googleClientId && googleClientId !== 'PENDING',
    microsoftConfigured: !!microsoftClientId && microsoftClientId !== 'PENDING',
  };
};

// KPI Data Hook
const useExecutiveKPIs = () => {
  return useQuery({
    queryKey: ['executive-compliance-kpis'],
    queryFn: async (): Promise<{ modules: ModuleKPI[], metrics: ExecutiveMetrics, trends: TrendDataPoint[] }> => {
      // Simulate API call - in production, fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const generateModuleKPI = (
        id: string, 
        name: string, 
        shortName: string, 
        icon: React.ElementType, 
        baseScore: number,
        color: string
      ): ModuleKPI => {
        const variance = Math.floor(Math.random() * 10) - 5;
        const score = Math.max(40, Math.min(100, baseScore + variance));
        const previousScore = Math.max(40, Math.min(100, score - Math.floor(Math.random() * 8) + 4));
        const trend: 'up' | 'down' | 'stable' = score > previousScore ? 'up' : score < previousScore ? 'down' : 'stable';
        
        const totalItems = Math.floor(Math.random() * 50) + 30;
        const conformeItems = Math.floor(totalItems * (score / 100));
        const ncItems = totalItems - conformeItems - Math.floor(Math.random() * 5);
        const pendingItems = totalItems - conformeItems - ncItems;
        const criticalNCs = Math.floor(Math.random() * 4);
        
        const getStatus = (s: number): ModuleKPI['status'] => {
          if (s >= 90) return 'excellent';
          if (s >= 75) return 'good';
          if (s >= 60) return 'acceptable';
          if (s >= 40) return 'inadequate';
          return 'critical';
        };
        
        const getMaturity = (s: number): string => {
          if (s >= 90) return 'Excelência';
          if (s >= 75) return 'Maduro';
          if (s >= 60) return 'Em Desenvolvimento';
          if (s >= 40) return 'Inicial';
          return 'Crítico';
        };
        
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const daysUntil = Math.floor(Math.random() * 60) + 15;
        
        return {
          id,
          name,
          shortName,
          icon,
          score,
          previousScore,
          trend,
          status: getStatus(score),
          totalItems,
          conformeItems,
          ncItems,
          pendingItems: Math.max(0, pendingItems),
          criticalNCs,
          lastAudit: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000).toISOString(),
          riskLevel: Math.max(0, 100 - score),
          maturityLevel: getMaturity(score),
          color
        };
      };
      
      const modules: ModuleKPI[] = [
        generateModuleKPI('peotram', 'PEOTRAM 2024', 'PEOTRAM', Anchor, 78, '#3b82f6'),
        generateModuleKPI('peo-dp', 'PEO-DP 2026', 'PEO-DP', Ship, 82, '#8b5cf6'),
        generateModuleKPI('mlc', 'MLC 2006', 'MLC', Shield, 85, '#22c55e'),
        generateModuleKPI('sgso', 'SGSO ANP 46/2016', 'SGSO', FileCheck, 88, '#f59e0b'),
      ];
      
      const overallScore = Math.round(modules.reduce((sum, m) => sum + m.score, 0) / modules.length);
      const previousOverall = Math.round(modules.reduce((sum, m) => sum + m.previousScore, 0) / modules.length);
      
      const metrics: ExecutiveMetrics = {
        overallScore,
        overallTrend: overallScore > previousOverall ? 'up' : overallScore < previousOverall ? 'down' : 'stable',
        trendPercentage: Math.abs(overallScore - previousOverall),
        totalModules: modules.length,
        modulesCompliant: modules.filter(m => m.status === 'excellent' || m.status === 'good').length,
        modulesAtRisk: modules.filter(m => m.status === 'acceptable' || m.status === 'inadequate').length,
        modulesCritical: modules.filter(m => m.status === 'critical').length,
        totalNCs: modules.reduce((sum, m) => sum + m.ncItems, 0),
        criticalNCs: modules.reduce((sum, m) => sum + m.criticalNCs, 0),
        pendingActions: modules.reduce((sum, m) => sum + m.pendingItems, 0),
        averageResolutionDays: Math.floor(Math.random() * 10) + 5,
        complianceROI: Math.floor(Math.random() * 50) + 150, // % ROI
      };
      
      // Generate 12-month trend data
      const trends: TrendDataPoint[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonth = new Date().getMonth();
      
      for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const progressFactor = (12 - i) / 12;
        trends.push({
          month: monthNames[monthIndex],
          PEOTRAM: Math.round(60 + progressFactor * 20 + Math.random() * 8 - 4),
          'PEO-DP': Math.round(65 + progressFactor * 18 + Math.random() * 8 - 4),
          MLC: Math.round(70 + progressFactor * 16 + Math.random() * 8 - 4),
          SGSO: Math.round(72 + progressFactor * 18 + Math.random() * 8 - 4),
          average: 0,
        });
        trends[trends.length - 1].average = Math.round(
          (trends[trends.length - 1].PEOTRAM + 
           trends[trends.length - 1]['PEO-DP'] + 
           trends[trends.length - 1].MLC + 
           trends[trends.length - 1].SGSO) / 4
        );
      }
      
      return { modules, metrics, trends };
    },
    refetchInterval: 60000,
  });
};

// Status colors
const getStatusConfig = (status: ModuleKPI['status']) => {
  switch (status) {
    case 'excellent': return { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Excelente' };
    case 'good': return { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Bom' };
    case 'acceptable': return { color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Aceitável' };
    case 'inadequate': return { color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Inadequado' };
    case 'critical': return { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Crítico' };
  }
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'];

export function ExecutiveComplianceDashboard() {
  const { data, isLoading, refetch } = useExecutiveKPIs();
  const oauthStatus = useOAuthStatus();
  const [activeView, setActiveView] = useState<'overview' | 'modules' | 'trends' | 'risks'>('overview');
  
  const { modules = [], metrics, trends = [] } = data || {};
  
  // Radar chart data
  const radarData = useMemo(() => modules.map(m => ({
    subject: m.shortName,
    score: m.score,
    target: 85,
    fullMark: 100,
  })), [modules]);
  
  // Risk distribution
  const riskDistribution = useMemo(() => [
    { name: 'Baixo', value: modules.filter(m => m.riskLevel < 20).length, color: '#22c55e' },
    { name: 'Médio', value: modules.filter(m => m.riskLevel >= 20 && m.riskLevel < 40).length, color: '#f59e0b' },
    { name: 'Alto', value: modules.filter(m => m.riskLevel >= 40).length, color: '#ef4444' },
  ].filter(d => d.value > 0), [modules]);
  
  // NC by module for bar chart
  const ncByModule = useMemo(() => modules.map(m => ({
    name: m.shortName,
    ncs: m.ncItems,
    critical: m.criticalNCs,
    pending: m.pendingItems,
  })), [modules]);
  
  // Export PDF
  const handleExportPDF = () => {
    if (!metrics) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('DASHBOARD EXECUTIVO', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Compliance Consolidado', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 38, { align: 'center' });
    
    // Overall Score
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Score Geral de Compliance', 14, 60);
    doc.setFontSize(48);
    const scoreColor = metrics.overallScore >= 80 ? [34, 197, 94] : metrics.overallScore >= 60 ? [245, 158, 11] : [239, 68, 68];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${metrics.overallScore}%`, 14, 85);
    
    // Trend indicator
    doc.setFontSize(12);
    doc.setTextColor(metrics.overallTrend === 'up' ? 34 : 239, metrics.overallTrend === 'up' ? 197 : 68, metrics.overallTrend === 'up' ? 94 : 68);
    doc.text(`${metrics.overallTrend === 'up' ? '↑' : metrics.overallTrend === 'down' ? '↓' : '→'} ${metrics.trendPercentage}% vs período anterior`, 14, 95);
    
    // KPIs Grid
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let yPos = 115;
    
    doc.text(`Módulos Conformes: ${metrics.modulesCompliant}/${metrics.totalModules}`, 14, yPos);
    doc.text(`Módulos em Risco: ${metrics.modulesAtRisk}`, 100, yPos);
    yPos += 10;
    doc.text(`Total de NCs: ${metrics.totalNCs}`, 14, yPos);
    doc.text(`NCs Críticas: ${metrics.criticalNCs}`, 100, yPos);
    yPos += 10;
    doc.text(`Ações Pendentes: ${metrics.pendingActions}`, 14, yPos);
    doc.text(`Tempo Médio Resolução: ${metrics.averageResolutionDays} dias`, 100, yPos);
    
    // Module Details
    yPos += 20;
    doc.setFontSize(14);
    doc.text('Detalhes por Módulo', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');
    doc.text('Módulo', 16, yPos);
    doc.text('Score', 55, yPos);
    doc.text('Tendência', 80, yPos);
    doc.text('NCs', 110, yPos);
    doc.text('Críticas', 130, yPos);
    doc.text('Maturidade', 155, yPos);
    
    yPos += 8;
    modules.forEach(m => {
      doc.text(m.shortName, 16, yPos);
      doc.text(`${m.score}%`, 55, yPos);
      doc.text(m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→', 80, yPos);
      doc.text(String(m.ncItems), 110, yPos);
      doc.text(String(m.criticalNCs), 130, yPos);
      doc.text(m.maturityLevel, 155, yPos);
      yPos += 7;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Nautilus One - Maritime HR Management Platform', pageWidth / 2, 285, { align: 'center' });
    
    doc.save(`executive-compliance-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exportado com sucesso');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* OAuth Status Warning */}
      {(!oauthStatus.googleConfigured || !oauthStatus.microsoftConfigured) && (
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-700">Integração Incompleta</AlertTitle>
          <AlertDescription className="text-yellow-600">
            Chaves OAuth pendentes: 
            {!oauthStatus.googleConfigured && <Badge variant="outline" className="ml-2">VITE_GOOGLE_CLIENT_ID</Badge>}
            {!oauthStatus.microsoftConfigured && <Badge variant="outline" className="ml-2">VITE_MICROSOFT_CLIENT_ID</Badge>}
            <span className="block mt-1 text-sm">Configure nos secrets do projeto para ativar sincronização com calendários externos.</span>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            Dashboard Executivo de Compliance
          </h2>
          <p className="text-muted-foreground mt-1">
            KPIs consolidados • PEOTRAM • PEO-DP • MLC • SGSO
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Geral</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{metrics.overallScore}%</span>
                  <Badge variant={metrics.overallTrend === 'up' ? 'default' : 'secondary'} className="gap-1">
                    {metrics.overallTrend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                     metrics.overallTrend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                    {metrics.trendPercentage}%
                  </Badge>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <Progress value={metrics.overallScore} className="mt-4 h-2" />
          </CardContent>
        </Card>

        {/* Modules Status */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Status dos Módulos</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Conformes</span>
                </div>
                <span className="font-bold text-green-600">{metrics.modulesCompliant}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Em Risco</span>
                </div>
                <span className="font-bold text-yellow-600">{metrics.modulesAtRisk}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Críticos</span>
                </div>
                <span className="font-bold text-red-600">{metrics.modulesCritical}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Non-Conformities */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Não Conformidades</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{metrics.totalNCs}</span>
              <span className="text-sm text-muted-foreground">total</span>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs">{metrics.criticalNCs} críticas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-xs">{metrics.pendingActions} pendentes</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Resolução média: {metrics.averageResolutionDays} dias
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">ROI Compliance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{metrics.complianceROI}%</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Economia estimada vs custos de não-conformidade
            </p>
            <Badge variant="outline" className="mt-2 text-green-600 border-green-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Alto Retorno
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <Activity className="h-4 w-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Tendências
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riscos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Comparativo de Módulos
                </CardTitle>
                <CardDescription>Score atual vs meta (85%)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    <Radar name="Meta" dataKey="target" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* NC Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  NCs por Módulo
                </CardTitle>
                <CardDescription>Distribuição de não conformidades</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ncByModule}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ncs" name="NCs" fill="#f59e0b" />
                    <Bar dataKey="critical" name="Críticas" fill="#ef4444" />
                    <Bar dataKey="pending" name="Pendentes" fill="#6b7280" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => {
              const statusConfig = getStatusConfig(module.status);
              const Icon = module.icon;
              
              return (
                <Card key={module.id} className={`border-2 ${statusConfig.border} ${statusConfig.bg}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${module.color}20` }}>
                          <Icon className="h-5 w-5" style={{ color: module.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.shortName}</CardTitle>
                          <CardDescription className="text-xs">{module.name}</CardDescription>
                        </div>
                      </div>
                      <Badge className={statusConfig.bg} variant="outline">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{module.score}%</span>
                        {module.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {module.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                    <Progress value={module.score} className="h-2" />
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded bg-background">
                        <p className="text-xs text-muted-foreground">Conformes</p>
                        <p className="text-lg font-bold text-green-600">{module.conformeItems}</p>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <p className="text-xs text-muted-foreground">NCs</p>
                        <p className="text-lg font-bold text-yellow-600">{module.ncItems}</p>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <p className="text-xs text-muted-foreground">Críticas</p>
                        <p className="text-lg font-bold text-red-600">{module.criticalNCs}</p>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última: {new Date(module.lastAudit).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Próxima: {new Date(module.nextAudit).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    {/* Maturity */}
                    <Badge variant="outline" className="w-full justify-center">
                      Maturidade: {module.maturityLevel}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução de Compliance (12 Meses)
              </CardTitle>
              <CardDescription>Tendência histórica de todos os módulos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[50, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="average" name="Média" fill="#e2e8f0" stroke="#94a3b8" />
                  <Line type="monotone" dataKey="PEOTRAM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="PEO-DP" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="MLC" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="SGSO" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Distribuição de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Módulos por Nível de Risco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.sort((a, b) => b.riskLevel - a.riskLevel).map(module => {
                  const Icon = module.icon;
                  const riskColor = module.riskLevel >= 40 ? 'text-red-600' : 
                                   module.riskLevel >= 20 ? 'text-yellow-600' : 'text-green-600';
                  const riskBg = module.riskLevel >= 40 ? 'bg-red-500' : 
                                module.riskLevel >= 20 ? 'bg-yellow-500' : 'bg-green-500';
                  
                  return (
                    <div key={module.id} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${module.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: module.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{module.shortName}</span>
                          <span className={`font-bold ${riskColor}`}>{module.riskLevel}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${riskBg} transition-all`} 
                            style={{ width: `${module.riskLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
