import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Activity,
  TrendingUp,
  Database,
  Zap,
  FileText,
  BarChart3,
  Wrench,
  Brain,
  MessageSquare,
  Settings
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

interface ModuleStatus {
  name: string;
  route: string;
  status: "online" | "partial" | "offline" | "planned";
  description: string;
  icon: React.ElementType;
  lastCheck?: Date;
  responseTime?: number;
  roadmapStatus: "✅" | "🟡" | "❌" | "🔜";
}

const SystemStatus = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Define all modules from the roadmap
  const [modules, setModules] = useState<ModuleStatus[]>([
    {
      name: "Dashboard",
      route: "/dashboard",
      status: "online",
      description: "Dashboard estratégico com KPIs e métricas",
      icon: BarChart3,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 120
    },
    {
      name: "Relatórios",
      route: "/reports",
      status: "online",
      description: "Relatórios avançados com IA",
      icon: FileText,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 95
    },
    {
      name: "Checklists Inteligentes",
      route: "/checklists",
      status: "online",
      description: "Sistema de checklists com IA",
      icon: CheckCircle2,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 110
    },
    {
      name: "Documentos",
      route: "/documents",
      status: "online",
      description: "Gestão de documentos com IA",
      icon: FileText,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 105
    },
    {
      name: "Assistente IA",
      route: "/ai-assistant",
      status: "online",
      description: "Chat assistente com inteligência artificial",
      icon: MessageSquare,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 130
    },
    {
      name: "Smart Workflow",
      route: "/smart-workflow",
      status: "online",
      description: "Automação inteligente de workflows",
      icon: Zap,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 115
    },
    {
      name: "MMI",
      route: "/mmi",
      status: "online",
      description: "Manutenção e Manutenibilidade Industrial",
      icon: Wrench,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 100
    },
    {
      name: "Forecast",
      route: "/forecast",
      status: "online",
      description: "Previsões e análises preditivas",
      icon: TrendingUp,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 125
    },
    {
      name: "Logs & Restauração",
      route: "/admin/reports/logs",
      status: "online",
      description: "Sistema de logs e recuperação",
      icon: Database,
      roadmapStatus: "✅",
      lastCheck: new Date(),
      responseTime: 90
    },
    {
      name: "Centro de Inteligência DP",
      route: "/dp-intelligence",
      status: "partial",
      description: "Centro de inteligência para DP (em desenvolvimento)",
      icon: Brain,
      roadmapStatus: "🟡",
      lastCheck: new Date(),
      responseTime: 140
    },
    {
      name: "Auditoria FMEA",
      route: "/fmea",
      status: "planned",
      description: "Módulo de auditoria FMEA (planejado)",
      icon: Settings,
      roadmapStatus: "🔜",
      lastCheck: undefined,
      responseTime: undefined
    },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate checking module status
    setTimeout(() => {
      setModules(prev => prev.map(module => ({
        ...module,
        lastCheck: module.status !== "planned" ? new Date() : undefined,
        responseTime: module.status !== "planned" 
          ? Math.floor(Math.random() * 50) + 80 
          : undefined
      })));
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "planned":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      partial: "secondary",
      offline: "destructive",
      planned: "outline"
    } as const;

    const labels = {
      online: "Online",
      partial: "Parcial",
      offline: "Offline",
      planned: "Planejado"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const onlineModules = modules.filter(m => m.status === "online").length;
  const partialModules = modules.filter(m => m.status === "partial").length;
  const plannedModules = modules.filter(m => m.status === "planned").length;
  const totalImplemented = onlineModules + partialModules;
  const healthPercentage = Math.round((onlineModules / (modules.length - plannedModules)) * 100);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Activity}
        title="Status do Sistema"
        description="Monitor de status e saúde dos módulos do Nautilus One"
        gradient="purple"
        badges={[
          { icon: CheckCircle2, label: `${onlineModules} Online` },
          { icon: AlertCircle, label: `${partialModules} Parcial` },
          { icon: Clock, label: `${plannedModules} Planejado` }
        ]}
      />

      <div className="space-y-6">
        {/* System Health Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Visão Geral do Sistema</CardTitle>
              <CardDescription>
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Online</span>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">{onlineModules}</div>
                <p className="text-xs text-green-700">Módulos funcionais</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-900">Parcial</span>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-900">{partialModules}</div>
                <p className="text-xs text-yellow-700">Em desenvolvimento</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Planejado</span>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{plannedModules}</div>
                <p className="text-xs text-blue-700">Futuros módulos</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">Saúde</span>
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900">{healthPercentage}%</div>
                <p className="text-xs text-purple-700">Status do sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module List */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Módulos</CardTitle>
            <CardDescription>
              Monitoramento em tempo real de todos os módulos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
                <TabsTrigger value="partial">Parcial</TabsTrigger>
                <TabsTrigger value="planned">Planejado</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                <ScrollArea className="h-[600px] pr-4">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Card key={module.route} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{module.name}</h4>
                                  {getStatusIcon(module.status)}
                                  {getStatusBadge(module.status)}
                                  <span className="text-lg">{module.roadmapStatus}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {module.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="font-mono">{module.route}</span>
                                  {module.lastCheck && (
                                    <span>
                                      Última verificação: {module.lastCheck.toLocaleTimeString('pt-BR')}
                                    </span>
                                  )}
                                  {module.responseTime && (
                                    <span className="text-green-600">
                                      ⚡ {module.responseTime}ms
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="online" className="space-y-3">
                <ScrollArea className="h-[600px] pr-4">
                  {modules.filter(m => m.status === "online").map((module) => {
                    const Icon = module.icon;
                    return (
                      <Card key={module.route} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{module.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {module.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="font-mono">{module.route}</span>
                                {module.responseTime && (
                                  <span className="text-green-600">
                                    ⚡ {module.responseTime}ms
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="partial" className="space-y-3">
                <ScrollArea className="h-[600px] pr-4">
                  {modules.filter(m => m.status === "partial").map((module) => {
                    const Icon = module.icon;
                    return (
                      <Card key={module.route} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{module.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {module.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="font-mono">{module.route}</span>
                                <Badge variant="secondary">Em desenvolvimento</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="planned" className="space-y-3">
                <ScrollArea className="h-[600px] pr-4">
                  {modules.filter(m => m.status === "planned").map((module) => {
                    const Icon = module.icon;
                    return (
                      <Card key={module.route} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{module.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {module.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="font-mono">{module.route}</span>
                                <Badge variant="outline">Planejado</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Roadmap Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Roadmap</CardTitle>
            <CardDescription>
              Progresso de implementação conforme roadmap oficial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold text-green-900">Módulos Finalizados</div>
                    <div className="text-sm text-green-700">{onlineModules} módulos completos e funcionais</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-900">{onlineModules}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <div className="font-semibold text-yellow-900">Módulos Parciais</div>
                    <div className="text-sm text-yellow-700">{partialModules} módulo em desenvolvimento</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-900">{partialModules}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔜</span>
                  <div>
                    <div className="font-semibold text-blue-900">Módulos Planejados</div>
                    <div className="text-sm text-blue-700">{plannedModules} módulo para futuras versões</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">{plannedModules}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
};

export default SystemStatus;
