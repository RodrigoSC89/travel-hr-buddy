// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Play,
  Save,
  Trash2,
  Plus,
  Database,
  Sparkles,
  Bell,
  GitBranch,
  Clock,
  Zap,
  List,
  Download,
  Upload,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Node types configuration
const nodeTypes = [
  { type: 'trigger', label: 'Trigger', icon: Zap, color: 'bg-yellow-500' },
  { type: 'database', label: 'Database', icon: Database, color: 'bg-blue-500' },
  { type: 'ai_analysis', label: 'AI Analysis', icon: Sparkles, color: 'bg-purple-500' },
  { type: 'notification', label: 'Notification', icon: Bell, color: 'bg-green-500' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-orange-500' },
  { type: 'delay', label: 'Delay', icon: Clock, color: 'bg-gray-500' },
];

interface WorkflowLog {
  id: string;
  step_name: string;
  step_type: string;
  status: string;
  error_message?: string;
  timestamp: string;
  duration_ms: number;
}

export const WorkflowBuilder = () => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedNodeType, setSelectedNodeType] = useState('trigger');
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<WorkflowLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('mission_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading workflows',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = () => {
    const nodeConfig = nodeTypes.find((n) => n.type === selectedNodeType);
    if (!nodeConfig) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: (
          <div className="flex items-center gap-2 p-2">
            <nodeConfig.icon className="h-4 w-4" />
            <span>{nodeConfig.label}</span>
          </div>
        ),
        nodeType: selectedNodeType,
      },
      style: {
        background: nodeConfig.color.replace('bg-', '#'),
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '8px',
        padding: '10px',
      },
    };

    setNodes((nds) => [...nds, newNode]);

    toast({
      title: 'Node added',
      description: `${nodeConfig.label} node added to workflow`,
    });
  };

  const saveWorkflow = async () => {
    if (!workflowName) {
      toast({
        title: 'Name required',
        description: 'Please enter a workflow name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const workflowDefinition = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.nodeType,
          label: node.data.label,
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };

      const { data, error } = await supabase
        .from('mission_workflows')
        .insert({
          name: workflowName,
          description: workflowDescription,
          workflow_definition: workflowDefinition,
          status: 'active',
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Workflow saved',
        description: `Workflow "${workflowName}" has been saved successfully`,
      });

      setSelectedWorkflow(data);
      loadWorkflows();
    } catch (error: any) {
      toast({
        title: 'Error saving workflow',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadWorkflow = async (workflow: any) => {
    try {
      setSelectedWorkflow(workflow);
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description || '');

      if (workflow.workflow_definition) {
        const def = workflow.workflow_definition;

        // Reconstruct nodes
        const loadedNodes = def.nodes?.map((node: any) => {
          const nodeConfig = nodeTypes.find((n) => n.type === node.type);
          return {
            id: node.id,
            type: 'default',
            position: node.position,
            data: {
              label: (
                <div className="flex items-center gap-2 p-2">
                  {nodeConfig && <nodeConfig.icon className="h-4 w-4" />}
                  <span>{nodeConfig?.label || node.type}</span>
                </div>
              ),
              nodeType: node.type,
            },
            style: {
              background: nodeConfig?.color.replace('bg-', '#') || '#gray',
              color: 'white',
              border: '2px solid #fff',
              borderRadius: '8px',
              padding: '10px',
            },
          };
        }) || [];

        // Reconstruct edges
        const loadedEdges = def.edges?.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })) || [];

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      }

      toast({
        title: 'Workflow loaded',
        description: `Loaded workflow "${workflow.name}"`,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading workflow',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow) {
      toast({
        title: 'No workflow selected',
        description: 'Please save or load a workflow first',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    setExecutionLogs([]);
    setShowLogs(true);

    const executionId = `exec-${Date.now()}`;
    const logs: WorkflowLog[] = [];

    try {
      // Simulate workflow execution with logging
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const startTime = Date.now();

        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

        const duration = Date.now() - startTime;
        const status = Math.random() > 0.1 ? 'completed' : 'failed';

        const log: WorkflowLog = {
          id: `log-${Date.now()}-${i}`,
          step_name: `Step ${i + 1}`,
          step_type: node.data.nodeType,
          status,
          error_message: status === 'failed' ? 'Simulated error for testing' : undefined,
          timestamp: new Date().toISOString(),
          duration_ms: duration,
        };

        logs.push(log);
        setExecutionLogs([...logs]);

        // Save to database
        await supabase.from('mission_logs').insert({
          workflow_id: selectedWorkflow.id,
          execution_id: executionId,
          step_name: log.step_name,
          step_type: log.step_type,
          status: log.status,
          error_message: log.error_message,
          duration_ms: log.duration_ms,
          input_data: { node_id: node.id },
          output_data: status === 'completed' ? { result: 'success' } : null,
        });

        if (status === 'failed') break;
      }

      // Update workflow execution count
      await supabase
        .from('mission_workflows')
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: (selectedWorkflow.execution_count || 0) + 1,
        })
        .eq('id', selectedWorkflow.id);

      toast({
        title: 'Workflow executed',
        description: `Execution completed with ${logs.length} steps`,
      });
    } catch (error: any) {
      toast({
        title: 'Execution error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const deleteWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const { error } = await supabase
        .from('mission_workflows')
        .delete()
        .eq('id', selectedWorkflow.id);

      if (error) throw error;

      toast({
        title: 'Workflow deleted',
        description: 'Workflow has been deleted successfully',
      });

      setSelectedWorkflow(null);
      setNodes([]);
      setEdges([]);
      setWorkflowName('');
      setWorkflowDescription('');
      loadWorkflows();
    } catch (error: any) {
      toast({
        title: 'Error deleting workflow',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('');
    setWorkflowDescription('');
    setSelectedWorkflow(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <GitBranch className="h-8 w-8" />
            Workflow Builder
          </h1>
          <p className="text-muted-foreground">
            Create and execute visual workflows for mission automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearCanvas} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button onClick={saveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={executeWorkflow} disabled={isExecuting || !selectedWorkflow}>
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
          {selectedWorkflow && (
            <Button onClick={deleteWorkflow} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Saved Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workflows.map((workflow) => (
              <Button
                key={workflow.id}
                variant={selectedWorkflow?.id === workflow.id ? 'default' : 'outline'}
                className="w-full justify-start text-left"
                onClick={() => loadWorkflow(workflow)}
              >
                <div className="truncate">
                  <div className="font-medium truncate">{workflow.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {workflow.execution_count || 0} executions
                  </div>
                </div>
              </Button>
            ))}
            {workflows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No workflows yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Input
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Enter workflow description"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedNodeType} onValueChange={setSelectedNodeType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTypes.map((nodeType) => (
                      <SelectItem key={nodeType.type} value={nodeType.type}>
                        <div className="flex items-center gap-2">
                          <nodeType.icon className="h-4 w-4" />
                          {nodeType.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addNode}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Node
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] border rounded-lg bg-gray-50">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background />
                <Panel position="top-right">
                  <Badge variant="secondary">
                    {nodes.length} nodes, {edges.length} connections
                  </Badge>
                </Panel>
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-3xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Execution Logs
            </DialogTitle>
            <DialogDescription>
              Step-by-step execution logs for the current workflow run
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {executionLogs.map((log) => (
              <Card key={log.id} className={log.status === 'failed' ? 'border-red-500' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={log.status === 'completed' ? 'default' : 'destructive'}
                        >
                          {log.status}
                        </Badge>
                        <span className="font-medium">{log.step_name}</span>
                        <span className="text-sm text-muted-foreground">({log.step_type})</span>
                      </div>
                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-2">{log.error_message}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Duration: {log.duration_ms}ms | {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {isExecuting && (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Executing workflow...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
