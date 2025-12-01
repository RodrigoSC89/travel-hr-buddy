/**
 * PATCH 536 - Coordination AI Engine v1.0
 * Multi-agent coordination system with priority-based task distribution
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Network,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { coordinationAIService } from "@/services/coordinationAIService";
import { logger } from "@/lib/logger";
import type {
  CoordinationAgent,
  CoordinationTask,
  CoordinationDecision,
  AgentType,
  TaskStatus,
} from "@/types/patches-536-540";

const CoordinationAIEnginePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [agents, setAgents] = useState<CoordinationAgent[]>([]);
  const [tasks, setTasks] = useState<CoordinationTask[]>([]);
  const [decisions, setDecisions] = useState<CoordinationDecision[]>([]);
  const [statistics, setStatistics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
  });
  const [loading, setLoading] = useState(false);

  // Form states
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentType, setNewAgentType] = useState<AgentType>("analyzer");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskType, setNewTaskType] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(5);

  useEffect(() => {
    loadData();
    
    // Refresh every 10 seconds (increased from 5s)
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [agentsData, tasksData, decisionsData, statsData] = await Promise.all([
        coordinationAIService.getAgents(),
        coordinationAIService.getTasks(),
        coordinationAIService.getAllDecisions(20),
        coordinationAIService.getStatistics(),
      ]);

      setAgents(agentsData);
      setTasks(tasksData);
      setDecisions(decisionsData);
      setStatistics(statsData);
    } catch (error) {
      logger.error("Error loading coordination AI data", { error });
    }
  };

  const handleRegisterAgent = async () => {
    if (!newAgentName) {
      toast.error("Please provide an agent name");
      return;
    }

    setLoading(true);
    try {
      const agent = await coordinationAIService.registerAgent({
        agent_name: newAgentName,
        agent_type: newAgentType,
        capabilities: [`${newAgentType}_capability`, "general"],
        status: "idle",
        priority_level: 5,
        max_concurrent_tasks: 3,
        metadata: {},
      });

      if (agent) {
        toast.success(`Agent ${newAgentName} registered successfully`);
        setNewAgentName("");
        loadData();
      } else {
        toast.error("Failed to register agent");
      }
    } catch (error) {
      logger.error("Error registering coordination agent", { error, agentName: newAgentName, agentType: newAgentType });
      toast.error("Error registering agent");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskName || !newTaskType) {
      toast.error("Please provide task name and type");
      return;
    }

    setLoading(true);
    try {
      const task = await coordinationAIService.createTask({
        task_name: newTaskName,
        task_type: newTaskType,
        priority: newTaskPriority,
        required_capabilities: [`${newAgentType}_capability`],
        payload: { created_from: "coordination_ui" },
        timeout_seconds: 300,
      });

      if (task) {
        toast.success(`Task ${newTaskName} created and assigned`);
        setNewTaskName("");
        setNewTaskType("");
        loadData();
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      logger.error("Error creating coordination task", { error, taskName: newTaskName, taskType: newTaskType });
      toast.error("Error creating task");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      idle: "bg-gray-500",
      active: "bg-blue-500",
      busy: "bg-yellow-500",
      error: "bg-red-500",
      offline: "bg-gray-400",
      pending: "bg-yellow-500",
      assigned: "bg-blue-500",
      processing: "bg-purple-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
      timeout: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "failed":
    case "timeout":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "processing":
      return <Activity className="w-4 h-4 text-purple-500 animate-pulse" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <PlayCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="w-8 h-8 text-primary" />
            Coordination AI Engine v1.0
          </h1>
          <p className="text-muted-foreground mt-1">
            Multi-agent coordination with priority-based task distribution
          </p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.pendingTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.completedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.failedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalTasks > 0
                ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="decisions">Decisions Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Register Agent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Register New Agent
                </CardTitle>
                <CardDescription>
                  Add a new agent to the coordination system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g., Analyzer Agent 1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select value={newAgentType} onValueChange={(v) => setNewAgentType(v as AgentType)}>
                    <SelectTrigger id="agent-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llm">LLM</SelectItem>
                      <SelectItem value="copilot">Copilot</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="drone">Drone</SelectItem>
                      <SelectItem value="analyzer">Analyzer</SelectItem>
                      <SelectItem value="executor">Executor</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleRegisterAgent} disabled={loading} className="w-full">
                  Register Agent
                </Button>
              </CardContent>
            </Card>

            {/* Create Task */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Create New Task
                </CardTitle>
                <CardDescription>
                  Create and auto-assign a coordination task
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input
                    id="task-name"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="e.g., Analyze sensor data"
                  />
                </div>
                <div>
                  <Label htmlFor="task-type">Task Type</Label>
                  <Input
                    id="task-type"
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    placeholder="e.g., analysis"
                  />
                </div>
                <div>
                  <Label htmlFor="task-priority">
                    Priority: {newTaskPriority}
                  </Label>
                  <Input
                    id="task-priority"
                    type="range"
                    min="1"
                    max="10"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(parseInt(e.target.value))}
                  />
                </div>
                <Button onClick={handleCreateTask} disabled={loading} className="w-full">
                  Create Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Registered Agents</CardTitle>
              <CardDescription>
                View all agents and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No agents registered yet
                  </p>
                ) : (
                  agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                        <div>
                          <h4 className="font-medium">{agent.agent_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Type: {agent.agent_type} | Priority: {agent.priority_level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{agent.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tasks: {agent.current_task_count}/{agent.max_concurrent_tasks}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Coordination Tasks</CardTitle>
              <CardDescription>
                Monitor task execution and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks created yet
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium">{task.task_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Type: {task.task_type} | Priority: {task.priority}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {task.error_message && (
                          <p className="text-xs text-red-500 mt-1 max-w-xs">
                            {task.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Log Tab */}
        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Central Decision Log
              </CardTitle>
              <CardDescription>
                View all coordination decisions and reasoning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decisions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No decisions logged yet
                  </p>
                ) : (
                  decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge>{decision.decision_type}</Badge>
                        {decision.confidence_score && (
                          <span className="text-sm text-muted-foreground">
                            Confidence: {decision.confidence_score}%
                          </span>
                        )}
                      </div>
                      {decision.reasoning && (
                        <p className="text-sm">{decision.reasoning}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(decision.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinationAIEnginePage;
