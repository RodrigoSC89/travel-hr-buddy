import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Code2, CheckCircle, AlertCircle, XCircle, Filter, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ModuleStatus = "complete" | "partial" | "incomplete";

interface ModuleInfo {
  name: string;
  path: string;
  status: ModuleStatus;
  description: string;
  tests: number;
  coverage: number;
  lastUpdate: string;
}

interface GroupInfo {
  name: string;
  icon: string;
  color: string;
  modules: ModuleInfo[];
}

const moduleGroups: GroupInfo[] = [
  {
    name: "operations",
    icon: "⚙️",
    color: "blue",
    modules: [
      { name: "crew", path: "operations/crew", status: "complete", description: "Gerenciamento de tripulação", tests: 12, coverage: 85, lastUpdate: "2025-10-23" },
      { name: "fleet", path: "operations/fleet", status: "complete", description: "Gestão de frota", tests: 8, coverage: 72, lastUpdate: "2025-10-23" },
      { name: "feedback", path: "operations/feedback", status: "partial", description: "Sistema de feedback", tests: 4, coverage: 45, lastUpdate: "2025-10-20" },
      { name: "performance", path: "operations/performance", status: "complete", description: "Performance analytics", tests: 15, coverage: 88, lastUpdate: "2025-10-22" },
      { name: "crew-wellbeing", path: "operations/crew-wellbeing", status: "partial", description: "Bem-estar da tripulação", tests: 6, coverage: 60, lastUpdate: "2025-10-21" }
    ]
  },
  {
    name: "control",
    icon: "🎮",
    color: "purple",
    modules: [
      { name: "bridgelink", path: "control/bridgelink", status: "complete", description: "Sistema de ponte", tests: 18, coverage: 90, lastUpdate: "2025-10-23" },
      { name: "control-hub", path: "control/control-hub", status: "complete", description: "Hub de controle", tests: 14, coverage: 82, lastUpdate: "2025-10-23" },
      { name: "forecast-global", path: "control/forecast-global", status: "partial", description: "Previsões globais", tests: 7, coverage: 65, lastUpdate: "2025-10-19" }
    ]
  },
  {
    name: "intelligence",
    icon: "🧠",
    color: "cyan",
    modules: [
      { name: "dp-intelligence", path: "intelligence/dp-intelligence", status: "complete", description: "DP Intelligence", tests: 22, coverage: 92, lastUpdate: "2025-10-23" },
      { name: "ai-insights", path: "intelligence/ai-insights", status: "complete", description: "AI Insights", tests: 16, coverage: 87, lastUpdate: "2025-10-22" },
      { name: "analytics-core", path: "intelligence/analytics-core", status: "partial", description: "Analytics core", tests: 11, coverage: 70, lastUpdate: "2025-10-21" },
      { name: "automation", path: "intelligence/automation", status: "incomplete", description: "Automação IA", tests: 3, coverage: 35, lastUpdate: "2025-10-15" }
    ]
  },
  {
    name: "emergency",
    icon: "🚨",
    color: "red",
    modules: [
      { name: "emergency-response", path: "emergency/emergency-response", status: "complete", description: "Resposta a emergências", tests: 20, coverage: 95, lastUpdate: "2025-10-23" },
      { name: "mission-logs", path: "emergency/mission-logs", status: "complete", description: "Logs de missões", tests: 12, coverage: 80, lastUpdate: "2025-10-22" },
      { name: "risk-management", path: "emergency/risk-management", status: "partial", description: "Gestão de riscos", tests: 9, coverage: 68, lastUpdate: "2025-10-20" },
      { name: "mission-control", path: "emergency/mission-control", status: "partial", description: "Controle de missões", tests: 10, coverage: 72, lastUpdate: "2025-10-21" }
    ]
  },
  {
    name: "planning",
    icon: "📋",
    color: "green",
    modules: [
      { name: "mmi", path: "planning/mmi", status: "complete", description: "Maintenance Intelligence", tests: 25, coverage: 90, lastUpdate: "2025-10-23" },
      { name: "voyage-planner", path: "planning/voyage-planner", status: "complete", description: "Planejamento de viagens", tests: 14, coverage: 85, lastUpdate: "2025-10-22" },
      { name: "fmea", path: "planning/fmea", status: "partial", description: "FMEA Analysis", tests: 8, coverage: 62, lastUpdate: "2025-10-19" }
    ]
  },
  {
    name: "compliance",
    icon: "📜",
    color: "yellow",
    modules: [
      { name: "audit-center", path: "compliance/audit-center", status: "complete", description: "Centro de auditorias", tests: 18, coverage: 88, lastUpdate: "2025-10-23" },
      { name: "compliance-hub", path: "compliance/compliance-hub", status: "complete", description: "Hub de conformidade", tests: 15, coverage: 82, lastUpdate: "2025-10-22" },
      { name: "sgso", path: "compliance/sgso", status: "complete", description: "SGSO System", tests: 20, coverage: 90, lastUpdate: "2025-10-23" },
      { name: "reports", path: "compliance/reports", status: "partial", description: "Relatórios", tests: 7, coverage: 55, lastUpdate: "2025-10-18" }
    ]
  }
];

