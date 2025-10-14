"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Star, 
  StarOff,
  Lock, 
  LockOpen,
  Download,
  Loader2,
  Sparkles,
  Search,
  Edit,
  Trash2,
  Copy,
  FileCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";

interface Template {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_private: boolean;
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterPrivate, setFilterPrivate] = useState(false);
  
  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      let query = supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setTemplates(data || []);
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
  }

  async function generateTemplate() {
    if (!newTitle || !newPurpose) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o propósito do template.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { title: newTitle, purpose: newPurpose },
      });

      if (error) throw error;

      setGeneratedContent(data?.content || "");
      toast({
        title: "Template gerado com sucesso",
        description: "Você pode revisar e salvar o template.",
      });
    } catch (err) {
      logger.error("Error generating template:", err);
      toast({
        title: "Erro ao gerar template",
        description: "Não foi possível gerar o template com IA.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function enhanceTemplate() {
    if (!generatedContent) {
      toast({
        title: "Nenhum conteúdo",
        description: "Gere ou escreva um template primeiro.",
        variant: "destructive",
      });
      return;
    }

    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-template", {
        body: { content: generatedContent, context: newPurpose },
      });

      if (error) throw error;

      setGeneratedContent(data?.content || generatedContent);
      toast({
        title: "Template aprimorado com sucesso",
        description: "O template foi melhorado pela IA.",
      });
    } catch (err) {
      logger.error("Error enhancing template:", err);
      toast({
        title: "Erro ao aprimorar template",
        description: "Não foi possível aprimorar o template.",
        variant: "destructive",
      });
    } finally {
      setEnhancing(false);
    }
  }

  async function saveTemplate() {
    if (!newTitle || !generatedContent) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar templates.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("templates")
        .insert({
          title: newTitle,
          content: generatedContent,
          created_by: user.id,
          is_favorite: false,
          is_private: false,
        });

      if (error) throw error;

      toast({
        title: "Template salvo com sucesso",
        description: "O template foi salvo no banco de dados.",
      });

      // Reset form
      setNewTitle("");
      setNewPurpose("");
      setGeneratedContent("");
      setShowCreateForm(false);
      
      // Reload templates
      loadTemplates();
    } catch (err) {
      logger.error("Error saving template:", err);
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar o template.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function toggleFavorite(template: Template) {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_favorite: !template.is_favorite })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: template.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error toggling favorite:", err);
      toast({
        title: "Erro ao atualizar",
        variant: "destructive",
      });
    }
  }

  async function togglePrivate(template: Template) {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_private: !template.is_private })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: template.is_private ? "Template agora é público" : "Template agora é privado",
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error toggling private:", err);
      toast({
        title: "Erro ao atualizar",
        variant: "destructive",
      });
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Tem certeza que deseja excluir este template?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template excluído com sucesso",
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error deleting template:", err);
      toast({
        title: "Erro ao excluir template",
        variant: "destructive",
      });
    }
  }

  async function exportToPDF(template: Template) {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Título
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(template.title, margin, margin);
      
      // Conteúdo
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
        title: "PDF exportado com sucesso",
      });
    } catch (err) {
      logger.error("Error exporting PDF:", err);
      toast({
        title: "Erro ao exportar PDF",
        variant: "destructive",
      });
    }
  }

  async function applyToDocument(template: Template) {
    // Navigate to documents/ai with template content pre-filled
    navigate("/admin/documents/ai", { 
      state: { 
        templateTitle: template.title, 
        templateContent: template.content 
      } 
    });
  }

  async function duplicateTemplate(template: Template) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("templates")
        .insert({
          title: `${template.title} (Cópia)`,
          content: template.content,
          created_by: user.id,
          is_favorite: false,
          is_private: template.is_private,
        });

      if (error) throw error;

      toast({
        title: "Template duplicado com sucesso",
      });

      loadTemplates();
    } catch (err) {
      logger.error("Error duplicating template:", err);
      toast({
        title: "Erro ao duplicar template",
        variant: "destructive",
      });
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = !filterFavorites || template.is_favorite;
    const matchesPrivate = !filterPrivate || template.is_private;
    
    return matchesSearch && matchesFavorite && matchesPrivate;
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📝 Templates com IA</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Template
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>Criar Novo Template com IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Template</label>
              <Input
                placeholder="Ex: Relatório de Inspeção de Sistema Azimutal"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Propósito / Objetivo</label>
              <Textarea
                rows={3}
                placeholder="Descreva o propósito deste template..."
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateTemplate} 
                disabled={generating || !newTitle || !newPurpose}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> Gerar com IA
                  </>
                )}
              </Button>
            </div>

            {generatedContent && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo do Template</label>
                  <Textarea
                    rows={12}
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={saveTemplate} disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 mr-2" /> Salvar Template
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={enhanceTemplate} 
                    disabled={enhancing}
                    variant="outline"
                  >
                    {enhancing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aprimorando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Aprimorar com IA
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={() => {
                      setGeneratedContent("");
                      setNewTitle("");
                      setNewPurpose("");
                      setShowCreateForm(false);
                    }}
                    variant="ghost"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button
          variant={filterFavorites ? "default" : "outline"}
          onClick={() => setFilterFavorites(!filterFavorites)}
        >
          <Star className="w-4 h-4 mr-2" />
          Favoritos
        </Button>

        <Button
          variant={filterPrivate ? "default" : "outline"}
          onClick={() => setFilterPrivate(!filterPrivate)}
        >
          <Lock className="w-4 h-4 mr-2" />
          Privados
        </Button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm || filterFavorites || filterPrivate
                ? "Nenhum template encontrado com esses filtros."
                : "Nenhum template criado ainda. Crie seu primeiro template!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {template.is_favorite && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" /> Favorito
                        </Badge>
                      )}
                      {template.is_private && (
                        <Badge variant="secondary">
                          <Lock className="w-3 h-3 mr-1" /> Privado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content.substring(0, 150)}...
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => applyToDocument(template)}
                  >
                    <FileCheck className="w-3 h-3 mr-1" />
                    Aplicar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFavorite(template)}
                  >
                    {template.is_favorite ? (
                      <StarOff className="w-3 h-3" />
                    ) : (
                      <Star className="w-3 h-3" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePrivate(template)}
                  >
                    {template.is_private ? (
                      <LockOpen className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportToPDF(template)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
