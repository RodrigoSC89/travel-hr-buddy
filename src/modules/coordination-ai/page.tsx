/**
 * PATCH 538 - Coordination AI Page
 * UI for multi-agent coordination system
 */

import React, { useState } from "react";
import { useCoordination } from "@/hooks/useCoordination";
import { Agent, AgentState, AgentType } from "@/lib/coordination/logic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Sparkles,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const stateIcons: Record<AgentState, React.ReactNode> = {
  idle: <Clock className="w-4 h-4" />,
  active: <Activity className="w-4 h-4" />,
  waiting: <RefreshCw className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  offline: <XCircle className="w-4 h-4" />
};

const stateColors: Record<AgentState, string> = {
  idle: "bg-gray-500",
  active: "bg-green-500",
  waiting: "bg-yellow-500",
  error: "bg-red-500",
  offline: "bg-gray-700"
};

export default function CoordinationAIPage() {
  const {
    agents,
    actions,
    rules,
    isExecuting,
    lastExecution,
    registerAgent,
    updateAgent,
    removeAgent,
    executeCoordination,
    getAIRecommendation,
    toggleRule,
    clearAll
  } = useCoordination({
    enableMQTT: false,
    enableSupabase: false,
    autoExecute: false
  });

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showAddAgent, setShowAddAgent] = useState(false);

  // Demo: Add sample agents
  const addSampleAgents = () => {
    const sampleAgents: Omit<Agent, "lastUpdate">[] = [
      {
        id: "drone-1",
        name: "Drone Alpha",
        type: "drone" as AgentType,
        state: "idle" as AgentState,
        position: { lat: -23.5505, lng: -46.6333, alt: 100 },
        battery: 85
      },
      {
        id: "sensor-1",
        name: "Sensor Station 1",
        type: "sensor" as AgentType,
        state: "active" as AgentState,
        position: { lat: -23.5515, lng: -46.6343 },
        battery: 92
      },
      {
        id: "satellite-1",
        name: "Satellite Observer",
        type: "satellite" as AgentType,
        state: "active" as AgentState,
        battery: 100
      }
    ];

    sampleAgents.forEach(agent => registerAgent(agent));
  };

  // Simulate state change for demo
  const simulateStateChange = (agentId: string) => {
    const states: AgentState[] = ["idle", "active", "waiting", "error"];
    const currentAgent = agents.find(a => a.id === agentId);
    if (!currentAgent) return;

    const currentIndex = states.indexOf(currentAgent.state);
    const nextState = states[(currentIndex + 1) % states.length];
    
    updateAgent(agentId, { 
      state: nextState,
      battery: currentAgent.battery ? Math.max(0, currentAgent.battery - 5) : undefined
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coordination AI</h1>
          <p className="text-muted-foreground">
            Multi-agent coordination system with AI-powered recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addSampleAgents}
            disabled={agents.length > 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Agents
          </Button>
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={agents.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={executeCoordination}
            disabled={isExecuting || agents.length === 0}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Coordination
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.state === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {lastExecution ? lastExecution.toLocaleTimeString() : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agents</CardTitle>
            <CardDescription>
              Current status of all registered agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No agents registered. Click "Add Sample Agents" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedAgent === agent.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-3 h-3 rounded-full", stateColors[agent.state])} />
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {agent.type} • {agent.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.battery !== undefined && (
                            <Badge variant="outline">
                              {agent.battery}% Battery
                            </Badge>
                          )}
                          <Badge variant="secondary" className="gap-1">
                            {stateIcons[agent.state]}
                            {agent.state}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              simulateStateChange(agent.id);
                            }}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              getAIRecommendation(agent.id);
                            }}
                          >
                            <Sparkles className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAgent(agent.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {agent.position && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Position: {agent.position.lat.toFixed(4)}, {agent.position.lng.toFixed(4)}
                          {agent.position.alt && ` @ ${agent.position.alt}m`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules and Actions */}
        <div className="space-y-6">
          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Coordination Rules</CardTitle>
              <CardDescription>
                Active rules governing agent behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{rule.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Priority: {rule.priority}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={rule.enabled ? "default" : "outline"}
                      onClick={() => toggleRule(rule.id, !rule.enabled)}
                    >
                      {rule.enabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>
                Actions generated by coordination engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No actions yet. Execute coordination to generate actions.
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.slice(0, 5).map((action, index) => (
                    <div key={index} className="p-2 rounded border">
                      <div className="text-sm font-medium">{action.action}</div>
                      <div className="text-xs text-muted-foreground">
                        Agent: {action.agentId}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {action.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
