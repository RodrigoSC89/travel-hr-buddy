"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Star, 
  Lock, 
  FileText, 
  Copy, 
  Edit, 
  Trash2,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

type FilterType = "all" | "favorites" | "private";

interface Template {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_private: boolean;
  created_at: string;
}

export default function TemplatesListPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

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

  async function deleteTemplate(id: string) {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: "Template excluído",
        description: "O template foi excluído com sucesso.",
      });
    } catch (err) {
      logger.error("Error deleting template:", err);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    }
  }

  async function copyTemplate(template: Template) {
    try {
      await navigator.clipboard.writeText(template.content);
      toast({
        title: "Template copiado",
        description: "O conteúdo do template foi copiado para a área de transferência.",
      });
    } catch (err) {
      logger.error("Error copying template:", err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o template.",
        variant: "destructive",
      });
    }
  }

  function applyTemplate(template: Template) {
    // Store template in localStorage for use in documents-ai page
    localStorage.setItem("appliedTemplate", JSON.stringify({
      title: template.title,
      content: template.content,
    }));
    
    toast({
      title: "Template aplicado",
      description: "O template está pronto para uso. Redirecionando...",
    });
    
    setTimeout(() => {
      navigate("/admin/documents/ai");
    }, 1000);
  }

  const filteredTemplates = templates.filter((template) => {
    if (filter === "favorites") return template.is_favorite;
    if (filter === "private") return template.is_private;
    return true;
  });

  const getPreview = (content: string) => {
    // Remove HTML tags and get first 100 characters
    const text = content.replace(/<[^>]*>/g, "");
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates com IA</h1>
            <p className="text-muted-foreground">
              Gerencie templates técnicos e operacionais
            </p>
          </div>
          <Button onClick={() => navigate("/admin/templates/editor")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Todos ({templates.length})
          </Button>
          <Button
            variant={filter === "favorites" ? "default" : "outline"}
            onClick={() => setFilter("favorites")}
          >
            <Star className="h-4 w-4 mr-2" />
            Favoritos ({templates.filter(t => t.is_favorite).length})
          </Button>
          <Button
            variant={filter === "private" ? "default" : "outline"}
            onClick={() => setFilter("private")}
          >
            <Lock className="h-4 w-4 mr-2" />
            Privados ({templates.filter(t => t.is_private).length})
          </Button>
        </div>

        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum template encontrado</p>
              <p className="text-muted-foreground mb-4">
                {filter === "all" 
                  ? "Crie seu primeiro template com IA"
                  : `Nenhum template ${filter === "favorites" ? "favorito" : "privado"} encontrado`
                }
              </p>
              {filter === "all" && (
                <Button onClick={() => navigate("/admin/templates/editor")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <div className="flex gap-1">
                      {template.is_favorite && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      {template.is_private && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {getPreview(template.content)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="flex-1"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Aplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/templates/editor/${template.id}`)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(template.created_at).toLocaleDateString("pt-BR")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
