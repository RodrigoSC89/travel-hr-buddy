"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  ArrowLeft, 
  Star,
  Lock,
  Unlock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(id || null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Comece a escrever ou gere conteúdo com IA...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  async function loadTemplate(templateId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setIsFavorite(data.is_favorite);
      setIsPrivate(data.is_private);
      editor?.commands.setContent(data.content);
    } catch (err) {
      logger.error("Error loading template:", err);
      toast({
        title: "Erro ao carregar template",
        description: "Não foi possível carregar o template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function generateContent() {
    if (!title.trim()) {
      toast({
        title: "Título necessário",
        description: "Por favor, insira um título para o template.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("templates-generate", {
        body: { title },
      });

      if (error) throw error;

      editor?.commands.setContent(data.content);
      toast({
        title: "Conteúdo gerado com sucesso",
        description: "O template foi gerado com IA.",
      });
    } catch (err) {
      logger.error("Error generating content:", err);
      toast({
        title: "Erro ao gerar conteúdo",
        description: "Não foi possível gerar o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function rewriteSelection() {
    const { from, to } = editor?.state.selection || {};
    if (from === to || !editor) {
      toast({
        title: "Selecione um trecho",
        description: "Por favor, selecione o texto que deseja reescrever.",
        variant: "destructive",
      });
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to, " ");
    
    setRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("templates-rewrite", {
        body: { input: selectedText },
      });

      if (error) throw error;

      editor.chain().focus().deleteSelection().insertContent(data.result).run();
      
      toast({
        title: "Texto reescrito com sucesso",
        description: "O trecho foi reescrito com IA.",
      });
    } catch (err) {
      logger.error("Error rewriting text:", err);
      toast({
        title: "Erro ao reescrever",
        description: "Não foi possível reescrever o texto.",
        variant: "destructive",
      });
    } finally {
      setRewriting(false);
    }
  }

  async function saveTemplate() {
    if (!title.trim() || !editor) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título do template.",
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
          description: "Você precisa estar logado para salvar templates.",
          variant: "destructive",
        });
        return;
      }

      const content = editor.getHTML();
      
      if (savedTemplateId) {
        // Update existing template
        const { error } = await supabase
          .from("templates")
          .update({
            title: title.trim(),
            content,
            is_favorite: isFavorite,
            is_private: isPrivate,
          })
          .eq("id", savedTemplateId);

        if (error) throw error;
      } else {
        // Insert new template
        const { data, error } = await supabase
          .from("templates")
          .insert({
            title: title.trim(),
            content,
            is_favorite: isFavorite,
            is_private: isPrivate,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        setSavedTemplateId(data.id);
      }

      toast({
        title: "Template salvo com sucesso",
        description: "O template foi salvo no Supabase.",
      });
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
  }

  async function exportToPDF() {
    if (!title.trim() || !editor) {
      toast({
        title: "Erro ao exportar",
        description: "Por favor, preencha o título.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const pdf = new jsPDF();
      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin, yPosition);
      yPosition += 10;

      // Content
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      const content = editor.getText();
      const lines = pdf.splitTextToSize(content, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });

      pdf.save(`${title}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O template foi exportado em PDF.",
      });
    } catch (err) {
      logger.error("Error exporting PDF:", err);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor de Templates</h1>
            <p className="text-muted-foreground">
              Crie e edite templates com suporte de IA
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/templates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Título do Template"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                title="Marcar como favorito"
              >
                <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant={isPrivate ? "default" : "outline"}
                size="icon"
                onClick={() => setIsPrivate(!isPrivate)}
                title={isPrivate ? "Template privado" : "Template público"}
              >
                {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateContent}
                disabled={generating || !title.trim()}
                variant="secondary"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
              <Button
                onClick={rewriteSelection}
                disabled={rewriting}
                variant="outline"
              >
                {rewriting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reescrevendo...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reescrever Seleção
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg min-h-[400px] bg-white">
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button onClick={saveTemplate} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Template
              </>
            )}
          </Button>
          <Button onClick={exportToPDF} disabled={exporting} variant="outline">
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
