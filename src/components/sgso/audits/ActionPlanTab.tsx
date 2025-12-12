import { useEffect, useState } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save } from "lucide-react";

interface ActionPlan {
  id?: string;
  audit_id: string;
  action_description: string;
  responsible: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
}

interface ActionPlanTabProps {
  auditId: string;
}

export const ActionPlanTab = memo(function({ auditId }: ActionPlanTabProps) {
  const [actions, setActions] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ActionPlan>({
    audit_id: auditId,
    action_description: "",
    responsible: "",
    deadline: "",
    status: "pending",
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
        .eq("audit_id", auditId)
        .order("deadline", { ascending: true });

      if (error) throw error;

      setActions(data || []);
      logger.info("Action plans loaded", { count: data?.length });
    } catch (error) {
      logger.error("Failed to load action plans", error);
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
            action_description: formData.action_description,
            responsible: formData.responsible,
            deadline: formData.deadline,
            status: formData.status,
          })
          .eq("id", formData.id);

        if (error) throw error;
        toast.success("Action plan updated");
      } else {
        const { error } = await supabase.from("sgso_actions").insert({
          audit_id: auditId,
          action_description: formData.action_description,
          responsible: formData.responsible,
          deadline: formData.deadline,
          status: formData.status,
        });

        if (error) throw error;
        toast.success("Action plan created");
      }

      setEditMode(false);
      setFormData({
        audit_id: auditId,
        action_description: "",
        responsible: "",
        deadline: "",
        status: "pending",
      });
      loadActions();
    } catch (error) {
      logger.error("Failed to save action plan", error);
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
    } catch (error) {
      logger.error("Failed to delete action plan", error);
      toast.error("Failed to delete action plan");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-yellow-600",
      in_progress: "text-blue-600",
      completed: "text-green-600",
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
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
                <Label htmlFor="action_description">Description</Label>
                <Textarea
                  id="action_description"
                  value={formData.action_description}
                  onChange={(e) =>
                    setFormData({ ...formData, action_description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responsible">Responsible</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) =>
                      setFormData({ ...formData, responsible: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as ActionPlan["status"],
                      })
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
                      audit_id: auditId,
                      action_description: "",
                      responsible: "",
                      deadline: "",
                      status: "pending",
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
                  <p className="font-medium">{action.action_description}</p>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-semibold">Responsible:</span>{" "}
                      {action.responsible}
                    </p>
                    <p className={isOverdue(action.deadline) ? "text-red-600 font-semibold" : ""}>
                      <span className="font-semibold">Deadline:</span>{" "}
                      {new Date(action.deadline).toLocaleDateString()}
                      {isOverdue(action.deadline) && " (Overdue)"}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={getStatusColor(action.status)}>
                        {action.status.replace("_", " ").toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(action.id!)}
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
