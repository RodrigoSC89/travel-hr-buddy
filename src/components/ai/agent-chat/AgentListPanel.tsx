/**
 * Agent List sidebar panel
 */
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import type { Agent } from "./types";

interface AgentListPanelProps {
  agents: Agent[];
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
}

export const AgentListPanel: React.FC<AgentListPanelProps> = ({ agents, selectedAgent, onSelectAgent }) => (
  <Card className="lg:col-span-1">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Agentes IA</CardTitle>
      <CardDescription>Selecione um agente para conversar</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {agents.map((agent) => (
        <div
          key={agent.id}
          onClick={() => onSelectAgent(agent)}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            selectedAgent.id === agent.id
              ? "bg-primary/10 border border-primary"
              : "hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              agent.status === "active" ? "bg-success/20"
                : agent.status === "busy" ? "bg-warning/20"
                : "bg-muted"
            }`}>
              <Bot className={`h-4 w-4 ${
                agent.status === "active" ? "text-success"
                  : agent.status === "busy" ? "text-warning"
                  : "text-muted-foreground"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{agent.name}</p>
              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{agent.stats.success_rate}% sucesso</span>
            <span>•</span>
            <span>{agent.stats.avg_response_ms}ms</span>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);
