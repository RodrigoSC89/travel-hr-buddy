/**
 * PATCH 415 - Experimental Modules Overview
 * Dashboard for monitoring and managing experimental modules
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Beaker,
  Search,
  ExternalLink,
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Waves,
  Navigation,
  Plane,
  Radio,
  Shield,
  Zap,
  Bot
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useNavigate } from "react-router-dom";

interface ExperimentalModule {
  id: string;
  name: string;
  description: string;
  status: "active" | "testing" | "prototype" | "deprecated";
  stability: "stable" | "beta" | "alpha" | "experimental";
  tags: string[];
  lastExecution?: string;
  route?: string;
  usage: number; // percentage
  icon: any;
  version: string;
  author: string;
}

const ExperimentalModules: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStability, setFilterStability] = useState<string>("all");

  const modules: ExperimentalModule[] = [
    {
      id: "drone-commander",
      name: "Drone Commander",
      description: "Sistema autônomo de comando e controle de drones",
      status: "testing",
      stability: "beta",
      tags: ["AI", "drone", "automation"],
      lastExecution: new Date(Date.now() - 3600000).toISOString(),
      route: "/drone-commander",
      usage: 45,
      icon: Plane,
      version: "0.8.2",
      author: "Coordination Team"
    },
    {
      id: "ocean-sonar",
      name: "Ocean Sonar AI",
      description: "Análise inteligente de dados de sonar submarino",
      status: "active",
      stability: "beta",
      tags: ["AI", "sonar", "analytics"],
      lastExecution: new Date(Date.now() - 1800000).toISOString(),
      route: "/ocean-sonar",
      usage: 78,
      icon: Waves,
      version: "1.2.0",
      author: "Maritime AI Team"
    },
    {
      id: "navigation-copilot",
      name: "Navigation Copilot",
      description: "Copiloto de navegação com IA para otimização de rotas",
      status: "testing",
      stability: "alpha",
      tags: ["AI", "nav", "optimization"],
      lastExecution: new Date(Date.now() - 7200000).toISOString(),
      route: "/navigation-copilot",
      usage: 34,
      icon: Navigation,
      version: "0.5.1",
      author: "Navigation Team"
    },
    {
      id: "surface-bot",
      name: "Surface Bot",
      description: "Bot autônomo para operações em superfície",
      status: "prototype",
      stability: "alpha",
      tags: ["AI", "bot", "automation"],
      lastExecution: new Date(Date.now() - 86400000).toISOString(),
      route: "/surface-bot",
      usage: 12,
      icon: Bot,
      version: "0.3.0",
      author: "Robotics Team"
    },
    {
      id: "sonar-ai",
      name: "Sonar AI Engine",
      description: "Motor de IA para processamento avançado de sonar",
      status: "active",
      stability: "stable",
      tags: ["AI", "sonar", "processing"],
      lastExecution: new Date(Date.now() - 900000).toISOString(),
      usage: 92,
      icon: Radio,
      version: "2.1.3",
      author: "Core AI Team"
    },
    {
      id: "deep-risk-ai",
      name: "Deep Risk AI",
      description: "Análise profunda de riscos com machine learning",
      status: "testing",
      stability: "beta",
      tags: ["AI", "risk", "ml"],
      lastExecution: new Date(Date.now() - 5400000).toISOString(),
      usage: 56,
      icon: Shield,
      version: "1.0.0-beta.4",
      author: "Risk Analysis Team"
    },
    {
      id: "sensors-hub",
      name: "Sensors Hub",
      description: "Central de agregação e processamento de sensores",
      status: "active",
      stability: "stable",
      tags: ["sensors", "iot", "aggregation"],
      lastExecution: new Date(Date.now() - 300000).toISOString(),
      usage: 88,
      icon: Cpu,
      version: "1.5.2",
      author: "IoT Team"
    },
    {
      id: "underwater-drone",
      name: "Underwater Drone Control",
      description: "Sistema de controle para drones submarinos",
      status: "prototype",
      stability: "experimental",
      tags: ["drone", "underwater", "control"],
      lastExecution: new Date(Date.now() - 172800000).toISOString(),
      usage: 8,
      icon: Waves,
      version: "0.2.0",
      author: "Subsea Team"
    },
    {
      id: "coordination-ai",
      name: "Coordination AI",
      description: "IA de coordenação de sistemas autônomos",
      status: "active",
      stability: "beta",
      tags: ["AI", "coordination", "autonomous"],
      lastExecution: new Date(Date.now() - 600000).toISOString(),
      route: "/coordination-ai",
      usage: 73,
      icon: Zap,
      version: "0.9.5",
      author: "Coordination Team"
    },
    {
      id: "auto-sub",
      name: "Autonomous Submarine",
      description: "Sistema de submarino autônomo",
      status: "prototype",
      stability: "alpha",
      tags: ["submarine", "autonomous", "navigation"],
      lastExecution: new Date(Date.now() - 259200000).toISOString(),
      usage: 15,
      icon: Waves,
      version: "0.4.0",
      author: "Subsea Team"
    },
    {
      id: "route-planner",
      name: "AI Route Planner",
      description: "Planejador de rotas com otimização por IA",
      status: "testing",
      stability: "beta",
      tags: ["AI", "nav", "planning"],
      lastExecution: new Date(Date.now() - 10800000).toISOString(),
      usage: 41,
      icon: Navigation,
      version: "0.7.3",
      author: "Navigation Team"
    },
    {
      id: "xr-interface",
      name: "XR Interface",
      description: "Interface de realidade estendida para controle remoto",
      status: "prototype",
      stability: "experimental",
      tags: ["xr", "interface", "immersive"],
      lastExecution: new Date(Date.now() - 432000000).toISOString(),
      usage: 5,
      icon: Activity,
      version: "0.1.0",
      author: "XR Team"
    }
  ];

  const allTags = Array.from(new Set(modules.flatMap(m => m.tags))).sort();

  const filteredModules = modules.filter(module => {
    const matchesSearch = searchTerm === "" || 
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === "all" || module.tags.includes(filterTag);
    const matchesStatus = filterStatus === "all" || module.status === filterStatus;
    const matchesStability = filterStability === "all" || module.stability === filterStability;

    return matchesSearch && matchesTag && matchesStatus && matchesStability;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
      active: "default",
      testing: "outline",
      prototype: "secondary",
      deprecated: "destructive"
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getStabilityBadge = (stability: string) => {
    const colors: { [key: string]: string } = {
      stable: "bg-green-100 text-green-800 border-green-300",
      beta: "bg-blue-100 text-blue-800 border-blue-300",
      alpha: "bg-yellow-100 text-yellow-800 border-yellow-300",
      experimental: "bg-red-100 text-red-800 border-red-300"
    };
    return (
      <Badge variant="outline" className={`capitalize ${colors[stability] || ""}`}>
        {stability}
      </Badge>
    );
  };

  const getStabilityIcon = (stability: string) => {
    switch (stability) {
      case "stable":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "beta":
      case "alpha":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const handleModuleClick = (module: ExperimentalModule) => {
    if (module.route) {
      navigate(module.route);
    }
  };

  const stats = {
    total: modules.length,
    active: modules.filter(m => m.status === "active").length,
    testing: modules.filter(m => m.status === "testing").length,
    prototype: modules.filter(m => m.status === "prototype").length,
    stable: modules.filter(m => m.stability === "stable").length,
  };

  return (
    <ModulePageWrapper gradient="cyan">
      <ModuleHeader
        icon={Beaker}
        title="Experimental Modules Overview"
        description="Painel de monitoramento de módulos experimentais e em desenvolvimento"
        gradient="cyan"
        badges={[
          { icon: Beaker, label: "12 Módulos" },
          { icon: Activity, label: "Experimental" },
          { icon: CheckCircle, label: `${stats.stable} Estáveis` }
        ]}
      />

      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Módulos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.testing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Protótipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.prototype}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estáveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.stable}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Busca</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar módulos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="prototype">Prototype</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estabilidade</label>
                <Select value={filterStability} onValueChange={setFilterStability}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="alpha">Alpha</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id}
                className={module.route ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
                onClick={() => module.route && handleModuleClick(module)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{module.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{module.version}</p>
                      </div>
                    </div>
                    {module.route && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>

                  <div className="flex gap-2">
                    {getStatusBadge(module.status)}
                    {getStabilityBadge(module.stability)}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {module.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Uso</span>
                      <span className="font-medium">{module.usage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${module.usage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>Autor: {module.author}</p>
                    {module.lastExecution && (
                      <p>
                        Última execução:{" "}
                        {new Date(module.lastExecution).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Nenhum módulo encontrado com os filtros aplicados
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModulePageWrapper>
  );
};

export default ExperimentalModules;
