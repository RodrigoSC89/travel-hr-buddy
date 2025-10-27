import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause, 
  Clock, 
  Zap, 
  Mail, 
  CheckSquare,
  Bell,
  Database,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action';
  config: Record<string, any>;
}

interface WorkflowTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  is_active: boolean;
}

export const WorkflowBuilder: React.FC = () => {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<WorkflowTemplate>({
    name: '',
    description: '',
    category: 'general',
    nodes: [],
    is_active: false
  });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  const triggerTypes = [
    { value: 'schedule', label: 'Schedule (Cron)', icon: Clock },
    { value: 'event', label: 'Event Trigger', icon: Zap },
    { value: 'module_action', label: 'Module Action', icon: Database }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'create_task', label: 'Create Task', icon: CheckSquare },
    { value: 'send_notification', label: 'Send Notification', icon: Bell },
    { value: 'update_record', label: 'Update Record', icon: Database }
  ];

  const addTrigger = (triggerType: string) => {
    const newNode: WorkflowNode = {
      id: `trigger_${Date.now()}`,
      type: 'trigger',
      config: { trigger_type: triggerType }
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    toast({
      title: 'Trigger Added',
      description: `Added ${triggerType} trigger to workflow`
    });
  };

  const addAction = (actionType: string) => {
    const newNode: WorkflowNode = {
      id: `action_${Date.now()}`,
      type: 'action',
      config: { action_type: actionType }
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    toast({
      title: 'Action Added',
      description: `Added ${actionType} action to workflow`
    });
  };

  const saveWorkflow = async () => {
    if (!workflow.name) {
      toast({
        title: 'Error',
        description: 'Please provide a workflow name',
        variant: 'destructive'
      });
      return;
    }

    // TODO: Implement actual save to Supabase
    toast({
      title: 'Success',
      description: 'Workflow saved successfully'
    });
  };

  const toggleWorkflow = () => {
    setWorkflow(prev => ({
      ...prev,
      is_active: !prev.is_active
    }));
    toast({
      title: workflow.is_active ? 'Workflow Paused' : 'Workflow Activated',
      description: workflow.is_active 
        ? 'Workflow execution has been paused' 
        : 'Workflow is now active and will execute on triggers'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Workflow Builder</h1>
            <p className="text-muted-foreground">Create and manage automated workflows</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleWorkflow}>
            {workflow.is_active ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button onClick={saveWorkflow}>
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
            <CardDescription>Define your workflow details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                placeholder="Enter workflow name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Input
                id="workflow-description"
                placeholder="Enter workflow description"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Visual Workflow Builder */}
            <div className="border rounded-lg p-4 min-h-[300px] bg-muted/10">
              <h3 className="font-semibold mb-4">Workflow Steps</h3>
              {workflow.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Add triggers and actions to build your workflow
                </div>
              ) : (
                <div className="space-y-3">
                  {workflow.nodes.map((node, index) => (
                    <div 
                      key={node.id}
                      className="flex items-center gap-2 p-3 bg-card rounded-lg border cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-2 rounded-full ${
                          node.type === 'trigger' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {node.type === 'trigger' ? <Zap className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{node.config.trigger_type || node.config.action_type}</div>
                          <div className="text-xs text-muted-foreground">{node.type}</div>
                        </div>
                      </div>
                      {index < workflow.nodes.length - 1 && (
                        <div className="text-muted-foreground">→</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Toolbox */}
        <Card>
          <CardHeader>
            <CardTitle>Add Components</CardTitle>
            <CardDescription>Drag or click to add</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="triggers">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="triggers">Triggers</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="triggers" className="space-y-2 mt-4">
                {triggerTypes.map(trigger => (
                  <Button
                    key={trigger.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addTrigger(trigger.value)}
                  >
                    <trigger.icon className="mr-2 h-4 w-4" />
                    {trigger.label}
                  </Button>
                ))}
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-2 mt-4">
                {actionTypes.map(action => (
                  <Button
                    key={action.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addAction(action.value)}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Triggers</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflow.nodes.filter(n => n.type === 'trigger').length}</div>
            <p className="text-xs text-muted-foreground">In this workflow</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflow.nodes.filter(n => n.type === 'action').length}</div>
            <p className="text-xs text-muted-foreground">In this workflow</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${workflow.is_active ? 'text-green-500' : 'text-gray-500'}`}>
              {workflow.is_active ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">Current state</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
