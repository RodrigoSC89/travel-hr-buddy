/**
 * PATCH 1002 - Rule Engine Panel
 * Visual interface for creating automated rules (event + condition + action)
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  Cog,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Settings2,
  Trash2,
  Zap,
  CheckCircle2,
  Pause,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: RuleCondition[];
  actions: RuleAction[];
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
}

interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "not_equals";
  value: string | number;
}

interface RuleAction {
  type: "notification" | "email" | "webhook" | "create_task" | "update_status";
  config: Record<string, unknown>;
}

const TRIGGER_TYPES = [
  { value: "alert_created", label: "Alert Created", icon: AlertTriangle },
  { value: "status_changed", label: "Status Changed", icon: Settings2 },
  { value: "threshold_exceeded", label: "Threshold Exceeded", icon: Zap },
  { value: "schedule", label: "Scheduled", icon: Bell },
  { value: "ai_insight", label: "AI Insight Generated", icon: MessageSquare },
];

const ACTION_TYPES = [
  { value: "notification", label: "Send Notification", icon: Bell },
  { value: "email", label: "Send Email", icon: Mail },
  { value: "webhook", label: "Call Webhook", icon: Cog },
  { value: "create_task", label: "Create Task", icon: Plus },
  { value: "update_status", label: "Update Status", icon: Settings2 },
];

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
];

export function RuleEnginePanel() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: "",
    description: "",
    trigger_type: "",
    trigger_config: {},
    conditions: [],
    actions: [],
    is_active: true,
  });

  const fetchRules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRules(
        (data || []).map((rule) => ({
          id: rule.id,
          name: rule.rule_name,
          description: rule.description || "",
          trigger_type: rule.trigger_type,
          trigger_config: (rule.trigger_config as unknown as Record<string, unknown>) || {},
          conditions: (rule.conditions as unknown as RuleCondition[]) || [],
          actions: (rule.actions as unknown as RuleAction[]) || [],
          is_active: rule.is_active,
          execution_count: rule.execution_count,
          last_executed_at: rule.last_executed_at,
          created_at: rule.created_at,
        }))
      );
    } catch (err) {
      logger.error("[RuleEngine] Failed to fetch rules", { error: err });
      toast.error("Failed to load rules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const addCondition = () => {
    setNewRule((prev) => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { field: "", operator: "equals", value: "" },
      ],
    }));
  };

  const updateCondition = (index: number, updates: Partial<RuleCondition>) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions?.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    }));
  };

  const removeCondition = (index: number) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index),
    }));
  };

  const addAction = () => {
    setNewRule((prev) => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        { type: "notification", config: {} },
      ],
    }));
  };

  const updateAction = (index: number, updates: Partial<RuleAction>) => {
    setNewRule((prev) => ({
      ...prev,
      actions: prev.actions?.map((a, i) =>
        i === index ? { ...a, ...updates } : a
      ),
    }));
  };

  const removeAction = (index: number) => {
    setNewRule((prev) => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index),
    }));
  };

  const createRule = async () => {
    if (!newRule.name || !newRule.trigger_type || !newRule.actions?.length) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const insertData = {
        rule_name: newRule.name,
        description: newRule.description,
        trigger_type: newRule.trigger_type,
        trigger_config: JSON.parse(JSON.stringify(newRule.trigger_config || {})),
        conditions: JSON.parse(JSON.stringify(newRule.conditions || [])),
        actions: JSON.parse(JSON.stringify(newRule.actions || [])),
        is_active: newRule.is_active ?? true,
      };

      const { error } = await supabase.from("automation_rules").insert([insertData]);

      if (error) throw error;

      toast.success("Rule created successfully");
      setIsCreateOpen(false);
      setNewRule({
        name: "",
        description: "",
        trigger_type: "",
        trigger_config: {},
        conditions: [],
        actions: [],
        is_active: true,
      });
      fetchRules();
    } catch (err) {
      logger.error("[RuleEngine] Failed to create rule", { error: err });
      toast.error("Failed to create rule");
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("automation_rules")
        .update({ is_active: isActive })
        .eq("id", ruleId);

      if (error) throw error;

      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, is_active: isActive } : r))
      );
      toast.success(`Rule ${isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      logger.error("[RuleEngine] Failed to toggle rule", { error: err });
      toast.error("Failed to update rule");
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from("automation_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;

      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("Rule deleted");
    } catch (err) {
      logger.error("[RuleEngine] Failed to delete rule", { error: err });
      toast.error("Failed to delete rule");
    }
  };

  const executeRule = async (ruleId: string) => {
    try {
      const { error } = await supabase.functions.invoke("rule-engine-execute", {
        body: { ruleId },
      });

      if (error) throw error;

      toast.success("Rule executed successfully");
      fetchRules();
    } catch (err) {
      logger.error("[RuleEngine] Failed to execute rule", { error: err });
      toast.error("Failed to execute rule");
    }
  };

  const getTriggerIcon = (type: string) => {
    const trigger = TRIGGER_TYPES.find((t) => t.value === type);
    return trigger ? trigger.icon : Zap;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Cog className="h-5 w-5" />
            Rule Engine
          </CardTitle>
          <CardDescription>
            Create automated rules: Event + Condition + Action
          </CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>
                Define when and how the system should act automatically
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., Critical Alert Notification"
                    value={newRule.name}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-desc">Description</Label>
                  <Textarea
                    id="rule-desc"
                    placeholder="What does this rule do?"
                    value={newRule.description}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Trigger */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Trigger Event *</Label>
                <Select
                  value={newRule.trigger_type}
                  onValueChange={(value) =>
                    setNewRule((prev) => ({ ...prev, trigger_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="flex items-center gap-2">
                          <trigger.icon className="h-4 w-4" />
                          {trigger.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Conditions</Label>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                {newRule.conditions?.map((condition, condIdx) => (
                  <div key={`cond-${condIdx}-${condition.field}`} className="flex items-center gap-2">
                    <Input
                      placeholder="Field"
                      value={condition.field}
                      onChange={(e) =>
                        updateCondition(condIdx, { field: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateCondition(condIdx, {
                          operator: value as RuleCondition["operator"],
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={condition.value?.toString()}
                      onChange={(e) =>
                        updateCondition(condIdx, { value: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(condIdx)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Actions *</Label>
                  <Button variant="outline" size="sm" onClick={addAction}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                {newRule.actions?.map((action, actIdx) => (
                  <div key={`act-${actIdx}-${action.type}`} className="flex items-center gap-2">
                    <Select
                      value={action.type}
                      onValueChange={(value) =>
                        updateAction(actIdx, {
                          type: value as RuleAction["type"],
                        })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((act) => (
                          <SelectItem key={act.value} value={act.value}>
                            <div className="flex items-center gap-2">
                              <act.icon className="h-4 w-4" />
                              {act.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Configuration (JSON)"
                      value={JSON.stringify(action.config)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          updateAction(actIdx, { config });
                        } catch {
                          // Allow partial editing
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction(actIdx)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Cog className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No rules created yet</p>
              <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
                Create your first rule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const TriggerIcon = getTriggerIcon(rule.trigger_type);
                return (
                  <div
                    key={rule.id}
                    className={cn(
                      "p-4 rounded-lg border bg-card transition-opacity",
                      !rule.is_active && "opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <TriggerIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {rule.trigger_type.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {rule.conditions?.length || 0} conditions
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {rule.actions?.length || 0} actions
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Executed: {rule.execution_count}x</p>
                          {rule.last_executed_at && (
                            <p>
                              Last: {new Date(rule.last_executed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => executeRule(rule.id)}
                          title="Execute Now"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRule(rule.id)}
                          title="Delete Rule"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default RuleEnginePanel;
