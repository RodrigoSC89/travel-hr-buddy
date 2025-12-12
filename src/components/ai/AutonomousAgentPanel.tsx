/**
 * Autonomous Agent Panel - Proactive AI monitoring and actions
 */

import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Shield,
  Wrench,
  Users,
  Ship,
  Bell,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentAction {
  id: string;
  type: "alert" | "recommendation" | "automation";
  priority: "critical" | "high" | "medium" | "low";
  module: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "executed";
  timestamp: Date;
  impact?: string;
  confidence: number;
}

const PRIORITY_COLORS = {
  critical: "bg-red-500/20 text-red-500 border-red-500/50",
  high: "bg-orange-500/20 text-orange-500 border-orange-500/50",
  medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  low: "bg-blue-500/20 text-blue-500 border-blue-500/50",
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  maintenance: <Wrench className="h-4 w-4" />,
  crew: <Users className="h-4 w-4" />,
  vessel: <Ship className="h-4 w-4" />,
  qhse: <Shield className="h-4 w-4" />,
  finance: <TrendingUp className="h-4 w-4" />,
};

const MOCK_ACTIONS: AgentAction[] = [
  {
    id: "1",
    type: "alert",
    priority: "critical",
    module: "maintenance",
    title: "Falha Iminente Detectada",
    description: "Análise preditiva detectou padrão de vibração anormal no motor principal do MV Atlantic. Probabilidade de falha em 72h: 87%.",
    status: "pending",
    timestamp: new Date(),
    impact: "Evitar parada não programada de $45.000",
    confidence: 87,
  },
  {
    id: "2",
    type: "recommendation",
    priority: "high",
    module: "crew",
    title: "Otimização de Escala Sugerida",
    description: "Identificada oportunidade de reduzir custos de tripulação em 12% realocando 3 oficiais entre embarcações.",
    status: "pending",
    timestamp: new Date(Date.now() - 1800000),
    impact: "Economia mensal estimada: $8.200",
    confidence: 92,
  },
  {
    id: "3",
    type: "automation",
    priority: "medium",
    module: "qhse",
    title: "Relatório de Compliance Gerado",
    description: "Relatório mensal QHSE gerado automaticamente. Todos os indicadores dentro das metas estabelecidas.",
    status: "executed",
    timestamp: new Date(Date.now() - 3600000),
    confidence: 100,
  },
  {
    id: "4",
    type: "alert",
    priority: "high",
    module: "vessel",
    title: "Desvio de Rota Recomendado",
    description: "Condições meteorológicas adversas previstas. Rota alternativa pode economizar 8h de viagem e $12.000 em combustível.",
    status: "pending",
    timestamp: new Date(Date.now() - 900000),
    impact: "Economia: $12.000 | Tempo: 8h",
    confidence: 78,
  },
];

export const AutonomousAgentPanel = memo(function() {
  const [isActive, setIsActive] = useState(true);
  const [actions, setActions] = useState<AgentAction[]>(MOCK_ACTIONS);
  const [autoApprove, setAutoApprove] = useState(false);
  const [agentStats, setAgentStats] = useState({
    actionsToday: 12,
    successRate: 94,
    savingsGenerated: 127500,
    issuesPrevented: 8,
  });

  const pendingActions = actions.filter(a => a.status === "pending");
  const executedActions = actions.filter(a => a.status === "executed" || a.status === "approved");

  const handleApprove = (id: string) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, status: "approved" } : a))
    );
  };

  const handleReject = (id: string) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, status: "rejected" } : a))
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Agente Autônomo
            <Badge variant={isActive ? "default" : "secondary"} className="ml-2">
              {isActive ? "Ativo" : "Pausado"}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSetIsActive}
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agent Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-primary">{agentStats.actionsToday}</p>
            <p className="text-[10px] text-muted-foreground">Ações Hoje</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-green-500">{agentStats.successRate}%</p>
            <p className="text-[10px] text-muted-foreground">Taxa Sucesso</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-primary">${(agentStats.savingsGenerated / 1000).toFixed(0)}k</p>
            <p className="text-[10px] text-muted-foreground">Economia</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-orange-500">{agentStats.issuesPrevented}</p>
            <p className="text-[10px] text-muted-foreground">Prevenidos</p>
          </div>
        </div>

        {/* Auto-approve toggle */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">Auto-aprovação (baixo risco)</span>
          </div>
          <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
        </div>

        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Aguardando Aprovação ({pendingActions.length})</span>
            </div>
            <ScrollArea className="h-[250px]">
              <AnimatePresence>
                {pendingActions.map((action) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="mb-3"
                  >
                    <div className={`border rounded-lg p-3 ${PRIORITY_COLORS[action.priority]}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {MODULE_ICONS[action.module]}
                          <span className="font-medium text-sm">{action.title}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                      {action.impact && (
                        <div className="flex items-center gap-1 mb-2">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">{action.impact}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Progress value={action.confidence} className="w-16 h-1" />
                          <span className="text-[10px] text-muted-foreground">{action.confidence}% confiança</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => handlehandleReject}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => handlehandleApprove}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </div>
        )}

        {/* Recent Executed */}
        {executedActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Executadas Recentemente</span>
            </div>
            <div className="space-y-1">
              {executedActions.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between bg-muted/30 rounded px-2 py-1"
                >
                  <div className="flex items-center gap-2">
                    {MODULE_ICONS[action.module]}
                    <span className="text-xs truncate max-w-[200px]">{action.title}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
