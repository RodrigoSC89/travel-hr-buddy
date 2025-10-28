/**
 * PATCH 414 - Coordination AI UI
 * Interface for visualizing and controlling AI coordination of system modules
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Network,
  Zap,
  GitBranch,
  Play,
  Pause
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

interface ModuleStatus {
  id: string;
  name: string;
  status: "active" | "inactive" | "error" | "warning";
  health: number;
  dependencies: string[];
  lastActivity: string;
  metrics: {
    uptime: string;
    requests: number;
    errors: number;
  };
}

interface AIDecision {
  id: string;
  timestamp: string;
  type: "optimization" | "failover" | "scaling" | "alert";
  module: string;
  action: string;
  reason: string;
  outcome: "success" | "pending" | "failed";
}

const CoordinationAI: React.FC = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
    loadAIDecisions();
    const interval = setInterval(() => {
      if (isSimulating) {
        simulateAIDecision();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const loadModules = () => {
    // Mock data - replace with actual API calls
    const mockModules: ModuleStatus[] = [
      {
        id: "fleet-mgmt",
        name: "Fleet Management",
        status: "active",
        health: 98,
        dependencies: ["database", "api-gateway"],
        lastActivity: new Date().toISOString(),
        metrics: { uptime: "99.9%", requests: 12543, errors: 2 }
      },
      {
        id: "coordination-ai",
        name: "Coordination AI",
        status: "active",
        health: 95,
        dependencies: ["fleet-mgmt", "drone-commander"],
        lastActivity: new Date().toISOString(),
        metrics: { uptime: "99.5%", requests: 8932, errors: 5 }
      },
      {
        id: "drone-commander",
        name: "Drone Commander",
        status: "warning",
        health: 75,
        dependencies: ["coordination-ai"],
        lastActivity: new Date(Date.now() - 120000).toISOString(),
        metrics: { uptime: "97.2%", requests: 5421, errors: 15 }
      },
      {
        id: "ocean-sonar",
        name: "Ocean Sonar AI",
        status: "active",
        health: 92,
        dependencies: ["sensors-hub"],
        lastActivity: new Date().toISOString(),
        metrics: { uptime: "98.8%", requests: 3210, errors: 3 }
      },
      {
        id: "surface-bot",
        name: "Surface Bot",
        status: "inactive",
        health: 0,
        dependencies: ["coordination-ai"],
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        metrics: { uptime: "85.0%", requests: 0, errors: 0 }
      },
      {
        id: "navigation-copilot",
        name: "Navigation Copilot",
        status: "error",
        health: 45,
        dependencies: ["gps-module", "weather-api"],
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        metrics: { uptime: "90.1%", requests: 1234, errors: 45 }
      }
    ];
    setModules(mockModules);
    setLoading(false);
  };

  const loadAIDecisions = () => {
    const mockDecisions: AIDecision[] = [
      {
        id: "d1",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        type: "optimization",
        module: "fleet-mgmt",
        action: "Increased cache size",
        reason: "High request rate detected",
        outcome: "success"
      },
      {
        id: "d2",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        type: "alert",
        module: "drone-commander",
        action: "Sent health warning",
        reason: "Health below 80%",
        outcome: "success"
      },
      {
        id: "d3",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: "failover",
        module: "navigation-copilot",
        action: "Switched to backup GPS",
        reason: "Primary GPS failure",
        outcome: "pending"
      }
    ];
    setAiDecisions(mockDecisions);
  };

  const simulateAIDecision = () => {
    const decisions = [
      "Optimized database queries",
      "Adjusted resource allocation",
      "Triggered preventive maintenance",
      "Scaled up module instances",
      "Initiated failover protocol"
    ];
    const moduleIds = modules.map(m => m.id);
    
    const newDecision: AIDecision = {
      id: `d-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: ["optimization", "failover", "scaling", "alert"][Math.floor(Math.random() * 4)] as any,
      module: moduleIds[Math.floor(Math.random() * moduleIds.length)],
      action: decisions[Math.floor(Math.random() * decisions.length)],
      reason: "AI-detected anomaly pattern",
      outcome: "pending"
    };
    
    setAiDecisions(prev => [newDecision, ...prev.slice(0, 9)]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
      active: "default",
      warning: "outline",
      error: "destructive",
      inactive: "secondary"
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-green-600";
    if (health >= 70) return "text-yellow-600";
    if (health >= 50) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Coordination AI Control Center"
        description="Coordenação autônoma de módulos do sistema com IA"
        gradient="purple"
        badges={[
          { icon: Network, label: "Coordenação" },
          { icon: Zap, label: "Autônomo" },
          { icon: GitBranch, label: "Distribuído" }
        ]}
      />

      <div className="space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Painel de Controle</CardTitle>
                <CardDescription>
                  Controle e simulação do sistema de coordenação AI
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isSimulating ? "destructive" : "default"}
                  onClick={() => setIsSimulating(!isSimulating)}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar Simulação
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Simulação
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={loadModules}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">Módulos ({modules.length})</TabsTrigger>
            <TabsTrigger value="dependencies">Dependências</TabsTrigger>
            <TabsTrigger value="decisions">Decisões AI ({aiDecisions.length})</TabsTrigger>
          </TabsList>

          {/* Modules Overview */}
          <TabsContent value="modules" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(module.status)}
                        <CardTitle className="text-base">{module.name}</CardTitle>
                      </div>
                      {getStatusBadge(module.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Health</span>
                        <span className={`text-lg font-bold ${getHealthColor(module.health)}`}>
                          {module.health}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            module.health >= 90 ? "bg-green-500" :
                            module.health >= 70 ? "bg-yellow-500" :
                            module.health >= 50 ? "bg-orange-500" : "bg-red-500"
                          }`}
                          style={{ width: `${module.health}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium">{module.metrics.uptime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Requests</p>
                        <p className="font-medium">{module.metrics.requests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="font-medium text-red-600">{module.metrics.errors}</p>
                      </div>
                    </div>

                    {module.dependencies.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Dependencies</p>
                        <div className="flex flex-wrap gap-1">
                          {module.dependencies.map((dep) => (
                            <Badge key={dep} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dependencies Visualization */}
          <TabsContent value="dependencies">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Dependências</CardTitle>
                <CardDescription>
                  Visualização das relações entre módulos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(module.status)}
                        <span className="font-medium">{module.name}</span>
                      </div>
                      {module.dependencies.length > 0 && (
                        <>
                          <GitBranch className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 flex flex-wrap gap-2">
                            {module.dependencies.map((dep) => {
                              const depModule = modules.find(m => m.id === dep);
                              return (
                                <div key={dep} className="flex items-center gap-1">
                                  {depModule && getStatusIcon(depModule.status)}
                                  <span className="text-sm">{dep}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Decisions Log */}
          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Decisões da IA</CardTitle>
                <CardDescription>
                  Histórico de ações autônomas do sistema de coordenação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiDecisions.map((decision) => (
                    <div key={decision.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {decision.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(decision.timestamp).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{decision.action}</p>
                          <p className="text-sm text-muted-foreground">
                            Módulo: {decision.module}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Razão: {decision.reason}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          decision.outcome === "success" ? "default" :
                          decision.outcome === "pending" ? "outline" : "destructive"
                        }
                      >
                        {decision.outcome}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModulePageWrapper>
  );
};

export default CoordinationAI;
