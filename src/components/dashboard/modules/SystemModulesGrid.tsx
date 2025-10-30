/**
 * System Modules Grid Component
 * PATCH 621: Lazy loaded modules grid with tabs
 */

import React from "react";
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
  FileText,
  Lock,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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

export default function SystemModulesGrid() {
  React.useEffect(() => {
    console.log("✅ SystemModulesGrid loaded");
  }, []);

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">Todos os Módulos</TabsTrigger>
        <TabsTrigger value="ai">IA & Automação</TabsTrigger>
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
            .filter(m => ["patch-221", "patch-223"].includes(m.id))
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
  );
}
