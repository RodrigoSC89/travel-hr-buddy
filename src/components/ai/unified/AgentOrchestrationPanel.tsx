/**
 * Agent Orchestration Panel
 * Real-time view of multi-agent collaboration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Ship,
  Wrench,
  Shield,
  Heart,
  Navigation,
  Calculator,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  Activity
} from "lucide-react";

interface AgentState {
  id: string;
  role: string;
  name: string;
  icon: React.ReactNode;
  status: "active" | "busy" | "idle" | "error";
  currentTask: string | null;
  confidence: number;
  decisionsToday: number;
  accuracyRate: number;
  lastAction: Date;
}

interface Decision {
  id: string;
  title: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  proposedBy: string;
  status: "pending" | "voting" | "approved" | "executed" | "rejected";
  votes: { agent: string; vote: "approve" | "reject" | "abstain"; confidence: number }[];
  consensusReached: boolean;
  timestamp: Date;
}

export function AgentOrchestrationPanel() {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    initializeAgents();
    simulateDecisions();
  }, []);

  const initializeAgents = () => {
    const agentList: AgentState[] = [
      {
        id: "captain",
        role: "captain",
        name: "ARIA Captain",
        icon: <Ship className="h-5 w-5" />,
        status: "active",
        currentTask: null,
        confidence: 0.92,
        decisionsToday: 12,
        accuracyRate: 94,
        lastAction: new Date()
      },
      {
        id: "engineer",
        role: "engineer",
        name: "ARIA Engineer",
        icon: <Wrench className="h-5 w-5" />,
        status: "active",
        currentTask: "Analyzing propulsion system telemetry",
        confidence: 0.88,
        decisionsToday: 18,
        accuracyRate: 91,
        lastAction: new Date()
      },
      {
        id: "safety",
        role: "safety",
        name: "ARIA Safety",
        icon: <Shield className="h-5 w-5" />,
        status: "active",
        currentTask: null,
        confidence: 0.95,
        decisionsToday: 8,
        accuracyRate: 97,
        lastAction: new Date()
      },
      {
        id: "wellness",
        role: "wellness",
        name: "ARIA Wellness",
        icon: <Heart className="h-5 w-5" />,
        status: "idle",
        currentTask: null,
        confidence: 0.85,
        decisionsToday: 5,
        accuracyRate: 88,
        lastAction: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: "navigator",
        role: "navigator",
        name: "ARIA Navigator",
        icon: <Navigation className="h-5 w-5" />,
        status: "busy",
        currentTask: "Optimizing route for weather avoidance",
        confidence: 0.91,
        decisionsToday: 15,
        accuracyRate: 93,
        lastAction: new Date()
      },
      {
        id: "economist",
        role: "economist",
        name: "ARIA Economist",
        icon: <Calculator className="h-5 w-5" />,
        status: "active",
        currentTask: null,
        confidence: 0.87,
        decisionsToday: 9,
        accuracyRate: 89,
        lastAction: new Date()
      },
      {
        id: "predictor",
        role: "predictor",
        name: "ARIA Predictor",
        icon: <TrendingUp className="h-5 w-5" />,
        status: "active",
        currentTask: "Running maintenance forecast models",
        confidence: 0.89,
        decisionsToday: 22,
        accuracyRate: 86,
        lastAction: new Date()
      },
      {
        id: "communicator",
        role: "communicator",
        name: "ARIA Communicator",
        icon: <MessageSquare className="h-5 w-5" />,
        status: "active",
        currentTask: null,
        confidence: 0.93,
        decisionsToday: 6,
        accuracyRate: 95,
        lastAction: new Date()
      }
    ];
    setAgents(agentList);
  };

  const simulateDecisions = () => {
    const sampleDecisions: Decision[] = [
      {
        id: "dec-001",
        title: "Ajuste de velocidade para economia de combustível",
        type: "route_optimization",
        priority: "medium",
        proposedBy: "navigator",
        status: "executed",
        votes: [
          { agent: "captain", vote: "approve", confidence: 0.92 },
          { agent: "navigator", vote: "approve", confidence: 0.95 },
          { agent: "economist", vote: "approve", confidence: 0.88 },
          { agent: "safety", vote: "approve", confidence: 0.90 }
        ],
        consensusReached: true,
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: "dec-002",
        title: "Manutenção preventiva no sistema hidráulico",
        type: "maintenance_scheduling",
        priority: "high",
        proposedBy: "engineer",
        status: "approved",
        votes: [
          { agent: "engineer", vote: "approve", confidence: 0.94 },
          { agent: "predictor", vote: "approve", confidence: 0.89 },
          { agent: "safety", vote: "approve", confidence: 0.91 },
          { agent: "captain", vote: "approve", confidence: 0.87 }
        ],
        consensusReached: true,
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: "dec-003",
        title: "Rota alternativa devido a condições meteorológicas",
        type: "route_optimization",
        priority: "critical",
        proposedBy: "navigator",
        status: "voting",
        votes: [
          { agent: "navigator", vote: "approve", confidence: 0.96 },
          { agent: "safety", vote: "approve", confidence: 0.94 },
          { agent: "captain", vote: "abstain", confidence: 0.75 }
        ],
        consensusReached: false,
        timestamp: new Date()
      }
    ];
    setDecisions(sampleDecisions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "busy": return "bg-blue-500 animate-pulse";
      case "idle": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Crítico</Badge>;
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Alto</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Médio</Badge>;
      case "low":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Baixo</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getDecisionStatusBadge = (status: string) => {
    switch (status) {
      case "executed":
        return <Badge className="bg-green-500/20 text-green-400">Executado</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/20 text-blue-400">Aprovado</Badge>;
      case "voting":
        return <Badge className="bg-purple-500/20 text-purple-400 animate-pulse">Em Votação</Badge>;
      case "pending":
        return <Badge className="bg-gray-500/20 text-gray-400">Pendente</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const totalDecisions = agents.reduce((sum, a) => sum + a.decisionsToday, 0);
  const avgConfidence = Math.round(agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length * 100);
  const avgAccuracy = Math.round(agents.reduce((sum, a) => sum + a.accuracyRate, 0) / agents.length);
  const busyAgents = agents.filter(a => a.status === "busy").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{agents.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Agentes Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{totalDecisions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Decisões Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{avgConfidence}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Confiança Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{avgAccuracy}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Precisão Média</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agents Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Agentes Especializados
            </CardTitle>
            <CardDescription>
              8 agentes colaborando em decisões complexas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => (
                <Card 
                  key={agent.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedAgent === agent.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {agent.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agent.name}</p>
                          <div className="flex items-center gap-1">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                            <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {agent.currentTask && (
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {agent.currentTask}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span>{agent.decisionsToday} decisões</span>
                      <span className="text-green-500">{agent.accuracyRate}% precisão</span>
                    </div>

                    {selectedAgent === agent.id && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Confiança</span>
                          <span>{Math.round(agent.confidence * 100)}%</span>
                        </div>
                        <Progress value={agent.confidence * 100} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Decisions Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Decisões Recentes
            </CardTitle>
            <CardDescription>
              Consenso multi-agente em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <Card key={decision.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityBadge(decision.priority)}
                            {getDecisionStatusBadge(decision.status)}
                          </div>
                          <h4 className="font-medium text-sm">{decision.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Proposto por: {agents.find(a => a.id === decision.proposedBy)?.name}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <p className="text-xs font-medium">Votação dos Agentes:</p>
                        <div className="flex flex-wrap gap-2">
                          {decision.votes.map((vote, idx) => {
                            const agent = agents.find(a => a.id === vote.agent);
                            return (
                              <div 
                                key={idx}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  vote.vote === "approve" 
                                    ? "bg-green-500/20 text-green-400" 
                                    : vote.vote === "reject"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {vote.vote === "approve" ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : vote.vote === "reject" ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                <span>{agent?.role}</span>
                                <span className="opacity-60">({Math.round(vote.confidence * 100)}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>{decision.type}</span>
                        <span>{decision.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AgentOrchestrationPanel;
