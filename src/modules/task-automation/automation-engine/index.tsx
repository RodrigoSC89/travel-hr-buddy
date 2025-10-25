/**
 * PATCH 115.0 - Workflow Automation Engine
 * Automation Engine - Rule-based automation with AI suggestions
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Workflow,
  Zap,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { runAIContext } from "@/ai/kernel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistance, format } from "date-fns";

interface WorkflowRule {
  id: string;
  rule_name: string;
  trigger: string;
  action: string;
  target_module: string;
  enabled: boolean;
  priority: number;
  execution_count: number;
  time_saved_minutes: number;
  last_executed: string | null;
  created_at: string;
  total_executions?: number;
  successful_executions?: number;
  failed_executions?: number;
  success_rate?: number;
}

interface AutomationSuggestion {
  suggested_trigger: string;
  suggested_action: string;
  suggested_module: string;
  reasoning: string;
  estimated_time_savings_min: number;
}

const AutomationEngine = () => {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [suggestions, setSuggestions] = useState<AutomationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterEnabled, setFilterEnabled] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflowRules();
    loadSuggestions();
    loadAIInsights();
  }, []);

  const loadWorkflowRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_dashboard')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;

      setRules(data || []);
    } catch (error) {
      console.error('Error loading workflow rules:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('suggest_automation_opportunities');

      if (error) throw error;

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      const activeRules = rules.filter(r => r.enabled).length;
      const executionsToday = rules.reduce((sum, r) => sum + (r.total_executions || 0), 0);
      const timeSaved = rules.reduce((sum, r) => sum + r.time_saved_minutes, 0) / 60;
      
      const response = await runAIContext({
        module: 'automation-suggester',
        action: 'suggest',
        context: { 
          activeRules,
          executionsToday,
          timeSaved,
          suggestedAutomations: suggestions.length
        }
      });
      
      if (response.message) {
        setAiInsight(response.message);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .update({ enabled: !currentEnabled })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rule ${currentEnabled ? 'disabled' : 'enabled'}`,
      });

      loadWorkflowRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Error",
        description: "Failed to update rule",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (enabled: boolean) => {
    if (enabled) {
      return <Badge variant="secondary" className="flex items-center gap-1 text-green-600">
        <Play className="h-3 w-3" /> Active
      </Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1">
      <Pause className="h-3 w-3" /> Paused
    </Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 90) {
      return <Badge variant="destructive">Urgent</Badge>;
    } else if (priority >= 70) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">High</Badge>;
    } else if (priority >= 50) {
      return <Badge variant="secondary">Medium</Badge>;
    }
    return <Badge variant="outline">Low</Badge>;
  };

  const filteredRules = rules.filter(rule => {
    const matchesModule = filterModule === "all" || rule.target_module === filterModule;
    const matchesEnabled = filterEnabled === "all" || 
      (filterEnabled === "enabled" && rule.enabled) ||
      (filterEnabled === "disabled" && !rule.enabled);
    const matchesSearch = searchQuery === "" || 
      rule.rule_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesModule && matchesEnabled && matchesSearch;
  });

  const modules = Array.from(new Set(rules.map(r => r.target_module)));

  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.enabled).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.execution_count, 0);
  const totalTimeSaved = (rules.reduce((sum, r) => sum + r.time_saved_minutes, 0) / 60).toFixed(1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Automation Engine</h1>
            <p className="text-muted-foreground">Workflow Automation & Rule Management</p>
          </div>
        </div>
        <Button onClick={loadWorkflowRules} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
            <p className="text-xs text-muted-foreground">{activeRules} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">Total runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalTimeSaved}h</div>
            <p className="text-xs text-muted-foreground">Estimated savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Lightbulb className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{suggestions.length}</div>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Automation Suggester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Automation Suggestions
            </CardTitle>
            <CardDescription>
              AI identified {suggestions.length} opportunities to automate recurring tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            When "{suggestion.suggested_trigger}" → Do "{suggestion.suggested_action}"
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.suggested_module}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.reasoning}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Saves ~{suggestion.estimated_time_savings_min} minutes per execution
                          </span>
                        </div>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEnabled} onValueChange={setFilterEnabled}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rules</SelectItem>
                <SelectItem value="enabled">Active Only</SelectItem>
                <SelectItem value="disabled">Paused Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Rules List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>
              {filteredRules.length} rules {filteredRules.length !== totalRules && `(filtered from ${totalRules})`}
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading automation rules...
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No automation rules found matching your filters
              </div>
            ) : (
              filteredRules.map((rule) => (
                <Card key={rule.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{rule.rule_name}</h3>
                          {getStatusBadge(rule.enabled)}
                          {getPriorityBadge(rule.priority)}
                          <Badge variant="outline" className="text-xs">
                            {rule.target_module}
                          </Badge>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-lg mb-3">
                          <div className="flex items-center gap-2 text-sm font-mono">
                            <span className="text-muted-foreground">When</span>
                            <Badge variant="secondary">{rule.trigger}</Badge>
                            <span className="text-muted-foreground">→ Do</span>
                            <Badge variant="secondary">{rule.action}</Badge>
                            <span className="text-muted-foreground">in</span>
                            <Badge variant="outline">{rule.target_module}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground text-xs">Executions</p>
                              <p className="font-semibold">{rule.execution_count}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-muted-foreground text-xs">Time Saved</p>
                              <p className="font-semibold text-green-600">
                                {(rule.time_saved_minutes / 60).toFixed(1)}h
                              </p>
                            </div>
                          </div>

                          {rule.success_rate !== undefined && rule.success_rate !== null && (
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-muted-foreground text-xs">Success Rate</p>
                                <p className="font-semibold text-blue-600">{rule.success_rate.toFixed(0)}%</p>
                              </div>
                            </div>
                          )}

                          {rule.last_executed && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground text-xs">Last Run</p>
                                <p className="font-semibold text-xs">
                                  {formatDistance(new Date(rule.last_executed), new Date(), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {rule.enabled ? 'Active' : 'Paused'}
                          </span>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule.id, rule.enabled)}
                          />
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Rule
                        </Button>
                      </div>
                    </div>

                    {/* Execution Stats */}
                    {rule.total_executions && rule.total_executions > 0 && (
                      <div className="pt-3 border-t mt-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{rule.successful_executions} successful</span>
                          </div>
                          {rule.failed_executions && rule.failed_executions > 0 && (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-destructive" />
                              <span>{rule.failed_executions} failed</span>
                            </div>
                          )}
                          <span>Last 30 days</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationEngine;