const getStatusIcon = (status: ModuleStatus) => {
  switch (status) {
    case "complete":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "partial":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "incomplete":
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const getStatusBadge = (status: ModuleStatus) => {
  switch (status) {
    case "complete":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">✅ Completo</Badge>;
    case "partial":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">🟡 Parcial</Badge>;
    case "incomplete":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">🔴 Incompleto</Badge>;
  }
};

const getCoverageBadge = (coverage: number) => {
  if (coverage >= 80) return <Badge variant="default" className="bg-green-500">{ coverage}%</Badge>;
  if (coverage >= 60) return <Badge variant="default" className="bg-yellow-500">{coverage}%</Badge>;
  return <Badge variant="default" className="bg-red-500">{coverage}%</Badge>;
};

export default function ModuleStatus() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ModuleStatus | "all">("all");

  const allModules = moduleGroups.flatMap(g => g.modules);
  const totalModules = allModules.length;
  const completeModules = allModules.filter(m => m.status === "complete").length;
  const partialModules = allModules.filter(m => m.status === "partial").length;
  const incompleteModules = allModules.filter(m => m.status === "incomplete").length;
  const avgCoverage = Math.round(allModules.reduce((sum, m) => sum + m.coverage, 0) / totalModules);

  const filteredGroups = moduleGroups.map(group => ({
    ...group,
    modules: group.modules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || module.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  })).filter(group => group.modules.length > 0);

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Code2}
        title="Module Status - Developer View"
        description="Status detalhado de todos os módulos do sistema"
        gradient="blue"
        badges={[
          { icon: CheckCircle, label: `${completeModules} Completos` },
          { icon: AlertCircle, label: `${partialModules} Parciais` },
          { icon: XCircle, label: `${incompleteModules} Incompletos` }
        ]}
      />

      <div className="space-y-6">
        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <div className="text-3xl font-bold text-blue-400">{totalModules}</div>
            <div className="text-sm text-muted-foreground mt-1">Total de Módulos</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="text-3xl font-bold text-green-400">{completeModules}</div>
            <div className="text-sm text-muted-foreground mt-1">Completos</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <div className="text-3xl font-bold text-yellow-400">{partialModules}</div>
            <div className="text-sm text-muted-foreground mt-1">Parciais</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="text-3xl font-bold text-purple-400">{avgCoverage}%</div>
            <div className="text-sm text-muted-foreground mt-1">Cobertura Média</div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "complete" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("complete")}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Completos
              </Button>
              <Button
                variant={statusFilter === "partial" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("partial")}
                className="gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                Parciais
              </Button>
              <Button
                variant={statusFilter === "incomplete" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("incomplete")}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Incompletos
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de Módulos */}
        <ScrollArea className="h-[700px]">
          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <Card key={group.name} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{group.icon}</span>
                  <h3 className="text-2xl font-bold capitalize">{group.name}</h3>
                  <Badge variant="secondary">{group.modules.length} módulos</Badge>
                </div>
                
                <div className="space-y-3">
                  {group.modules.map((module) => (
                    <Card key={module.name} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(module.status)}
                            <h4 className="font-mono font-semibold">{module.name}</h4>
                            {getStatusBadge(module.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>📁 {module.path}</span>
                            <span>🧪 {module.tests} testes</span>
                            <span>📅 {module.lastUpdate}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getCoverageBadge(module.coverage)}
                          <Link to={`/modules/${module.path}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                            Ver código <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Link para PATCH 66 Dashboard */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Ver Organograma Completo</h3>
              <p className="text-sm text-muted-foreground">
                Acesse o dashboard do PATCH 66 para visualizar a estrutura completa
              </p>
            </div>
            <Link to="/patch66">
              <Button>
                Ver Dashboard <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
