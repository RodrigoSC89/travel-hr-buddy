"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  FileText, Search, Plus, Copy, Edit, Trash2, Star,
  Lock, Unlock, Loader2, CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface AIDocumentTemplate {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_private: boolean;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AITemplatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<AIDocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AIDocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AIDocumentTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_favorite: false,
    is_private: false,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchTerm, templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as unknown as AIDocumentTemplate[]);
      setFilteredTemplates((data || []) as unknown as AIDocumentTemplate[]);
    } catch (error) {
      logger.error("Error loading templates:", error);
      toast({ title: "Erro ao carregar templates", description: "Não foi possível carregar a lista de templates.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates);
      return;
    }
    const filtered = templates.filter(
      (template) =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTemplates(filtered);
  };

  const handleApplyTemplate = (template: AIDocumentTemplate) => {
    localStorage.setItem("applied_template", template.content);
    localStorage.setItem("applied_template_title", template.title);
    toast({ title: "Template aplicado", description: "Redirecionando para o editor..." });
    navigate("/admin/documents/ai");
  };

  const handleCopyTemplate = async (template: AIDocumentTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      toast({ title: "Template copiado", description: "O conteúdo foi copiado para a área de transferência." });
    } catch (error) {
      logger.error("Error copying template:", error);
      toast({ title: "Erro ao copiar", description: "Não foi possível copiar o template.", variant: "destructive" });
    }
  };

  const handleToggleFavorite = async (template: AIDocumentTemplate) => {
    try {
      const { error } = await supabase
        .from("ai_document_templates")
        .update({ is_favorite: !template.is_favorite })
        .eq("id", template.id);

      if (error) throw error;
      setTemplates(templates.map(t => t.id === template.id ? { ...t, is_favorite: !t.is_favorite } : t));
      toast({ title: template.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos" });
    } catch (error) {
      logger.error("Error toggling favorite:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o template.", variant: "destructive" });
    }
  };

  const handleTogglePrivate = async (template: AIDocumentTemplate) => {
    try {
      const { error } = await supabase
        .from("ai_document_templates")
        .update({ is_private: !template.is_private })
        .eq("id", template.id);

      if (error) throw error;
      setTemplates(templates.map(t => t.id === template.id ? { ...t, is_private: !t.is_private } : t));
      toast({ title: template.is_private ? "Template tornado público" : "Template tornado privado" });
    } catch (error) {
      logger.error("Error toggling private:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o template.", variant: "destructive" });
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !formData.title.trim() || !formData.content.trim()) {
      toast({ title: "Erro de validação", description: "Título e conteúdo são obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("ai_document_templates")
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            is_favorite: formData.is_favorite,
            is_private: formData.is_private,
            tags: formData.tags,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast({ title: "Template atualizado", description: "O template foi atualizado com sucesso." });
      } else {
        const { error } = await supabase
          .from("ai_document_templates")
          .insert({
            title: formData.title.trim(),
            content: formData.content.trim(),
            is_favorite: formData.is_favorite,
            is_private: formData.is_private,
            tags: formData.tags,
            user_id: user.id,
            template_type: "custom",
          });

        if (error) throw error;
        toast({ title: "Template criado", description: "O template foi criado com sucesso." });
      }

      setShowCreateDialog(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      logger.error("Error saving template:", error);
      toast({ title: "Erro ao salvar template", description: "Não foi possível salvar o template.", variant: "destructive" });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    try {
      const { error } = await supabase
        .from("ai_document_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
      toast({ title: "Template excluído", description: "O template foi excluído com sucesso." });
      loadTemplates();
    } catch (error) {
      logger.error("Error deleting template:", error);
      toast({ title: "Erro ao excluir template", description: "Não foi possível excluir o template.", variant: "destructive" });
    }
  };

  const handleEditTemplate = (template: AIDocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      is_favorite: template.is_favorite,
      is_private: template.is_private,
      tags: template.tags || [],
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", is_favorite: false, is_private: false, tags: [] });
    setTagInput("");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📋 Templates de Documentos IA</h1>
          <p className="text-muted-foreground mt-1">Gerencie templates reutilizáveis para seus documentos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setEditingTemplate(null); setShowCreateDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />Novo Template
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/documents/ai")}>
            <FileText className="w-4 h-4 mr-2" />Editor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Templates</CardTitle>
          <CardDescription>Pesquise por título, conteúdo ou tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Digite para buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{searchTerm ? "Nenhum template encontrado" : "Nenhum template ainda"}</h3>
            <p className="text-muted-foreground text-center mb-4">{searchTerm ? "Tente ajustar sua pesquisa" : "Comece criando seu primeiro template"}</p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4 mr-2" />Criar Primeiro Template</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      {template.is_favorite && <Star className="w-4 h-4 text-primary fill-primary" />}
                      {template.is_private ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Unlock className="w-4 h-4 text-primary" />}
                    </div>
                    {template.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{template.content.substring(0, 150)}...</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => handleApplyTemplate(template)}><CheckCircle className="w-4 h-4 mr-1" />Aplicar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleCopyTemplate(template)}><Copy className="w-4 h-4 mr-1" />Copiar</Button>
                  {template.created_by === user?.id && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleFavorite(template)}>
                        <Star className={`w-4 h-4 ${template.is_favorite ? "fill-primary text-primary" : ""}`} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleTogglePrivate(template)}>
                        {template.is_private ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(template)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(template.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Editar Template" : "Criar Novo Template"}</DialogTitle>
            <DialogDescription>Preencha os campos abaixo para {editingTemplate ? "atualizar" : "criar"} o template</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Título do template" />
            </div>
            <div className="grid gap-2">
              <Label>Conteúdo</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} placeholder="Conteúdo do template..." />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_favorite} onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })} />
                <Label>Favorito</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_private} onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })} />
                <Label>Privado</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} placeholder="Adicionar tag" />
                <Button type="button" variant="outline" onClick={handleAddTag}>Adicionar</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>{tag} ×</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingTemplate(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSaveTemplate} disabled={!formData.title.trim() || !formData.content.trim()}>
              {editingTemplate ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
