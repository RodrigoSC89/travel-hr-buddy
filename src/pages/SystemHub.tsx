/**
import { useEffect, useMemo, useState } from "react";;
 * System Hub - Unified System Operations Center
 * PATCH 990: Fusion of SystemDiagnostic + SystemMonitor + ProductRoadmap
 * 
 * Combines:
 * - System diagnostics and health checks
 * - Real-time performance monitoring
 * - Product roadmap and strategic planning
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, CheckCircle2, AlertTriangle, XCircle, Download,
  Cpu, Database, Wifi, WifiOff, Brain, FileText, RefreshCw,
  Shield, Clock, Zap, HardDrive, BarChart3, Settings2,
  Server, MemoryStick, Globe, TrendingUp, TrendingDown,
  Calendar, Target, Rocket, Users, Map
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: { warning: number; critical: number };
  trend: "up" | "down" | "stable";
}

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number;
  responseTime: number;
}

interface DiagnosticSummary {
  overallScore: number;
  systemStatus: string;
  readyModules: number;
  totalModules: number;
  aiCoverage: number;
  offlineCoverage: number;
}

interface Sprint {
  id: number;
  name: string;
  status: "completed" | "in-progress" | "planned";
  progress: number;
  objectives: string[];
}

interface Phase {
  id: number;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "planned";
  progress: number;
  sprints: Sprint[];
  color: string;
}

// =====================================================
// STATIC DATA
// =====================================================

const roadmapPhases: Phase[] = [
  {
    id: 1, name: "Estabilização", description: "Sistema estável e funcional",
    status: "completed", progress: 100, color: "bg-green-500",
    sprints: [
      { id: 1, name: "Auditoria Funcional", status: "completed", progress: 100, objectives: ["Mapear funcionalidades", "Identificar bugs"] },
      { id: 2, name: "Correção de Bugs", status: "completed", progress: 100, objectives: ["Corrigir bugs críticos", "Otimizar performance"] },
    ]
  },
  {
    id: 2, name: "Performance", description: "Escalabilidade garantida",
    status: "completed", progress: 100, color: "bg-blue-500",
    sprints: [
      { id: 3, name: "Testes de Carga", status: "completed", progress: 100, objectives: ["Stress tests", "Otimizar queries"] },
      { id: 4, name: "Multi-tenant", status: "completed", progress: 100, objectives: ["Isolamento de dados", "Gestão de tenants"] },
    ]
  },
  {
    id: 3, name: "Inteligência IA", description: "Automação e assistentes",
    status: "completed", progress: 100, color: "bg-purple-500",
    sprints: [
      { id: 5, name: "Assistente Virtual", status: "completed", progress: 100, objectives: ["IA conversacional", "Comandos de voz"] },
      { id: 6, name: "Automações", status: "completed", progress: 100, objectives: ["Workflows automáticos", "Alertas inteligentes"] },
    ]
  },
  {
    id: 4, name: "Comercial", description: "Preparação Go-to-Market",
    status: "in-progress", progress: 75, color: "bg-orange-500",
    sprints: [
      { id: 7, name: "KPIs e Dashboards", status: "completed", progress: 100, objectives: ["Definir KPIs", "Dashboards executivos"] },
      { id: 8, name: "Estrutura SaaS", status: "in-progress", progress: 50, objectives: ["Planos de assinatura", "Billing automático"] },
    ]
  },
  {
    id: 5, name: "Escala", description: "Expansão comercial",
    status: "planned", progress: 20, color: "bg-red-500",
    sprints: [
      { id: 9, name: "BCP e Segurança", status: "in-progress", progress: 40, objectives: ["Plano de continuidade", "Auditoria de segurança"] },
      { id: 10, name: "Go-to-Market", status: "planned", progress: 0, objectives: ["Onboarding automático", "Material de vendas"] },
    ]
  },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function SystemHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(4);

  // System Metrics State
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: "CPU", value: 45, unit: "%", status: "healthy", threshold: { warning: 70, critical: 90 }, trend: "stable" },
    { name: "Memória", value: 68, unit: "%", status: "warning", threshold: { warning: 70, critical: 85 }, trend: "up" },
    { name: "Disco", value: 55, unit: "%", status: "healthy", threshold: { warning: 80, critical: 95 }, trend: "stable" },
    { name: "Rede", value: 23, unit: "MB/s", status: "healthy", threshold: { warning: 50, critical: 80 }, trend: "down" },
    { name: "Conexões", value: 142, unit: "", status: "healthy", threshold: { warning: 200, critical: 300 }, trend: "stable" },
    { name: "Queries/s", value: 85, unit: "", status: "healthy", threshold: { warning: 150, critical: 200 }, trend: "up" }
  ]);

  const [services] = useState<ServiceStatus[]>([
    { name: "Web Server", status: "online", uptime: 99.9, responseTime: 120 },
    { name: "Database", status: "online", uptime: 99.8, responseTime: 15 },
    { name: "API Gateway", status: "online", uptime: 99.7, responseTime: 45 },
    { name: "Cache", status: "degraded", uptime: 95.2, responseTime: 8 },
    { name: "Storage", status: "online", uptime: 99.9, responseTime: 25 },
  ]);

  // Diagnostic Summary
  const diagnostic = useMemo<DiagnosticSummary>(() => ({
    overallScore: 92,
    systemStatus: "production-ready",
    readyModules: 85,
    totalModules: 90,
    aiCoverage: 78,
    offlineCoverage: 65
  }), []);

  // Performance Chart Data
  const performanceData = [
    { time: "00:00", cpu: 35, memory: 55, network: 15 },
    { time: "04:00", cpu: 42, memory: 58, network: 18 },
    { time: "08:00", cpu: 65, memory: 72, network: 28 },
    { time: "12:00", cpu: 58, memory: 68, network: 23 },
    { time: "16:00", cpu: 45, memory: 65, network: 20 },
    { time: "20:00", cpu: 38, memory: 60, network: 16 },
    { time: "Agora", cpu: 45, memory: 68, network: 23 }
  ];

  // Roadmap Stats
  const roadmapStats = useMemo(() => {
    const completedPhases = roadmapPhases.filter(p => p.status === "completed").length;
    const totalSprints = roadmapPhases.reduce((acc, p) => acc + p.sprints.length, 0);
    const completedSprints = roadmapPhases.reduce((acc, p) => 
      acc + p.sprints.filter(s => s.status === "completed").length, 0);
    const overallProgress = Math.round(roadmapPhases.reduce((acc, p) => acc + p.progress, 0) / roadmapPhases.length);
    
    return { completedPhases, totalPhases: roadmapPhases.length, completedSprints, totalSprints, overallProgress };
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
      status: metric.value > metric.threshold.critical ? "critical" : 
        metric.value > metric.threshold.warning ? "warning" : "healthy"
    })));
    
    setIsRefreshing(false);
    toast.success("Dados atualizados!");
  };

  // Export handler
  const handleExport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      diagnostic,
      systemMetrics,
      services,
      roadmap: { ...roadmapStats, phases: roadmapPhases }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado!");
  };

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
    case "healthy": case "online": case "completed": case "production-ready":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "warning": case "degraded": case "in-progress":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "healthy": case "online": case "completed": return "bg-green-500";
    case "warning": case "degraded": case "in-progress": return "bg-yellow-500";
    default: return "bg-red-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="w-3 h-3 text-red-500" />;
    case "down": return <TrendingDown className="w-3 h-3 text-green-500" />;
    default: return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const overallSystemStatus = systemMetrics.every(m => m.status === "healthy") && 
    services.every(s => s.status === "online") ? "healthy" : 
    systemMetrics.some(m => m.status === "critical") ? "critical" : "warning";

  const currentPhase = roadmapPhases.find(p => p.id === selectedPhase);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro de Operações</h1>
            <p className="text-muted-foreground">
              Monitoramento, diagnóstico e roadmap do sistema
            </p>
          </div>
          <Badge className={`ml-2 ${getStatusColor(overallSystemStatus)} text-white`}>
            {overallSystemStatus === "healthy" ? "Sistema Saudável" : 
              overallSystemStatus === "warning" ? "Atenção" : "Crítico"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Alert for critical issues */}
      {overallSystemStatus === "critical" && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Atenção: Métricas críticas detectadas. Verifique o sistema imediatamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{diagnostic.overallScore}%</p>
            <p className="text-xs text-muted-foreground">Score Geral</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Settings2 className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{diagnostic.readyModules}/{diagnostic.totalModules}</p>
            <p className="text-xs text-muted-foreground">Módulos Prontos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{diagnostic.aiCoverage}%</p>
            <p className="text-xs text-muted-foreground">Cobertura IA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <WifiOff className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
            <p className="text-2xl font-bold">{diagnostic.offlineCoverage}%</p>
            <p className="text-xs text-muted-foreground">Suporte Offline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{roadmapStats.completedPhases}/{roadmapStats.totalPhases}</p>
            <p className="text-xs text-muted-foreground">Fases Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Rocket className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{roadmapStats.overallProgress}%</p>
            <p className="text-xs text-muted-foreground">Progresso Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {systemMetrics.map((metric, idx) => (
                    <div key={idx} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(metric.status)}
                          {getTrendIcon(metric.trend)}
                        </div>
                      </div>
                      <p className="text-xl font-bold">{metric.value.toFixed(0)}{metric.unit}</p>
                      <Progress 
                        value={metric.unit === "%" ? metric.value : (metric.value / metric.threshold.critical) * 100} 
                        className="h-1 mt-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="CPU %" />
                    <Area type="monotone" dataKey="memory" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Memória %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap Timeline Mini */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Roadmap do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {roadmapPhases.map((phase) => (
                  <div 
                    key={phase.id}
                    className={`flex-shrink-0 p-3 rounded-lg border-2 w-40 cursor-pointer transition-all
                      ${phase.status === "completed" ? "border-green-500 bg-green-500/5" :
                    phase.status === "in-progress" ? "border-yellow-500 bg-yellow-500/5" :
                      "border-muted bg-muted/5"}`}
                    onClick={() => { setSelectedPhase(phase.id); setActiveTab("roadmap"); }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Fase {phase.id}</span>
                      {getStatusIcon(phase.status)}
                    </div>
                    <p className="text-sm font-semibold truncate">{phase.name}</p>
                    <Progress value={phase.progress} className="h-1 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">{phase.progress}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((metric, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {metric.name === "CPU" && <Cpu className="w-5 h-5 text-blue-600" />}
                      {metric.name === "Memória" && <MemoryStick className="w-5 h-5 text-green-600" />}
                      {metric.name === "Disco" && <HardDrive className="w-5 h-5 text-orange-600" />}
                      {metric.name === "Rede" && <Wifi className="w-5 h-5 text-purple-600" />}
                      {metric.name === "Conexões" && <Globe className="w-5 h-5 text-cyan-600" />}
                      {metric.name === "Queries/s" && <Database className="w-5 h-5 text-red-600" />}
                      <h3 className="font-semibold">{metric.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold">{metric.value.toFixed(0)}</span>
                    <span className="text-xl text-muted-foreground ml-1">{metric.unit}</span>
                  </div>
                  
                  <Progress 
                    value={metric.unit === "%" ? metric.value : (metric.value / metric.threshold.critical) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Aviso: {metric.threshold.warning}{metric.unit}</span>
                    <span>Crítico: {metric.threshold.critical}{metric.unit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="CPU %" />
                  <Area type="monotone" dataKey="memory" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Memória %" />
                  <Area type="monotone" dataKey="network" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} name="Rede MB/s" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{service.name}</h3>
                    <Badge className={`${getStatusColor(service.status)} text-white`}>
                      {service.status === "online" ? "Online" : 
                        service.status === "degraded" ? "Degradado" : "Offline"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-semibold">{service.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Resposta</p>
                      <p className="font-semibold">{service.responseTime}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{service.name}</span>
                    <Progress value={service.uptime} className="flex-1 h-2" />
                    <span className="w-16 text-sm text-right">{service.uptime}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          {/* Phase Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {roadmapPhases.map((phase) => (
              <Button
                key={phase.id}
                variant={selectedPhase === phase.id ? "default" : "outline"}
                onClick={() => setSelectedPhase(phase.id)}
                className="flex-shrink-0"
              >
                <span className={`w-2 h-2 rounded-full ${phase.color} mr-2`} />
                {phase.name}
              </Button>
            ))}
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline do Produto</CardTitle>
              <CardDescription>Evolução estratégica do Nautilus One</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roadmapPhases.map((phase, idx) => (
                  <div key={phase.id} className="relative">
                    {idx < roadmapPhases.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${phase.color} text-white`}>
                        {getStatusIcon(phase.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Fase {phase.id}: {phase.name}</h3>
                          <Badge variant={phase.status === "completed" ? "default" : "outline"}>
                            {phase.status === "completed" ? "Concluída" : 
                              phase.status === "in-progress" ? "Em Andamento" : "Planejada"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                        <Progress value={phase.progress} className="h-2 mb-2" />
                        <span className="text-xs text-muted-foreground">{phase.progress}% concluído</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Phase Detail */}
          {currentPhase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${currentPhase.color}`} />
                  Detalhes: {currentPhase.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPhase.sprints.map((sprint) => (
                    <Card key={sprint.id} className="border-l-4" style={{ borderLeftColor: currentPhase.color.replace("bg-", "").includes("green") ? "#22c55e" : currentPhase.color.replace("bg-", "").includes("blue") ? "#3b82f6" : currentPhase.color.replace("bg-", "").includes("purple") ? "#a855f7" : currentPhase.color.replace("bg-", "").includes("orange") ? "#f97316" : "#ef4444" }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Sprint {sprint.id}</h4>
                          {getStatusIcon(sprint.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{sprint.name}</p>
                        <Progress value={sprint.progress} className="h-1 mb-2" />
                        <div className="text-xs text-muted-foreground">
                          {sprint.objectives.map((obj, i) => (
                            <p key={i}>• {obj}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
