/**
 * PATCH 463 - Complete Template Editor
 * PATCH 866: Fully refactored to align with actual database schema
 * Uses: ai_document_templates table with correct column names
 * PATCH: XSS Protection - Added createSafeHTML
 */

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createSafeHTML } from "@/lib/utils/safe-html";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Download,
  Save,
  Plus,
  Type,
  Calendar,
  User,
  Hash,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Building,
  Eye,
  Edit,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import type { Database } from "@/integrations/supabase/types";

// Type aligned with actual database schema
type TemplateRow = Database["public"]["Tables"]["ai_document_templates"]["Row"];

// Extended type for UI - variables JSONB contains placeholders
interface Template {
  id: string;
  title: string;
  content: string;
  template_type: string;
  variables: Record<string, string> | null;
  is_favorite: boolean | null;
  is_private: boolean | null;
  tags: string[] | null;
  created_at: string | null;
  user_id: string | null;
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
  { key: "{{crew_name}}", label: "Crew Name", icon: User },
  { key: "{{crew_position}}", label: "Crew Position", icon: Type },
  { key: "{{vessel_imo}}", label: "Vessel IMO", icon: Hash },
  { key: "{{departure_port}}", label: "Departure Port", icon: MapPin },
  { key: "{{arrival_port}}", label: "Arrival Port", icon: MapPin },
];

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

export const CompleteTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateType, setTemplateType] = useState("document");
  const [placeholderValues, setPlaceholderValues] = useState<PlaceholderValue>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFillDialog, setShowFillDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start typing or select a template...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 border rounded-md bg-background",
      },
    },
  });

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map to our interface
      const mapped: Template[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        template_type: row.template_type,
        variables: row.variables as Record<string, string> | null,
        is_favorite: row.is_favorite,
        is_private: row.is_private,
        tags: row.tags,
        created_at: row.created_at,
        user_id: row.user_id,
      }));

      setTemplates(mapped);
    } catch (error) {
      logger.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (selectedTemplate && editor) {
      editor.commands.setContent(selectedTemplate.content);
      setTemplateTitle(selectedTemplate.title);
      setTemplateType(selectedTemplate.template_type);
      
      // Initialize placeholder values from variables
      const initialValues: PlaceholderValue = {};
      if (selectedTemplate.variables) {
        Object.keys(selectedTemplate.variables).forEach(key => {
          initialValues[key] = "";
        });
      }
      setPlaceholderValues(initialValues);
    }
  }, [selectedTemplate, editor]);

  const extractPlaceholders = (content: string): Record<string, string> => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(regex) || [];
    const variables: Record<string, string> = {};
    matches.forEach(match => {
      variables[match] = "";
    });
    return variables;
  };

  const saveTemplate = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const variables = extractPlaceholders(content);

    if (!templateTitle) {
      toast.error("Please enter a template title");
      return;
    }

    try {
      setIsSaving(true);
      
      const templateData = {
        title: templateTitle,
        content,
        template_type: templateType,
        variables: variables,
        user_id: user?.id,
        is_favorite: false,
        is_private: true,
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
          .insert([templateData]);

        if (error) throw error;
        toast.success("Template saved successfully");
      }

      setShowSaveDialog(false);
      loadTemplates();
    } catch (error) {
      logger.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
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
      logger.error("Error deleting template:", error);
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
    });

    editor.commands.setContent(content);
    setShowFillDialog(false);
    toast.success("Template filled with values");
  };

  const exportToPDF = async () => {
    if (!editor) return;

    try {
      const JsPDF = await loadJsPDF();
      const doc = new JsPDF();
      const content = editor.getText();
      const lines = doc.splitTextToSize(content, 180);
      
      doc.setFontSize(12);
      doc.text(lines, 14, 20);
      doc.save(`${templateTitle || "document"}.pdf`);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const exportToWord = async () => {
    if (!editor) return;

    try {
      const content = editor.getText();
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(content)],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${templateTitle || "document"}.docx`);
      
      toast.success("Word document exported successfully");
    } catch (error) {
      logger.error("Error exporting Word:", error);
      toast.error("Failed to export Word document");
    }
  };

  const showPreview = () => {
    if (!editor) return;
    
    let content = editor.getHTML();
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[{}]/g, "\\$&"), "g");
      content = content.replace(regex, value || `<span class="text-warning">${key}</span>`);
    });
    
    setPreviewContent(content);
    setShowPreviewDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editor de Templates</h1>
          <p className="text-muted-foreground">Crie e gerencie templates de documentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFillDialog(true)} disabled={!selectedTemplate}>
            <Edit className="h-4 w-4 mr-2" />
            Preencher
          </Button>
          <Button onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Template
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Templates List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full mb-4"
              onClick={() => {
                setSelectedTemplate(null);
                setTemplateTitle("");
                editor?.commands.setContent("<p>Start typing...</p>");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
            
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum template encontrado
                </p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{template.title}</span>
                        </div>
                        {template.is_favorite && (
                          <Star className="h-3 w-3 fill-warning text-warning" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">
                          {template.template_type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <EditorContent editor={editor} />
          </CardContent>
        </Card>

        {/* Placeholders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Placeholders</CardTitle>
            <CardDescription className="text-xs">Clique para inserir no editor</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {AVAILABLE_PLACEHOLDERS.map((ph) => (
                  <Button
                    key={ph.key}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => insertPlaceholder(ph.key)}
                  >
                    <ph.icon className="h-3 w-3 mr-2" />
                    {ph.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={showPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="w-full" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={exportToWord}>
                <FileText className="h-4 w-4 mr-2" />
                Export Word
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título do Template</Label>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="Ex: Contrato de Trabalho"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                  <SelectItem value="certificate">Certificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fill Dialog */}
      <Dialog open={showFillDialog} onOpenChange={setShowFillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preencher Placeholders</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {Object.keys(placeholderValues).map((key) => (
                <div key={key}>
                  <Label className="text-xs">{key}</Label>
                  <Input
                    value={placeholderValues[key]}
                    onChange={(e) => setPlaceholderValues({
                      ...placeholderValues,
                      [key]: e.target.value
                    })}
                    placeholder={`Valor para ${key}`}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFillDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={fillTemplate}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog - XSS Protected */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview do Documento</DialogTitle>
          </DialogHeader>
          <div 
            className="prose prose-sm max-w-none p-4 border rounded-md bg-background"
            dangerouslySetInnerHTML={createSafeHTML(previewContent)}
          />
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompleteTemplateEditor;
