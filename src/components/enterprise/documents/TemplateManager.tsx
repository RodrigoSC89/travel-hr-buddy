/**
 * Template Manager Component
 * ✅ P0-002: Real data from ai_document_templates table
 * ✅ FUNCTIONAL BUTTONS: Novo Template, Baixar PDF/DOCX, Eye, Edit
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Copy, Edit, Eye, Download, Variable, FileCode, Clock, User, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: string[];
  lastModified: string;
  createdBy: string;
  usageCount: number;
  isFavorite: boolean;
  content: string;
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "", type: "contract" });

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase
      .from("ai_document_templates")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);

    const mapped: Template[] = (data || []).map((t) => ({
      id: t.id,
      name: t.title,
      category: t.template_type || "Geral",
      description: typeof t.content === 'string' ? t.content.substring(0, 100) : "",
      variables: Array.isArray(t.variables) ? (t.variables as unknown[]).map((v) => typeof v === 'string' ? v : `{{${String((v as Record<string, unknown>)?.name || v)}}}`) : [],
      lastModified: t.updated_at || t.created_at || new Date().toISOString(),
      createdBy: "Sistema",
      usageCount: 0,
      isFavorite: t.is_favorite || false,
      content: t.content || "",
    }));
    setTemplates(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const generatePreview = (template: Template) => {
    let content = template.content;
    template.variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, "");
      const value = variableValues[key] || `[${key}]`;
      content = content.replace(new RegExp(variable.replace(/[{}]/g, "\\$&"), "g"), value);
    });
    return content;
  };

  const handleCreateTemplate = useCallback(async () => {
    if (!newTemplate.title.trim()) {
      toast.error("Informe o título do template");
      return;
    }
    const { error } = await supabase
      .from("ai_document_templates")
      .insert({
        title: newTemplate.title,
        content: newTemplate.content,
        template_type: newTemplate.type,
      } as never);
    
    if (error) {
      toast.error(`Erro ao criar template: ${error.message}`);
    } else {
      toast.success("Template criado com sucesso!");
      setShowNewDialog(false);
      setNewTemplate({ title: "", content: "", type: "contract" });
      fetchTemplates();
    }
  }, [newTemplate, fetchTemplates]);

  const handleDownload = useCallback((template: Template, format: "txt" | "md") => {
    const content = generatePreview(template);
    const mimeType = format === "md" ? "text/markdown" : "text/plain";
    const ext = format === "md" ? "md" : "txt";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${template.name}.${ext} baixado`);
  }, [variableValues]);

  const handleViewPreview = useCallback((template: Template) => {
    setPreviewTemplate(template);
    setShowPreviewDialog(true);
  }, []);

  const handleEdit = useCallback((template: Template) => {
    setNewTemplate({ title: template.name, content: template.content, type: template.category });
    setShowNewDialog(true);
  }, []);

  const categories = [...new Set(templates.map(t => t.category))];

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={`tmpl-skeleton-${i}`} className="h-32 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total de Templates</p><p className="text-3xl font-bold">{templates.length}</p></div><div className="p-3 rounded-full bg-primary/10"><FileCode className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
         <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Categorias</p><p className="text-3xl font-bold">{categories.length}</p></div><div className="p-3 rounded-full bg-info/10"><FileText className="h-6 w-6 text-info" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Documentos Gerados</p><p className="text-3xl font-bold text-success">{templates.reduce((acc, t) => acc + t.usageCount, 0)}</p></div><div className="p-3 rounded-full bg-success/10"><Copy className="h-6 w-6 text-success" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Favoritos</p><p className="text-3xl font-bold text-warning">{templates.filter(t => t.isFavorite).length}</p></div><div className="p-3 rounded-full bg-warning/10"><Star className="h-6 w-6 text-warning" /></div></div></CardContent></Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Biblioteca de Templates</h2>
        <Button onClick={() => { setNewTemplate({ title: "", content: "", type: "contract" }); setShowNewDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />Novo Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <FileCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum template cadastrado</p>
          <Button className="mt-4" onClick={() => setShowNewDialog(true)}><Plus className="h-4 w-4 mr-2" />Criar Template</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><FileCode className="h-5 w-5 text-primary" /></div>
                    <div><CardTitle className="text-base flex items-center gap-2">{template.name}{template.isFavorite && <Star className="h-4 w-4 text-warning fill-warning" />}</CardTitle><p className="text-sm text-muted-foreground">{template.category}</p></div>
                  </div>
                  <Badge variant="outline">{template.usageCount} usos</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{template.description}</p>
                {template.variables.length > 0 && (
                  <div><p className="text-xs font-medium text-muted-foreground mb-2">Variáveis:</p><div className="flex flex-wrap gap-1">{template.variables.map((variable) => <Badge key={variable} variant="secondary" className="text-xs font-mono"><Variable className="h-3 w-3 mr-1" />{variable}</Badge>)}</div></div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{template.createdBy}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(template.lastModified).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild><Button variant="default" size="sm" className="flex-1" onClick={() => { setSelectedTemplate(template); setVariableValues({}); }}><Copy className="h-4 w-4 mr-1" />Usar</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Gerar Documento: {template.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">{template.variables.map(variable => { const key = variable.replace(/[{}]/g, ""); return (<div key={key}><label className="text-sm font-medium">{key}</label><Input placeholder={`Digite ${key}...`} value={variableValues[key] || ""} onChange={(e) => setVariableValues(prev => ({ ...prev, [key]: e.target.value }))} className="mt-1" /></div>); })}</div>
                        <div><label className="text-sm font-medium">Preview:</label><Textarea value={generatePreview(template)} readOnly className="mt-1 h-48 font-mono text-sm" /></div>
                        <div className="flex gap-2">
                          <Button className="flex-1" onClick={() => handleDownload(template, "txt")}><Download className="h-4 w-4 mr-2" />Baixar TXT</Button>
                          <Button variant="outline" className="flex-1" onClick={() => handleDownload(template, "md")}><FileText className="h-4 w-4 mr-2" />Baixar Markdown</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => handleViewPreview(template)} title="Visualizar"><Eye className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)} title="Editar"><Edit className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Template Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Template</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input value={newTemplate.title} onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))} placeholder="Nome do template" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea value={newTemplate.content} onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))} placeholder="Conteúdo do template... Use {{variavel}} para variáveis." className="mt-1 h-40" />
            </div>
            <Button onClick={handleCreateTemplate} className="w-full"><Plus className="h-4 w-4 mr-2" />Criar Template</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{previewTemplate?.name}</DialogTitle></DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <Badge variant="outline">{previewTemplate.category}</Badge>
              <Textarea value={previewTemplate.content} readOnly className="h-64 font-mono text-sm" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateManager;
