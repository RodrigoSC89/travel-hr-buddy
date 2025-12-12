/**
 * REVOLUTIONARY AI - Autonomous Agent (AI Ops)
 * Funcionalidade 6 & 10: Gestor Digital Autônomo + Agente Autônomo de Decisão
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Zap, CheckCircle, AlertTriangle, Clock, 
  ShoppingCart, Wrench, FileText, Bell, Activity,
  Play, Pause, Settings, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentAction {
  id: string;
  type: "purchase" | "maintenance" | "report" | "alert" | "optimization";
  title: string;
  description: string;
  status: "pending" | "executing" | "completed" | "failed" | "cancelled";
  confidence: number;
  impact: "high" | "medium" | "low";
  timestamp: Date;
  result?: string;
  requiresApproval: boolean;
}

interface AgentMetrics {
  actionsToday: number;
  successRate: number;
  timeSaved: number;
  costSaved: number;
  activeRules: number;
}

const MOCK_ACTIONS: AgentAction[] = [
  {
    id: "1",
    type: "purchase",
    title: "Pedido Automático: Filtros de Óleo",
    description: "Estoque abaixo do mínimo (2 unidades). Gerando pedido para 10 unidades ao fornecedor preferencial.",
    status: "pending",
    confidence: 95,
    impact: "medium",
    timestamp: new Date(),
    requiresApproval: true
  },
  {
    id: "2",
    type: "maintenance",
    title: "Agendamento: Manutenção Preventiva Motor #2",
    description: "Baseado em padrão de vibração e horas de operação, agendando manutenção para próxima janela disponível.",
    status: "executing",
    confidence: 87,
    impact: "high",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    requiresApproval: false
  },
  {
    id: "3",
    type: "report",
    title: "Relatório Semanal de Compliance",
    description: "Gerando e enviando relatório automático para stakeholders conforme cronograma.",
    status: "completed",
    confidence: 100,
    impact: "low",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    result: "Relatório enviado para 5 destinatários",
    requiresApproval: false
  },
  {
    id: "4",
    type: "alert",
    title: "Alerta: Certificado STCW Vencendo",
    description: "Notificando RH e tripulante sobre certificação vencendo em 15 dias.",
    status: "completed",
    confidence: 100,
    impact: "high",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    result: "Notificações enviadas via email e push",
    requiresApproval: false
  },
  {
    id: "5",
    type: "optimization",
    title: "Otimização: Rota de Abastecimento",
    description: "Sugerindo rota alternativa com economia de 12% no combustível baseado em condições climáticas.",
    status: "pending",
    confidence: 78,
    impact: "high",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    requiresApproval: true
  }
];

const MOCK_METRICS: AgentMetrics = {
  actionsToday: 23,
  successRate: 94.5,
  timeSaved: 12.5,
  costSaved: 15800,
  activeRules: 18
};

export function AutonomousAgent() {
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [actions, setActions] = useState(MOCK_ACTIONS);
  const [metrics] = useState(MOCK_METRICS);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  const handleApprove = (actionId: string) => {
    setActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, status: "executing" as const } : a
    ));
  };

  const handleReject = (actionId: string) => {
    setActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, status: "cancelled" as const } : a
    ));
  };

  const getActionIcon = (type: string) => {
    switch (type) {
    case "purchase": return <ShoppingCart className="h-4 w-4" />;
    case "maintenance": return <Wrench className="h-4 w-4" />;
    case "report": return <FileText className="h-4 w-4" />;
    case "alert": return <Bell className="h-4 w-4" />;
    case "optimization": return <Target className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      executing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      cancelled: "bg-muted text-muted-foreground border-muted"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "text-red-400",
      medium: "text-amber-400",
      low: "text-green-400"
    };
    return colors[impact as keyof typeof colors] || "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isAgentActive ? "bg-primary/20" : "bg-muted"}`}>
                <Brain className={`h-8 w-8 ${isAgentActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Agente Autônomo
                  {isAgentActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </motion.div>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {isAgentActive ? "Monitorando e agindo proativamente" : "Pausado - Aguardando ativação"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Agente Ativo</span>
                <Switch
                  checked={isAgentActive}
                  onCheckedChange={setIsAgentActive}
                />
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Regras
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.actionsToday}</p>
            <p className="text-xs text-muted-foreground">Ações Hoje</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.successRate}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.timeSaved}h</p>
            <p className="text-xs text-muted-foreground">Tempo Economizado</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">R${(metrics.costSaved/1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Custo Economizado</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Settings className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.activeRules}</p>
            <p className="text-xs text-muted-foreground">Regras Ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Feed de Ações
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {actions.map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            selectedAction?.id === action.id ? "border-primary ring-2 ring-primary/20" : ""
                          }`}
                          onClick={() => setSelectedAction(action)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                action.status === "executing" ? "bg-blue-500/20 text-blue-400" :
                                  action.status === "completed" ? "bg-green-500/20 text-green-400" :
                                    action.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                                      "bg-muted text-muted-foreground"
                              }`}>
                                {getActionIcon(action.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{action.title}</h4>
                                  <Badge variant="outline" className={getStatusColor(action.status)}>
                                    {action.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {action.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Brain className="h-3 w-3 text-primary" />
                                    {action.confidence}%
                                  </span>
                                  <span className={`flex items-center gap-1 ${getImpactColor(action.impact)}`}>
                                    <Target className="h-3 w-3" />
                                    {action.impact}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {action.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                              {action.status === "pending" && action.requiresApproval && (
                                <div className="flex gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-green-400 hover:bg-green-500/20"
                                    onClick={(e) => { e.stopPropagation(); handleApprove(action.id); }}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                                    onClick={(e) => { e.stopPropagation(); handleReject(action.id); }}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {action.result && (
                              <div className="mt-3 p-2 rounded bg-green-500/10 text-xs text-green-400">
                                ✓ {action.result}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Action Details */}
        <div>
          <Card className="border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {selectedAction ? "Detalhes da Ação" : "Selecione uma ação"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAction ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      selectedAction.status === "completed" ? "bg-green-500/20 text-green-400" :
                        selectedAction.status === "executing" ? "bg-blue-500/20 text-blue-400" :
                          "bg-amber-500/20 text-amber-400"
                    }`}>
                      {getActionIcon(selectedAction.type)}
                    </div>
                    <div>
                      <Badge variant="outline" className={getStatusColor(selectedAction.status)}>
                        {selectedAction.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">{selectedAction.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Confiança da IA</p>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedAction.confidence} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{selectedAction.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Impacto</span>
                      <Badge variant="outline" className={getImpactColor(selectedAction.impact)}>
                        {selectedAction.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Requer Aprovação</span>
                      <span className="text-sm">{selectedAction.requiresApproval ? "Sim" : "Não"}</span>
                    </div>
                  </div>

                  {selectedAction.result && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-medium mb-1">Resultado</p>
                      <p className="text-sm">{selectedAction.result}</p>
                    </div>
                  )}

                  {selectedAction.status === "pending" && selectedAction.requiresApproval && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedAction.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(selectedAction.id)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Clique em uma ação para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AutonomousAgent;
