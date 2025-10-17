import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Brain } from "lucide-react";

interface AuditoriaIMCA {
  id: string;
  navio: string;
  data: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Observação" | "N/A";
  comentarios: string;
}

export function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<AuditoriaIMCA[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarAuditorias();
  }, []);

  const carregarAuditorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("auditorias_imca")
        .select("id, navio, data, norma, item_auditado, resultado, comentarios")
        .order("data", { ascending: false });

      if (error) throw error;
      setAuditorias(data || []);
    } catch (error) {
      console.error("Erro ao carregar auditorias:", error);
      toast.error("Erro ao carregar auditorias");
    } finally {
      setLoading(false);
    }
  };

  const auditoriasFiltradas = auditorias.filter((a) => {
    const termoBusca = filtro.toLowerCase();
    return (
      a.navio?.toLowerCase().includes(termoBusca) ||
      a.norma?.toLowerCase().includes(termoBusca) ||
      a.item_auditado?.toLowerCase().includes(termoBusca) ||
      a.resultado?.toLowerCase().includes(termoBusca)
    );
  });

  const frota = [...new Set(auditorias.map((a) => a.navio).filter(Boolean))];

  const getBadgeColor = (resultado: string) => {
    switch (resultado) {
      case "Conforme":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "Não Conforme":
        return "bg-red-600 text-white hover:bg-red-700";
      case "Observação":
        return "bg-gray-600 text-white hover:bg-gray-700";
      case "N/A":
        return "bg-transparent border border-gray-300 text-gray-600";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const explicarIA = async (id: string, navio: string, item: string, norma: string) => {
    try {
      setLoadingIA(id);
      
      const response = await fetch("/api/auditoria/explicar-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ navio, item, norma }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar explicação");
      }

      const data = await response.json();
      setExplicacao((prev) => ({ ...prev, [id]: data.explicacao }));
      toast.success("Explicação gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao explicar com IA:", error);
      toast.error("Erro ao gerar explicação");
    } finally {
      setLoadingIA(null);
    }
  };

  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      const dataAtual = format(new Date(), "dd/MM/yyyy HH:mm");

      // Título
      doc.setFontSize(16);
      doc.text("Relatório de Auditorias IMCA", 14, 15);

      // Informações
      doc.setFontSize(10);
      doc.text(`Data de Geração: ${dataAtual}`, 14, 25);
      doc.text(`Total de Auditorias: ${auditoriasFiltradas.length}`, 14, 30);
      doc.text(`Frota: ${frota.join(", ")}`, 14, 35);

      // Tabela
      const tableData = auditoriasFiltradas.map((a) => [
        a.navio,
        a.data ? format(new Date(a.data), "dd/MM/yyyy") : "-",
        a.norma,
        a.item_auditado,
        a.resultado,
        a.comentarios || "-",
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [14, 165, 233] },
      });

      doc.save(`auditorias-imca-${format(new Date(), "yyyyMMdd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const exportarCSV = () => {
    try {
      const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
      const rows = auditoriasFiltradas.map((a) => [
        a.navio,
        a.data ? format(new Date(a.data), "dd/MM/yyyy") : "-",
        a.norma,
        a.item_auditado,
        a.resultado,
        a.comentarios || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell?.toString().replace(/"/g, '""') || ""}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `auditorias-imca-${format(new Date(), "yyyyMMdd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando auditorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Filtro e Ações */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Input
          placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-2">
          <Button onClick={exportarPDF} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Informações da Frota */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Frota auditada:</strong> {frota.join(", ") || "Nenhuma"}
            </p>
            <p className="text-sm">
              <strong>Total de auditorias:</strong> {auditoriasFiltradas.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Auditorias */}
      <div className="grid gap-4">
        {auditoriasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma auditoria encontrada
            </CardContent>
          </Card>
        ) : (
          auditoriasFiltradas.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">🚢 {a.navio}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "-"} - Norma: {a.norma}
                    </p>
                  </div>
                  <Badge className={getBadgeColor(a.resultado)}>{a.resultado}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Item auditado:</p>
                  <p className="text-sm text-muted-foreground">{a.item_auditado}</p>
                </div>

                {a.comentarios && (
                  <div>
                    <p className="text-sm font-medium">Comentários:</p>
                    <p className="text-sm text-muted-foreground">{a.comentarios}</p>
                  </div>
                )}

                {a.resultado === "Não Conforme" && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingIA === a.id}
                      onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {loadingIA === a.id ? "Gerando explicação..." : "🧠 Explicar com IA"}
                    </Button>

                    {explicacao[a.id] && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium mb-2">📘 Explicação IA:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {explicacao[a.id]}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
