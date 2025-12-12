/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 275 - Document Templates Editor
 * Create and manage document templates with variable support
 */

/**
 * PATCH 554 - Document Templates Completion
 * Enhanced with WYSIWYG editor, variable placeholders, and PDF export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Code,
  FileType
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import html2pdf from "html2pdf.js";
import { TemplateWYSIWYGEditor } from "./components/TemplateWYSIWYGEditor";

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[]; // e.g., ["{{nome}}", "{{data}}", "{{empresa}}"]
  createdAt: Date;
  updatedAt: Date;
}

export default function TemplatesPanel() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Relatório de Inspeção",
      description: "Template padrão para relatórios de inspeção de embarcações",
      content: `<h1>Relatório de Inspeção</h1>
<p><strong>Data:</strong> {{data}}</p>
<p><strong>Inspetor:</strong> {{nome}}</p>
<p><strong>Embarcação:</strong> {{embarcacao}}</p>
<h2>Detalhes da Inspeção</h2>
<p>{{detalhes}}</p>
<h2>Conclusão</h2>
<p>{{conclusao}}</p>`,
      variables: ["{{data}}", "{{nome}}", "{{embarcacao}}", "{{detalhes}}", "{{conclusao}}"],
      createdAt: new Date("2025-10-20"),
      updatedAt: new Date("2025-10-20")
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [editorMode, setEditorMode] = useState<"wysiwyg" | "html">("wysiwyg");
  
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    content: ""
  });

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // match[1] contains the captured group (variable name without braces)
      matches.push(`{{${match[1]}}}`);
    }
    
    return [...new Set(matches)]; // Remove duplicates
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const variables = extractVariables(newTemplate.content);
    
    const template: Template = {
      id: `t-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      content: newTemplate.content,
      variables,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTemplates([...templates, template]);
    toast.success("Template criado com sucesso!", {
      description: `${variables.length} variáveis detectadas`
    });

    setIsDialogOpen(false);
    setNewTemplate({ name: "", description: "", content: "" });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    const variables = extractVariables(editingTemplate.content);
    const updatedTemplate = {
      ...editingTemplate,
      variables,
      updatedAt: new Date()
    };

    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    toast.success("Template atualizado com sucesso!");
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.info("Template removido");
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(v => {
      const varName = v.replace(/\{\{|\}\}/g, "");
      initialVariables[varName] = "";
  };
    setPreviewVariables(initialVariables);
  };

  const renderPreview = (): string => {
    if (!previewTemplate) return "";
    
    let content = previewTemplate.content;
    
    // Sanitize content to prevent XSS
    // Replace script tags and dangerous attributes
    content = content
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, "");
    
    // Replace variables with values
    Object.entries(previewVariables).forEach(([key, value]) => {
      // Escape HTML in user input to prevent XSS
      const escapedValue = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      content = content.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"), 
        escapedValue || `[${key}]`
      );
    });
    
    return content;
  });

  const handleExportPDF = async (template: Template) => {
    try {
      const content = renderPreview();
      const element = document.createElement("div");
      element.innerHTML = content;
      element.style.padding = "20px";
      
      const opt = {
        margin: 1,
        filename: `${template.name.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
    }
  };

  const handleExportHTML = (template: Template) => {
    const content = renderPreview();
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML exportado com sucesso!");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Gerenciamento de Templates
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie templates de documentos com variáveis dinâmicas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Use variáveis no formato {"{{nome}}"}, {"{{data}}"}, etc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Template *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Relatório de Inspeção"
                  value={newTemplate.name}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição opcional"
                  value={newTemplate.description}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as "wysiwyg" | "html"}>
                    <TabsList className="h-8">
                      <TabsTrigger value="wysiwyg" className="text-xs">Editor</TabsTrigger>
                      <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {editorMode === "wysiwyg" ? (
                  <TemplateWYSIWYGEditor
                    content={newTemplate.content}
                    onChange={(content) => setNewTemplate({ ...newTemplate, content })}
                  />
                ) : (
                  <Textarea
                    id="content"
                    placeholder={"<h1>Título</h1>\n<p>{{nome}}</p>\n<p>{{data}}</p>"}
                    value={newTemplate.content}
                    onChange={handleChange})}
                    rows={15}
                    className="font-mono text-sm"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Variáveis detectadas: {extractVariables(newTemplate.content).join(", ") || "Nenhuma"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetIsDialogOpen}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTemplate}>
                Criar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlehandlePreview}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSetEditingTemplate}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlehandleDeleteTemplate}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Variáveis:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, idx) => (
                      <Badge key={idx} variant="secondary">
                        <Code className="h-3 w-3 mr-1" />
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Criado em {template.createdAt.toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Atualizado em {template.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTemplate && (
        <Dialog open={true} onOpenChange={() => setEditingTemplate(null}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  value={editingTemplate.description}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Conteúdo HTML</Label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={handleChange})}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetEditingTemplate}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateTemplate}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={true} onOpenChange={() => setPreviewTemplate(null}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visualizar Template: {previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <Label>Preencha as Variáveis</Label>
                {previewTemplate.variables.map((variable) => {
                  const varName = variable.replace(/\{\{|\}\}/g, "");
                  return (
                    <div key={variable} className="grid gap-2">
                      <Label className="text-sm">{variable}</Label>
                      <Input
                        value={previewVariables[varName] || ""}
                        onChange={handleChange})}
                        placeholder={`Valor para ${variable}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Visualização:</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview() }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handlehandleExportHTML}
                className="gap-2"
              >
                <FileType className="h-4 w-4" />
                Exportar HTML
              </Button>
              <Button 
                onClick={() => handlehandleExportPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
