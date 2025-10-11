"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, FileText, Save, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DocumentsAIPage() {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function generateDocument() {
    if (!prompt) return;
    setLoading(true);
    setGenerated("");
    setSaved(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { prompt },
      });

      if (error) throw error;

      setGenerated(data?.content || "");
    } catch (err) {
      console.error("Error generating document:", err);
      setGenerated("❌ Erro ao gerar documento.");
    }
    setLoading(false);
  }

  async function saveDocument() {
    if (!title || !generated) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("documents").insert({
        title,
        content: generated,
        author: author || null,
      });

      if (error) throw error;

      setSaved(true);
      toast({
        title: "Sucesso ✅",
        description: "Documento salvo no Supabase",
      });
    } catch (err) {
      console.error("Error saving document:", err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o documento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function exportPDF() {
    const el = document.getElementById("generated-document");
    if (!el) return;

    try {
      const canvas = await html2canvas(el);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${title || "documento"}.pdf`);

      toast({
        title: "Sucesso 📄",
        description: "PDF exportado com sucesso",
      });
    } catch (err) {
      console.error("Error exporting PDF:", err);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o PDF",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">📄 Documentos com IA</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Título do Documento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Autor (opcional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
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
        <Card className="border border-green-600" id="generated-document">
          <CardContent className="p-4 whitespace-pre-wrap">
            <h2 className="text-lg font-semibold mb-2">
              <FileText className="inline w-4 h-4 mr-2" /> {title || "Documento Gerado"}
            </h2>
            {author && (
              <p className="text-sm text-muted-foreground mb-4">
                Autor: {author}
              </p>
            )}
            {generated}
          </CardContent>
        </Card>
      )}

      {generated && (
        <div className="flex gap-4">
          <Button 
            onClick={saveDocument} 
            disabled={saving || !title}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : saved ? (
              <>
                <Save className="w-4 h-4 mr-2" /> Salvo ✅
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Salvar no Supabase
              </>
            )}
          </Button>
          <Button 
            onClick={exportPDF} 
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      )}
    </div>
  );
}
