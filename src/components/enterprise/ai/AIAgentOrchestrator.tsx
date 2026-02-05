/**
 * AIAgentOrchestrator - Painel de Orquestração de Agentes IA
 * Enterprise-grade AI agent management with real-time monitoring
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, Bot, Activity, Zap, Clock, CheckCircle2, 
  AlertTriangle, Play, Pause, RefreshCw, Settings, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIAgent {
  id: string;
  name: string;
  type: "analysis" | "prediction" | "automation" | "monitoring" | "assistant";
  status: "active" | "idle" | "processing" | "error" | "disabled";
  module: string;
  lastExecution: Date;
  tasksCompleted: number;
  tasksQueued: number;
  avgLatency: number;
  confidence: number;
  errorRate: number;
  enabled: boolean;
}

const mockAgents: AIAgent[] = [
  {
    id: "agent-1",
    name: "Document Analyzer",
    type: "analysis",
    status: "active",
    module: "Document Center",
    lastExecution: new Date(Date.now() - 5 * 60 * 1000),
    tasksCompleted: 1245,
    tasksQueued: 3,
    avgLatency: 850,
    confidence: 94.5,
    errorRate: 0.8,
    enabled: true,
  },
  {
    id: "agent-2",
    name: "Maintenance Predictor",
    type: "prediction",
    status: "processing",
    module: "Maintenance Hub",
    lastExecution: new Date(Date.now() - 2 * 60 * 1000),
    tasksCompleted: 892,
    tasksQueued: 1,
    avgLatency: 1200,
    confidence: 89.2,
    errorRate: 1.2,
    enabled: true,
  },
  {
    id: "agent-3",
    name: "Crew Matcher",
    type: "automation",
    status: "idle",
    module: "People Hub",
    lastExecution: new Date(Date.now() - 30 * 60 * 1000),
    tasksCompleted: 567,
    tasksQueued: 0,
    avgLatency: 650,
    confidence: 92.1,
    errorRate: 0.5,
    enabled: true,
  },
  {
    id: "agent-4",
    name: "Compliance Monitor",
    type: "monitoring",
    status: "active",
    module: "Compliance Hub",
    lastExecution: new Date(Date.now() - 1 * 60 * 1000),
    tasksCompleted: 2134,
    tasksQueued: 5,
    avgLatency: 320,
    confidence: 97.8,
    errorRate: 0.2,
    enabled: true,
  },
  {
    id: "agent-5",
    name: "Voyage Optimizer",
    type: "prediction",
    status: "error",
    module: "Operations Hub",
    lastExecution: new Date(Date.now() - 15 * 60 * 1000),
    tasksCompleted: 445,
    tasksQueued: 12,
    avgLatency: 2100,
    confidence: 78.5,
    errorRate: 5.2,
    enabled: true,
  },
  {
    id: "agent-6",
    name: "Chat Assistant",
    type: "assistant",
    status: "disabled",
    module: "AI Control Tower",
    lastExecution: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tasksCompleted: 3421,
    tasksQueued: 0,
    avgLatency: 450,
    confidence: 91.3,
    errorRate: 1.5,
    enabled: false,
  },
];

const typeConfig = {
  analysis: { icon: Brain, color: "bg-purple-500", label: "Análise" },
  prediction: { icon: Zap, color: "bg-blue-500", label: "Predição" },
  automation: { icon: RefreshCw, color: "bg-green-500", label: "Automação" },
  monitoring: { icon: Activity, color: "bg-amber-500", label: "Monitoramento" },
  assistant: { icon: Bot, color: "bg-pink-500", label: "Assistente" },
};

const statusConfig = {
  active: { color: "bg-green-500", label: "Ativo", pulse: true },
  idle: { color: "bg-gray-400", label: "Ocioso", pulse: false },
  processing: { color: "bg-blue-500", label: "Processando", pulse: true },
  error: { color: "bg-red-500", label: "Erro", pulse: true },
  disabled: { color: "bg-gray-300", label: "Desabilitado", pulse: false },
};

export function AIAgentOrchestrator() {
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const activeAgents = agents.filter(a => a.status === "active" || a.status === "processing").length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);
  const avgConfidence = agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length;
  const errorAgents = agents.filter(a => a.status === "error").length;

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, enabled: !agent.enabled, status: agent.enabled ? "disabled" : "idle" }
        : agent
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Orquestrador de Agentes IA
          </h2>
          <p className="text-muted-foreground">Gerenciamento e monitoramento de agentes inteligentes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Executar Todos
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                <p className="text-2xl font-bold">{activeAgents}/{agents.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Executadas</p>
                <p className="text-2xl font-bold">{totalTasks.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-2xl font-bold">{avgConfidence.toFixed(1)}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">{errorAgents}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const TypeIcon = typeConfig[agent.type].icon;
          const isSelected = selectedAgent?.id === agent.id;
          
          return (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${!agent.enabled ? "opacity-60" : ""}`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${typeConfig[agent.type].color} flex items-center justify-center`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-xs text-muted-foreground">{agent.module}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`h-3 w-3 rounded-full ${statusConfig[agent.status].color}`} />
                        {statusConfig[agent.status].pulse && (
                          <div className={`absolute inset-0 h-3 w-3 rounded-full ${statusConfig[agent.status].color} animate-ping opacity-75`} />
                        )}
                      </div>
                      <Switch 
                        checked={agent.enabled} 
                        onCheckedChange={() => toggleAgent(agent.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Tarefas</p>
                      <p className="font-medium">{agent.tasksCompleted}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Na Fila</p>
                      <p className="font-medium">{agent.tasksQueued}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Latência</p>
                      <p className="font-medium">{agent.avgLatency}ms</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Confiança</p>
                      <p className={`font-medium ${agent.confidence >= 90 ? "text-green-600" : agent.confidence >= 80 ? "text-amber-600" : "text-red-600"}`}>
                        {agent.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-3">
                    <Progress value={agent.confidence} className="h-1.5" />
                  </div>

                  {/* Error Warning */}
                  {agent.status === "error" && (
                    <div className="mt-3 p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Taxa de erro: {agent.errorRate}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Agent Detail Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg ${typeConfig[selectedAgent.type].color} flex items-center justify-center`}>
                      {React.createElement(typeConfig[selectedAgent.type].icon, { className: "h-6 w-6 text-white" })}
                    </div>
                    <div>
                      <CardTitle>{selectedAgent.name}</CardTitle>
                      <CardDescription>{selectedAgent.module} • {typeConfig[selectedAgent.type].label}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusConfig[selectedAgent.status].color} text-white`}>
                      {statusConfig[selectedAgent.status].label}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reiniciar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Última Execução</p>
                    <p className="font-semibold">{Math.round((Date.now() - selectedAgent.lastExecution.getTime()) / 60000)} min atrás</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Tarefas Hoje</p>
                    <p className="font-semibold">{selectedAgent.tasksCompleted}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Latência Média</p>
                    <p className="font-semibold">{selectedAgent.avgLatency}ms</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                    <p className={`font-semibold ${selectedAgent.errorRate > 2 ? "text-red-600" : "text-green-600"}`}>
                      {selectedAgent.errorRate}%
                    </p>
                  </div>
                </div>

                {/* Logs placeholder */}
                <div className="mt-4 p-4 rounded-lg border bg-black/5 font-mono text-xs overflow-x-auto">
                  <p className="text-green-600">[INFO] Agent {selectedAgent.name} initialized successfully</p>
                  <p className="text-muted-foreground">[DEBUG] Processing task queue: {selectedAgent.tasksQueued} items</p>
                  <p className="text-blue-600">[INFO] Last task completed with confidence: {selectedAgent.confidence}%</p>
                  {selectedAgent.status === "error" && (
                    <p className="text-red-600">[ERROR] Connection timeout - retrying in 30s</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIAgentOrchestrator;
