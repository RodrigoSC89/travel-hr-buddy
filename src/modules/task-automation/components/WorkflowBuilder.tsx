// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Save,
  Trash2,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowTemplate>({
    name: '',
    description: '',
    category: 'general',
    nodes: [],
    is_active: false
  });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const { data, error } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("organization_id", orgData.organization_id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar regras", variant: "destructive" });
      return;
    }

    const formattedWorkflows = (data || []).map(rule => ({
      id: rule.id,
      name: rule.rule_name,
      description: rule.description || '',
      category: rule.trigger_type,
      nodes: [
        { id: `trigger_${rule.id}`, type: 'trigger' as const, config: rule.trigger_config },
        ...(Array.isArray(rule.actions) ? rule.actions.map((action: any, idx: number) => ({
          id: `action_${rule.id}_${idx}`,
          type: 'action' as const,
          config: action
        })) : [])
      ],
      is_active: rule.is_active
    }));

    setWorkflows(formattedWorkflows);
  };

  const triggerTypes = [
    { value: 'schedule', label: 'Schedule (Cron)', icon: Clock, events: ['daily', 'weekly', 'monthly'] },
    { value: 'event', label: 'Event Trigger', icon: Zap, events: ['task_created', 'task_updated', 'task_completed', 'document_uploaded', 'incident_reported'] },
    { value: 'webhook', label: 'Webhook', icon: Database, events: ['external_api'] },
    { value: 'manual', label: 'Manual Trigger', icon: Play, events: ['user_initiated'] }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'send_notification', label: 'Send Notification', icon: Bell },
    { value: 'create_task', label: 'Create Task', icon: CheckSquare },
    { value: 'update_record', label: 'Update Record', icon: Database },
    { value: 'call_ai_agent', label: 'Call AI Agent', icon: Bot },
    { value: 'log_event', label: 'Log Event', icon: Database }
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

    if (workflow.nodes.length === 0) {
      toast({
        title: 'Error',
        description: 'Add at least one trigger and one action',
        variant: 'destructive'
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: orgData } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!orgData) return;

    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    const actionNodes = workflow.nodes.filter(n => n.type === 'action');

    if (triggerNodes.length === 0 || actionNodes.length === 0) {
      toast({
        title: 'Error',
        description: 'Workflow must have at least one trigger and one action',
        variant: 'destructive'
      });
      return;
    }

    const triggerConfig = triggerNodes[0].config;
    const actions = actionNodes.map(n => n.config);

    const ruleData = {
      organization_id: orgData.organization_id,
      rule_name: workflow.name,
      description: workflow.description,
      trigger_type: triggerConfig.trigger_type || 'event',
      trigger_config: triggerConfig,
      actions: actions,
      is_active: workflow.is_active,
      created_by: user.id
    };

    let error;
    if (workflow.id) {
      // Update existing
      const result = await supabase
        .from("automation_rules")
        .update(ruleData)
        .eq("id", workflow.id);
      error = result.error;
    } else {
      // Create new
      const result = await supabase
        .from("automation_rules")
        .insert(ruleData);
      error = result.error;
    }

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Workflow saved successfully'
    });

    // Reset form and refresh list
    setWorkflow({
      name: '',
      description: '',
      category: 'general',
      nodes: [],
      is_active: false
    });
    setIsEditing(false);
    fetchWorkflows();
  };

  const toggleWorkflow = async (workflowId?: string) => {
    const id = workflowId || workflow.id;
    if (!id) {
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
      return;
    }

    const targetWorkflow = workflows.find(w => w.id === id);
    const newStatus = !targetWorkflow?.is_active;

    const { error } = await supabase
      .from("automation_rules")
      .update({ is_active: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error toggling workflow", variant: "destructive" });
      return;
    }

    toast({
      title: newStatus ? 'Workflow Activated' : 'Workflow Paused',
      description: newStatus 
        ? 'Workflow is now active and will execute on triggers' 
        : 'Workflow execution has been paused'
    });

    fetchWorkflows();
  };

  const deleteWorkflow = async (workflowId: string) => {
    const { error } = await supabase
      .from("automation_rules")
      .delete()
      .eq("id", workflowId);

    if (error) {
      toast({ title: "Error deleting workflow", variant: "destructive" });
      return;
    }

    toast({ title: "Workflow deleted successfully" });
    fetchWorkflows();
  };

  const editWorkflow = (workflowToEdit: WorkflowTemplate) => {
    setWorkflow(workflowToEdit);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setWorkflow({
      name: '',
      description: '',
      category: 'general',
      nodes: [],
      is_active: false
    });
    setIsEditing(false);
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
            <div className="text-2xl font-bold">{workflows.filter(w => w.is_active).length}</div>
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

      {/* Saved Workflows List */}
      {workflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Automation Rules</CardTitle>
            <CardDescription>Manage your existing automation workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div 
                  key={wf.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{wf.name}</h4>
                    <p className="text-sm text-muted-foreground">{wf.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {wf.nodes.filter(n => n.type === 'trigger').length} trigger(s)
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        {wf.nodes.filter(n => n.type === 'action').length} action(s)
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        wf.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {wf.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={wf.is_active}
                      onCheckedChange={() => toggleWorkflow(wf.id)}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editWorkflow(wf)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => wf.id && deleteWorkflow(wf.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
