/**
 * AI Agent Orchestration Dashboard - Nautilus v4.0
 * Refactored: data and sub-components extracted to orchestration/
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, MessageSquare, Activity, CheckCircle2, Clock, Zap, Network, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentChatPanel } from "./AgentChatPanel";
import { agents, recentDecisions, statusColors, autonomyLabels, OrchAgent } from "./orchestration/orchestration-data";
import { AgentDetailModal } from "./orchestration/AgentDetailModal";
import { DecisionsFeed } from "./orchestration/DecisionsFeed";

export function AgentOrchestrationDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<OrchAgent | null>(null);
  const [chatAgent, setChatAgent] = useState<OrchAgent | null>(null);
  const [systemStatus, setSystemStatus] = useState<"operational" | "degraded" | "critical">("operational");

  useEffect(() => {
    const interval = setInterval(() => {}, 5000);
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
          <p className="text-muted-foreground mt-1">Multi-agent system com consenso distribuído</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`${systemStatus === "operational" ? "border-success text-success" : "border-destructive text-destructive"}`}>
            <Activity className="h-3 w-3 mr-1" />
            {systemStatus === "operational" ? "Sistema Operacional" : "Degradado"}
          </Badge>
          <Button variant="outline" onClick={() => {
            const pendingCount = recentDecisions.filter(d => d.status === "pending").length;
            toast.success(pendingCount > 0 ? `Consenso forçado para ${pendingCount} decisões pendentes` : "Nenhuma decisão pendente para consenso");
          }}>
            <Zap className="h-4 w-4 mr-2" />Forçar Consenso
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Agentes Ativos</p><p className="text-2xl font-bold">{activeAgents}/{agents.length}</p></div><Bot className="h-8 w-8 text-info opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Consenso Médio</p><p className="text-2xl font-bold">{avgConsensus.toFixed(1)}%</p></div><CheckCircle2 className="h-8 w-8 text-success opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tasks Completadas</p><p className="text-2xl font-bold">{totalTasks.toLocaleString()}</p></div><Zap className="h-8 w-8 text-warning opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Decisões Pendentes</p><p className="text-2xl font-bold">{recentDecisions.filter(d => d.status === "pending").length}</p></div><Clock className="h-8 w-8 text-primary opacity-80" /></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Agentes Especializados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => {
                  const Icon = agent.icon;
                  return (
                    <motion.div key={agent.id} whileHover={{ scale: 1.02 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAgent?.id === agent.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                      onClick={() => setSelectedAgent(agent)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
                          <div>
                            <h4 className="font-medium">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{agent.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
                          <Badge variant="outline" className={autonomyLabels[agent.autonomyLevel].color}>L{agent.autonomyLevel}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Success Rate</span><span className="font-medium">{agent.successRate}%</span></div>
                        <Progress value={agent.successRate} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-2">{agent.lastAction}</p>
                        <Button size="sm" variant="outline" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); setChatAgent(agent); }}>
                          <MessageSquare className="h-3 w-3 mr-1" />Interagir
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <DecisionsFeed />
      </div>

      <AnimatePresence>
        {selectedAgent && <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {chatAgent && (
          <AgentChatPanel agentId={chatAgent.id} agentName={chatAgent.name} agentRole={chatAgent.role} onClose={() => setChatAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AgentOrchestrationDashboard;
