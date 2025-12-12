import { useEffect, useState, useCallback, useMemo } from "react";;

/**
 * PATCH 463 - Complete Template Editor
 * Enhanced drag-and-drop editor with dynamic placeholders and PDF export
 */

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Download,
  Save,
  Plus,
  Settings,
  Type,
  Calendar,
  User,
  Hash,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Building,
  FileDown,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx"; // PATCH 493: Add Word export
import { saveAs } from "file-saver"; // PATCH 493: For downloading files

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

interface Template {
  id: string;
  title: string;
  content: string;
  placeholders: string[];
  created_at: string;
  created_by: string;
  is_favorite: boolean;
}

interface PlaceholderValue {
  [key: string]: string;
}

// Available placeholders
const AVAILABLE_PLACEHOLDERS = [
  { key: "{{company_name}}", label: "Company Name", icon: Building },
  { key: "{{client_name}}", label: "Client Name", icon: User },
  { key: "{{date}}", label: "Date", icon: Calendar },
  { key: "{{document_number}}", label: "Document Number", icon: Hash },
  { key: "{{amount}}", label: "Amount", icon: DollarSign },
  { key: "{{email}}", label: "Email", icon: Mail },
  { key: "{{phone}}", label: "Phone", icon: Phone },
  { key: "{{address}}", label: "Address", icon: MapPin },
  { key: "{{vessel_name}}", label: "Vessel Name", icon: Building },
  { key: "{{port}}", label: "Port", icon: MapPin },
  // PATCH 493: Additional maritime placeholders
  { key: "{{crew_name}}", label: "Crew Name", icon: User },
  { key: "{{crew_position}}", label: "Crew Position", icon: Type },
  { key: "{{vessel_imo}}", label: "Vessel IMO", icon: Hash },
  { key: "{{departure_port}}", label: "Departure Port", icon: MapPin },
  { key: "{{arrival_port}}", label: "Arrival Port", icon: MapPin },
];

