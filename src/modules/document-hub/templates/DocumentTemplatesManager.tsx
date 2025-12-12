import { useEffect, useState, useCallback } from "react";;

/**
 * PATCH 299: Document Templates Manager
 * Enhanced with database integration, variable substitution, and PDF/Word export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Code,
  FileType,
  History,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Document, Packer, Paragraph, TextRun } from "docx";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};
import { saveAs } from "file-saver";

interface Template {
  id: string;
  template_code: string;
  name: string;
  description: string;
  category: string;
  content: string;
  format: string;
  current_version: number;
  status: string;
  tags: string[];
  created_at: string;
  variables?: string[];
}

interface TemplateVersion {
  id: string;
  version_number: number;
  content: string;
  change_summary: string;
  created_at: string;
}

const DocumentTemplatesManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "report",
    content: "",
    format: "html",
    tags: ""
  });

  useEffect(() => {
    loadTemplates();
    
    const channel = supabase
      .channel("templates_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_templates"
        },
        () => {
          loadTemplates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    });
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Extract variables from content for each template
      const templatesWithVars = (data || []).map(template => ({
        ...template,
        variables: extractVariables(template.content)
      }));
      
      setTemplates(templatesWithVars);
    } catch (error: SupabaseError | null) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from("template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: SupabaseError | null) {
      console.error("Error loading versions:", error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return [...new Set(matches)];
  };

  const substituteVariables = (content: string, variables: Record<string, string>): string => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  };
    return result;
  };

  const createTemplate = async () => {
    try {
      const templateCode = `TPL-${Date.now()}`;
      const tags = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from("document_templates")
        .insert({
          template_code: templateCode,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          content: formData.content,
          format: formData.format,
          tags,
          status: "active"
        });

      if (error) throw error;

      toast({
        title: "✅ Template Created",
        description: "Document template has been created successfully",
      });

      setShowNewTemplate(false);
      setFormData({
        name: "",
        description: "",
        category: "report",
        content: "",
        format: "html",
        tags: ""
      });
      loadTemplates();
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error creating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTemplate = async (templateId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .update({ content: newContent })
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "✅ Template Updated",
        description: "Template has been updated and versioned",
      });

      loadTemplates();
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .update({ status: "archived" })
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template Archived",
        description: "Template has been archived",
      });

      loadTemplates();
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error archiving template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = (template: Template, variables: Record<string, string>) => {
    const startTime = Date.now();
    const doc = new jsPDF();
    const content = substituteVariables(template.content, variables);
    
    // Simple HTML to text conversion
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(textContent, 180);
    doc.text(lines, 14, 20);
    
    const fileName = `${template.template_code}.pdf`;
    doc.save(fileName);
    
    const processingTime = Date.now() - startTime;
    
    // Log usage
    supabase.from("template_usage_log").insert({
      template_id: template.id,
      version_number: template.current_version,
      output_format: "pdf",
      variables_used: variables,
      generation_time_ms: processingTime,
      success: true
    });
    
    toast({
      title: "✅ PDF Exported",
      description: `Template exported to ${fileName}`,
    });
  });

  const exportToWord = async (template: Template, variables: Record<string, string>) => {
    const startTime = Date.now();
    const content = substituteVariables(template.content, variables);
    
    // Simple HTML to text conversion
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(textContent)
            ]
          })
        ]
      }]
    });
    
    const blob = await Packer.toBlob(doc);
    const fileName = `${template.template_code}.docx`;
    saveAs(blob, fileName);
    
    const processingTime = Date.now() - startTime;
    
    // Log usage
    supabase.from("template_usage_log").insert({
      template_id: template.id,
      version_number: template.current_version,
      output_format: "docx",
      variables_used: variables,
      generation_time_ms: processingTime,
      success: true
    });
    
    toast({
      title: "✅ Word Document Exported",
      description: `Template exported to ${fileName}`,
    });
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
    case "contract":
      return <Badge className="bg-purple-500">Contract</Badge>;
    case "report":
      return <Badge className="bg-blue-500">Report</Badge>;
    case "certificate":
      return <Badge className="bg-green-500">Certificate</Badge>;
    case "invoice":
      return <Badge className="bg-yellow-500">Invoice</Badge>;
    default:
      return <Badge variant="outline">{category}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <p className="text-muted-foreground">
            Manage document templates with variable substitution
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates Library
              </CardTitle>
              <CardDescription>
                Create and manage document templates with dynamic variables
              </CardDescription>
            </div>
            <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Document Template</DialogTitle>
                  <DialogDescription>
                    Create a new template with variable support (use double curly braces syntax)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Inspection Report"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="form">Form</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of this template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Template Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Use {{vessel_name}}, {{commander}}, {{date}}, etc."
                      rows={10}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Variables: {extractVariables(formData.content).join(", ") || "None"}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., vessel, inspection, report"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleSetShowNewTemplate}>
                    Cancel
                  </Button>
                  <Button onClick={createTemplate}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p>Loading templates...</p>
            ) : templates.filter(t => t.status === "active").length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates found. Create your first template!
              </p>
            ) : (
              templates.filter(t => t.status === "active").map((template) => (
                <Card key={template.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{template.name}</span>
                            {getCategoryBadge(template.category)}
                            <Badge variant="outline">v{template.current_version}</Badge>
                            <Badge variant="secondary">{template.format}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.description}
                          </p>
                          {template.variables && template.variables.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">Variables:</span>
                              {template.variables.map((variable, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {template.tags && template.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap mt-2">
                              <span className="text-xs text-muted-foreground">Tags:</span>
                              {template.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template);
                            loadVersions(template.id);
                          }}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowPreview(true);
                            // Initialize preview variables
                            const vars: Record<string, string> = {};
                            template.variables?.forEach(v => {
                              vars[v] = "";
  });
                            setPreviewVariables(vars);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handledeleteTemplate}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview and Export Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Fill Template Variables</DialogTitle>
            <DialogDescription>
              Fill in the variables and export to PDF or Word
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.variables?.map((variable) => (
                  <div key={variable}>
                    <Label htmlFor={variable}>{variable}</Label>
                    <Input
                      id={variable}
                      value={previewVariables[variable] || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${variable}`}
                    />
                  </div>
                ))}
              </div>
              <div className="border rounded-md p-4 bg-muted">
                <Label>Preview</Label>
                <div 
                  className="mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: substituteVariables(selectedTemplate.content, previewVariables) 
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowPreview}>
              Close
            </Button>
            {selectedTemplate && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleexportToPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
                <Button
                  onClick={() => handleexportToWord}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Word
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default DocumentTemplatesManager;
