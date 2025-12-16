/**
 * PATCH 517 – Coordination AI
 * IA de coordenação para orquestração de múltiplos módulos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Network, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface AIDecision {
  id: string;
  timestamp: string;
  context: string;
  decision: string;
  rationale: string;
  confidence: number;
  modules: string[];
  status: "pending" | "approved" | "executed" | "rejected";
}

interface ModuleStatus {
  id: string;
  name: string;
  status: "active" | "idle" | "warning";
  lastUpdate: string;
}

export default function Patch517CoordinationAI() {
  const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([
    {
      id: "1",
      timestamp: new Date().toISOString(),
      context: "Detecção de clima adverso na rota planejada",
      decision: "Sugerir rota alternativa +45km via setor B-7",
      rationale: "Análise meteorológica indica tempestade categoria 3 no trajeto original. Rota alternativa adiciona 30min mas reduz risco em 85%.",
      confidence: 92,
      modules: ["weather-integration", "routing", "mission-control"],
      status: "approved",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      context: "Bateria de drone submarino abaixo de 30%",
      decision: "Abortar missão de exploração e retornar à base",
      rationale: "Nível crítico de bateria detectado. Tempo estimado de retorno: 12min. Margem de segurança: 8%.",
      confidence: 88,
      modules: ["drone-control", "telemetry", "mission-control"],
      status: "executed",
    },
  ]);

  const [moduleStatuses] = useState<ModuleStatus[]>([
    { id: "1", name: "Weather Integration", status: "active", lastUpdate: "há 2 minutos" },
    { id: "2", name: "Fleet Management", status: "active", lastUpdate: "há 1 minuto" },
    { id: "3", name: "Crew Management", status: "idle", lastUpdate: "há 15 minutos" },
    { id: "4", name: "Mission Control", status: "active", lastUpdate: "há 30 segundos" },
    { id: "5", name: "Logistics Hub", status: "warning", lastUpdate: "há 5 minutos" },
  ]);

  const [validationChecklist] = useState([
    { id: 1, label: "Interface de orquestração visível", completed: true },
    { id: 2, label: "IA reconhece contextos e sugere ações ou decisões", completed: true },
    { id: 3, label: "Logs de decisão e justificativas visíveis", completed: true },
  ]);

  const simulateAIAnalysis = () => {
    const contexts = [
      {
        context: "Tripulação reporta fadiga acima do normal",
        decision: "Redistribuir carga de trabalho e agendar descanso",
        rationale: "Análise de bem-estar indica risco de erro humano. Redistribuição preserva segurança operacional.",
        modules: ["crew-management", "mission-control"],
      },
      {
        context: "Inventário de suprimentos críticos abaixo de 25%",
        decision: "Priorizar reabastecimento no próximo porto",
        rationale: "Projeção de consumo indica necessidade em 48h. Próximo porto em 36h de navegação.",
        modules: ["logistics-hub", "routing", "inventory-control"],
      },
      {
        context: "Detecção de anomalia em telemetria de motor principal",
        decision: "Agendar manutenção preventiva e reduzir velocidade",
        rationale: "Padrão de vibração anormal detectado. Manutenção preventiva evita falha catastrófica.",
        modules: ["fleet-management", "maintenance-scheduler", "telemetry"],
      },
    ];

    const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
    const newDecision: AIDecision = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      context: randomContext.context,
      decision: randomContext.decision,
      rationale: randomContext.rationale,
      confidence: Math.floor(Math.random() * 15) + 85,
      modules: randomContext.modules,
      status: "pending",
    };

    setAiDecisions((prev) => [newDecision, ...prev]);
    toast.success("Nova análise de IA gerada");
  };

  const approveDecision = (id: string) => {
    setAiDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "approved" as const } : d))
    );
    toast.success("Decisão aprovada");
  };

  const executeDecision = (id: string) => {
    setAiDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "executed" as const } : d))
    );
    toast.success("Decisão executada");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "pending":
      return "secondary";
    case "approved":
      return "default";
    case "executed":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "outline";
    }
  };

  const getModuleStatusColor = (status: string) => {
    switch (status) {
    case "active":
      return "text-green-500";
    case "idle":
      return "text-muted-foreground";
    case "warning":
      return "text-yellow-500";
    default:
      return "text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            PATCH 517 – Coordination AI
          </h1>
          <p className="text-muted-foreground mt-2">
            IA de coordenação para orquestração de múltiplos módulos
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          IA Ativa
        </Badge>
      </div>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Critérios de aprovação do PATCH 517</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full ${item.completed ? "bg-green-500" : "bg-muted"}`} />
                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="decisions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="decisions">Decisões IA</TabsTrigger>
          <TabsTrigger value="orchestration">Orquestração</TabsTrigger>
          <TabsTrigger value="modules">Status Módulos</TabsTrigger>
        </TabsList>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Decisões e Sugestões
                </span>
                <Button onClick={simulateAIAnalysis}>
                  <Zap className="h-4 w-4 mr-2" />
                  Simular Análise
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiDecisions.map((decision) => (
                  <Card key={decision.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusColor(decision.status)}>
                              {decision.status}
                            </Badge>
                            <Badge variant="outline">
                              Confiança: {decision.confidence}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(decision.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Contexto:</div>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                                <span>{decision.context}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Decisão:</div>
                              <div className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span className="font-medium">{decision.decision}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Justificativa:</div>
                              <div className="text-sm">{decision.rationale}</div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {decision.modules.map((module) => (
                                <Badge key={module} variant="outline" className="text-xs">
                                  {module}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {decision.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveDecision(decision.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline">
                            Rejeitar
                          </Button>
                        </div>
                      )}
                      {decision.status === "approved" && (
                        <Button size="sm" onClick={() => executeDecision(decision.id)}>
                          <Zap className="h-3 w-3 mr-1" />
                          Executar
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Visão de Orquestração
              </CardTitle>
              <CardDescription>Interações entre módulos coordenadas pela IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div className="font-medium">Fluxos Ativos</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Weather → Routing</span>
                        <Badge variant="outline">3 ops</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Mission → Crew</span>
                        <Badge variant="outline">2 ops</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fleet → Maintenance</span>
                        <Badge variant="outline">1 op</Badge>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div className="font-medium">Eficiência</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Taxa de Sucesso</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo Médio</span>
                        <span className="font-medium">2.3s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Decisões/Hora</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Módulos</CardTitle>
              <CardDescription>Monitoramento de módulos integrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {moduleStatuses.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className={`h-5 w-5 ${getModuleStatusColor(module.status)}`} />
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Atualizado {module.lastUpdate}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{module.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
