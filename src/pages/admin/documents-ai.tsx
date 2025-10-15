"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, FileText, Save, Download, Brain, RefreshCw, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";

export default function DocumentsAIPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [title, setTitle] = useState("");
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [summary, setSummary] = useState("");

  // Load applied template from localStorage
  useEffect(() => {
    const appliedTemplate = localStorage.getItem("applied_template");
    if (appliedTemplate) {
      try {
        const templateData = JSON.parse(appliedTemplate);
        setTitle(templateData.title || "");
        setGenerated(templateData.content || "");
        localStorage.removeItem("applied_template");
        toast({
          title: "Template aplicado",
          description: "O template foi carregado com sucesso.",
        });
      } catch (err) {
        logger.error("Error loading applied template:", err);
      }
    }
  }, []);

  async function generateDocument() {
    if (!prompt) return;
    setLoading(true);
    setGenerated("");
    setSavedDocumentId(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { prompt },
      });

      if (error) throw error;

      setGenerated(data?.content || "");
      toast({
        title: "Documento gerado com sucesso",
        description: "Você pode agora salvar ou exportar o documento.",
      });
    } catch (err) {
      logger.error("Error generating document:", err);
      setGenerated("❌ Erro ao gerar documento.");
      toast({
        title: "Erro ao gerar documento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  async function saveDocument() {
    if (!generated || !title.trim()) {
      toast({
        title: "Erro ao salvar",
        description: "Por favor, preencha o título e gere um documento.",
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
          description: "Você precisa estar logado para salvar documentos.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("ai_generated_documents")
        .insert({
          title: title.trim(),
          content: generated,
          prompt: prompt,
          generated_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedDocumentId(data.id);
      toast({
        title: "Documento salvo com sucesso",
        description: "O documento foi salvo no Supabase.",
      });
    } catch (err) {
      logger.error("Error saving document:", err);
      toast({
        title: "Erro ao salvar documento",
        description: "Não foi possível salvar o documento.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function exportToPDF() {
    if (!generated || !title.trim()) {
      toast({
        title: "Erro ao exportar",
        description: "Por favor, preencha o título e gere um documento.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Título
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin, margin);
      
      // Conteúdo
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      // Split text into lines
      const lines = pdf.splitTextToSize(generated, maxWidth);
      let y = margin + 10;
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += 7;
      });
      
      pdf.save(`${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O documento foi exportado como PDF.",
      });
    } catch (err) {
      logger.error("Error exporting PDF:", err);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível exportar o documento.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  async function summarizeDocument() {
    if (!generated) {
      toast({
        title: "Erro ao resumir",
        description: "Não há documento para resumir.",
        variant: "destructive",
      });
      return;
    }

    setSummarizing(true);
    setSummary("");
    try {
      const { data, error } = await supabase.functions.invoke("summarize-document", {
        body: { content: generated },
      });

      if (error) throw error;

      setSummary(data?.summary || "");
      toast({
        title: "Resumo gerado com sucesso",
        description: "O documento foi resumido com IA.",
      });
    } catch (err) {
      logger.error("Error summarizing document:", err);
      toast({
        title: "Erro ao resumir documento",
        description: "Não foi possível resumir o documento.",
        variant: "destructive",
      });
    } finally {
      setSummarizing(false);
    }
  }

  async function rewriteDocument() {
    if (!generated) {
      toast({
        title: "Erro ao reformular",
        description: "Não há documento para reformular.",
        variant: "destructive",
      });
      return;
    }

    setRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-document", {
        body: { content: generated },
      });

      if (error) throw error;

      setGenerated(data?.rewritten || "");
      setSummary(""); // Clear summary when rewriting
      toast({
        title: "Documento reformulado com sucesso",
        description: "O documento foi reformulado com IA.",
      });
    } catch (err) {
      logger.error("Error rewriting document:", err);
      toast({
        title: "Erro ao reformular documento",
        description: "Não foi possível reformular o documento.",
        variant: "destructive",
      });
    } finally {
      setRewriting(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📄 Documentos com IA</h1>
        <Button variant="outline" onClick={() => navigate("/admin/documents")}>
          <List className="w-4 h-4 mr-2" />
          Ver Todos os Documentos
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Título do Documento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            rows={4}
            placeholder="Descreva o que você quer gerar com a IA..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button onClick={generateDocument} disabled={loading || !prompt}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> Gerar com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card className="border border-green-600">
          <CardContent className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                <FileText className="inline w-4 h-4 mr-2" /> {title || "Documento Gerado"}
              </h2>
              <div className="whitespace-pre-wrap">{generated}</div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={saveDocument} 
                disabled={saving || !title.trim() || !!savedDocumentId}
                variant="default"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : savedDocumentId ? (
                  <>
                    <Save className="w-4 h-4 mr-2 text-green-400" /> Salvo no Supabase
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Salvar no Supabase
                  </>
                )}
              </Button>
              
              <Button 
                onClick={exportToPDF} 
                disabled={exporting || !title.trim()}
                variant="outline"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" /> Exportar em PDF
                  </>
                )}
              </Button>

              <Button 
                onClick={summarizeDocument} 
                disabled={summarizing}
                variant="ghost"
              >
                {summarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resumindo...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" /> Resumir com IA
                  </>
                )}
              </Button>

              <Button 
                onClick={rewriteDocument} 
                disabled={rewriting}
                variant="ghost"
              >
                {rewriting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reformulando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reformular IA
                  </>
                )}
              </Button>
            </div>

            {summary && (
              <div className="mt-4 text-sm bg-muted p-3 rounded">
                <strong>🧠 Resumo:</strong> {summary}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
