/**
 * PATCH 471 - Agent Control Panel UI
 * Control panel for managing AI agents in the coordination system
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Network,
  Activity,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Brain,
  Cpu,
} from "lucide-react";
import { coordinationService, type Agent, type AgentStatus } from "../services/coordinationService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const AgentControlPanel: React.FC = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const agentList = await coordinationService.getActiveAgents();
      setAgents(agentList);
    } catch (error) {
      console.error("Failed to load agents:", error);
    }
  };

  const handleStartAgent = async (agentId: string) => {
    setIsLoading(true);
    try {
      await coordinationService.startAgent(agentId, user?.id);
      toast.success("Agente iniciado");
      await loadAgents();
    } catch (error) {
      console.error("Failed to start agent:", error);
      toast.error("Falha ao iniciar agente");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseAgent = async (agentId: string) => {
    setIsLoading(true);
    try {
      await coordinationService.pauseAgent(agentId, user?.id);
      toast.success("Agente pausado");
      await loadAgents();
    } catch (error) {
      console.error("Failed to pause agent:", error);
      toast.error("Falha ao pausar agente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartAgent = async (agentId: string) => {
    setIsLoading(true);
    try {
      await coordinationService.restartAgent(agentId, user?.id);
      toast.success("Agente reiniciado");
      await loadAgents();
    } catch (error) {
      console.error("Failed to restart agent:", error);
      toast.error("Falha ao reiniciar agente");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return <Activity className="w-4 h-4 animate-pulse" />;
      case "idle":
        return <Pause className="w-4 h-4" />;
      case "error":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Painel de Controle de Agentes
          <Badge variant="outline" className="ml-auto">
            {agents.length} Agentes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agente ativo</p>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">{agent.name}</h3>
                      <Badge className={getStatusColor(agent.status)}>
                        {getStatusIcon(agent.status)}
                        <span className="ml-1">{agent.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Tipo: {agent.type}</span>
                      <span>
                        Tarefas: {agent.completedTasks}/{agent.totalTasks}
                      </span>
                      {agent.lastActive && (
                        <span>
                          Última atividade:{" "}
                          {new Date(agent.lastActive).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {agent.status === "paused" || agent.status === "idle" ? (
                      <Button
                        size="sm"
                        onClick={() => handleStartAgent(agent.id)}
                        disabled={isLoading}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePauseAgent(agent.id)}
                        disabled={isLoading}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestartAgent(agent.id)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Performance Metrics */}
                {agent.performance && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Eficiência</span>
                      <span className="font-medium">
                        {agent.performance.efficiency.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={agent.performance.efficiency} />
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Taxa de Sucesso</div>
                        <div className="font-medium">
                          {agent.performance.successRate.toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Tempo Médio</div>
                        <div className="font-medium">
                          {agent.performance.avgResponseTime.toFixed(0)}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Erros</div>
                        <div className="font-medium">{agent.performance.errorCount}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Task */}
                {agent.currentTask && (
                  <div className="p-2 bg-primary/10 rounded text-sm">
                    <div className="font-medium">Tarefa Atual:</div>
                    <div className="text-muted-foreground">{agent.currentTask}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentControlPanel;
