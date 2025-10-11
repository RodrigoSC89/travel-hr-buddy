"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Loader2,
  FileText,
  Save,
  Download,
  RefreshCw,
  Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DocumentsAIPage() {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [resumido, setResumido] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  async function generateDocument() {
    if (!prompt) return;
    setLoading(true);
    setGenerated("");
    setResumido("");
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

  async function saveToDatabase() {
    if (!title || !generated) return;
    const { error } = await supabase.from("documents").insert({
      title,
      content: generated,
      author: "admin",
    });
    if (!error) setSaved(true);
  }

  async function exportPDF() {
    const node = document.getElementById("generated-doc");
    if (!node) return;
    const canvas = await html2canvas(node);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${title || "documento-gerado"}.pdf`);
  }

  async function summarizeDocument() {
    setSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-document", {
        body: { content: generated },
      });
      if (error) throw error;
      if (data) {
        setResumido(data.summary);
      }
    } catch (err) {
      console.error("Error summarizing document:", err);
      setResumido("❌ Erro ao resumir documento.");
    } finally {
      setSummarizing(false);
    }
  }

  async function rewriteDocument() {
    setRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-document", {
        body: { content: generated },
      });
      if (error) throw error;
      if (data) {
        setGenerated(data.rewritten);
        setResumido(""); // Clear summary when document is rewritten
      }
    } catch (err) {
      console.error("Error rewriting document:", err);
      setGenerated("❌ Erro ao reformular documento.");
    } finally {
      setRewriting(false);
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
        <Card id="generated-doc" className="border border-green-600">
          <CardContent className="p-4 whitespace-pre-wrap">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> {title || "Documento Gerado"}
            </h2>
            {generated}
            <div className="flex gap-3 mt-4 flex-wrap">
              <Button onClick={saveToDatabase} disabled={saved} variant="secondary">
                <Save className="w-4 h-4 mr-2" /> {saved ? "Salvo ✅" : "Salvar Documento"}
              </Button>
              <Button onClick={exportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" /> Exportar PDF
              </Button>
              <Button onClick={summarizeDocument} variant="ghost" disabled={summarizing}>
                <Brain className="w-4 h-4 mr-2" /> {summarizing ? "Gerando..." : "Resumir com IA"}
              </Button>
              <Button onClick={rewriteDocument} variant="ghost" disabled={rewriting}>
                <RefreshCw className="w-4 h-4 mr-2" /> {rewriting ? "Reformulando..." : "Reformular IA"}
              </Button>
            </div>

            {resumido && (
              <div className="mt-4 text-sm bg-muted p-3 rounded">
                <strong>🧠 Resumo:</strong> {resumido}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
