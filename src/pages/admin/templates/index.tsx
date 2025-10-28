/**
 * PATCH 401 - Templates Management Page
 * Complete template system with TipTap editor, dynamic placeholders, preview, and PDF export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle2,
  FileCode,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import html2pdf from "html2pdf.js";
import { RoleBasedAccess } from "@/components/auth/role-based-access";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  content: string;
  variables: any;
  version: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Reports",
    content: "",
  });

  // Rich text editor for template content
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] p-4 border rounded-lg focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();

    const channel = supabase
      .channel("templates_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_templates",
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
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
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

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    return [...new Set(matches)];
  };

  const createTemplate = async () => {
    try {
      const content = editor?.getHTML() || formData.content;
      const variables = extractVariables(content);

      // Build variables JSON array
      const variablesJson = variables.map((varName) => ({
        name: varName,
        type: "text",
        required: true,
      }));

      const { error } = await supabase.from("document_templates").insert({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        content: content,
        variables: variablesJson,
        is_active: true,
        is_public: false,
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
        category: "Reports",
        content: "",
      });
      editor?.commands.setContent("");
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error creating template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .update({ is_active: false })
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template Archived",
        description: "Template has been archived",
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error archiving template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generatePreview = () => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.content;
    Object.entries(variableValues).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    });

    setPreviewContent(content);
    setShowPreview(true);
  };

  const exportToPDF = async () => {
    if (!previewContent) return;

    try {
      const element = document.createElement("div");
      element.innerHTML = previewContent;

      const opt = {
        margin: 1,
        filename: `${selectedTemplate?.name || "document"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "in" as const,
          format: "letter" as const,
          orientation: "portrait" as const,
        },
      };

      await html2pdf().from(element).set(opt).save();

      toast({
        title: "PDF Exported",
        description: "Document has been exported to PDF successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error exporting PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const insertPlaceholder = (varName: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${varName}}}`).run();
    }
  };

  return (
    <RoleBasedAccess allowedRoles={["admin"]}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Templates</h1>
            <p className="text-muted-foreground">
              Create and manage document templates with dynamic placeholders
            </p>
          </div>
          <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Use placeholders like {"{{nome}}"}, {"{{data}}"}, {"{{número_viagem}}"} in your content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Travel Approval Form"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this template"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reports">Reports</SelectItem>
                      <SelectItem value="Contracts">Contracts</SelectItem>
                      <SelectItem value="Letters">Letters</SelectItem>
                      <SelectItem value="Forms">Forms</SelectItem>
                      <SelectItem value="Invoices">Invoices</SelectItem>
                      <SelectItem value="Certificates">Certificates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Content</Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertPlaceholder("nome")}
                      >
                        + {"{{nome}}"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertPlaceholder("data")}
                      >
                        + {"{{data}}"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertPlaceholder("número_viagem")}
                      >
                        + {"{{número_viagem}}"}
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <div className="flex gap-2 p-2 border-b bg-muted">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                      >
                        <strong>B</strong>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                      >
                        <em>I</em>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                      >
                        H1
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                      >
                        H2
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          editor?.chain().focus().toggleBulletList().run()
                        }
                      >
                        • List
                      </Button>
                    </div>
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={createTemplate}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading templates...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const variables = extractVariables(template.content);
              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {variables.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Variables:</p>
                          <div className="flex flex-wrap gap-1">
                            {variables.slice(0, 3).map((varName) => (
                              <Badge key={varName} variant="secondary" className="text-xs">
                                {"{{" + varName + "}}"}
                              </Badge>
                            ))}
                            {variables.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{variables.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setVariableValues({});
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Preview & Export Dialog */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTemplate.name}</DialogTitle>
                <DialogDescription>
                  Fill in the variables and preview the document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {extractVariables(selectedTemplate.content).map((varName) => (
                  <div key={varName}>
                    <Label htmlFor={varName}>{varName}</Label>
                    <Input
                      id={varName}
                      value={variableValues[varName] || ""}
                      onChange={(e) =>
                        setVariableValues({
                          ...variableValues,
                          [varName]: e.target.value,
                        })
                      }
                      placeholder={`Enter ${varName}`}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={generatePreview} className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Generate Preview
                  </Button>
                  {showPreview && (
                    <Button onClick={exportToPDF} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  )}
                </div>
                {showPreview && (
                  <div className="border rounded-lg p-4 bg-white">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </RoleBasedAccess>
  );
};

export default TemplatesPage;
