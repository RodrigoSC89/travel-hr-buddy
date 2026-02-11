/**
 * SGSO Action Plan Tab
 * PATCH 892: Fixed schema alignment with sgso_actions table
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

// Use types from Supabase schema
type SgsoAction = Database["public"]["Tables"]["sgso_actions"]["Row"];
type SgsoActionInsert = Database["public"]["Tables"]["sgso_actions"]["Insert"];

interface ActionFormData {
  id?: string;
  plan_id: string;
  action_title: string;
  action_description: string;
  priority: string;
  status: string;
  due_date: string;
}

interface ActionPlanTabProps {
  auditId: string;
}

export function ActionPlanTab({ auditId }: ActionPlanTabProps) {
  const [actions, setActions] = useState<SgsoAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ActionFormData>({
    plan_id: auditId,
    action_title: "",
    action_description: "",
    priority: "medium",
    status: "pending",
    due_date: "",
  });

  useEffect(() => {
    loadActions();
  }, [auditId]);

  const loadActions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sgso_actions")
        .select("*")
        .eq("plan_id", auditId)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setActions(data || []);
      logger.info("Action plans loaded", { count: data?.length });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Failed to load action plans", { error: errorMessage });
      toast.error("Failed to load action plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.id) {
        const { error } = await supabase
          .from("sgso_actions")
          .update({
            action_title: formData.action_title,
            action_description: formData.action_description,
            priority: formData.priority,
            status: formData.status,
            due_date: formData.due_date || null,
          })
          .eq("id", formData.id);

        if (error) throw error;
        toast.success("Action plan updated");
      } else {
        const insertData: SgsoActionInsert = {
          plan_id: auditId,
          action_title: formData.action_title,
          action_description: formData.action_description || null,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.due_date || null,
        };

        const { error } = await supabase.from("sgso_actions").insert(insertData);

        if (error) throw error;
        toast.success("Action plan created");
      }

      setEditMode(false);
      setFormData({
        plan_id: auditId,
        action_title: "",
        action_description: "",
        priority: "medium",
        status: "pending",
        due_date: "",
      });
      loadActions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Failed to save action plan", { error: errorMessage });
      toast.error("Failed to save action plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this action plan?")) return;

    try {
      const { error } = await supabase.from("sgso_actions").delete().eq("id", id);

      if (error) throw error;
      toast.success("Action plan deleted");
      loadActions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Failed to delete action plan", { error: errorMessage });
      toast.error("Failed to delete action plan");
    }
  };

  const getStatusColor = (status: string | null) => {
    const colors: Record<string, string> = {
      pending: "text-warning",
      in_progress: "text-primary",
      completed: "text-success",
    };
    return colors[status || "pending"] || "text-muted-foreground";
  };

  const getPriorityColor = (priority: string | null) => {
    const colors: Record<string, string> = {
      low: "text-muted-foreground",
      medium: "text-warning",
      high: "text-accent-foreground",
      critical: "text-destructive",
    };
    return colors[priority || "medium"] || "text-muted-foreground";
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <p>Loading action plans...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Action Plans</h2>
        <Button onClick={() => setEditMode(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Action
        </Button>
      </div>

      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle>{formData.id ? "Edit Action Plan" : "New Action Plan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="action_title">Title</Label>
                <Input
                  id="action_title"
                  value={formData.action_title}
                  onChange={(e) =>
                    setFormData({ ...formData, action_title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="action_description">Description</Label>
                <Textarea
                  id="action_description"
                  value={formData.action_description}
                  onChange={(e) =>
                    setFormData({ ...formData, action_description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      plan_id: auditId,
                      action_title: "",
                      action_description: "",
                      priority: "medium",
                      status: "pending",
                      due_date: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {actions.map((action) => (
          <Card key={action.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{action.action_title}</p>
                  {action.action_description && (
                    <p className="text-sm text-muted-foreground mt-1">{action.action_description}</p>
                  )}
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-semibold">Priority:</span>{" "}
                      <span className={getPriorityColor(action.priority)}>
                        {(action.priority || "medium").toUpperCase()}
                      </span>
                    </p>
                    {action.due_date && (
                      <p className={isOverdue(action.due_date) ? "text-destructive font-semibold" : ""}>
                        <span className="font-semibold">Due Date:</span>{" "}
                        {new Date(action.due_date).toLocaleDateString()}
                        {isOverdue(action.due_date) && " (Overdue)"}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={getStatusColor(action.status)}>
                        {(action.status || "pending").replace("_", " ").toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(action.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {actions.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No action plans yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
