/**
 * AIAgentOrchestrator - Connected to real Supabase data
 * Enterprise-grade AI agent management with real-time monitoring
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain, Bot, Activity, Zap, Clock, CheckCircle2,
  AlertTriangle, Play, Pause, RefreshCw, Settings, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  analysis: { icon: Brain, color: "bg-accent", label: "Análise" },
  prediction: { icon: Zap, color: "bg-info", label: "Predição" },
  automation: { icon: RefreshCw, color: "bg-success", label: "Automação" },
  monitoring: { icon: Activity, color: "bg-warning", label: "Monitoramento" },
  assistant: { icon: Bot, color: "bg-primary", label: "Assistente" },
  default: { icon: Bot, color: "bg-muted", label: "Agente" },
};

const statusConfig: Record<string, { color: string; label: string; pulse: boolean }> = {
  active: { color: "bg-success", label: "Ativo", pulse: true },
  online: { color: "bg-success", label: "Online", pulse: true },
  idle: { color: "bg-muted-foreground", label: "Ocioso", pulse: false },
  processing: { color: "bg-info", label: "Processando", pulse: true },
  error: { color: "bg-destructive", label: "Erro", pulse: true },
  disabled: { color: "bg-muted", label: "Desabilitado", pulse: false },
};

export function AIAgentOrchestrator() {
  const { agents, metrics, isLoading } = useAIControlTowerData();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = useMemo(() =>
    agents.find((a: Record<string, unknown>) => a.id === selectedAgentId) || null,
    [agents, selectedAgentId]
  );

  const activeAgents = agents.filter((a: Record<string, unknown>) => a.status === "active" || a.status === "online").length;
  const errorAgents = agents.filter((a: Record<string, unknown>) => a.status === "error").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Orquestrador de Agentes IA
          </h2>
          <p className="text-muted-foreground">
            {agents.length} agentes registrados • {activeAgents} ativos
          </p>
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
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Decisões</p>
                <p className="text-2xl font-bold">{metrics.approvedDecisions + metrics.rejectedDecisions + metrics.pendingDecisions}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-2xl font-bold">{metrics.avgConfidence}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Com Erro</p>
                <p className={`text-2xl font-bold ${errorAgents > 0 ? "text-destructive" : ""}`}>{errorAgents}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Nenhum agente registrado</h3>
          <p className="text-muted-foreground">Agentes aparecerão aqui quando registrados na tabela agent_registry</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent: Record<string, unknown>) => {
            const agentType = String((agent.metadata as Record<string, unknown>)?.type || "default");
            const config = typeConfig[agentType] || typeConfig.default;
            const TypeIcon = config.icon;
            const status = statusConfig[String(agent.status)] || statusConfig.idle;
            const isSelected = selectedAgentId === agent.id;

            return (
              <motion.div key={String(agent.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedAgentId(String(agent.id))}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{String(agent.name)}</h4>
                          <p className="text-xs text-muted-foreground">{String(agent.agent_id)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className={`h-3 w-3 rounded-full ${status.color}`} />
                          {status.pulse && (
                            <div className={`absolute inset-0 h-3 w-3 rounded-full ${status.color} animate-ping opacity-75`} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {(Array.isArray(agent.capabilities) ? agent.capabilities : []).slice(0, 3).map((cap: unknown, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{String(cap)}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-medium">{status.label}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">Capacidades</p>
                        <p className="font-medium">{(Array.isArray(agent.capabilities) ? agent.capabilities : []).length}</p>
                      </div>
                    </div>

                    {String(agent.status) === "error" && (
                      <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Agente com erro — verificar configuração
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Agent Detail Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{selectedAgent.name}</CardTitle>
                      <CardDescription>{selectedAgent.agent_id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${(statusConfig[selectedAgent.status] || statusConfig.idle).color} text-white`}>
                      {(statusConfig[selectedAgent.status] || statusConfig.idle).label}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAgentId(null)}>Fechar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold">{selectedAgent.status}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Capacidades</p>
                    <p className="font-semibold">{(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Último Heartbeat</p>
                    <p className="font-semibold">
                      {selectedAgent.last_heartbeat
                        ? `${Math.round((Date.now() - new Date(selectedAgent.last_heartbeat).getTime()) / 60000)}min`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-semibold">{new Date(selectedAgent.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                {(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Todas as Capacidades</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).map((cap: unknown, i: number) => (
                        <Badge key={i} variant="outline">{String(cap)}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIAgentOrchestrator;
