import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Save,
  Download,
  Eye,
  Copy,
  Trash2,
  History,
  Plus,
  RefreshCw,
  FileDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import html2canvas from "html2canvas";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

interface TemplateVersion {
  id: string;
  template_id: string;
  template_name: string;
  template_content: string;
  version_number: number;
  variables: unknown: unknown: unknown;
  is_current: boolean;
  created_at: string;
  change_description?: string;
}

interface GenerationHistory {
  id: string;
  template_id: string;
  output_format: string;
  status: string;
  created_at: string;
  generation_duration_ms?: number;
}

// Available dynamic variables
const DYNAMIC_VARIABLES = [
  { key: "voyage_number", label: "Voyage Number", source: "mission_workflows", field: "name" },
  { key: "vessel_name", label: "Vessel Name", source: "vessels", field: "name" },
  { key: "crew_count", label: "Crew Count", source: "profiles", field: "count" },
  { key: "port_of_departure", label: "Port of Departure", source: "route_segments", field: "departure_port" },
  { key: "port_of_arrival", label: "Port of Arrival", source: "route_segments", field: "arrival_port" },
  { key: "current_date", label: "Current Date", source: "system", field: "date" },
  { key: "current_time", label: "Current Time", source: "system", field: "time" },
  { key: "user_name", label: "User Name", source: "auth", field: "full_name" },
  { key: "user_email", label: "User Email", source: "auth", field: "email" },
  { key: "company_name", label: "Company Name", source: "system", field: "company" },
  { key: "document_id", label: "Document ID", source: "system", field: "uuid" },
  { key: "fuel_consumption", label: "Total Fuel Consumption", source: "fuel_logs", field: "sum" },
];

