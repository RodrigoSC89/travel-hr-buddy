/**
 * PATCH 881: Document Templates Manager
 * Type-safe using interfaces aligned with actual document_templates schema
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Trash2,
  Code,
  FileType,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

// Local Template interface aligned with actual schema
interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  content: string;
  tags: string[];
  created_at: string;
  variables?: string[];
}

const DocumentTemplatesManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
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
    };
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map to local Template interface with safe defaults
      const templatesWithVars: Template[] = (data || []).map(row => {
        const contentStr = typeof row.content === "string" ? row.content : JSON.stringify(row.content || "");
        return {
          id: row.id,
          name: row.name || "Untitled",
          description: row.description,
          category: row.category,
          content: contentStr,
          tags: (row.tags as string[]) || [],
          created_at: row.created_at || new Date().toISOString(),
          variables: extractVariables(contentStr)
        };
      });
      
      setTemplates(templatesWithVars);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao carregar templates";
      toast({
        title: "Error loading templates",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    });
    return result;
  };

  const createTemplate = async () => {
    try {
      const tags = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      
      // Use type assertion to bypass schema mismatch for optional 'name' field
      const insertData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        content: formData.content,
        tags,
      } as Record<string, unknown>;

      const { error } = await supabase
        .from("document_templates")
        .insert(insertData as never);

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
        tags: ""
      });
      loadTemplates();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error creating template",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template has been deleted",
      });

      loadTemplates();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error deleting template",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async (template: Template, variables: Record<string, string>) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const content = substituteVariables(template.content, variables);
      
      // Simple HTML to text conversion
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";
      
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(textContent, 180);
      doc.text(lines, 14, 20);
      
      const fileName = `${template.name.replace(/\s+/g, "-")}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "✅ PDF Exported",
        description: `Template exported to ${fileName}`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error exporting PDF",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const exportToWord = async (template: Template, variables: Record<string, string>) => {
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
    const fileName = `${template.name.replace(/\s+/g, "-")}.docx`;
    saveAs(blob, fileName);
    
    toast({
      title: "✅ Word Document Exported",
      description: `Template exported to ${fileName}`,
    });
  };

  const getCategoryBadge = (category: string | null) => {
    switch (category) {
    case "contract":
      return <Badge className="bg-primary/80">Contract</Badge>;
    case "report":
      return <Badge className="bg-primary">Report</Badge>;
    case "certificate":
      return <Badge className="bg-green-600">Certificate</Badge>;
    case "invoice":
      return <Badge className="bg-amber-500">Invoice</Badge>;
    default:
      return <Badge variant="outline">{category || "Other"}</Badge>;
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Template Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., vessel, inspection, report"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
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
            ) : templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates found. Create your first template!
              </p>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{template.name}</span>
                            {getCategoryBadge(template.category)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.description || "No description"}
                          </p>
                          {template.variables && template.variables.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {template.variables.map((v, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <Code className="h-3 w-3 mr-1" />
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setPreviewVariables({});
                                setShowPreview(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportToPDF(template, previewVariables)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportToWord(template, previewVariables)}
                            >
                              <FileType className="h-4 w-4 mr-1" />
                              Word
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <h4 className="col-span-2 font-semibold">Fill Variables</h4>
                  {selectedTemplate.variables.map((v) => (
                    <div key={v}>
                      <Label htmlFor={v}>{v}</Label>
                      <Input
                        id={v}
                        value={previewVariables[v] || ""}
                        onChange={(e) =>
                          setPreviewVariables({ ...previewVariables, [v]: e.target.value })
                        }
                        placeholder={`Enter ${v}...`}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 border rounded-lg bg-background">
                <pre className="whitespace-pre-wrap text-sm">
                  {substituteVariables(selectedTemplate.content, previewVariables)}
                </pre>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportToPDF(selectedTemplate, previewVariables)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={() => exportToWord(selectedTemplate, previewVariables)}>
                  <FileType className="h-4 w-4 mr-2" />
                  Export Word
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTemplatesManager;
