/**
 * Tabs content for AI Observability Dashboard
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, TrendingUp, TrendingDown, Search, Filter,
  Play, Pause, RotateCcw, Settings, Bot, Cpu, XCircle
} from "lucide-react";
import type { AIAgent, AIMetric, AILog, AgentStatus } from "@/hooks/useAIObservabilityData";

interface ObservabilityTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  agents: AIAgent[];
  metrics: AIMetric[];
  filteredLogs: AILog[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  levelFilter: string;
  onLevelFilterChange: (v: string) => void;
  onStartAgent: (id: string) => void;
  onPauseAgent: (id: string) => void;
  onRestartAgent: (id: string) => void;
  onClearQueue: (id: string) => void;
  onConfigAgent: (agent: AIAgent) => void;
}

const getStatusConfig = (status: AgentStatus) => {
  const config = {
    running: { label: "Executando", color: "bg-success", textColor: "text-success" },
    idle: { label: "Ocioso", color: "bg-info", textColor: "text-info" },
    paused: { label: "Pausado", color: "bg-warning", textColor: "text-warning" },
    error: { label: "Erro", color: "bg-destructive", textColor: "text-destructive" }
  };
  return config[status];
};

const getLevelConfig = (level: AILog["level"]) => {
  const config = {
    info: { color: "text-info bg-info/10" },
    warning: { color: "text-warning bg-warning/10" },
    error: { color: "text-destructive bg-destructive/10" },
    debug: { color: "text-muted-foreground bg-muted" }
  };
  return config[level];
};

export const ObservabilityTabs: React.FC<ObservabilityTabsProps> = ({
  activeTab, onTabChange, agents, metrics, filteredLogs,
  searchQuery, onSearchChange, levelFilter, onLevelFilterChange,
  onStartAgent, onPauseAgent, onRestartAgent, onClearQueue, onConfigAgent
}) => (
  <Tabs value={activeTab} onValueChange={onTabChange}>
    <TabsList>
      <TabsTrigger value="overview">Visão Geral</TabsTrigger>
      <TabsTrigger value="agents">Agentes</TabsTrigger>
      <TabsTrigger value="metrics">Métricas</TabsTrigger>
      <TabsTrigger value="logs">Logs</TabsTrigger>
    </TabsList>

    {/* Overview Tab */}
    <TabsContent value="overview" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const statusConfig = getStatusConfig(agent.status);
          return (
            <Card key={agent.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${statusConfig.color}`} />
                </div>
                <CardDescription>{agent.model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tarefas</p>
                    <p className="font-medium">{agent.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Na Fila</p>
                    <p className="font-medium">{agent.tasksQueued}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tempo Médio</p>
                    <p className="font-medium">{agent.avgResponseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sucesso</p>
                    <p className="font-medium">{agent.successRate}%</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {agent.status === "running" ? (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => onPauseAgent(agent.id)}>
                      <Pause className="h-4 w-4 mr-1" /> Pausar
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={() => onStartAgent(agent.id)}>
                      <Play className="h-4 w-4 mr-1" /> Iniciar
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onRestartAgent(agent.id)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onConfigAgent(agent)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TabsContent>

    {/* Agents Tab */}
    <TabsContent value="agents" className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {agents.map((agent) => {
              const statusConfig = getStatusConfig(agent.status);
              return (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{agent.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Cpu className="h-3 w-3" />
                        <span>{agent.model}</span>
                        <span>•</span>
                        <span>{agent.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Tarefas</p>
                      <p className="font-medium">{agent.tasksCompleted}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Fila</p>
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{agent.tasksQueued}</p>
                        {agent.tasksQueued > 0 && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onClearQueue(agent.id)}>
                            <XCircle className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Sucesso</p>
                      <p className="font-medium">{agent.successRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Custo</p>
                      <p className="font-medium">${agent.costUSD.toFixed(2)}</p>
                    </div>
                    <Badge variant={agent.status === "running" ? "default" : "secondary"}>
                      {statusConfig.label}
                    </Badge>
                    <div className="flex gap-1">
                      {agent.status === "running" ? (
                        <Button size="sm" variant="outline" onClick={() => onPauseAgent(agent.id)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => onStartAgent(agent.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => onRestartAgent(agent.id)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Metrics Tab */}
    <TabsContent value="metrics" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.name}</span>
                {metric.trend === "up" ? (
                  <TrendingUp className={`h-4 w-4 ${metric.status === "good" ? "text-green-500" : "text-red-500"}`} />
                ) : metric.trend === "down" ? (
                  <TrendingDown className={`h-4 w-4 ${metric.status === "good" ? "text-green-500" : "text-red-500"}`} />
                ) : (
                  <Activity className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{metric.value}</p>
                <span className="text-lg text-muted-foreground">{metric.unit}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={
                  metric.status === "good" ? "default" :
                  metric.status === "warning" ? "secondary" : "destructive"
                }>
                  {metric.change > 0 ? "+" : ""}{metric.change}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs. período anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>

    {/* Logs Tab */}
    <TabsContent value="logs" className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={levelFilter} onValueChange={onLevelFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 font-mono text-sm">
              {filteredLogs.map((log) => {
                const levelConfig = getLevelConfig(log.level);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString('pt-BR')}
                    </span>
                    <Badge variant="outline" className={`${levelConfig.color} uppercase text-xs`}>
                      {log.level}
                    </Badge>
                    <span className="text-muted-foreground">[{log.agentName}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);
