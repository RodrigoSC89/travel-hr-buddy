/**
 * AI Performance Metrics - Métricas de Performance da IA
 * Monitoramento em tempo real dos agentes de IA
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Cpu, Zap, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Activity, BarChart3, Target, Gauge,
  RefreshCw, Settings, Eye, Sparkles, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "learning" | "error";
  accuracy: number;
  responseTime: number;
  tasksCompleted: number;
  confidenceLevel: number;
  lastActive: string;
}

interface AIMetric {
  label: string;
  value: number;
  change: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

const metrics: AIMetric[] = [
  { label: "Decisões Hoje", value: 0, change: 0, unit: "", icon: Brain, color: "text-purple-500" },
  { label: "Precisão Média", value: 0, change: 0, unit: "%", icon: Target, color: "text-green-500" },
  { label: "Tempo Resposta", value: 0, change: 0, unit: "ms", icon: Zap, color: "text-yellow-500" },
  { label: "Taxa Sucesso", value: 0, change: 0, unit: "%", icon: CheckCircle2, color: "text-blue-500" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
    active: { variant: "default", label: "Ativo" },
    idle: { variant: "secondary", label: "Ocioso" },
    learning: { variant: "outline", label: "Aprendendo" },
    error: { variant: "destructive", label: "Erro" },
  };
  const config = variants[status] || variants.idle;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function AIPerformanceMetrics() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [dynamicMetrics, setDynamicMetrics] = useState(metrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const [{ data: registry }, { data: swarmMetrics }] = await Promise.all([
          supabase.from("agent_registry").select("*").order("name").limit(20),
          supabase.from("agent_swarm_metrics").select("*").limit(20),
        ]);

        const metricsMap = new Map((swarmMetrics || []).map((m: any) => [m.agent_id, m]));

        const mapped: AIAgent[] = (registry || []).map((r: any) => {
          const m = metricsMap.get(r.agent_id);
          return {
            id: r.id,
            name: r.name,
            type: (r.capabilities as any)?.type || "Geral",
            status: r.status as any || "idle",
            accuracy: m ? Math.round((m.success_count / Math.max(m.task_count, 1)) * 100 * 10) / 10 : 0,
            responseTime: m?.avg_response_time_ms || 0,
            tasksCompleted: m?.task_count || 0,
            confidenceLevel: m ? Math.round((m.success_count / Math.max(m.task_count, 1)) * 100) : 0,
            lastActive: r.last_heartbeat ? new Date(r.last_heartbeat).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "N/A",
          };
        });

        setAgents(mapped);

        // Calculate dynamic metrics
        const totalTasks = mapped.reduce((s, a) => s + a.tasksCompleted, 0);
        const avgAcc = mapped.length ? mapped.reduce((s, a) => s + a.accuracy, 0) / mapped.length : 0;
        const avgResp = mapped.length ? mapped.reduce((s, a) => s + a.responseTime, 0) / mapped.length : 0;
        const successRate = mapped.length ? mapped.reduce((s, a) => s + a.confidenceLevel, 0) / mapped.length : 0;

        setDynamicMetrics([
          { label: "Tarefas Total", value: totalTasks, change: 0, unit: "", icon: Brain, color: "text-purple-500" },
          { label: "Precisão Média", value: Math.round(avgAcc * 10) / 10, change: 0, unit: "%", icon: Target, color: "text-green-500" },
          { label: "Tempo Resposta", value: Math.round(avgResp), change: 0, unit: "ms", icon: Zap, color: "text-yellow-500" },
          { label: "Taxa Sucesso", value: Math.round(successRate * 10) / 10, change: 0, unit: "%", icon: CheckCircle2, color: "text-blue-500" },
        ]);
      } catch (err) {
        logger.error("Error fetching AI agents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const activeAgents = agents.filter(a => a.status === "active").length;
  const avgAccuracy = agents.length ? agents.reduce((acc, a) => acc + a.accuracy, 0) / agents.length : 0;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Performance da IA
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos agentes inteligentes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            {activeAgents} Agentes Ativos
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {dynamicMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <Badge variant={metric.change >= 0 ? "default" : "destructive"} className="text-xs">
                    {metric.change >= 0 ? "+" : ""}{metric.change}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-5 w-5 text-purple-500" />
            Saúde do Sistema de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Uso de GPU</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Memória</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Tokens/min</span>
                <span className="text-sm font-medium">12.4K</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedAgent?.id === agent.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedAgent(agent)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    agent.status === "active" ? "bg-success/10" : 
                    agent.status === "learning" ? "bg-warning/10" : "bg-muted"
                  }`}>
                    <Brain className={`h-5 w-5 ${
                      agent.status === "active" ? "text-success" : 
                      agent.status === "learning" ? "text-warning" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.type}</p>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Precisão</p>
                  <p className="text-lg font-bold text-success">{agent.accuracy}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confiança</p>
                  <p className="text-lg font-bold text-primary">{agent.confidenceLevel}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {agent.responseTime}ms
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {agent.tasksCompleted.toLocaleString()} tarefas
                </span>
                <span>Ativo: {agent.lastActive}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Aprendizado Contínuo
          </CardTitle>
          <CardDescription>
            Progresso de treinamento e otimização dos modelos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Modelo de Compliance</p>
                  <p className="text-xs text-muted-foreground">Fine-tuning com dados ISM/ISPS</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">98.5%</p>
                <p className="text-xs text-muted-foreground">Concluído</p>
              </div>
            </div>
            <Progress value={98.5} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Predição de Manutenção</p>
                  <p className="text-xs text-muted-foreground">Modelo preditivo v3.2</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-warning">72%</p>
                <p className="text-xs text-muted-foreground">Em progresso</p>
              </div>
            </div>
            <Progress value={72} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Otimização de Rotas</p>
                  <p className="text-xs text-muted-foreground">Algoritmo de eficiência</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">45%</p>
                <p className="text-xs text-muted-foreground">Treinando</p>
              </div>
            </div>
            <Progress value={45} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
