/**
 * AI Agent Orchestration Dashboard - Nautilus v4.0
 * 8 specialized agents with multi-LLM consensus
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Brain, 
  Anchor, 
  Wrench, 
  Shield, 
  Heart, 
  Navigation, 
  TrendingUp, 
  Eye,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Network,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentChatPanel } from "./AgentChatPanel";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  status: "active" | "idle" | "processing" | "consensus";
  autonomyLevel: 0 | 1 | 2 | 3;
  model: string;
  lastAction: string;
  lastActionTime: Date;
  tasksCompleted: number;
  avgResponseMs: number;
  successRate: number;
}

interface Decision {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  agents: string[];
  consensus: number;
  status: "pending" | "approved" | "executed" | "rejected";
  autonomyLevel: number;
}

const agents: Agent[] = [
  {
    id: "captain",
    name: "Captain Agent",
    role: "Decisões estratégicas, planejamento de rota, alocação de tripulação",
    icon: Anchor,
    status: "active",
    autonomyLevel: 2,
    model: "Claude Opus 4",
    lastAction: "Otimizou rotação de tripulação para Q1",
    lastActionTime: new Date(Date.now() - 300000),
    tasksCompleted: 147,
    avgResponseMs: 2340,
    successRate: 98.2
  },
  {
    id: "engineer",
    name: "Engineer Agent",
    role: "Manutenção preditiva, otimização de combustível",
    icon: Wrench,
    status: "processing",
    autonomyLevel: 3,
    model: "Claude Opus 4",
    lastAction: "Agendou manutenção preventiva - Motor Principal",
    lastActionTime: new Date(Date.now() - 120000),
    tasksCompleted: 234,
    avgResponseMs: 1890,
    successRate: 99.1
  },
  {
    id: "safety",
    name: "Safety Officer Agent",
    role: "Compliance PEOTRAM/MLC, enforcement de segurança",
    icon: Shield,
    status: "active",
    autonomyLevel: 3,
    model: "Claude Opus 4",
    lastAction: "Validou checklist PEOTRAM - 100% compliant",
    lastActionTime: new Date(Date.now() - 600000),
    tasksCompleted: 189,
    avgResponseMs: 1560,
    successRate: 100
  },
  {
    id: "wellness",
    name: "HR/Wellness Agent",
    role: "Gestão de tripulação, recrutamento, bem-estar",
    icon: Heart,
    status: "idle",
    autonomyLevel: 2,
    model: "Claude Opus 4",
    lastAction: "Alertou burnout risk - 2 tripulantes",
    lastActionTime: new Date(Date.now() - 900000),
    tasksCompleted: 156,
    avgResponseMs: 2100,
    successRate: 96.8
  },
  {
    id: "navigator",
    name: "Navigator Agent",
    role: "Otimização de rota quantum-AI, previsão meteorológica",
    icon: Navigation,
    status: "consensus",
    autonomyLevel: 1,
    model: "Claude Opus 4",
    lastAction: "Propôs rota alternativa - economia 12% fuel",
    lastActionTime: new Date(Date.now() - 180000),
    tasksCompleted: 98,
    avgResponseMs: 4200,
    successRate: 94.5
  },
  {
    id: "economist",
    name: "Economist Agent",
    role: "Otimização de custos, economia de combustível, pricing",
    icon: TrendingUp,
    status: "active",
    autonomyLevel: 2,
    model: "Claude Opus 4",
    lastAction: "Ajustou RPM para economia ótima",
    lastActionTime: new Date(Date.now() - 450000),
    tasksCompleted: 167,
    avgResponseMs: 1780,
    successRate: 97.3
  },
  {
    id: "predictor",
    name: "Predictor Agent",
    role: "Previsão de falhas, anomalias, mudanças de mercado",
    icon: Eye,
    status: "processing",
    autonomyLevel: 3,
    model: "Claude Opus 4 + TensorFlow",
    lastAction: "Detectou anomalia térmica - Gerador #2",
    lastActionTime: new Date(Date.now() - 60000),
    tasksCompleted: 312,
    avgResponseMs: 890,
    successRate: 95.7
  },
  {
    id: "communicator",
    name: "Communicator Agent",
    role: "Notificações, relatórios, comunicação com tripulação",
    icon: MessageSquare,
    status: "active",
    autonomyLevel: 2,
    model: "Claude Sonnet 4",
    lastAction: "Enviou briefing diário para 45 tripulantes",
    lastActionTime: new Date(Date.now() - 3600000),
    tasksCompleted: 892,
    avgResponseMs: 450,
    successRate: 99.8
  }
];

const recentDecisions: Decision[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 60000),
    type: "Manutenção Preventiva",
    description: "Agendar troca de rolamentos do motor principal em 5 dias",
    agents: ["engineer", "predictor", "economist"],
    consensus: 95,
    status: "executed",
    autonomyLevel: 3
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 180000),
    type: "Otimização de Rota",
    description: "Rota alternativa via Canal X - economia de 12% combustível",
    agents: ["navigator", "economist", "captain"],
    consensus: 87,
    status: "pending",
    autonomyLevel: 1
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 300000),
    type: "Alerta de Wellness",
    description: "2 tripulantes com risco de burnout - sugerir rotação",
    agents: ["wellness", "captain"],
    consensus: 92,
    status: "approved",
    autonomyLevel: 2
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 600000),
    type: "Compliance Check",
    description: "Auditoria PEOTRAM completa - 100% conformidade",
    agents: ["safety"],
    consensus: 100,
    status: "executed",
    autonomyLevel: 3
  }
];

const statusColors: Record<Agent["status"], string> = {
  active: "bg-success",
  idle: "bg-muted-foreground",
  processing: "bg-info animate-pulse",
  consensus: "bg-accent animate-pulse"
};

const autonomyLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Manual", color: "text-muted-foreground" },
  1: { label: "Recomenda", color: "text-blue-500" },
  2: { label: "Auto + Notifica", color: "text-amber-500" },
  3: { label: "Autônomo", color: "text-green-500" }
};

export function AgentOrchestrationDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [systemStatus, setSystemStatus] = useState<"operational" | "degraded" | "critical">("operational");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate agent status changes
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeAgents = agents.filter(a => a.status !== "idle").length;
  const avgConsensus = recentDecisions.reduce((acc, d) => acc + d.consensus, 0) / recentDecisions.length;
  const totalTasks = agents.reduce((acc, a) => acc + a.tasksCompleted, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            AI Agent Orchestration
          </h1>
          <p className="text-muted-foreground mt-1">
            Multi-agent system com consenso distribuído
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`${systemStatus === "operational" ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}
          >
            <Activity className="h-3 w-3 mr-1" />
            {systemStatus === "operational" ? "Sistema Operacional" : "Degradado"}
          </Badge>
          <Button 
            variant="outline"
            onClick={() => {
              // Force consensus action
              const pendingCount = recentDecisions.filter(d => d.status === "pending").length;
              if (pendingCount > 0) {
                toast.success(`Consenso forçado para ${pendingCount} decisões pendentes`);
              } else {
                toast.success("Nenhuma decisão pendente para consenso");
              }
            }}
          >
            <Zap className="h-4 w-4 mr-2" />
            Forçar Consenso
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                <p className="text-2xl font-bold">{activeAgents}/{agents.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consenso Médio</p>
                <p className="text-2xl font-bold">{avgConsensus.toFixed(1)}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completadas</p>
                <p className="text-2xl font-bold">{totalTasks.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Decisões Pendentes</p>
                <p className="text-2xl font-bold">
                  {recentDecisions.filter(d => d.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Agentes Especializados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => {
                  const Icon = agent.icon;
                  return (
                    <motion.div
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAgent?.id === agent.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {agent.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
                          <Badge variant="outline" className={autonomyLabels[agent.autonomyLevel].color}>
                            L{agent.autonomyLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span className="font-medium">{agent.successRate}%</span>
                        </div>
                        <Progress value={agent.successRate} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {agent.lastAction}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatAgent(agent);
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Interagir
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decisions Feed */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Decisões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {recentDecisions.map(decision => (
                      <motion.div
                        key={decision.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{decision.type}</Badge>
                          <Badge 
                            variant={decision.status === "executed" ? "default" : "secondary"}
                            className={
                              decision.status === "pending" ? "bg-amber-500" :
                              decision.status === "executed" ? "bg-green-500" : ""
                            }
                          >
                            {decision.status === "pending" ? "Aguardando" :
                             decision.status === "executed" ? "Executado" :
                             decision.status === "approved" ? "Aprovado" : "Rejeitado"}
                          </Badge>
                        </div>
                        <p className="text-sm">{decision.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {decision.agents.length} agentes
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {decision.consensus}% consenso
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {decision.agents.map(agentId => {
                            const agent = agents.find(a => a.id === agentId);
                            if (!agent) return null;
                            const Icon = agent.icon;
                            return (
                              <div 
                                key={agentId}
                                className="p-1 rounded bg-muted"
                                title={agent.name}
                              >
                                <Icon className="h-3 w-3" />
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background p-6 rounded-xl max-w-lg w-full mx-4 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <selectedAgent.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedAgent.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Modelo</p>
                  <p className="font-medium">{selectedAgent.model}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Autonomia</p>
                  <p className={`font-medium ${autonomyLabels[selectedAgent.autonomyLevel].color}`}>
                    {autonomyLabels[selectedAgent.autonomyLevel].label}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Tasks Completadas</p>
                  <p className="font-medium">{selectedAgent.tasksCompleted}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  <p className="font-medium">{selectedAgent.avgResponseMs}ms</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Última Ação</p>
                <p className="text-sm">{selectedAgent.lastAction}</p>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => setSelectedAgent(null)}>
                  Fechar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast.success(`Histórico do ${selectedAgent.name} carregado`);
                  }}
                >
                  Ver Histórico
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => {
                    toast.success(`Agente ${selectedAgent.name} reiniciado`);
                    setSelectedAgent(null);
                  }}
                >
                  Reiniciar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Chat Panel */}
      <AnimatePresence>
        {chatAgent && (
          <AgentChatPanel
            agentId={chatAgent.id}
            agentName={chatAgent.name}
            agentRole={chatAgent.role}
            onClose={() => setChatAgent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AgentOrchestrationDashboard;
