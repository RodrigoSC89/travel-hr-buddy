/**
 * Stats bar for AI Observability Dashboard
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ObservabilityStats {
  totalAgents: number;
  running: number;
  paused: number;
  errors: number;
  totalTasks: number;
  queuedTasks: number;
  avgSuccessRate: string;
  totalCost: string;
}

interface ObservabilityStatsBarProps {
  stats: ObservabilityStats;
}

export const ObservabilityStatsBar: React.FC<ObservabilityStatsBarProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Agentes</p>
        <p className="text-2xl font-bold">{stats.totalAgents}</p>
      </CardContent>
    </Card>
    <Card className="border-success/50">
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Executando</p>
        <p className="text-2xl font-bold text-success">{stats.running}</p>
      </CardContent>
    </Card>
    <Card className="border-warning/50">
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Pausados</p>
        <p className="text-2xl font-bold text-warning">{stats.paused}</p>
      </CardContent>
    </Card>
    <Card className="border-destructive/50">
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Com Erro</p>
        <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Tarefas</p>
        <p className="text-2xl font-bold">{stats.totalTasks}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Na Fila</p>
        <p className="text-2xl font-bold">{stats.queuedTasks}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Sucesso</p>
        <p className="text-2xl font-bold">{stats.avgSuccessRate}%</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Custo Total</p>
        <p className="text-2xl font-bold">${stats.totalCost}</p>
      </CardContent>
    </Card>
  </div>
);
