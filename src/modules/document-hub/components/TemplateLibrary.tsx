import { useEffect, useState, useCallback } from "react";;

/**
 * PATCH 380: Document Template Library with PDF Generation
 * Template management with dynamic placeholders and PDF export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Download, Edit, Trash2, History, Copy } from "lucide-react";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: string;
  placeholders?: string[];
  is_public: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  content: string;
  change_summary?: string;
  created_at: string;
}

export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    content: "",
    is_public: false
  });

  const [generateData, setGenerateData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categoryFilter, templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      };
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
    } catch (error) {
      console.error("Error loading versions:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    setFilteredTemplates(filtered);
  };

  const extractPlaceholders = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!placeholders.includes(match[1].trim())) {
        placeholders.push(match[1].trim());
      }
    }

    return placeholders;
  };

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const placeholders = extractPlaceholders(formData.content);

      const { data: template, error } = await supabase
        .from("document_templates")
        .insert([{
          ...formData,
          user_id: user.id,
          placeholders,
          version: 1
        }])
        .select()
        .single();

      if (error) throw error;

      // Create initial version
      await supabase
        .from("template_versions")
        .insert([{
          template_id: template.id,
          version_number: 1,
          content: formData.content,
          change_summary: "Initial version",
          changed_by: user.id
        }]);

      toast({
        title: "Success",
        description: "Template created successfully"
      };

      setIsCreateOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      };
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully"
      };

      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      };
    }
  };

  const openGenerateDialog = (template: Template) => {
    setSelectedTemplate(template);
    const placeholders = template.placeholders || extractPlaceholders(template.content);
    const initialData: Record<string, string> = {};
    placeholders.forEach(p => {
      initialData[p] = "";
  };
    setGenerateData(initialData);
    setIsGenerateOpen(true);
  };

  const generatePDF = () => {
    if (!selectedTemplate) return;

    try {
      let content = selectedTemplate.content;
      
      // Replace placeholders
      Object.keys(generateData).forEach(key => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
        content = content.replace(regex, generateData[key] || `[${key}]`);
  };

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(selectedTemplate.name, margin, margin);

      // Add content
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, maxWidth);
      doc.text(lines, margin, margin + 15);

      // Save PDF
      doc.save(`${selectedTemplate.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`);

      // Log export
      supabase
        .from("itinerary_exports")
        .insert([{
          export_format: "pdf",
          file_size_kb: Math.round(doc.output("blob").size / 1024)
        }]);

      toast({
        title: "Success",
        description: "PDF generated successfully"
      };

      setIsGenerateOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      };
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
      content: "",
      is_public: false
    };
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      general: "bg-blue-100 text-blue-800",
      report: "bg-green-100 text-green-800",
      legal: "bg-purple-100 text-purple-800",
      compliance: "bg-red-100 text-red-800"
    };

    return <Badge className={variants[category] || "bg-gray-100"}>{category}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Document Template Library</h1>
          <p className="text-muted-foreground">
            Manage reusable templates with dynamic placeholders
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Create and manage document templates with PDF generation
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Template</DialogTitle>
                  <DialogDescription>
                    Create a new document template with placeholders
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Template Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={handleChange})}
                        placeholder="Monthly Report Template"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={handleChange})}
                      placeholder="Template description..."
                    />
                  </div>

                  <div>
                    <Label>Content *</Label>
                    <Textarea
                      value={formData.content}
                      onChange={handleChange})}
                      placeholder="Use {{placeholder}} syntax for dynamic content..."
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use double curly braces for placeholders, e.g., {"{{company_name}}"}, {"{{date}}"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={handleChange})}
                      className="rounded"
                    />
                    <Label htmlFor="is_public" className="cursor-pointer">
                      Make template public (visible to all users)
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleSetIsCreateOpen}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates found. Create your first template to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Placeholders</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-gray-500">{template.description}</div>
                        )}
                      </TableCell>
                      <TableCell>{getCategoryBadge(template.category)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{template.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600">
                          {template.placeholders && template.placeholders.length > 0
                            ? template.placeholders.length + " placeholder(s)"
                            : "No placeholders"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={template.is_public ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {template.is_public ? "Public" : "Private"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleopenGenerateDialog}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              loadVersions(template.id);
                              setIsVersionsOpen(true);
                            }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlehandleDelete}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate PDF Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate PDF</DialogTitle>
            <DialogDescription>
              Fill in the placeholders to generate your document
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
            {selectedTemplate && Object.keys(generateData).map((placeholder) => (
              <div key={placeholder}>
                <Label>{placeholder}</Label>
                <Input
                  value={generateData[placeholder]}
                  onChange={handleChange})}
                  placeholder={`Enter ${placeholder}...`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetIsGenerateOpen}>
              Cancel
            </Button>
            <Button onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              Template versions for {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {versions.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">No version history available</div>
            ) : (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>Version {version.version_number}</Badge>
                      <div className="text-xs text-gray-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {version.change_summary && (
                      <div className="text-sm text-gray-600">{version.change_summary}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSetIsVersionsOpen}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
