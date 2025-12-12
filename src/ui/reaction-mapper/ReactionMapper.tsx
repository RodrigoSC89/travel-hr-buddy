/**
import { useCallback, useEffect, useMemo, useState } from "react";;
 * PATCH 578 - Multilayer Reaction Mapper Component
 * Interactive visualization of multi-layer reaction system
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Users, 
  Cpu,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import {
  DecisionNode,
  DecisionPath,
  ReactionScenario,
  ReactionLogEntry,
  ReactionMapperState,
  ReactionLayer,
  NodeStatus,
  ReactionMetrics,
} from "./types";
import { situationalAwareness } from "@/ai/situational-awareness";
import { tacticalResponse } from "@/ai/tactical-response";
import { BridgeLink } from "@/core/BridgeLink";

/**
 * Props for ReactionMapper component
 */
interface ReactionMapperProps {
  scenario?: ReactionScenario;
  onScenarioChange?: (scenario: ReactionScenario) => void;
  integrateWithControlHub?: boolean;
}

/**
 * Multilayer Reaction Mapper Component
 */
export const ReactionMapper: React.FC<ReactionMapperProps> = ({
  scenario,
  onScenarioChange,
  integrateWithControlHub = true,
}) => {
  const [state, setState] = useState<ReactionMapperState>({
    currentScenario: scenario,
    activeNodes: new Set(),
    completedNodes: new Set(),
    failedNodes: new Set(),
    logs: [],
    simulationMode: false,
    simulationSpeed: 1,
});

  const [selectedNode, setSelectedNode] = useState<DecisionNode | null>(null);
  const [metrics, setMetrics] = useState<ReactionMetrics | null>(null);

  /**
   * Calculate metrics from current state
   */
  const calculateMetrics = useCallback((): ReactionMetrics => {
    if (!state.currentScenario) {
      return {
        totalReactions: 0,
        averageReactionTime: 0,
        layerStatistics: [],
        pathExecutionRate: {},
        criticalPathTime: 0,
      };
    }

    const { nodes, paths } = state.currentScenario;
    const completedLogs = state.logs.filter(l => l.status === "completed");

    // Calculate layer statistics
    const layers: ReactionLayer[] = ["crew", "system", "ai"];
    const layerStatistics = layers.map(layer => {
      const layerNodes = nodes.filter(n => n.layer === layer);
      const completedNodes = layerNodes.filter(n => state.completedNodes.has(n.id));
      const failedNodes = layerNodes.filter(n => state.failedNodes.has(n.id));
      const automatedNodes = layerNodes.filter(n => n.metadata.automated);

      const averageResponseTime = completedNodes.reduce((sum, node) => 
        sum + (node.duration || 0), 0) / (completedNodes.length || 1);

      return {
        layer,
        totalDecisions: layerNodes.length,
        successfulDecisions: completedNodes.length,
        failedDecisions: failedNodes.length,
        averageResponseTime,
        automationRate: layerNodes.length > 0 
          ? (automatedNodes.length / layerNodes.length) * 100 
          : 0,
      };
    };

    // Calculate path execution rates
    const pathExecutionRate: Record<string, number> = {};
    paths.forEach(path => {
      const executions = state.logs.filter(l => 
        l.nodeId === path.fromNodeId || l.nodeId === path.toNodeId
      ).length;
      pathExecutionRate[path.id] = executions;
  };

    // Calculate critical path time
    const criticalPathTime = nodes.reduce((max, node) => {
      if (node.duration && node.duration > max) {
        return node.duration;
      }
      return max;
    }, 0);

    return {
      totalReactions: completedLogs.length,
      averageReactionTime: completedLogs.reduce((sum, log) => {
        const node = nodes.find(n => n.id === log.nodeId);
        return sum + (node?.duration || 0);
      }, 0) / (completedLogs.length || 1),
      layerStatistics,
      pathExecutionRate,
      criticalPathTime,
    };
  }, [state]);

  /**
   * Update metrics when state changes
   */
  useEffect(() => {
    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);
  }, [calculateMetrics]);

  /**
   * Start simulation
   */
  const startSimulation = useCallback(() => {
    if (!state.currentScenario) return;

    setState(prev => ({
      ...prev,
      simulationMode: true,
      activeNodes: new Set(),
      completedNodes: new Set(),
      failedNodes: new Set(),
      logs: [],
    }));

    // Trigger simulation event
    if (integrateWithControlHub) {
      BridgeLink.emit("reaction-mapper:simulation-started" as unknown, "ReactionMapper", {
        scenarioId: state.currentScenario.id,
        timestamp: Date.now(),
      };
    }

    // Simulate nodes execution
    simulateExecution();
  }, [state.currentScenario, integrateWithControlHub]);

  /**
   * Simulate execution of decision nodes
   */
  const simulateExecution = useCallback(async () => {
    if (!state.currentScenario) return;

    const { nodes } = state.currentScenario;
    const rootNodes = nodes.filter(n => !n.parentId);

    // Execute nodes layer by layer
    for (const rootNode of rootNodes) {
      await executeNodeTree(rootNode, nodes);
    }
  }, [state.currentScenario]);

  /**
   * Execute a node and its children
   */
  const executeNodeTree = async (node: DecisionNode, allNodes: DecisionNode[]): Promise<void> => {
    // Mark node as active
    setState(prev => ({
      ...prev,
      activeNodes: new Set([...prev.activeNodes, node.id]),
    }));

    // Add log entry
    const logEntry: ReactionLogEntry = {
      id: `log-${Date.now()}-${node.id}`,
      timestamp: Date.now(),
      layer: node.layer,
      nodeId: node.id,
      event: `Executing ${node.type}: ${node.title}`,
      actor: node.metadata.actor || "Unknown",
      status: "active",
      details: { ...node.metadata },
    };

    setState(prev => ({
      ...prev,
      logs: [...prev.logs, logEntry],
    }));

    // Simulate execution time
    const executionTime = node.duration || Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, executionTime / state.simulationSpeed));

    // Randomly succeed or fail (90% success rate)
    const success = Math.random() > 0.1;
    const finalStatus: NodeStatus = success ? "completed" : "failed";

    // Update node status
    setState(prev => {
      const newActiveNodes = new Set(prev.activeNodes);
      newActiveNodes.delete(node.id);

      const newCompleted = success ? new Set([...prev.completedNodes, node.id]) : prev.completedNodes;
      const newFailed = !success ? new Set([...prev.failedNodes, node.id]) : prev.failedNodes;

      return {
        ...prev,
        activeNodes: newActiveNodes,
        completedNodes: newCompleted,
        failedNodes: newFailed,
      };
    });

    // Update log
    setState(prev => ({
      ...prev,
      logs: prev.logs.map(log => 
        log.id === logEntry.id 
          ? { ...log, status: finalStatus, details: { ...log.details, executionTime } }
          : log
      ),
    }));

    // Execute children if successful
    if (success && node.children.length > 0) {
      const childNodes = allNodes.filter(n => node.children.includes(n.id));
      for (const child of childNodes) {
        await executeNodeTree(child, allNodes);
      }
    }
  };

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      simulationMode: false,
    }));

    if (integrateWithControlHub) {
      BridgeLink.emit("reaction-mapper:simulation-stopped" as unknown, "ReactionMapper", {
        timestamp: Date.now(),
      };
    }
  }, [integrateWithControlHub]);

  /**
   * Reset simulation
   */
  const resetSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeNodes: new Set(),
      completedNodes: new Set(),
      failedNodes: new Set(),
      logs: [],
      simulationMode: false,
    }));
  }, []);

  /**
   * Get layer icon
   */
  const getLayerIcon = (layer: ReactionLayer) => {
    switch (layer) {
    case "crew":
      return <Users className="h-4 w-4" />;
    case "system":
      return <Cpu className="h-4 w-4" />;
    case "ai":
      return <Zap className="h-4 w-4" />;
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: NodeStatus): string => {
    switch (status) {
    case "active":
      return "text-blue-500";
    case "completed":
      return "text-green-500";
    case "failed":
      return "text-red-500";
    case "pending":
      return "text-gray-400";
    case "bypassed":
      return "text-yellow-500";
    default:
      return "text-gray-400";
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
    case "active":
      return <Activity className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "failed":
      return <AlertCircle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
    }
  };

  /**
   * Render decision node
   */
  const renderNode = (node: DecisionNode) => {
    const isActive = state.activeNodes.has(node.id);
    const isCompleted = state.completedNodes.has(node.id);
    const isFailed = state.failedNodes.has(node.id);

    let status: NodeStatus = "pending";
    if (isActive) status = "active";
    else if (isCompleted) status = "completed";
    else if (isFailed) status = "failed";

    return (
      <Card
        key={node.id}
        className={`mb-2 cursor-pointer transition-all ${
          selectedNode?.id === node.id ? "ring-2 ring-blue-500" : ""
        } ${isActive ? "border-blue-500 shadow-lg" : ""}`}
        onClick={handleSetSelectedNode}
      >
        <CardHeader className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getLayerIcon(node.layer)}
              <div>
                <CardTitle className="text-sm">{node.title}</CardTitle>
                <CardDescription className="text-xs">{node.description}</CardDescription>
              </div>
            </div>
            <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <Badge variant="outline" className="text-xs">
                {node.layer}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  /**
   * Render layer section
   */
  const renderLayer = (layer: ReactionLayer) => {
    if (!state.currentScenario) return null;

    const layerNodes = state.currentScenario.nodes.filter(n => n.layer === layer);
    if (layerNodes.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {getLayerIcon(layer)}
          <h3 className="text-lg font-semibold capitalize">{layer} Layer</h3>
          <Badge variant="secondary">{layerNodes.length}</Badge>
        </div>
        <div className="space-y-2">
          {layerNodes.map(node => renderNode(node))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Multilayer Reaction Mapper</CardTitle>
            <CardDescription>
              Visualize and simulate multi-layer reaction paths
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={state.simulationMode ? "secondary" : "default"}
              onClick={state.simulationMode ? stopSimulation : startSimulation}
              disabled={!state.currentScenario}
            >
              {state.simulationMode ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Simulate
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetSimulation}
              disabled={!state.currentScenario}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layers">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="paths">Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="layers" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              {state.currentScenario ? (
                <>
                  {renderLayer("crew")}
                  <Separator className="my-4" />
                  {renderLayer("system")}
                  <Separator className="my-4" />
                  {renderLayer("ai")}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No scenario loaded. Please load or create a scenario.
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {state.logs.length > 0 ? (
                  state.logs.map(log => (
                    <Card key={log.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getLayerIcon(log.layer)}
                          <div>
                            <p className="text-sm font-medium">{log.event}</p>
                            <p className="text-xs text-gray-500">
                              {log.actor} · {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className={getStatusColor(log.status)}>
                          {getStatusIcon(log.status)}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No logs available. Start a simulation to see reaction logs.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <div className="space-y-4">
              {metrics && state.currentScenario ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-500">Total Reactions</p>
                          <p className="text-2xl font-bold">{metrics.totalReactions}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500">Avg Response Time</p>
                          <p className="text-2xl font-bold">
                            {Math.round(metrics.averageReactionTime)}ms
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Layer Statistics</h3>
                    <div className="space-y-3">
                      {metrics.layerStatistics.map(stat => (
                        <div key={stat.layer} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getLayerIcon(stat.layer)}
                              <span className="font-medium capitalize">{stat.layer}</span>
                            </div>
                            <Badge variant="outline">
                              {stat.successfulDecisions}/{stat.totalDecisions} success
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Avg Response: {Math.round(stat.averageResponseTime)}ms</p>
                            <p>Automation: {Math.round(stat.automationRate)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No metrics available. Run a simulation to see metrics.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="mt-4">
            <ScrollArea className="h-[600px]">
              {state.currentScenario && state.currentScenario.paths.length > 0 ? (
                <div className="space-y-2">
                  {state.currentScenario.paths.map(path => (
                    <Card key={path.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {path.fromNodeId} → {path.toNodeId}
                          </p>
                          <p className="text-xs text-gray-500">{path.type}</p>
                        </div>
                        <Badge variant={path.executed ? "default" : "outline"}>
                          {path.executed ? "Executed" : "Not executed"}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No decision paths available.
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReactionMapper;
