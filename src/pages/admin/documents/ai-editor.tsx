"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save, 
  Download, 
  RefreshCw, 
  List,
  Loader2,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";
// Template system - to be implemented later
import ApplyTemplateModal from "@/components/templates/ApplyTemplateModal";

export default function DocumentAIEditorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Crie ou edite seu documento aqui...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Apply template loaded from localStorage when page opens
  useEffect(() => {
    if (!editor) return;
    
    const storedTemplate = localStorage.getItem("applied_template");
    const storedTitle = localStorage.getItem("applied_template_title");
    
    if (storedTemplate) {
      editor.commands.setContent(storedTemplate);
      localStorage.removeItem("applied_template");
      
      if (storedTitle) {
        setTitle(storedTitle);
        localStorage.removeItem("applied_template_title");
      }
      
      toast({
        title: "Template aplicado",
        description: "O template foi carregado no editor.",
      });
    }
  }, [editor]);

  const saveDocument = async () => {
    if (!editor || !title.trim()) {
      toast({
        title: "Erro ao salvar",
        description: "Por favor, preencha o título.",
        variant: "destructive",
      });
      return;
    }

    const content = editor.getHTML();
    
    if (!content || content === "<p></p>") {
      toast({
        title: "Erro ao salvar",
        description: "O documento está vazio.",
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
          content: content,
          prompt: "Documento criado manualmente no editor",
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
  };

  const exportToPDF = async () => {
    if (!editor || !title.trim()) {
      toast({
        title: "Erro ao exportar",
        description: "Por favor, preencha o título.",
        variant: "destructive",
      });
      return;
    }

    const content = editor.getText();
    
    if (!content.trim()) {
      toast({
        title: "Erro ao exportar",
        description: "O documento está vazio.",
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
      
      const lines = pdf.splitTextToSize(content, maxWidth);
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
  };

  const rewriteSelectedText = async () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) {
      toast({
        title: "Nenhum texto selecionado",
        description: "Por favor, selecione um trecho de texto para reescrever.",
        variant: "destructive",
      });
      return;
    }

    setRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-document", {
        body: { content: selectedText },
      });

      if (error) throw error;

      const rewrittenText = data?.rewritten || selectedText;
      
      // Replace selected text with rewritten version
      editor.chain().focus().deleteSelection().insertContent(rewrittenText).run();
      
      toast({
        title: "Texto reformulado com sucesso",
        description: "O trecho selecionado foi reformulado com IA.",
      });
    } catch (err) {
      logger.error("Error rewriting text:", err);
      toast({
        title: "Erro ao reformular texto",
        description: "Não foi possível reformular o texto selecionado.",
        variant: "destructive",
      });
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📝 Editor de Documentos com IA</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/documents/ai/templates")}>
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/documents")}>
            <List className="w-4 h-4 mr-2" />
            Ver Documentos
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título do Documento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Editor</CardTitle>
            <div className="flex gap-2">
              <ApplyTemplateModal
                tableName="templates"
                onApply={(content) => {
                  if (editor) {
                    editor.commands.setContent(content);
                  }
                }}
              />
              <Button 
                onClick={rewriteSelectedText} 
                disabled={rewriting}
                variant="ghost"
                size="sm"
              >
                {rewriting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reformulando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reescrever Seleção com IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg bg-white">
            <EditorContent editor={editor} />
          </div>
          
          <div className="flex gap-2 mt-4">
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
                  <Download className="w-4 h-4 mr-2" /> Exportar PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
