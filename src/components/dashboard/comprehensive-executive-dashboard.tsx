import { memo } from 'react';
/**
 * Comprehensive Executive Dashboard
 * Dashboard executivo completo com informações sobre todos os módulos e sistemas
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Ship,
  Brain,
  Network,
  Workflow,
  Cpu,
  Database,
  Shield,
  Users,
  Radio,
  Layers,
  GitBranch,
  Activity,
  Zap,
  Eye,
  Settings,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Globe,
  Box,
  FileText,
  Lock,
  Target
} from "lucide-react";
import nautilusLogo from "@/assets/nautilus-logo.png";

const systemModules = [
  {
    id: "patch-216",
    name: "Context Mesh Core",
    description: "Sistema de malha de contexto distribuído para sincronização em tempo real",
    icon: Network,
    status: "operational",
    uptime: 99.8,
    features: [
      "Pub/Sub Architecture",
      "Real-time State Sync",
      "Local Cache",
      "Supabase Persistence"
    ],
    metrics: {
      events: "2.4M",
      latency: "< 100ms",
      nodes: "156"
    }
  },
  {
    id: "patch-221",
    name: "Cognitive Clone Core",
    description: "Clonagem cognitiva de instâncias IA com contexto parcial/completo",
    icon: Brain,
    status: "operational",
    uptime: 98.5,
    features: [
      "Instance Cloning",
      "Context Snapshot",
      "Remote Dispatch",
      "Clone Registry"
    ],
    metrics: {
      clones: "24",
      avgCloneTime: "350ms",
      contextSize: "3.2MB"
    }
  },
  {
    id: "patch-222",
    name: "Adaptive UI Engine",
    description: "Motor de reconfiguração adaptativa de interface por contexto",
    icon: Layers,
    status: "operational",
    uptime: 99.2,
    features: [
      "Mobile/Desktop/Mission Profiles",
      "Network Optimization",
      "Conditional Loading",
      "Hot Reload Config"
    ],
    metrics: {
      profiles: "3",
      networkSaved: "42%",
      loadTime: "< 2s"
    }
  },
  {
    id: "patch-223",
    name: "Edge AI Ops Core",
    description: "IA embarcada operando localmente via WebGPU/WASM",
    icon: Cpu,
    status: "operational",
    uptime: 97.8,
    features: [
      "Local Inference",
      "WebGPU Acceleration",
      "ONNX Runtime",
      "Offline Capability"
    ],
    metrics: {
      inferenceTime: "< 100ms",
      modelSize: "87MB",
      gpuUsage: "78%"
    }
  },
  {
    id: "patch-224",
    name: "Deployment Kit Builder",
    description: "Gerador automático de kits standalone (.zip/.iso) offline",
    icon: Box,
    status: "operational",
    uptime: 99.5,
    features: [
      "Auto Kit Generation",
      "Local IndexedDB",
      "Complete Documentation",
      "Offline Operation"
    ],
    metrics: {
      kitSize: "< 50MB",
      genTime: "< 2min",
      deployments: "48"
    }
  },
  {
    id: "patch-225",
    name: "Mirror Instance Controller",
    description: "Controlador de múltiplas instâncias com sync e mesh networking",
    icon: GitBranch,
    status: "operational",
    uptime: 98.9,
    features: [
      "Instance Management",
      "Partial/Full Sync",
      "Conflict Resolution",
      "Mesh Consensus"
    ],
    metrics: {
      instances: "8",
      syncLatency: "< 5s",
      conflicts: "2"
    }
  },
  {
    id: "patch-226",
    name: "Protocol Adapter",
    description: "Adaptador de protocolos JSON-RPC, GMDSS e outros marítimos",
    icon: Radio,
    status: "operational",
    uptime: 99.7,
    features: [
      "JSON-RPC 2.0",
      "GMDSS Parser",
      "Message Validation",
      "Protocol Logging"
    ],
    metrics: {
      messages: "15.2K",
      protocols: "5",
      successRate: "98.5%"
    }
  },
  {
    id: "patch-227",
    name: "Agent Swarm Bridge",
    description: "Coordenação de enxames de agentes com distribuição paralela",
    icon: Users,
    status: "operational",
    uptime: 97.5,
    features: [
      "Agent Registry",
      "Parallel Distribution",
      "Result Consolidation",
      "Performance Metrics"
    ],
    metrics: {
      agents: "32",
      avgResponseTime: "280ms",
      tasksCompleted: "8.4K"
    }
  },
  {
    id: "patch-228",
    name: "Joint Tasking System",
    description: "Sistema de tarefas conjuntas com entidades externas",
    icon: Target,
    status: "operational",
    uptime: 98.2,
    features: [
      "Task Assignment",
      "Entity Registry",
      "Status Sync",
      "Mission Logging"
    ],
    metrics: {
      missions: "156",
      entities: "12",
      syncStatus: "100%"
    }
  },
  {
    id: "patch-229",
    name: "Trust Compliance",
    description: "Sistema de compliance baseado em trust score",
    icon: Shield,
    status: "operational",
    uptime: 99.9,
    features: [
      "Trust Score Calculation",
      "Input Validation",
      "Event Logging",
      "Alert System"
    ],
    metrics: {
      avgTrustScore: "87%",
      blockedEntities: "3",
      alerts: "8"
    }
  },
  {
    id: "patch-230",
    name: "Interop Dashboard",
    description: "Dashboard unificado de interoperabilidade e status",
    icon: Activity,
    status: "operational",
    uptime: 99.4,
    features: [
      "Multi-source Data",
      "Real-time Metrics",
      "Agent Visualization",
      "Trust Display"
    ],
    metrics: {
      dataSources: "10",
      refreshRate: "< 500ms",
      charts: "8"
    }
  },
  {
    id: "core-systems",
    name: "Core Systems",
    description: "Sistemas centrais de gestão e operação",
    icon: Database,
    status: "operational",
    uptime: 99.6,
    features: [
      "Vessel Management",
      "Crew Management",
      "Maintenance Scheduling",
      "Document Control"
    ],
    metrics: {
      vessels: "24",
      crew: "342",
      documents: "1.2K"
    }
  },
  {
    id: "peotram",
    name: "PEOTRAM Compliance",
    description: "Sistema de auditoria e compliance PEOTRAM",
    icon: FileText,
    status: "operational",
    uptime: 98.8,
    features: [
      "Audit Management",
      "AI Score Prediction",
      "Non-conformity Tracking",
      "Compliance Reports"
    ],
    metrics: {
      audits: "89",
      avgScore: "85.5",
      nonConformities: "12"
    }
  },
  {
    id: "security",
    name: "Security & Auth",
    description: "Sistema de segurança e autenticação",
    icon: Lock,
    status: "operational",
    uptime: 99.9,
    features: [
      "Multi-factor Auth",
      "Role-based Access",
      "Session Management",
      "Audit Logs"
    ],
    metrics: {
      users: "1.2K",
      sessions: "342",
      authRate: "99.8%"
    }
  },
  {
    id: "analytics",
    name: "Analytics & BI",
    description: "Sistema de análise e business intelligence",
    icon: BarChart3,
    status: "operational",
    uptime: 99.1,
    features: [
      "Custom Dashboards",
      "Real-time Metrics",
      "Predictive Analytics",
      "Export Reports"
    ],
    metrics: {
      dashboards: "24",
      metrics: "156",
      reports: "89"
    }
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
  case "operational":
    return "bg-green-500";
  case "degraded":
    return "bg-yellow-500";
  case "offline":
    return "bg-red-500";
  default:
    return "bg-gray-500";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
  case "operational":
    return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Operacional</Badge>;
  case "degraded":
    return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Degradado</Badge>;
  case "offline":
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Offline</Badge>;
  default:
    return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const ModuleCard = ({ module }: { module: typeof systemModules[0] }) => {
  const Icon = module.icon;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <CardDescription className="text-xs">{module.id}</CardDescription>
            </div>
          </div>
          {getStatusBadge(module.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{module.description}</p>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Uptime</span>
            <span className="text-xs font-bold">{module.uptime}%</span>
          </div>
          <Progress value={module.uptime} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Funcionalidades</p>
          <div className="flex flex-wrap gap-1">
            {module.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          {Object.entries(module.metrics).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-muted-foreground capitalize">{key}</p>
              <p className="text-sm font-bold">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ComprehensiveExecutiveDashboard = memo(function() {
  const totalModules = systemModules.length;
  const operationalModules = systemModules.filter(m => m.status === "operational").length;
  const avgUptime = (systemModules.reduce((sum, m) => sum + m.uptime, 0) / totalModules).toFixed(1);

  return (
    <div className="space-y-6 p-6">
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={nautilusLogo} alt="Nautilus One" className="h-16 w-16" />
          <div>
            <h1 className="text-4xl font-bold font-playfair">NAUTILUS ONE</h1>
            <p className="text-muted-foreground mt-1">
              Sistema Revolucionário de Gestão Marítima e IA Distribuída
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-2 py-2 px-3">
          <div className={`h-2 w-2 rounded-full ${getStatusColor("operational")} animate-pulse`} />
          Sistema Operacional
        </Badge>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Módulos Totais</p>
                <p className="text-3xl font-bold">{totalModules}</p>
              </div>
              <Layers className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operacionais</p>
                <p className="text-3xl font-bold text-green-600">{operationalModules}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime Médio</p>
                <p className="text-3xl font-bold text-blue-600">{avgUptime}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-3xl font-bold text-purple-600">A+</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Arquitetura do Sistema
          </CardTitle>
          <CardDescription>
            Visão geral da arquitetura distribuída e módulos integrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Inteligência Artificial
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Cognitive Clone Core</li>
                <li>• Edge AI Operations</li>
                <li>• Agent Swarm Coordination</li>
                <li>• Predictive Analytics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Interoperabilidade
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Protocol Adapter</li>
                <li>• Joint Tasking System</li>
                <li>• Context Mesh</li>
                <li>• Mirror Instances</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Segurança & Compliance
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Trust Compliance System</li>
                <li>• PEOTRAM Audits</li>
                <li>• Multi-factor Authentication</li>
                <li>• Role-based Access Control</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Módulos</TabsTrigger>
          <TabsTrigger value="ai">IA & Automação</TabsTrigger>
          <TabsTrigger value="interop">Interoperabilidade</TabsTrigger>
          <TabsTrigger value="core">Sistemas Core</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemModules
              .filter(m => ["patch-221", "patch-223", "patch-227"].includes(m.id))
              .map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="interop" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemModules
              .filter(m => ["patch-216", "patch-226", "patch-228", "patch-225", "patch-230"].includes(m.id))
              .map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="core" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemModules
              .filter(m => ["core-systems", "peotram", "security", "analytics"].includes(m.id))
              .map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stack Tecnológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="font-semibold">Frontend</p>
              <p className="text-sm text-muted-foreground mt-1">React + TypeScript</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="font-semibold">Backend</p>
              <p className="text-sm text-muted-foreground mt-1">Supabase + Edge Functions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="font-semibold">AI/ML</p>
              <p className="text-sm text-muted-foreground mt-1">ONNX Runtime + WebGPU</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="font-semibold">Database</p>
              <p className="text-sm text-muted-foreground mt-1">PostgreSQL + Vector</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
