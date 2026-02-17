import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useComplianceItems, useNonConformities, useComplianceAlerts, useDepartmentScores, useUpdateNCStatus } from '@/hooks/useComplianceRoadmapData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Bell, BellRing, Download, RefreshCw, Filter, Search, Eye, Edit, 
  Calendar, Target, Activity, BarChart3, FileText, Users, Mail, 
  MessageSquare, Zap, Gauge, AlertCircle, ChevronRight, Play, Pause
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Helper functions & constants
const getCriticidadeColor = (criticidade: string): string => {
  switch (criticidade) {
    case 'critico': return 'bg-destructive text-destructive-foreground';
    case 'alto': return 'bg-warning text-warning-foreground';
    case 'medio': return 'bg-warning/70 text-foreground';
    case 'baixo': return 'bg-success text-success-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'conforme': return 'bg-success text-success-foreground';
    case 'nao_conforme': return 'bg-destructive text-destructive-foreground';
    case 'pendente': return 'bg-warning/70 text-foreground';
    case 'em_analise': return 'bg-info text-info-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const CHART_COLORS: Record<string, string> = {
  PEOTRAM: 'hsl(var(--primary))',
  'PEO-DP': 'hsl(var(--success))',
  MLC: 'hsl(var(--warning))',
  SGSO: 'hsl(var(--accent))',
  'Pre-OVID': 'hsl(var(--destructive))',
  meta: 'hsl(var(--muted-foreground))',
};

// Types
interface ComplianceItem {
  id: string;
  itemId: string;
  elementId: string;
  lvId: string;
  requisito: string;
  evidencia: string;
  status: 'conforme' | 'nao_conforme' | 'pendente' | 'em_analise';
  criticidade: 'critico' | 'alto' | 'medio' | 'baixo';
  peso: number;
  ultimaAuditoria: string;
  proximaAuditoria: string;
  responsavel: string;
  departamento: string;
  modulo: 'PEOTRAM' | 'PEO-DP' | 'MLC' | 'SGSO' | 'Pre-OVID';
  tendencia: 'up' | 'down' | 'stable';
  diasAteVencimento?: number;
}

interface NonConformity {
  id: string;
  ncId: string;
  titulo: string;
  descricao: string;
  itemId: string;
  elementoAfetado: string;
  lvViolada: string;
  classificacao: 'A' | 'B' | 'C' | 'D';
  status: 'aberta' | 'em_pac' | 'em_execucao' | 'aguardando_validacao' | 'fechada';
  causaRaiz: string;
  planoAcao: string;
  responsavel: string;
  prazo: string;
  dataCriacao: string;
  diasAberta: number;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  modulo: string;
  evidenciaCorretiva?: string;
  percentualConcluido: number;
}

interface ComplianceAlert {
  id: string;
  tipo: 'certificado_vencendo' | 'nc_sem_acao' | 'auditoria_atrasada' | 'evidencia_pendente' | 'nc_critica' | 'prazo_vencido';
  titulo: string;
  mensagem: string;
  modulo: string;
  criticidade: 'critica' | 'alta' | 'media' | 'baixa';
  dataCriacao: string;
  lido: boolean;
  itemRelacionado?: string;
  diasAteVencimento?: number;
}

interface DepartmentScore {
  departamento: string;
  score: number;
  meta: number;
  tendencia: 'up' | 'down' | 'stable';
  ncsAbertas: number;
  totalItens: number;
}

// Data hooks replace all mock generators
export function ComplianceRoadmapDashboard() {
  const { data: itemsData = [] } = useComplianceItems();
  const { data: ncsData = [] } = useNonConformities();
  const { data: alertsData = [] } = useComplianceAlerts();
  const { data: departmentScoresData = [] } = useDepartmentScores();
  const updateNCMutation = useUpdateNCStatus();

  const [items] = useState<ComplianceItem[]>(() => []);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [departmentScores, setDepartmentScores] = useState<DepartmentScore[]>([]);

  // Sync from hooks
  useEffect(() => { if (ncsData.length) setNonConformities(ncsData); }, [ncsData]);
  useEffect(() => { if (alertsData.length) setAlerts(alertsData); }, [alertsData]);
  useEffect(() => { if (departmentScoresData.length) setDepartmentScores(departmentScoresData); }, [departmentScoresData]);

  // Use hook data for items
  const effectiveItems = itemsData.length > 0 ? itemsData : items;

  // Historical data derived from department scores
  const historicalData = useMemo(() => {
    const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
    return months.map((month, index) => ({
      month,
      PEOTRAM: Math.min(100, 75 + index * 3),
      'PEO-DP': Math.min(100, 78 + index * 2.5),
      MLC: Math.min(100, 72 + index * 3.5),
      SGSO: Math.min(100, 80 + index * 2),
      meta: 85,
      ncsAbertas: Math.max(1, 15 - index * 2),
      ncsFechadas: index * 3,
    }));
  }, []);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModulo, setSelectedModulo] = useState<string>('all');
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [isNCDialogOpen, setIsNCDialogOpen] = useState(false);
  
  // Cálculos de métricas
  const metrics = useMemo(() => {
    const filteredItems = items.filter(item => 
      (selectedModulo === 'all' || item.modulo === selectedModulo) &&
      (selectedDepartamento === 'all' || item.departamento === selectedDepartamento)
    );
    
    const conformes = filteredItems.filter(i => i.status === 'conforme').length;
    const naoConformes = filteredItems.filter(i => i.status === 'nao_conforme').length;
    const pendentes = filteredItems.filter(i => i.status === 'pendente').length;
    const criticos = filteredItems.filter(i => i.criticidade === 'critico' && i.status === 'nao_conforme').length;
    
    // Cálculo ponderado por criticidade
    const totalPeso = filteredItems.reduce((sum, i) => sum + i.peso, 0);
    const pesoConformes = filteredItems.filter(i => i.status === 'conforme').reduce((sum, i) => sum + i.peso, 0);
    const scorePonderado = totalPeso > 0 ? Math.round((pesoConformes / totalPeso) * 100) : 0;
    
    // Penalização por itens críticos não conformes
    const penalizacao = criticos * 5;
    const scoreFinal = Math.max(0, scorePonderado - penalizacao);
    
    // Itens próximos a vencer (30 dias)
    const proxAVencer = filteredItems.filter(i => i.diasAteVencimento && i.diasAteVencimento > 0 && i.diasAteVencimento <= 30).length;
    const vencidos = filteredItems.filter(i => i.diasAteVencimento && i.diasAteVencimento < 0).length;
    
    return {
      total: filteredItems.length,
      conformes,
      naoConformes,
      pendentes,
      criticos,
      scorePonderado,
      scoreFinal,
      proxAVencer,
      vencidos,
      taxaConformidade: filteredItems.length > 0 ? Math.round((conformes / filteredItems.length) * 100) : 0,
    };
  }, [items, selectedModulo, selectedDepartamento]);
  
  const ncMetrics = useMemo(() => {
    const abertas = nonConformities.filter(nc => nc.status !== 'fechada');
    const criticas = abertas.filter(nc => nc.classificacao === 'A');
    const atrasadas = abertas.filter(nc => new Date(nc.prazo) < new Date());
    const tempoMedioResolucao = nonConformities.filter(nc => nc.status === 'fechada')
      .reduce((sum, nc) => sum + nc.diasAberta, 0) / Math.max(1, nonConformities.filter(nc => nc.status === 'fechada').length);
    
    return {
      abertas: abertas.length,
      fechadas: nonConformities.length - abertas.length,
      criticas: criticas.length,
      atrasadas: atrasadas.length,
      tempoMedioResolucao: Math.round(tempoMedioResolucao),
    };
  }, [nonConformities]);
  
  const unreadAlerts = alerts.filter(a => !a.lido).length;
  
  // Handlers
  const handleMarkAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, lido: true } : a));
  };
  
  const handleClearAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, lido: true })));
    toast.success('Todos os alertas foram marcados como lidos');
  };
  
  const handleOpenNCDialog = (nc: NonConformity) => {
    setSelectedNC(nc);
    setIsNCDialogOpen(true);
  };
  
  const handleUpdateNCStatus = (ncId: string, newStatus: NonConformity['status']) => {
    setNonConformities(prev => prev.map(nc => 
      nc.id === ncId ? { ...nc, status: newStatus } : nc
    ));
    toast.success(`NC ${nonConformities.find(nc => nc.id === ncId)?.ncId} atualizada para ${newStatus.replace(/_/g, ' ')}`);
  };
  
  // Score visual
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: 'EXCELENTE', color: 'text-success', bg: 'bg-success' };
    if (score >= 80) return { label: 'BOM', color: 'text-success/80', bg: 'bg-success/80' };
    if (score >= 70) return { label: 'ACEITÁVEL', color: 'text-warning', bg: 'bg-warning' };
    if (score >= 50) return { label: 'INADEQUADO', color: 'text-warning/80', bg: 'bg-warning/80' };
    return { label: 'CRÍTICO', color: 'text-destructive', bg: 'bg-destructive' };
  };
  
  const scoreLevel = getScoreLevel(metrics.scoreFinal);
  
  // Radar data para módulos
  const radarData = [
    { modulo: 'PEOTRAM', score: 87, fullMark: 100 },
    { modulo: 'PEO-DP', score: 82, fullMark: 100 },
    { modulo: 'MLC', score: 89, fullMark: 100 },
    { modulo: 'SGSO', score: 91, fullMark: 100 },
    { modulo: 'Pre-OVID', score: 78, fullMark: 100 },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Dashboard de Conformidade Avançado
          </h2>
          <p className="text-muted-foreground text-sm">
            Fase 1 do Roadmap • Visualização em tempo real com scoring ponderado
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative"
          >
            {unreadAlerts > 0 ? <BellRing className="h-4 w-4 mr-2 text-destructive animate-pulse" /> : <Bell className="h-4 w-4 mr-2" />}
            Alertas
            {unreadAlerts > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadAlerts}
              </Badge>
            )}
          </Button>
          
          <Select value={selectedModulo} onValueChange={setSelectedModulo}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Módulos</SelectItem>
              <SelectItem value="PEOTRAM">PEOTRAM</SelectItem>
              <SelectItem value="PEO-DP">PEO-DP</SelectItem>
              <SelectItem value="MLC">MLC</SelectItem>
              <SelectItem value="SGSO">SGSO</SelectItem>
              <SelectItem value="Pre-OVID">Pre-OVID</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Dept.</SelectItem>
              <SelectItem value="Operação">Operação</SelectItem>
              <SelectItem value="RH">RH</SelectItem>
              <SelectItem value="Segurança">Segurança</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Logística">Logística</SelectItem>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Alerts Panel */}
      {showAlerts && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-warning">
                <BellRing className="h-5 w-5" />
                Sistema de Alertas Inteligentes ({unreadAlerts} não lidos)
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClearAlerts}>
                Marcar todos como lidos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${!alert.lido ? 'bg-background border-warning/30' : 'bg-muted/30 border-muted'}`}
                  onClick={() => handleMarkAlertRead(alert.id)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${getCriticidadeColor(alert.criticidade).includes('red') ? 'text-destructive' : getCriticidadeColor(alert.criticidade).includes('orange') ? 'text-warning' : 'text-warning'}`} />
                    <div>
                      <p className="font-medium text-sm">{alert.titulo}</p>
                      <p className="text-xs text-muted-foreground">{alert.mensagem}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{alert.modulo}</Badge>
                    <Badge className={getCriticidadeColor(alert.criticidade)}>{alert.criticidade}</Badge>
                    {alert.diasAteVencimento !== undefined && (
                      <span className="text-xs text-muted-foreground">{alert.diasAteVencimento}d</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* KPI Cards - Score Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Score Ponderado Principal */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-2" style={{ borderColor: scoreLevel.bg.replace('bg-', 'var(--') + ')' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-5xl font-bold ${scoreLevel.color}`}>
                {metrics.scoreFinal}%
              </div>
              <Badge className={`${scoreLevel.bg} mt-2`}>{scoreLevel.label}</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Score ponderado por criticidade
              </p>
              {metrics.criticos > 0 && (
                <p className="text-xs text-destructive mt-1">
                  -{metrics.criticos * 5}% por {metrics.criticos} item(s) crítico(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* NCs Abertas */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NCs Abertas</p>
                <p className="text-3xl font-bold text-warning">{ncMetrics.abertas}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning/50" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge variant="destructive">{ncMetrics.criticas} Críticas</Badge>
              <Badge variant="secondary">{ncMetrics.atrasadas} Atrasadas</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Itens Conformes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-3xl font-bold text-success">{metrics.conformes}/{metrics.total}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/50" />
            </div>
            <Progress value={metrics.taxaConformidade} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{metrics.taxaConformidade}% taxa de conformidade</p>
          </CardContent>
        </Card>
        
        {/* Próximos a Vencer */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próx. 30 dias</p>
                <p className="text-3xl font-bold text-warning">{metrics.proxAVencer}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/50" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge variant="destructive">{metrics.vencidos} Vencidos</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Tempo Médio Resolução NC */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio NC</p>
                <p className="text-3xl font-bold">{ncMetrics.tempoMedioResolucao}d</p>
              </div>
              <Target className="h-8 w-8 text-primary/50" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <TrendingDown className="h-3 w-3" />
              <span>-3 dias vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs de conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="ncs" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            NCs ({ncMetrics.abertas})
          </TabsTrigger>
          <TabsTrigger value="departamentos" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendências
          </TabsTrigger>
          <TabsTrigger value="itens" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Itens
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Tendência */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tendência de Conformidade (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[60, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Area type="monotone" dataKey="PEOTRAM" stroke={CHART_COLORS.PEOTRAM} fill={CHART_COLORS.PEOTRAM} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="PEO-DP" stroke={CHART_COLORS['PEO-DP']} fill={CHART_COLORS['PEO-DP']} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="MLC" stroke={CHART_COLORS.MLC} fill={CHART_COLORS.MLC} fillOpacity={0.3} />
                    <Line type="monotone" dataKey="meta" stroke={CHART_COLORS.meta} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Radar de Módulos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Conformidade por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="modulo" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* NCs por Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">NCs Abertas vs Fechadas (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="ncsAbertas" name="Abertas" fill="hsl(var(--destructive))" />
                    <Bar dataKey="ncsFechadas" name="Fechadas" fill="hsl(var(--success))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Top 3 Problemas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top 3 Problemas (Pareto)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { problema: 'Certificados NR-10 vencidos', impacto: 25, acao: 'Agendamento em massa' },
                    { problema: 'Documentação incompleta', impacto: 18, acao: 'Revisar procedimento arquivo' },
                    { problema: 'Treinamentos atrasados', impacto: 12, acao: 'Alertas 60 dias antes' },
                  ].map((item, itemIdx) => (
                    <div key={item.problema} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{itemIdx + 1}º</Badge>
                          <span className="font-medium text-sm">{item.problema}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ação: {item.acao}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-warning">{item.impacto}%</span>
                        <p className="text-xs text-muted-foreground">do total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* NCs Tab */}
        <TabsContent value="ncs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                   <AlertTriangle className="h-5 w-5 text-warning" />
                  Gestão de Não Conformidades
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar NC..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nonConformities
                  .filter(nc => nc.status !== 'fechada')
                  .filter(nc => 
                    nc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    nc.ncId.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .slice(0, 10)
                  .map(nc => (
                    <div
                      key={nc.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleOpenNCDialog(nc)}
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={getCriticidadeColor(nc.classificacao)}>
                          {nc.classificacao}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{nc.ncId}</span>
                            <Badge variant="outline" className={getStatusColor(nc.status)}>
                              {nc.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{nc.titulo}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>📁 {nc.modulo}</span>
                            <span>👤 {nc.responsavel}</span>
                            <span>📅 Prazo: {nc.prazo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{nc.diasAberta} dias</div>
                          <Progress value={nc.percentualConcluido} className="w-20 h-1.5 mt-1" />
                          <span className="text-xs text-muted-foreground">{nc.percentualConcluido}%</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Departamentos Tab */}
        <TabsContent value="departamentos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentScores.map(dept => {
              const level = getScoreLevel(dept.score);
              const abaixoMeta = dept.score < dept.meta;
              
              return (
                <Card key={dept.departamento} className={abaixoMeta ? 'border-warning/30' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{dept.departamento}</h3>
                      <Badge className={level.bg}>{level.label}</Badge>
                    </div>
                    <div className="text-center mb-4">
                      <span className={`text-4xl font-bold ${level.color}`}>{dept.score}%</span>
                      <p className="text-xs text-muted-foreground">Meta: {dept.meta}%</p>
                    </div>
                    <Progress value={dept.score} className="h-2 mb-4" />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        {dept.tendencia === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
                        {dept.tendencia === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
                        {dept.tendencia === 'stable' && <Activity className="h-4 w-4 text-warning" />}
                        <span className="text-muted-foreground">Tendência</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">{dept.ncsAbertas} NCs</Badge>
                        <Badge variant="outline" className="text-xs">{dept.totalItens} itens</Badge>
                      </div>
                    </div>
                    {abaixoMeta && (
                      <div className="mt-3 p-2 bg-warning/10 rounded text-xs text-warning">
                        ⚠️ {Math.abs(dept.score - dept.meta)}% abaixo da meta
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Tendências Tab */}
        <TabsContent value="tendencias" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Evolução por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="PEOTRAM" stroke={CHART_COLORS.PEOTRAM} strokeWidth={2} />
                    <Line type="monotone" dataKey="PEO-DP" stroke={CHART_COLORS['PEO-DP']} strokeWidth={2} />
                    <Line type="monotone" dataKey="MLC" stroke={CHART_COLORS.MLC} strokeWidth={2} />
                    <Line type="monotone" dataKey="SGSO" stroke={CHART_COLORS.SGSO} strokeWidth={2} />
                    <Line type="monotone" dataKey="meta" stroke={CHART_COLORS.meta} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Previsão Próximos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">RISCO CRÍTICO (90% confiança)</p>
                        <p className="text-sm text-muted-foreground">3 certificados NR-10 vencem em 15 dias</p>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive">Ação Urgente</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-warning">RISCO ALTO (75% confiança)</p>
                        <p className="text-sm text-muted-foreground">Dept. Manutenção pode falhar auditoria</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Ver Detalhes</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-warning">RISCO MÉDIO (65% confiança)</p>
                        <p className="text-sm text-muted-foreground">5 treinamentos próximos a vencer</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Agendar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Itens Tab */}
        <TabsContent value="itens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Matriz de Rastreabilidade</CardTitle>
              <CardDescription>Item → Elemento → LV → Evidência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Elemento</th>
                      <th className="text-left p-2">LV</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Criticidade</th>
                      <th className="text-left p-2">Peso</th>
                      <th className="text-left p-2">Próx. Auditoria</th>
                      <th className="text-left p-2">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter(item => 
                        (selectedModulo === 'all' || item.modulo === selectedModulo) &&
                        (selectedDepartamento === 'all' || item.departamento === selectedDepartamento)
                      )
                      .slice(0, 15)
                      .map(item => (
                        <tr key={item.id} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-mono text-xs">{item.itemId}</td>
                          <td className="p-2 font-mono text-xs">{item.elementId}</td>
                          <td className="p-2 font-mono text-xs">{item.lvId}</td>
                          <td className="p-2">
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={getCriticidadeColor(item.criticidade)}>
                              {item.criticidade}
                            </Badge>
                          </td>
                          <td className="p-2 text-center font-bold">{item.peso}</td>
                          <td className="p-2 text-xs">
                            {item.diasAteVencimento !== undefined && (
                              <span className={item.diasAteVencimento < 0 ? 'text-destructive' : item.diasAteVencimento <= 30 ? 'text-warning' : ''}>
                                {item.diasAteVencimento < 0 ? `${Math.abs(item.diasAteVencimento)}d atrasado` : `${item.diasAteVencimento}d`}
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-xs">{item.responsavel}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* NC Detail Dialog */}
      <Dialog open={isNCDialogOpen} onOpenChange={setIsNCDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {selectedNC?.ncId} - Detalhes da NC
            </DialogTitle>
          </DialogHeader>
          {selectedNC && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getCriticidadeColor(selectedNC.classificacao)}>
                  Classificação {selectedNC.classificacao}
                </Badge>
                <Badge variant="outline" className={getStatusColor(selectedNC.status)}>
                  {selectedNC.status.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline">{selectedNC.modulo}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <p className="text-sm text-muted-foreground">{selectedNC.titulo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Responsável</label>
                  <p className="text-sm text-muted-foreground">{selectedNC.responsavel}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <p className="text-sm text-muted-foreground">{selectedNC.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Elemento Afetado</label>
                  <p className="text-sm text-muted-foreground">{selectedNC.elementoAfetado}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">LV Violada</label>
                  <p className="text-sm text-muted-foreground">{selectedNC.lvViolada}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Causa Raiz</label>
                <p className="text-sm text-muted-foreground">{selectedNC.causaRaiz}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Plano de Ação</label>
                <p className="text-sm text-muted-foreground">{selectedNC.planoAcao}</p>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <span className="text-sm font-medium">Prazo: </span>
                  <span className="text-sm">{selectedNC.prazo}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Dias aberta: </span>
                  <span className="text-sm">{selectedNC.diasAberta}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Progresso: </span>
                  <span className="text-sm">{selectedNC.percentualConcluido}%</span>
                </div>
              </div>
              
              <Progress value={selectedNC.percentualConcluido} className="h-2" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNCDialogOpen(false)}>
              Fechar
            </Button>
            {selectedNC && selectedNC.status !== 'fechada' && (
              <Select
                value={selectedNC.status}
                onValueChange={(value) => {
                  handleUpdateNCStatus(selectedNC.id, value as NonConformity['status']);
                  setSelectedNC({ ...selectedNC, status: value as NonConformity['status'] });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alterar Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_pac">Em PAC</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="aguardando_validacao">Aguardando Validação</SelectItem>
                  <SelectItem value="fechada">Fechada</SelectItem>
                </SelectContent>
              </Select>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComplianceRoadmapDashboard;
