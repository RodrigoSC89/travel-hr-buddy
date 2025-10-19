"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Save, 
  ArrowLeft, 
  Brain, 
  RefreshCw, 
  Sparkles 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");

  // Load template data
  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setContent(data.content);
      } else {
        toast({
          title: "Template não encontrado",
          description: "O template solicitado não foi encontrado.",
          variant: "destructive",
        });
        navigate("/admin/templates");
      }
    } catch (err) {
      logger.error("Error loading template:", err);
      toast({
        title: "Erro ao carregar template",
        description: "Não foi possível carregar o template.",
        variant: "destructive",
      });
      navigate("/admin/templates");
    } finally {
      setLoading(false);
    }
  };

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

  // Update template
  const updateTemplate = async () => {
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
      const { error } = await supabase
        .from("templates")
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template atualizado",
        description: "O template foi atualizado com sucesso.",
      });
      
      navigate("/admin/templates");
    } catch (err) {
      logger.error("Error updating template:", err);
      toast({
        title: "Erro ao atualizar template",
        description: "Não foi possível atualizar o template.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/templates")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">✏️ Editar Template</h1>
          <p className="text-muted-foreground">Edite e reformule seu template com IA</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Template</CardTitle>
          <CardDescription>
            Use IA para reformular e aprimorar o conteúdo do template
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
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> Gerar com IA
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
              onClick={updateTemplate} 
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
                  Atualizar Template
                </>
              )}
            </Button>

            <Button onClick={() => navigate("/admin/templates")} variant="outline">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
