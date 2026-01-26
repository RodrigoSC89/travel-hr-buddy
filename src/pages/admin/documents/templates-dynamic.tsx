/**
 * Document Templates - Dynamic Generator
 * Create dynamic documents with real-time data and version control
 * PATCH 862: Removed @ts-nocheck, aligned with Supabase schema
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { createSafeHTML } from "@/lib/utils/safe-html";
import {
  FileText,
  Save,
  Download,
  Copy,
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
import type { DocumentTemplateVersion, DocumentTemplateVersionInsert, Json } from "@/types/supabase-aliases";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

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

// Generation history interface for DB
interface GenerationHistoryRow {
  id: string;
  template_id: string | null;
  template_version_id: string | null;
  generated_by: string | null;
  variables_used: Json;
  output_format: string | null;
  status: string | null;
  created_at: string | null;
  generation_duration_ms: number | null;
}

export const TemplatesDynamic = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplateVersion[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateVersion | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [versions, setVersions] = useState<DocumentTemplateVersion[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [changeDescription, setChangeDescription] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error loading templates",
        description: errorMessage,
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
    } catch (error: unknown) {
      logger.error("Error loading versions", error);
    }
  };

  const loadGenerationHistory = async () => {
    try {
      // Table exists in migrations but not in generated types - use dynamic access
      const { data, error } = await (supabase
        .from("document_generation_history" as "organizations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20) as unknown as Promise<{ data: GenerationHistoryRow[] | null; error: Error | null }>);

      if (error) throw error;
      setGenerationHistory(data || []);
    } catch (error: unknown) {
      logger.error("Error loading history", error);
    }
  };

  const fetchDynamicVariables = async () => {
    const values: Record<string, string> = {};

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
            .maybeSingle();
          values[variable.key] = data?.name || "Voyage 001";
        } else if (variable.source === "vessels") {
          const { data } = await supabase.from("vessels").select("name").limit(1).maybeSingle();
          values[variable.key] = data?.name || "MV Example";
        } else if (variable.source === "profiles") {
          const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
          values[variable.key] = count?.toString() || "0";
        } else if (variable.source === "route_segments") {
          const { data } = await supabase.from("route_segments").select("*").limit(1).maybeSingle();
          if (variable.field === "departure_port") {
            values[variable.key] = data?.departure_port || "Port A";
          } else if (variable.field === "arrival_port") {
            values[variable.key] = data?.arrival_port || "Port B";
          }
        } else if (variable.source === "fuel_logs") {
          const { data } = await supabase.from("fuel_logs").select("quantity_liters");
          const total = data?.reduce((sum, log) => sum + (log.quantity_liters || 0), 0) || 0;
          values[variable.key] = total.toFixed(2);
        }
      }

      setVariableValues(values);
    } catch (error: unknown) {
      logger.error("Error fetching variables", error);
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
      const insertData: DocumentTemplateVersionInsert = {
        template_id: templateId,
        template_name: templateName,
        template_content: templateContent,
        version_number: nextVersion,
        variables: DYNAMIC_VARIABLES as unknown as Json,
        is_current: true,
        created_by: user.user?.id,
        change_description: changeDescription || `Version ${nextVersion}`,
      };

      const { data, error } = await supabase
        .from("document_template_versions")
        .insert(insertData)
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error saving template",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: DocumentTemplateVersion) => {
    setSelectedTemplate(template);
    setTemplateName(template.template_name);
    setTemplateContent(template.template_content);
    if (template.template_id) {
      loadVersions(template.template_id);
    }
  };

  const restoreVersion = async (version: DocumentTemplateVersion) => {
    try {
      if (!version.template_id) return;
      
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error restoring version",
        description: errorMessage,
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

      const JsPDF = await loadJsPDF();
      const pdf = new JsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${templateName || "document"}.pdf`);

      // Log generation - table exists in migrations but not in generated types
      const { data: user } = await supabase.auth.getUser();
      await (supabase.from("document_generation_history" as "organizations").insert({
        template_id: selectedTemplate?.template_id || "unknown",
        template_version_id: selectedTemplate?.id,
        generated_by: user.user?.id,
        variables_used: variableValues,
        output_format: "pdf",
        generation_duration_ms: Date.now() - startTime,
        status: "completed",
      } as never));

      await loadGenerationHistory();

      toast({
        title: "PDF exported",
        description: "Document has been exported successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Export failed",
        description: errorMessage,
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

      // Log generation - table exists in migrations but not in generated types
      const { data: user } = await supabase.auth.getUser();
      await (supabase.from("document_generation_history" as "organizations").insert({
        template_id: selectedTemplate?.template_id || "unknown",
        template_version_id: selectedTemplate?.id,
        generated_by: user.user?.id,
        variables_used: variableValues,
        output_format: "docx",
        generation_duration_ms: Date.now() - startTime,
        status: "completed",
      } as never));

      await loadGenerationHistory();

      toast({
        title: "Document exported",
        description: "Document has been exported as HTML",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <p className="text-xs text-muted-foreground mt-1">Documents generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates
            </CardTitle>
            <CardDescription>Select a template to edit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{template.template_name}</span>
                    <Badge variant="secondary">v{template.version_number}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.created_at ? new Date(template.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              ))}
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No templates yet. Create your first one!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Template Editor</CardTitle>
            <CardDescription>
              Use {"{{variable_name}}"} syntax for dynamic content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <Label>Content (HTML supported)</Label>
                  <Textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Enter template content with {{variables}}..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Change Description</Label>
                  <Input
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                    placeholder="Describe changes in this version..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="border rounded-lg p-4 min-h-[400px] bg-background">
                  <div id="preview-content" dangerouslySetInnerHTML={createSafeHTML(previewHtml || "")} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={exportToPDF} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={exportToDOCX} disabled={loading}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export HTML
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="variables">
                <div className="grid grid-cols-2 gap-2">
                  {DYNAMIC_VARIABLES.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => insertVariable(variable.key)}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      {variable.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-2">Current Variable Values:</p>
                  <div className="space-y-1 text-xs">
                    {Object.entries(variableValues).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={version.is_current ? "default" : "secondary"}>
                            v{version.version_number}
                          </Badge>
                          {version.is_current && (
                            <Badge variant="outline">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {version.change_description || "No description"}
                        </p>
                      </div>
                      {!version.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreVersion(version)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  ))}
                  {versions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No version history for this template
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplatesDynamic;
