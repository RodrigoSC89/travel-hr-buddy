/**
 * Agent Orchestration - Orquestração de Agentes IA
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Play, Pause, RefreshCw, Activity, CheckCircle2 } from "lucide-react";

const agents = [
  { id: 1, name: "Document Analyzer", status: "running", tasks: 45, success: 98 },
  { id: 2, name: "Crew Scheduler", status: "idle", tasks: 23, success: 95 },
  { id: 3, name: "Compliance Monitor", status: "running", tasks: 67, success: 99 },
  { id: 4, name: "Maintenance Predictor", status: "paused", tasks: 12, success: 92 },
];

export default function AgentOrchestration() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Orquestração de Agentes</h2>
            <p className="text-muted-foreground">Gerencie agentes IA autônomos</p>
          </div>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id} 
            className={`cursor-pointer transition-all ${selectedAgent === agent.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedAgent(agent.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <Badge 
                  variant={agent.status === "running" ? "default" : agent.status === "paused" ? "secondary" : "outline"}
                >
                  {agent.status === "running" ? "Executando" : agent.status === "paused" ? "Pausado" : "Ocioso"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{agent.tasks} tarefas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{agent.success}% sucesso</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Play className="h-3 w-3 mr-1" />
                  Iniciar
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="h-3 w-3 mr-1" />
                  Pausar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