export const CompleteTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValue>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFillDialog, setShowFillDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false); // PATCH 493: Preview dialog
  const [previewContent, setPreviewContent] = useState(""); // PATCH 493: Preview content
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start typing or select a template...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 border rounded-md",
      },
    },
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate && editor) {
      editor.commands.setContent(selectedTemplate.content);
      setTemplateTitle(selectedTemplate.title);
      
      // Initialize placeholder values
      const initialValues: PlaceholderValue = {};
      selectedTemplate.placeholders?.forEach(ph => {
        initialValues[ph] = "";
  });
      setPlaceholderValues(initialValues);
    }
  }, [selectedTemplate, editor]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const extractPlaceholders = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(regex) || [];
    return [...new Set(matches)];
  });

  const saveTemplate = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const placeholders = extractPlaceholders(content);

    if (!templateTitle) {
      toast.error("Please enter a template title");
      return;
    }

    try {
      const templateData = {
        title: templateTitle,
        content,
        placeholders,
        created_by: user?.id,
        is_favorite: false,
      };

      if (selectedTemplate) {
        // Update existing
        const { error } = await supabase
          .from("ai_document_templates")
          .update(templateData)
          .eq("id", selectedTemplate.id);

        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from("ai_document_templates")
          .insert(templateData);

        if (error) throw error;
        toast.success("Template saved successfully");
      }

      setShowSaveDialog(false);
      loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("ai_document_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast.success("Template deleted");
      loadTemplates();
      
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        editor?.commands.setContent("<p>Start typing or select a template...</p>");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    if (editor) {
      editor.chain().focus().insertContent(placeholder).run();
    }
  };

  const fillTemplate = () => {
    if (!editor) return;

    let content = editor.getHTML();
    
    // Replace placeholders with values
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[{}]/g, "\\$&"), "g");
      content = content.replace(regex, value || key);
  };

    editor.commands.setContent(content);
    setShowFillDialog(false);
    toast.success("Template filled with values");
  };

  const exportToPDF = async () => {
    if (!editor) return;

    try {
      const doc = new jsPDF();
      const content = editor.getText();
      const lines = doc.splitTextToSize(content, 180);
      
      doc.setFontSize(12);
      doc.text(lines, 15, 15);
      
      const filename = `${templateTitle || "document"}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
      
      // PATCH 493: Save to history
      await saveExportHistory("PDF", filename);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const exportToHTML = async () => {
    if (!editor) return;

    try {
      const html = editor.getHTML();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateTitle || "document"}_${new Date().toISOString().split("T")[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);
      
      // PATCH 493: Save to history
      await saveExportHistory("HTML", link.download);
      
      toast.success("HTML exported successfully");
    } catch (error) {
      console.error("Error exporting HTML:", error);
      console.error("Error exporting HTML:", error);
      toast.error("Failed to export HTML");
    }
  };

  // PATCH 493: New Word/DOCX export
  const exportToWord = async () => {
    if (!editor) return;

    try {
      const content = editor.getText();
      const paragraphs = content.split("\n").map(line => 
        new Paragraph({
          children: [new TextRun(line)]
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      };

      const blob = await Packer.toBlob(doc);
      const filename = `${templateTitle || "document"}_${new Date().toISOString().split("T")[0]}.docx`;
      saveAs(blob, filename);
      
      // PATCH 493: Save to history
      await saveExportHistory("DOCX", filename);
      
      toast.success("Word document exported successfully");
    } catch (error) {
      console.error("Error exporting Word:", error);
      console.error("Error exporting Word:", error);
      toast.error("Failed to export Word document");
    }
  };

  // PATCH 493: Preview before export
  const showPreview = () => {
    if (!editor) return;
    
    let content = editor.getHTML();
    
    // Replace placeholders with values for preview
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[{}]/g, "\\$&"), "g");
      content = content.replace(regex, value || `<span class="text-orange-500">${key}</span>`);
  };
    
    setPreviewContent(content);
    setShowPreviewDialog(true);
  };

  // PATCH 493: Save export history to Supabase
  const saveExportHistory = async (format: string, filename: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from("template_export_history")
        .insert({
          template_id: selectedTemplate?.id,
          template_title: templateTitle || "Untitled",
          export_format: format,
          filename: filename,
          exported_by: user.id,
          exported_at: new Date().toISOString(),
          placeholder_values: placeholderValues
        });
      
      if (error) {
      }
    } catch (error) {
      console.error("Error saving export history:", error);
      console.error("Error saving export history:", error);
    }
  };

  const createNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateTitle("");
    setPlaceholderValues({});
    editor?.commands.setContent("<p>Start typing your new template...</p>");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Template Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            PATCH 463 - Create and manage document templates with dynamic fields
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button variant="outline" onClick={handleSetShowSaveDialog}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={handleSetShowFillDialog}>
            <Edit className="h-4 w-4 mr-2" />
            Fill Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Templates List & Placeholders */}
        <div className="lg:col-span-1 space-y-4">
          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">My Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No templates yet
                </div>
              ) : (
                templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? "border-primary" : ""
                    }`}
                    onClick={handleSetSelectedTemplate}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {template.placeholders?.length || 0} placeholders
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Placeholders Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Insert Placeholders</CardTitle>
              <CardDescription className="text-xs">
                Click to insert into template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {AVAILABLE_PLACEHOLDERS.map((placeholder) => {
                const Icon = placeholder.icon;
                return (
                  <Button
                    key={placeholder.key}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleinsertPlaceholder}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {placeholder.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {templateTitle || "Untitled Template"}
                  </CardTitle>
                  <CardDescription>
                    Edit template content and insert placeholders
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={showPreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToHTML}>
                    <FileDown className="h-4 w-4 mr-2" />
                    HTML
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToWord}>
                    <FileText className="h-4 w-4 mr-2" />
                    Word
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EditorContent editor={editor} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog - PATCH 493 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div 
            className="prose prose-sm max-w-none border rounded-md p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowPreviewDialog}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPreviewDialog(false);
              exportToPDF();
            }}>
              Export as PDF
            </Button>
            <Button onClick={() => {
              setShowPreviewDialog(false);
              exportToWord();
            }}>
              Export as Word
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateTitle">Template Title</Label>
              <Input
                id="templateTitle"
                value={templateTitle}
                onChange={handleChange}
                placeholder="e.g., Invoice Template"
              />
            </div>
            {editor && (
              <div className="text-sm text-muted-foreground">
                <p>Detected placeholders:</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {extractPlaceholders(editor.getHTML()).map((ph) => (
                    <Badge key={ph} variant="secondary">
                      {ph}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowSaveDialog}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fill Template Dialog */}
      <Dialog open={showFillDialog} onOpenChange={setShowFillDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fill Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
            {editor && extractPlaceholders(editor.getHTML()).map((placeholder) => {
              const placeholderInfo = AVAILABLE_PLACEHOLDERS.find(
                (p) => p.key === placeholder
              );
              return (
                <div key={placeholder} className="space-y-2">
                  <Label>
                    {placeholderInfo?.label || placeholder}
                    <span className="text-xs text-muted-foreground ml-2">
                      {placeholder}
                    </span>
                  </Label>
                  <Input
                    value={placeholderValues[placeholder] || ""}
                    onChange={handleChange})
                    }
                    placeholder={`Enter ${placeholderInfo?.label || placeholder}`}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowFillDialog}>
              Cancel
            </Button>
            <Button onClick={fillTemplate}>
              <Edit className="h-4 w-4 mr-2" />
              Fill Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompleteTemplateEditor;
