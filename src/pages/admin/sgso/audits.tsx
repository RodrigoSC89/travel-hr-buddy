import { useEffect, useState, useCallback } from "react";;

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
import { Plus, Trash2, Save, Eye } from "lucide-react";

interface AuditAction {
  id?: string;
  audit_id: string;
  action_description: string;
  responsible: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
}

interface Audit {
  id?: string;
  title: string;
  description: string;
  risk_level: "low" | "medium" | "high" | "critical";
  criticality: "minor" | "major" | "critical";
  responsible: string;
  status: "open" | "in_progress" | "closed";
  created_at?: string;
  actions?: AuditAction[];
}

export default function SGSOAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [formData, setFormData] = useState<Audit>({
    title: "",
    description: "",
    risk_level: "low",
    criticality: "minor",
    responsible: "",
    status: "open",
  });

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sgso_audits")
        .select(`
          *,
          sgso_actions (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAudits(data || []);
      logger.info("SGSO audits loaded successfully", { count: data?.length });
    } catch (error) {
      logger.error("Failed to load SGSO audits", error);
      toast.error("Failed to load audits");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.id) {
        // Update existing audit
        const { error } = await supabase
          .from("sgso_audits")
          .update({
            title: formData.title,
            description: formData.description,
            risk_level: formData.risk_level,
            criticality: formData.criticality,
            responsible: formData.responsible,
            status: formData.status,
          })
          .eq("id", formData.id);

        if (error) throw error;
        toast.success("Audit updated successfully");
      } else {
        // Create new audit
        const { error } = await supabase
          .from("sgso_audits")
          .insert({
            title: formData.title,
            description: formData.description,
            risk_level: formData.risk_level,
            criticality: formData.criticality,
            responsible: formData.responsible,
            status: formData.status,
          });

        if (error) throw error;

        // Log access for compliance
        await supabase.from("access_logs").insert({
          action: "sgso_audit_created",
          resource: "sgso_audits",
          details: { title: formData.title },
        });

        toast.success("Audit created successfully");
      }

      setEditMode(false);
      setFormData({
        title: "",
        description: "",
        risk_level: "low",
        criticality: "minor",
        responsible: "",
        status: "open",
      });
      loadAudits();
    } catch (error) {
      logger.error("Failed to save audit", error);
      toast.error("Failed to save audit");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audit?")) return;

    try {
      const { error } = await supabase.from("sgso_audits").delete().eq("id", id);

      if (error) throw error;

      // Log access for compliance
      await supabase.from("access_logs").insert({
        action: "sgso_audit_deleted",
        resource: "sgso_audits",
        details: { audit_id: id },
      });

      toast.success("Audit deleted successfully");
      loadAudits();
    } catch (error) {
      logger.error("Failed to delete audit", error);
      toast.error("Failed to delete audit");
    }
  };

  const handleEdit = (audit: Audit) => {
    setFormData(audit);
    setEditMode(true);
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      critical: "text-red-600",
    };
    return colors[level as keyof typeof colors] || "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Loading audits...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SGSO Audits</h1>
          <p className="text-muted-foreground">Safety Management System Audits</p>
        </div>
        <Button onClick={handleSetEditMode}>
          <Plus className="mr-2 h-4 w-4" />
          New Audit
        </Button>
      </div>

      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle>{formData.id ? "Edit Audit" : "Create New Audit"}</CardTitle>
            <CardDescription>
              Fill in the audit details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange})
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange})
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="risk_level">Risk Level</Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        risk_level: value as Audit["risk_level"],
                      })
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
                  <Label htmlFor="criticality">Criticality</Label>
                  <Select
                    value={formData.criticality}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        criticality: value as Audit["criticality"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as Audit["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="responsible">Responsible</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={handleChange})
                  }
                  required
                />
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
                      title: "",
                      description: "",
                      risk_level: "low",
                      criticality: "minor",
                      responsible: "",
                      status: "open",
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

      <div className="grid gap-4">
        {audits.map((audit) => (
          <Card key={audit.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{audit.title}</CardTitle>
                  <CardDescription>{audit.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlehandleEdit}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handlehandleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Risk Level:</span>
                  <p className={`font-semibold ${getRiskColor(audit.risk_level)}`}>
                    {audit.risk_level.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Criticality:</span>
                  <p className="font-semibold">{audit.criticality}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-semibold">{audit.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Responsible:</span>
                  <p className="font-semibold">{audit.responsible}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
