/**
 * PATCH 422 - Coordination AI v1
 * Multi-agent coordination and orchestration system
 * 
 * Features:
 * - Task visualization by agent
 * - Decision engine with context-based routing
 * - Integration with Mission Control and Agent Swarm
 * - Comprehensive decision and execution logging
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Network,
  Activity,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
  Database,
  List,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

interface Agent {
  id: string;
  name: string;
  type: "drone" | "surface" | "analytics" | "mission";
  status: "idle" | "active" | "busy" | "offline";
  currentTask?: string;
  tasksCompleted: number;
  efficiency: number;
}

interface Task {
  id: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "in_progress" | "completed" | "failed";
  assignedTo?: string;
  startTime?: number;
  endTime?: number;
}

interface Decision {
  id: string;
  timestamp: number;
  context: string;
  decision: string;
  agent: string;
  confidence: number;
  outcome?: string;
}

export default function CoordinationAI() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isCoordinating, setIsCoordinating] = useState(false);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    tasksCompleted: 0,
    avgEfficiency: 0,
    decisionsLogged: 0
  });

  useEffect(() => {
    logger.info("Coordination AI initialized - PATCH 422");
    initializeAgents();
    loadDecisionLogs();
  }, []);

  useEffect(() => {
    if (isCoordinating) {
      const interval = setInterval(() => {
        updateAgentStatuses();
        processTaskQueue();
        updateStats();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isCoordinating, agents, tasks]);

  const initializeAgents = () => {
    const initialAgents: Agent[] = [
      {
        id: "drone-01",
        name: "Underwater Drone Alpha",
        type: "drone",
        status: "idle",
        tasksCompleted: 0,
        efficiency: 95
      },
      {
        id: "surface-01",
        name: "Surface Bot Beta",
        type: "surface",
        status: "idle",
        tasksCompleted: 0,
        efficiency: 92
      },
      {
        id: "analytics-01",
        name: "Analytics Engine",
        type: "analytics",
        status: "idle",
        tasksCompleted: 0,
        efficiency: 98
      },
      {
        id: "mission-01",
        name: "Mission Controller",
        type: "mission",
        status: "idle",
        tasksCompleted: 0,
        efficiency: 94
      }
    ];
    setAgents(initialAgents);

    // Create initial task queue
    const initialTasks: Task[] = [
      {
        id: "task-01",
        description: "Bathymetric scanning of sector A",
        priority: "high",
        status: "pending"
      },
      {
        id: "task-02",
        description: "Analyze weather patterns",
        priority: "medium",
        status: "pending"
      },
      {
        id: "task-03",
        description: "Monitor surface conditions",
        priority: "low",
        status: "pending"
      },
      {
        id: "task-04",
        description: "Route optimization calculation",
        priority: "high",
        status: "pending"
      }
    ];
    setTasks(initialTasks);

    logger.info("Agents initialized", { agentCount: initialAgents.length, taskCount: initialTasks.length });
  };

  const loadDecisionLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("coordination_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        const mappedDecisions: Decision[] = data.map(d => ({
          id: d.id,
          timestamp: new Date(d.created_at).getTime(),
          context: d.context || "",
          decision: d.decision || "",
          agent: d.agent || "Unknown",
          confidence: d.confidence || 0,
          outcome: d.outcome
        }));
        setDecisions(mappedDecisions);
        logger.info("Decision logs loaded", { count: mappedDecisions.length });
      }
    } catch (error) {
      logger.warn("Failed to load decision logs", { error });
    }
  };

  const makeDecision = async (context: string, task: Task): Promise<string> => {
    // Decision engine logic
    const availableAgents = agents.filter(a => a.status === "idle");
    
    if (availableAgents.length === 0) {
      return "all-busy";
    }

    // Match task to appropriate agent type
    let selectedAgent: Agent | undefined;
    
    if (task.description.includes("scan") || task.description.includes("Bathymetric")) {
      selectedAgent = availableAgents.find(a => a.type === "drone");
    } else if (task.description.includes("weather") || task.description.includes("Analyze")) {
      selectedAgent = availableAgents.find(a => a.type === "analytics");
    } else if (task.description.includes("Monitor") || task.description.includes("surface")) {
      selectedAgent = availableAgents.find(a => a.type === "surface");
    } else if (task.description.includes("Route") || task.description.includes("optimize")) {
      selectedAgent = availableAgents.find(a => a.type === "mission");
    }

    // Fallback to any available agent
    if (!selectedAgent) {
      selectedAgent = availableAgents[0];
    }

    // Log decision
    const decision: Decision = {
      id: `dec-${Date.now()}`,
      timestamp: Date.now(),
      context: `Assigning task ${task.id} to ${selectedAgent.name}`,
      decision: `Agent selected based on ${context}`,
      agent: selectedAgent.id,
      confidence: 0.85 + Math.random() * 0.15
    };

    setDecisions(prev => [decision, ...prev].slice(0, 50));

    // Store in database
    try {
      await supabase.from("coordination_decisions").insert({
        context: decision.context,
        decision: decision.decision,
        agent: decision.agent,
        confidence: decision.confidence,
        task_id: task.id
      });
    } catch (error) {
      logger.warn("Failed to store decision log", { error });
    }

    logger.info("Decision made", { taskId: task.id, agent: selectedAgent.name });
    return selectedAgent.id;
  };

  const processTaskQueue = async () => {
    const pendingTasks = tasks.filter(t => t.status === "pending");
    
    for (const task of pendingTasks.slice(0, 1)) {
      const agentId = await makeDecision("task priority and agent availability", task);
      
      if (agentId !== "all-busy") {
        // Update task
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, status: "assigned", assignedTo: agentId, startTime: Date.now() }
            : t
        ));

        // Update agent
        setAgents(prev => prev.map(a => 
          a.id === agentId 
            ? { ...a, status: "busy", currentTask: task.description }
            : a
        ));

        // Simulate task completion
        setTimeout(() => {
          completeTask(task.id, agentId);
        }, 5000 + Math.random() * 5000);
      }
    }
  };

  const completeTask = (taskId: string, agentId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: "completed", endTime: Date.now() }
        : t
    ));

    setAgents(prev => prev.map(a => 
      a.id === agentId 
        ? { 
            ...a, 
            status: "idle", 
            currentTask: undefined,
            tasksCompleted: a.tasksCompleted + 1,
            efficiency: Math.min(99, a.efficiency + 0.5)
          }
        : a
    ));

    logger.info("Task completed", { taskId, agentId });
  };

  const updateAgentStatuses = () => {
    // Simulate random status changes for realism
    setAgents(prev => prev.map(agent => {
      if (agent.status === "idle" && Math.random() > 0.95) {
        return { ...agent, status: "active" };
      }
      return agent;
    }));
  };

  const updateStats = () => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status !== "offline").length;
    const tasksCompleted = tasks.filter(t => t.status === "completed").length;
    const avgEfficiency = agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length;
    const decisionsLogged = decisions.length;

    setStats({
      totalAgents,
      activeAgents,
      tasksCompleted,
      avgEfficiency,
      decisionsLogged
    });
  };

  const startCoordination = () => {
    setIsCoordinating(true);
    toast.success("Coordination AI activated");
    logger.info("Coordination AI started");
  };

  const stopCoordination = () => {
    setIsCoordinating(false);
    toast.info("Coordination AI paused");
    logger.info("Coordination AI stopped");
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "idle": return "bg-gray-500/10 text-gray-500";
      case "active": return "bg-green-500/10 text-green-500";
      case "busy": return "bg-blue-500/10 text-blue-500";
      case "offline": return "bg-red-500/10 text-red-500";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low": return "bg-gray-500/10 text-gray-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "high": return "bg-orange-500/10 text-orange-500";
      case "critical": return "bg-red-500/10 text-red-500";
    }
  };

  const getTaskStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "assigned": return <Users className="h-4 w-4" />;
      case "in_progress": return <Activity className="h-4 w-4 animate-pulse" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "failed": return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Coordination AI
          </h1>
          <p className="text-muted-foreground">
            PATCH 422 - Multi-agent coordination and orchestration system
          </p>
        </div>
        <Badge variant="outline" className={isCoordinating ? "text-green-600" : "text-gray-600"}>
          {isCoordinating ? (
            <>
              <Activity className="h-4 w-4 mr-1 animate-pulse" />
              Coordinating
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Standby
            </>
          )}
        </Badge>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
              </div>
              <Network className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAgents}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-2xl font-bold text-purple-600">{stats.tasksCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgEfficiency.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Decisions</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.decisionsLogged}</p>
              </div>
              <Database className="h-8 w-8 text-cyan-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Button */}
      <div className="flex gap-2">
        {!isCoordinating ? (
          <Button onClick={startCoordination} className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Start Coordination
          </Button>
        ) : (
          <Button onClick={stopCoordination} variant="destructive" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Pause Coordination
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
          <TabsTrigger value="decisions">Decision Logs</TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Agents
              </CardTitle>
              <CardDescription>Real-time status of all coordinated agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <div key={agent.id} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{agent.type} Agent</p>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    {agent.currentTask && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        Current: {agent.currentTask}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasks Completed</p>
                        <p className="font-semibold">{agent.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Efficiency</p>
                        <p className="font-semibold">{agent.efficiency}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Task Queue
              </CardTitle>
              <CardDescription>Current and completed tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {getTaskStatusIcon(task.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.description}</p>
                          {task.assignedTo && (
                            <p className="text-xs text-muted-foreground">
                              Assigned to: {agents.find(a => a.id === task.assignedTo)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Decision Logs
              </CardTitle>
              <CardDescription>AI decision history and outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              {decisions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No decisions logged yet. Start coordination to begin logging.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {decisions.map(decision => (
                    <div key={decision.id} className="p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{decision.context}</p>
                          <p className="text-xs text-muted-foreground mt-1">{decision.decision}</p>
                        </div>
                        <Badge variant="outline">
                          {(decision.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Agent: {decision.agent}</span>
                        <span>•</span>
                        <span>{new Date(decision.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
