"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  Save, 
  Download, 
  Brain, 
  RefreshCw, 
  Star, 
  StarOff,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Copy,
  FileCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Template {
  id: string;
  title: string;
  content: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_favorite: boolean | null;
  is_private: boolean | null;
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterPrivate, setFilterPrivate] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado.",
          variant: "destructive",
        });
        return;
      }

      const query = supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Map DB content (Json) to string for UI
      setTemplates((data || []).map((d) => ({
        ...d,
        content: typeof d.content === 'string' ? d.content : JSON.stringify(d.content),
        is_favorite: d.is_favorite ?? false,
        is_private: d.is_private ?? false,
      })));
    } catch (err) {
      logger.error("Error loading templates:", err);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Generate content with AI
  const generateWithAI = async () => {
    if (!title.trim()) {
      toast({
        title: "Título necessário",
        description: "Por favor, forneça um título para o template.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const aiPrompt = prompt || `Crie um template de documento com o título: ${title}`;
      
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { prompt: aiPrompt },
      });

      if (error) throw error;

      setContent(data?.content || "");
      toast({
        title: "Conteúdo gerado com sucesso",
        description: "O template foi gerado com IA.",
      });
    } catch (err) {
      logger.error("Error generating content:", err);
      toast({
        title: "Erro ao gerar conteúdo",
        description: "Não foi possível gerar o conteúdo com IA.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Rewrite content with AI
  const rewriteContent = async () => {
    if (!content) {
      toast({
        title: "Nenhum conteúdo para reformular",
        description: "Por favor, adicione conteúdo primeiro.",
        variant: "destructive",
      });
      return;
    }

    setRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-document", {
        body: { content },
      });

      if (error) throw error;

      setContent(data?.rewritten || "");
      toast({
        title: "Conteúdo reformulado com sucesso",
        description: "O template foi reformulado com IA.",
      });
    } catch (err) {
      logger.error("Error rewriting content:", err);
      toast({
        title: "Erro ao reformular conteúdo",
        description: "Não foi possível reformular o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setRewriting(false);
    }
  };

  // Auto-suggest title from content
  const suggestTitle = async () => {
    if (!content) {
      toast({
        title: "Nenhum conteúdo",
        description: "Por favor, adicione conteúdo primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { 
          prompt: `Com base no seguinte conteúdo, sugira um título curto e descritivo (máximo 60 caracteres):\n\n${content.substring(0, 500)}` 
        },
      });

      if (error) throw error;

      const suggestedTitle = data?.content?.substring(0, 100) || "";
      setTitle(suggestedTitle.trim());
      toast({
        title: "Título sugerido",
        description: "Um título foi sugerido com base no conteúdo.",
      });
    } catch (err) {
      logger.error("Error suggesting title:", err);
      toast({
        title: "Erro ao sugerir título",
        description: "Não foi possível sugerir um título.",
        variant: "destructive",
      });
    }
  };

  // Save or update template
  const saveTemplate = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado.",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentTemplateId) {
        // Update existing template
        const { error } = await supabase
          .from("templates")
          .update({
            title: title.trim(),
            content: content.trim(),
          })
          .eq("id", currentTemplateId);

        if (error) throw error;

        toast({
          title: "Template atualizado",
          description: "O template foi atualizado com sucesso.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from("templates")
          .insert({
            title: title.trim(),
            content: content.trim(),
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: "Template salvo",
          description: "O template foi salvo com sucesso.",
        });
      }

      // Reset form and reload templates
      resetForm();
      loadTemplates();
    } catch (err) {
      logger.error("Error saving template:", err);
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar o template.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_favorite: !template.is_favorite })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: template.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: `Template "${template.title}" ${template.is_favorite ? "removido de" : "adicionado aos"} favoritos.`,
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error toggling favorite:", err);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o favorito.",
        variant: "destructive",
      });
    }
  };

  // Toggle private
  const togglePrivate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_private: !template.is_private })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: template.is_private ? "Template público" : "Template privado",
        description: `Template "${template.title}" agora é ${template.is_private ? "público" : "privado"}.`,
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error toggling private:", err);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a privacidade.",
        variant: "destructive",
      });
    }
  };

  // Delete template
  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template excluído",
        description: "O template foi excluído com sucesso.",
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error deleting template:", err);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    }
  };

  // Load template for editing
  const editTemplate = (id: string) => {
    navigate(`/admin/templates/edit/${id}`);
  };

  // Duplicate template
  const duplicateTemplate = async (template: Template) => {
    setTitle(`${template.title} (Cópia)`);
    setContent(template.content);
    setCurrentTemplateId(null);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Apply template to documents-ai
  const applyTemplate = (template: Template) => {
    // Store template data in localStorage
    localStorage.setItem("applied_template", JSON.stringify({
      title: template.title,
      content: template.content,
    }));
    
    navigate("/admin/documents/ai");
  };

  // Export template as PDF
  const exportToPDF = async (template: Template) => {
    setExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(template.title, margin, margin);
      
      // Content
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      const lines = pdf.splitTextToSize(template.content, maxWidth);
      let y = margin + 10;
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += 7;
      });
      
      pdf.save(`${template.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: "O template foi exportado como PDF.",
      });
    } catch (err) {
      logger.error("Error exporting PDF:", err);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o template.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setContent("");
    setPrompt("");
    setCurrentTemplateId(null);
    setIsEditing(false);
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !filterFavorites || template.is_favorite;
    const matchesPrivate = !filterPrivate || template.is_private;
    
    return matchesSearch && matchesFavorites && matchesPrivate;
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📦 Templates com IA</h1>
          <p className="text-muted-foreground">Crie e gerencie templates de documentos com inteligência artificial</p>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            {isEditing ? "Editar Template" : "Criar Template"}
          </TabsTrigger>
          <TabsTrigger value="list">
            <FileText className="w-4 h-4 mr-2" />
            Meus Templates ({filteredTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Editar Template" : "Criar Novo Template"}</CardTitle>
              <CardDescription>
                Use IA para gerar e reformular conteúdo de forma inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Título do Template"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={suggestTitle}
                    disabled={!content}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Sugerir Título
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  rows={3}
                  placeholder="Descreva o que você quer gerar... (opcional)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateWithAI} 
                  disabled={generating || !title.trim()}
                  variant="default"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 text-accent-foreground" /> Gerar com IA
                    </>
                  )}
                </Button>

                {content && (
                  <Button
                    onClick={rewriteContent}
                    disabled={rewriting}
                    variant="outline"
                  >
                    {rewriting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reformulando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" /> Reformular
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Conteúdo do Template</label>
                <Textarea
                  rows={12}
                  placeholder="Digite ou gere o conteúdo do template..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={saveTemplate} 
                  disabled={saving || !title.trim() || !content.trim()}
                  variant="default"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> 
                      {isEditing ? "Atualizar Template" : "Salvar Template"}
                    </>
                  )}
                </Button>

                {isEditing && (
                  <Button onClick={resetForm} variant="outline">
                    Cancelar Edição
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={filterFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterFavorites(!filterFavorites)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Favoritos
                </Button>
                <Button
                  variant={filterPrivate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPrivate(!filterPrivate)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Privados
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando templates...</p>
              </CardContent>
            </Card>
          ) : filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || filterFavorites || filterPrivate
                    ? "Nenhum template encontrado com os filtros aplicados."
                    : "Você ainda não criou nenhum template. Crie seu primeiro!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg truncate flex-1">
                        {template.title}
                      </CardTitle>
                      <div className="flex gap-1">
                        {template.is_favorite && (
                          <Badge variant="secondary" className="ml-2">
                            <Star className="w-3 h-3 fill-current" />
                          </Badge>
                        )}
                        {template.is_private && (
                          <Badge variant="secondary">
                            <Lock className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {template.content.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Criado em {template.created_at ? new Date(template.created_at).toLocaleDateString("pt-BR") : '-'}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editTemplate(template.id)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                      >
                        <FileCheck className="w-3 h-3 mr-1" />
                        Aplicar
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(template)}
                      >
                        {template.is_favorite ? (
                          <StarOff className="w-3 h-3 mr-1" />
                        ) : (
                          <Star className="w-3 h-3 mr-1" />
                        )}
                        {template.is_favorite ? "Desfavoritar" : "Favoritar"}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePrivate(template)}
                      >
                        {template.is_private ? (
                          <Unlock className="w-3 h-3 mr-1" />
                        ) : (
                          <Lock className="w-3 h-3 mr-1" />
                        )}
                        {template.is_private ? "Público" : "Privado"}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportToPDF(template)}
                        disabled={exporting}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(template.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1 text-destructive" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (templateToDelete) {
                  deleteTemplate(templateToDelete);
                  setTemplateToDelete(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