export const TemplatesDynamic = memo(() => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateVersion[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateVersion | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [changeDescription, setChangeDescription] = useState("");
  const [variableValues, setVariableValues] = useState({});

  useEffect(() => {
    loadTemplates();
    loadGenerationHistory();
    fetchDynamicVariables();
  }, []);

  useEffect(() => {
    if (templateContent) {
      updatePreview();
    }
  }, [templateContent, variableValues]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("document_template_versions")
        .select("*")
        .eq("is_current", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadVersions = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from("document_template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: SupabaseError | null) {
      console.error("Error loading versions:", error);
    }
  };

  const loadGenerationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("document_generation_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setGenerationHistory(data || []);
    } catch (error: SupabaseError | null) {
      console.error("Error loading history:", error);
    }
  };

  const fetchDynamicVariables = async () => {
    const values = {};

    try {
      // Fetch real data from Supabase for each variable
      for (const variable of DYNAMIC_VARIABLES) {
        if (variable.source === "system") {
          // System variables
          if (variable.field === "date") {
            values[variable.key] = new Date().toLocaleDateString();
          } else if (variable.field === "time") {
            values[variable.key] = new Date().toLocaleTimeString();
          } else if (variable.field === "company") {
            values[variable.key] = "Maritime Operations Co.";
          } else if (variable.field === "uuid") {
            values[variable.key] = `DOC-${Date.now()}`;
          }
        } else if (variable.source === "auth") {
          // Auth variables
          const { data: user } = await supabase.auth.getUser();
          if (variable.field === "full_name") {
            values[variable.key] = user.user?.user_metadata?.full_name || "User";
          } else if (variable.field === "email") {
            values[variable.key] = user.user?.email || "user@example.com";
          }
        } else if (variable.source === "mission_workflows") {
          const { data } = await supabase
            .from("mission_workflows")
            .select("name")
            .limit(1)
            .single();
          values[variable.key] = data?.name || "Voyage 001";
        } else if (variable.source === "vessels") {
          const { data } = await supabase.from("vessels").select("name").limit(1).single();
          values[variable.key] = data?.name || "MV Example";
        } else if (variable.source === "profiles") {
          const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
          values[variable.key] = count?.toString() || "0";
        } else if (variable.source === "route_segments") {
          const { data } = await supabase.from("route_segments").select("*").limit(1).single();
          if (variable.field === "departure_port") {
            values[variable.key] = data?.departure_port || "Port A";
          } else if (variable.field === "arrival_port") {
            values[variable.key] = data?.arrival_port || "Port B";
          }
        } else if (variable.source === "fuel_logs") {
          const { data } = await supabase.from("fuel_logs").select("quantity_consumed");
          const total = data?.reduce((sum, log) => sum + (log.quantity_consumed || 0), 0) || 0;
          values[variable.key] = total.toFixed(2);
        }
      }

      setVariableValues(values);
    } catch (error: SupabaseError | null) {
      console.error("Error fetching variables:", error);
      // Set default values
      DYNAMIC_VARIABLES.forEach((v) => {
        values[v.key] = `{{${v.key}}}`;
      });
      setVariableValues(values);
    }
  };

  const updatePreview = () => {
    let html = templateContent;

    // Replace all variables with their values
    Object.keys(variableValues).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, variableValues[key] || `{{${key}}}`);
    });

    setPreviewHtml(html);
  };

  const saveTemplate = async () => {
    if (!templateName || !templateContent) {
      toast({
        title: "Missing fields",
        description: "Please provide template name and content",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const templateId = selectedTemplate?.template_id || `template-${Date.now()}`;
      const { data: user } = await supabase.auth.getUser();

      // Get next version number
      const { data: existingVersions } = await supabase
        .from("document_template_versions")
        .select("version_number")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion = (existingVersions?.[0]?.version_number || 0) + 1;

      // Mark all previous versions as not current
      await supabase
        .from("document_template_versions")
        .update({ is_current: false })
        .eq("template_id", templateId);

      // Insert new version
      const { data, error } = await supabase
        .from("document_template_versions")
        .insert({
          template_id: templateId,
          template_name: templateName,
          template_content: templateContent,
          version_number: nextVersion,
          variables: DYNAMIC_VARIABLES,
          is_current: true,
          created_by: user.user?.id,
          change_description: changeDescription || `Version ${nextVersion}`,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Template saved",
        description: `Template saved as version ${nextVersion}`,
      });

      setSelectedTemplate(data);
      setChangeDescription("");
      await loadTemplates();
      await loadVersions(templateId);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: TemplateVersion) => {
    setSelectedTemplate(template);
    setTemplateName(template.template_name);
    setTemplateContent(template.template_content);
    loadVersions(template.template_id);
  };

  const restoreVersion = async (version: TemplateVersion) => {
    try {
      // Mark all versions as not current
      await supabase
        .from("document_template_versions")
        .update({ is_current: false })
        .eq("template_id", version.template_id);

      // Mark selected version as current
      const { error } = await supabase
        .from("document_template_versions")
        .update({ is_current: true })
        .eq("id", version.id);

      if (error) throw error;

      toast({
        title: "Version restored",
        description: `Restored to version ${version.version_number}`,
      });

      loadTemplate(version);
      await loadTemplates();
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error restoring version",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const element = document.getElementById("preview-content");
      if (!element) return;

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${templateName || "document"}.pdf`);

      // Log generation
      const { data: user } = await supabase.auth.getUser();
      await supabase.from("document_generation_history").insert({
        template_id: selectedTemplate?.template_id || "unknown",
        template_version_id: selectedTemplate?.id,
        generated_by: user.user?.id,
        variables_used: variableValues,
        output_format: "pdf",
        generation_duration_ms: Date.now() - startTime,
        status: "completed",
      });

      await loadGenerationHistory();

      toast({
        title: "PDF exported",
        description: "Document has been exported successfully",
      });
    } catch (error: SupabaseError | null) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToDOCX = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      // Basic DOCX export (text only)
      const blob = new Blob([previewHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateName || "document"}.html`;
      link.click();
      URL.revokeObjectURL(url);

      // Log generation
      const { data: user } = await supabase.auth.getUser();
      await supabase.from("document_generation_history").insert({
        template_id: selectedTemplate?.template_id || "unknown",
        template_version_id: selectedTemplate?.id,
        generated_by: user.user?.id,
        variables_used: variableValues,
        output_format: "docx",
        generation_duration_ms: Date.now() - startTime,
        status: "completed",
      });

      await loadGenerationHistory();

      toast({
        title: "Document exported",
        description: "Document has been exported as HTML",
      });
    } catch (error: SupabaseError | null) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    };
  };

  const insertVariable = (variableKey: string) => {
    const newContent = templateContent + `{{${variableKey}}}`;
    setTemplateContent(newContent);
  };

  const newTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateContent("");
    setVersions([]);
    setPreviewHtml("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Document Templates - Dynamic Generator
          </h1>
          <p className="text-muted-foreground">
            Create dynamic documents with real-time data and version control
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={newTemplate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button onClick={saveTemplate} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Version
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{DYNAMIC_VARIABLES.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Available variables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Template versions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generationHistory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total documents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Saved Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => handleloadTemplate}
              >
                <div className="truncate">
                  <div className="font-medium truncate">{template.template_name}</div>
                  <div className="text-xs text-muted-foreground">
                    v{template.version_number} | {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Button>
            ))}
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No templates yet</p>
            )}
          </CardContent>
        </Card>

        {/* Editor and Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={handleChange}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="change-description">Change Description (for versioning)</Label>
                <Input
                  id="change-description"
                  value={changeDescription}
                  onChange={handleChange}
                  placeholder="Describe what changed in this version"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div>
                  <Label>Template Content</Label>
                  <Textarea
                    value={templateContent}
                    onChange={handleChange}
                    placeholder="Enter your template content with variables like {{voyage_number}}"
                    rows={15}
                    className="font-mono"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Label>Real-time Preview</Label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={exportToPDF} disabled={!previewHtml || loading}>
                      <FileDown className="h-3 w-3 mr-2" />
                      PDF
                    </Button>
                    <Button size="sm" onClick={exportToDOCX} disabled={!previewHtml || loading}>
                      <FileDown className="h-3 w-3 mr-2" />
                      HTML
                    </Button>
                  </div>
                </div>
                <div
                  id="preview-content"
                  className="border rounded-lg p-6 bg-white min-h-[400px]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                <div>
                  <Label className="mb-3 block">Available Variables</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {DYNAMIC_VARIABLES.map((variable) => (
                      <Card key={variable.key} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{variable.label}</p>
                            <code className="text-xs text-muted-foreground">
                              {`{{${variable.key}}}`}
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">
                              Current: {variableValues[variable.key] || "Loading..."}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleinsertVariable}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Button onClick={fetchDynamicVariables} variant="outline" className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Values
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div>
                  <Label className="mb-3 block">Version History</Label>
                  {versions.length > 0 ? (
                    <div className="space-y-2">
                      {versions.map((version) => (
                        <Card
                          key={version.id}
                          className={version.is_current ? "border-blue-500" : ""}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={version.is_current ? "default" : "secondary"}>
                                    v{version.version_number}
                                  </Badge>
                                  {version.is_current && <Badge>Current</Badge>}
                                </div>
                                <p className="text-sm">{version.change_description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(version.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!version.is_current && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlerestoreVersion}
                                >
                                  <History className="h-3 w-3 mr-2" />
                                  Restore
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No version history
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generation History
          </CardTitle>
          <CardDescription>Recently generated documents</CardDescription>
        </CardHeader>
        <CardContent>
          {generationHistory.length > 0 ? (
            <div className="space-y-2">
              {generationHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge>{history.output_format.toUpperCase()}</Badge>
                    <span className="text-sm">Document generated</span>
                    {history.generation_duration_ms && (
                      <span className="text-xs text-muted-foreground">
                        {history.generation_duration_ms}ms
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(history.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No documents generated yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
