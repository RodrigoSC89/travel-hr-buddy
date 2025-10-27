// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workflow,
  Play,
  Save,
  Plus,
  Trash2,
  Database,
  Zap,
  Bell,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const nodeTypes = [
  { type: "trigger", label: "Trigger", icon: Zap, color: "bg-yellow-100 border-yellow-300" },
  { type: "database", label: "Database Query", icon: Database, color: "bg-blue-100 border-blue-300" },
  { type: "ai_analysis", label: "AI Analysis", icon: Sparkles, color: "bg-purple-100 border-purple-300" },
  { type: "notification", label: "Send Notification", icon: Bell, color: "bg-green-100 border-green-300" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "bg-orange-100 border-orange-300" },
  { type: "delay", label: "Delay/Wait", icon: Clock, color: "bg-gray-100 border-gray-300" },
];

const MissionWorkflowBuilder = () => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [executing, setExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [selectedNodeConfig, setSelectedNodeConfig] = useState(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from("mission_workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error("Error loading workflows:", error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const nodeType = nodeTypes.find((n) => n.type === type);
    const newNode: Node = {
      id: `${type}-${nodes.length + 1}`,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: (
          <div className="flex items-center gap-2">
            {React.createElement(nodeType.icon, { className: "h-4 w-4" })}
            <span>{nodeType.label}</span>
          </div>
        ),
        config: {
          type: type,
          name: `${nodeType.label} ${nodes.length + 1}`,
          params: {},
        },
      },
      className: `${nodeType.color} border-2 rounded-lg px-4 py-2`,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const saveWorkflow = async () => {
    if (!workflowName) {
      toast({
        title: "Validation Error",
        description: "Please provide a workflow name",
        variant: "destructive",
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Workflow must have at least one node",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const workflowDefinition = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.config.type,
          position: n.position,
          config: n.data.config,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
      };

      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        workflow_definition: workflowDefinition,
        status: "active",
        created_by: user?.id,
      };

      let result;
      if (currentWorkflow) {
        result = await supabase
          .from("mission_workflows")
          .update(workflowData)
          .eq("id", currentWorkflow.id);
      } else {
        result = await supabase
          .from("mission_workflows")
          .insert([workflowData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Workflow ${currentWorkflow ? "updated" : "saved"} successfully`,
      });

      setShowSaveDialog(false);
      setWorkflowName("");
      setWorkflowDescription("");
      loadWorkflows();
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    }
  };

  const loadWorkflow = (workflow) => {
    setCurrentWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);

    const definition = workflow.workflow_definition;
    
    // Reconstruct nodes
    const loadedNodes = definition.nodes.map((n) => {
      const nodeType = nodeTypes.find((nt) => nt.type === n.type);
      return {
        id: n.id,
        type: "default",
        position: n.position,
        data: {
          label: (
            <div className="flex items-center gap-2">
              {React.createElement(nodeType.icon, { className: "h-4 w-4" })}
              <span>{nodeType.label}</span>
            </div>
          ),
          config: n.config,
        },
        className: `${nodeType.color} border-2 rounded-lg px-4 py-2`,
      };
    });

    // Reconstruct edges
    const loadedEdges = definition.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    setNodes(loadedNodes);
    setEdges(loadedEdges);

    toast({
      title: "Workflow Loaded",
      description: `Loaded workflow: ${workflow.name}`,
    });
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Cannot execute empty workflow",
        variant: "destructive",
      });
      return;
    }

    setExecuting(true);
    const executionId = `exec-${Date.now()}`;
    const logs = [];

    try {
      // Log execution start
      logs.push({
        step: "start",
        status: "success",
        message: "Workflow execution started",
        timestamp: new Date().toISOString(),
      });

      // Process nodes in order (simplified - in real implementation, follow edges)
      for (const node of nodes) {
        const config = node.data.config;
        
        logs.push({
          step: config.name,
          status: "running",
          message: `Executing ${config.type}...`,
          timestamp: new Date().toISOString(),
        });

        // Simulate node execution
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Execute based on node type
        switch (config.type) {
          case "database":
            // Simulate database query
            logs.push({
              step: config.name,
              status: "success",
              message: "Database query executed successfully",
              output: { rows: 10, duration: "45ms" },
              timestamp: new Date().toISOString(),
            });
            break;
          
          case "ai_analysis":
            // Simulate AI analysis
            logs.push({
              step: config.name,
              status: "success",
              message: "AI analysis completed",
              output: { confidence: 0.95, prediction: "optimal" },
              timestamp: new Date().toISOString(),
            });
            break;
          
          case "notification":
            // Simulate notification
            logs.push({
              step: config.name,
              status: "success",
              message: "Notification sent",
              output: { recipients: 3, method: "email" },
              timestamp: new Date().toISOString(),
            });
            break;
          
          default:
            logs.push({
              step: config.name,
              status: "success",
              message: "Step completed",
              timestamp: new Date().toISOString(),
            });
        }

        // Save log to database
        await supabase.from("mission_logs").insert({
          workflow_id: currentWorkflow?.id,
          execution_id: executionId,
          status: "success",
          step_name: config.name,
          step_output: logs[logs.length - 1].output || {},
        });
      }

      logs.push({
        step: "complete",
        status: "success",
        message: "Workflow execution completed successfully",
        timestamp: new Date().toISOString(),
      });

      setExecutionLogs(logs);
      setShowLogsDialog(true);
      setShowExecuteDialog(false);

      toast({
        title: "Execution Complete",
        description: "Workflow executed successfully",
      });
    } catch (error) {
      console.error("Error executing workflow:", error);
      logs.push({
        step: "error",
        status: "error",
        message: error.message || "Execution failed",
        timestamp: new Date().toISOString(),
      });
      setExecutionLogs(logs);
      setShowLogsDialog(true);
      
      toast({
        title: "Execution Failed",
        description: "An error occurred during execution",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setCurrentWorkflow(null);
    setWorkflowName("");
    setWorkflowDescription("");
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Workflow className="h-6 w-6" />
              Mission Control: Workflow Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Design and execute tactical operational workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLogsDialog(true)}>
              View Logs
            </Button>
            <Button variant="outline" onClick={clearCanvas}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setShowExecuteDialog(true)} disabled={nodes.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-64 border-r bg-muted/30 p-4">
          <h3 className="font-semibold mb-3">Node Types</h3>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {nodeTypes.map((nodeType) => (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode(nodeType.type)}
                >
                  {React.createElement(nodeType.icon, { className: "h-4 w-4 mr-2" })}
                  {nodeType.label}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Saved Workflows</h3>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <Button
                    key={wf.id}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => loadWorkflow(wf)}
                  >
                    <Workflow className="h-3 w-3 mr-2" />
                    {wf.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-right">
              <Card className="w-64">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nodes:</span>
                      <span className="font-medium">{nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="font-medium">{edges.length}</span>
                    </div>
                    {currentWorkflow && (
                      <div className="pt-2 border-t">
                        <p className="font-medium">{currentWorkflow.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workflow</DialogTitle>
            <DialogDescription>
              Provide a name and description for this workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Daily Vessel Check"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveWorkflow}>Save Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Workflow</DialogTitle>
            <DialogDescription>
              This will execute all nodes in the workflow in sequence
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Workflow Summary:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {nodes.length} nodes to execute</li>
                <li>• {edges.length} connections</li>
                <li>• Estimated time: {nodes.length * 2} seconds</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeWorkflow} disabled={executing}>
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Execution Logs</DialogTitle>
            <DialogDescription>
              Detailed logs from workflow execution
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {executionLogs.length > 0 ? (
                executionLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      log.status === "success"
                        ? "bg-green-50 border-green-200"
                        : log.status === "error"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {log.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {log.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {log.status === "running" && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                        <span className="font-medium">{log.step}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                    {log.output && (
                      <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No execution logs available
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowLogsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissionWorkflowBuilder;
