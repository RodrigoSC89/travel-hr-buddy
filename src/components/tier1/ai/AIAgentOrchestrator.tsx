/**
 * AI Agent Orchestrator - Tier-1 Component
 * Multi-agent system visualization and management
 * Based on enterprise AI orchestration patterns
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, Bot, Zap, Activity, Clock, CheckCircle, AlertTriangle,
  Play, Pause, Settings, Eye, MessageSquare, TrendingUp, Target
} from "lucide-react";

// Sample agent data
const aiAgents = [
  {
    id: "compliance-auditor",
    name: "Compliance Auditor",
    status: "active",
    type: "CORE",
    model: "GPT-4o",
    tasksToday: 45,
    accuracy: 98.5,
    avgResponseTime: 1.2,
    lastActive: "2 min ago",
    description: "Automated compliance checking for MLC 2006, STCW, ISM/ISPS",
  },
  {
    id: "document-analyzer",
    name: "Document Analyzer",
    status: "active",
    type: "CORE",
    model: "GPT-4o",
    tasksToday: 128,
    accuracy: 97.2,
    avgResponseTime: 2.5,
    lastActive: "Just now",
    description: "OCR and intelligent document classification",
  },
  {
    id: "maintenance-predictor",
    name: "Maintenance Predictor",
    status: "active",
    type: "CORE",
    model: "Gemini 2.0",
    tasksToday: 67,
    accuracy: 94.8,
    avgResponseTime: 3.1,
    lastActive: "5 min ago",
    description: "Predictive maintenance scheduling based on equipment data",
  },
  {
    id: "crew-optimizer",
    name: "Crew Optimizer",
    status: "paused",
    type: "SWARM",
    model: "Claude 3",
    tasksToday: 12,
    accuracy: 96.3,
    avgResponseTime: 1.8,
    lastActive: "1 hour ago",
    description: "Crew rotation optimization with MLC compliance",
  },
  {
    id: "voyage-analyst",
    name: "Voyage Analyst",
    status: "active",
    type: "CORE",
    model: "GPT-4o",
    tasksToday: 34,
    accuracy: 95.7,
    avgResponseTime: 2.2,
    lastActive: "10 min ago",
    description: "Real-time voyage P&L analysis and optimization",
  },
  {
    id: "safety-monitor",
    name: "Safety Monitor",
    status: "active",
    type: "AUDIT",
    model: "Gemini 2.0",
    tasksToday: 89,
    accuracy: 99.1,
    avgResponseTime: 0.8,
    lastActive: "Just now",
    description: "Real-time safety incident detection and alerting",
  },
];

const recentTasks = [
  { agent: "Document Analyzer", task: "Analyzed crew certificate", status: "completed", time: "2 min ago", confidence: 98 },
  { agent: "Compliance Auditor", task: "Verified MLC 4.1 compliance", status: "completed", time: "5 min ago", confidence: 96 },
  { agent: "Safety Monitor", task: "Processed incident report", status: "completed", time: "8 min ago", confidence: 99 },
  { agent: "Maintenance Predictor", task: "Predicted engine maintenance", status: "completed", time: "12 min ago", confidence: 92 },
  { agent: "Voyage Analyst", task: "Calculated voyage TCE", status: "in_progress", time: "Now", confidence: 0 },
];

export default function AIAgentOrchestrator() {
  const [agents, setAgents] = useState(aiAgents);

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'paused' : 'active' }
        : agent
    ));
  };

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksToday, 0);
  const avgAccuracy = agents.reduce((sum, a) => sum + a.accuracy, 0) / agents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Agent Orchestrator
          </h2>
          <p className="text-muted-foreground">
            Multi-agent system management and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
            <Zap className="h-3 w-3 mr-1" />
            Multi-Model Consensus
          </Badge>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Agents</p>
            <p className="text-2xl font-bold text-success">{activeAgents}/{agents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tasks Today</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Response</p>
            <p className="text-2xl font-bold">1.9s</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className={`transition-all ${agent.status === 'active' ? 'border-success/50' : 'opacity-60'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${agent.status === 'active' ? 'bg-success/10' : 'bg-muted'}`}>
                    <Bot className={`h-5 w-5 ${agent.status === 'active' ? 'text-success' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{agent.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{agent.model}</Badge>
                    </div>
                  </div>
                </div>
                <Switch 
                  checked={agent.status === 'active'}
                  onCheckedChange={() => toggleAgent(agent.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">{agent.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Tasks</p>
                  <p className="font-bold">{agent.tasksToday}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Accuracy</p>
                  <p className="font-bold">{agent.accuracy}%</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-muted-foreground">Response</p>
                  <p className="font-bold">{agent.avgResponseTime}s</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {agent.lastActive}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Agent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.task} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${task.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'}`}>
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Activity className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.agent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {task.confidence > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="font-bold text-sm">{task.confidence}%</p>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
