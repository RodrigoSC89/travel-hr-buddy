"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Document {
  id: string;
  title: string;
  content: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

export default function DocumentViewPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;

    supabase
      .from("ai_generated_documents")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading document:", error);
          toast({
            title: "Erro ao carregar documento",
            description: "Não foi possível carregar o documento.",
            variant: "destructive",
          });
        } else {
          setDoc(data);
        }
        setLoading(false);
      });
  }, [id]);

  const exportToPDF = async () => {
    if (!doc) return;

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
      pdf.text(doc.title, margin, margin);

      // Conteúdo
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");

      // Split text into lines
      const lines = pdf.splitTextToSize(doc.content, maxWidth);
      let y = margin + 10;

      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += 7;
      });

      pdf.save(`${doc.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);

      toast({
        title: "PDF exportado com sucesso",
        description: "O documento foi exportado como PDF.",
      });
    } catch (err) {
      console.error("Error exporting PDF:", err);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível exportar o documento.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Carregando documento...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">Documento não encontrado</h1>
        <Link to="/admin/documents/list">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/documents/list">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Button onClick={exportToPDF} disabled={exporting} variant="default">
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📄 {doc.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Criado em {format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
              Conteúdo:
            </h3>
            <div className="whitespace-pre-wrap p-4 bg-muted rounded-lg">
              {doc.content}
            </div>
          </div>

          {doc.prompt && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                Prompt utilizado:
              </h3>
              <div className="p-4 bg-muted rounded-lg">
                {doc.prompt}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
