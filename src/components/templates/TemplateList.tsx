import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_private: boolean;
  created_at: string;
}

export default function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites" | "private">("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    let query = supabase.from("templates").select("*").order("created_at", { ascending: false });

    if (filter === "favorites") query = query.eq("is_favorite", true);
    if (filter === "private") query = query.eq("is_private", true);

    const { data, error } = await query;
    if (error) {
      console.error("Erro ao buscar templates:", error);
      toast({
        title: "Erro",
        description: "Erro ao buscar templates",
        variant: "destructive"
      });
    } else {
      setTemplates(data || []);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const applyTemplate = (content: string) => {
    localStorage.setItem("applied_template", content);
    navigate("/admin/documents/ai");
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Sucesso",
        description: "Conteúdo copiado para a área de transferência"
      });
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast({
        title: "Erro",
        description: "Erro ao copiar conteúdo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <Button 
          onClick={() => setFilter("all")}
          variant={filter === "all" ? "default" : "outline"}
        >
          Todos
        </Button>
        <Button 
          onClick={() => setFilter("favorites")}
          variant={filter === "favorites" ? "default" : "outline"}
        >
          Favoritos
        </Button>
        <Button 
          onClick={() => setFilter("private")}
          variant={filter === "private" ? "default" : "outline"}
        >
          Privados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="border rounded p-4 bg-white shadow">
            <h3 className="font-bold text-lg mb-2">{template.title}</h3>
            <div 
              className="text-sm line-clamp-3" 
              dangerouslySetInnerHTML={{ __html: template.content }} 
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={() => applyTemplate(template.content)}>
                Aplicar
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => copyToClipboard(template.content)}
              >
                Copiar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum template encontrado
        </div>
      )}
    </div>
  );
}
