/**
 * AIOrchestrator - Orquestrador de Agentes IA
 * Dashboard de controle e monitoramento de agentes
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Sparkles, Activity, Cpu, Zap, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, Settings, Eye, Play,
  Pause, RefreshCw, MessageSquare, BarChart3, Shield,
  Target, ArrowRight, Bot, Network
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "processing" | "error" | "paused";
  lastActivity: string;
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  autonomyLevel: number;
  capabilities: string[];
}

interface AIDecision {
  id: string;
  agentName: string;
  type: string;
  description: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "executed";
  impact: "low" | "medium" | "high";
  timestamp: string;
}

const agents: AIAgent[] = [
  { id: "1", name: "Nautilus Core", type: "Orchestrator", status: "active", lastActivity: "Agora", tasksCompleted: 1250, successRate: 98.5, avgResponseTime: 120, autonomyLevel: 3, capabilities: ["routing", "scheduling", "optimization"] },
  { id: "2", name: "Compliance Guardian", type: "Auditor", status: "active", lastActivity: "2min", tasksCompleted: 890, successRate: 99.2, avgResponseTime: 85, autonomyLevel: 2, capabilities: ["mlc-check", "stcw-validation", "document-review"] },
  { id: "3", name: "Maintenance Prophet", type: "Predictor", status: "processing", lastActivity: "Agora", tasksCompleted: 456, successRate: 94.8, avgResponseTime: 2500, autonomyLevel: 2, capabilities: ["failure-prediction", "maintenance-scheduling"] },
  { id: "4", name: "Finance Advisor", type: "Analyzer", status: "idle", lastActivity: "15min", tasksCompleted: 678, successRate: 96.7, avgResponseTime: 180, autonomyLevel: 1, capabilities: ["cost-analysis", "budget-forecast", "contract-review"] },
  { id: "5", name: "Crew Matcher", type: "Optimizer", status: "active", lastActivity: "5min", tasksCompleted: 345, successRate: 97.3, avgResponseTime: 450, autonomyLevel: 2, capabilities: ["crew-matching", "rotation-planning", "competency-analysis"] },
  { id: "6", name: "Route Oracle", type: "Navigator", status: "paused", lastActivity: "1h", tasksCompleted: 234, successRate: 95.1, avgResponseTime: 3200, autonomyLevel: 1, capabilities: ["route-optimization", "weather-analysis", "fuel-efficiency"] },
];

const pendingDecisions: AIDecision[] = [
  { id: "1", agentName: "Maintenance Prophet", type: "Maintenance", description: "Antecipar manutenção da Bomba Ballast #2 para evitar falha crítica", confidence: 89, status: "pending", impact: "high", timestamp: "2026-02-04 14:30" },
  { id: "2", agentName: "Finance Advisor", type: "Budget", description: "Renegociar contrato de combustível com economia de 8%", confidence: 76, status: "pending", impact: "medium", timestamp: "2026-02-04 13:45" },
  { id: "3", agentName: "Crew Matcher", type: "Crew", description: "Substituir 2º Oficial por candidato com melhor match (92%)", confidence: 92, status: "pending", impact: "low", timestamp: "2026-02-04 12:00" },
];

const activityData = [
  { hour: "08:00", tasks: 12, decisions: 3 },
  { hour: "10:00", tasks: 25, decisions: 5 },
  { hour: "12:00", tasks: 18, decisions: 4 },
  { hour: "14:00", tasks: 32, decisions: 8 },
  { hour: "16:00", tasks: 28, decisions: 6 },
  { hour: "18:00", tasks: 15, decisions: 2 },
];

function StatusBadge({ status }: { status: AIAgent["status"] }) {
  const config = {
    active: { label: "Ativo", className: "bg-success/10 text-success", icon: CheckCircle2 },
    idle: { label: "Ocioso", className: "bg-muted text-muted-foreground", icon: Clock },
    processing: { label: "Processando", className: "bg-primary/10 text-primary animate-pulse", icon: Cpu },
    error: { label: "Erro", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
    paused: { label: "Pausado", className: "bg-warning/10 text-warning", icon: Pause },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={c.className}>
      <c.icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

function AutonomyLevel({ level }: { level: number }) {
  const labels = ["L0 - Manual", "L1 - Assistido", "L2 - Semi-Auto", "L3 - Autônomo"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3].map((l) => (
          <div
            key={l}
            className={`w-2 h-4 rounded-sm ${
              l <= level ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{labels[level]}</span>
    </div>
  );
}

function AgentCard({ agent }: { agent: AIAgent }) {
  const [isEnabled, setIsEnabled] = useState(agent.status !== "paused");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{agent.name}</h4>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-sm text-muted-foreground">{agent.type}</p>
            <AutonomyLevel level={agent.autonomyLevel} />
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => {
            setIsEnabled(checked);
            toast.success(checked ? `${agent.name} ativado` : `${agent.name} pausado`);
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="p-2 rounded bg-muted/50">
          <p className="text-lg font-bold">{agent.tasksCompleted}</p>
          <p className="text-xs text-muted-foreground">Tarefas</p>
        </div>
        <div className="p-2 rounded bg-muted/50">
          <p className="text-lg font-bold text-success">{agent.successRate}%</p>
          <p className="text-xs text-muted-foreground">Sucesso</p>
        </div>
        <div className="p-2 rounded bg-muted/50">
          <p className="text-lg font-bold">{agent.avgResponseTime}ms</p>
          <p className="text-xs text-muted-foreground">Resposta</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {agent.capabilities.map((cap) => (
          <Badge key={cap} variant="outline" className="text-xs">
            {cap}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Eye className="h-3 w-3" />
          Logs
        </Button>
        <Button size="sm" variant="outline" className="gap-1">
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}

function DecisionCard({ decision }: { decision: AIDecision }) {
  const handleApprove = () => {
    toast.info("Aprovação de decisão IA", { description: "Workflow de aprovação de decisões autônomas em implantação. As decisões são registradas para auditoria. ETA: Q3/2026." });
  };

  const handleReject = () => {
    toast.info("Rejeição de decisão IA", { description: "Workflow de rejeição em implantação. A decisão será marcada como rejeitada no audit trail. ETA: Q3/2026." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg border hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{decision.type}</Badge>
            <Badge variant={
              decision.impact === "high" ? "destructive" :
              decision.impact === "medium" ? "secondary" : "outline"
            }>
              {decision.impact === "high" ? "Alto Impacto" :
               decision.impact === "medium" ? "Médio" : "Baixo"}
            </Badge>
          </div>
          <p className="font-medium mt-2">{decision.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {decision.agentName} • {decision.timestamp}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{decision.confidence}%</div>
          <p className="text-xs text-muted-foreground">Confiança</p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button size="sm" className="flex-1 gap-1" onClick={handleApprove}>
          <CheckCircle2 className="h-3 w-3" />
          Aprovar
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={handleReject}>
          Rejeitar
        </Button>
        <Button size="sm" variant="ghost">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function AIOrchestrator() {
  const [activeTab, setActiveTab] = useState("agents");

  const stats = {
    activeAgents: agents.filter(a => a.status === "active" || a.status === "processing").length,
    totalTasks: agents.reduce((acc, a) => acc + a.tasksCompleted, 0),
    avgSuccess: Math.round(agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length * 10) / 10,
    pendingDecisions: pendingDecisions.length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agentes Ativos</p>
                <p className="text-2xl font-bold text-success">{stats.activeAgents}/{agents.length}</p>
              </div>
              <Bot className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tarefas Hoje</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgSuccess}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Aguardando</p>
                <p className="text-2xl font-bold text-warning">{stats.pendingDecisions}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividade dos Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hour" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Tarefas" />
              <Area type="monotone" dataKey="decisions" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} name="Decisões" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-500" />
                Orquestrador de Agentes IA
              </CardTitle>
              <CardDescription>Controle e monitoramento do ecossistema de IA</CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="agents">Agentes ({agents.length})</TabsTrigger>
              <TabsTrigger value="decisions">
                Decisões Pendentes ({pendingDecisions.length})
              </TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="agents">
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="decisions">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {pendingDecisions.map((decision) => (
                    <DecisionCard key={decision.id} decision={decision} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="audit">
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Audit Trail Blockchain</p>
                <p className="text-sm">Registro imutável de todas as decisões da IA</p>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Configurações de Agentes</p>
                <p className="text-sm">Ajuste níveis de autonomia e permissões</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
