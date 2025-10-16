import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditoriaIMCA {
  id: string;
  navio: string | null;
  norma: string | null;
  item_auditado: string | null;
  resultado: string | null;
  comentarios: string | null;
  data: string | null;
  created_at: string;
}

export default function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<AuditoriaIMCA[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarAuditorias();
  }, []);

  const carregarAuditorias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auditorias_imca")
        .select("*")
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
    const searchTerm = filtro.toLowerCase();
    return (
      a.navio?.toLowerCase().includes(searchTerm) ||
      a.norma?.toLowerCase().includes(searchTerm) ||
      a.item_auditado?.toLowerCase().includes(searchTerm) ||
      a.resultado?.toLowerCase().includes(searchTerm)
    );
  });

  const frota = Array.from(
    new Set(auditorias.map((a) => a.navio).filter((n) => n !== null))
  ) as string[];

  const explicarIA = async (
    id: string,
    navio: string,
    item: string,
    norma: string
  ) => {
    setLoadingIA(id);
    try {
      const response = await fetch("/api/auditoria/explicar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navio, item, norma }),
      });

      if (!response.ok) throw new Error("Erro ao gerar explicação");

      const data = await response.json();
      setExplicacao((prev) => ({ ...prev, [id]: data.explicacao }));
      toast.success("Explicação gerada com sucesso");
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
      toast.error("Erro ao gerar explicação com IA");
    } finally {
      setLoadingIA(null);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Auditorias IMCA", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);
    doc.text(`Total de auditorias: ${auditoriasFiltradas.length}`, 14, 37);
    doc.text(`Frota: ${frota.join(", ")}`, 14, 44);

    const tableData = auditoriasFiltradas.map((a) => [
      a.data ? format(new Date(a.data), "dd/MM/yyyy") : "-",
      a.navio || "-",
      a.norma || "-",
      a.item_auditado || "-",
      a.resultado || "-",
      a.comentarios || "-",
    ]);

    autoTable(doc, {
      head: [["Data", "Navio", "Norma", "Item", "Resultado", "Comentários"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`auditorias-imca-${format(new Date(), "yyyyMMdd")}.pdf`);
    toast.success("PDF exportado com sucesso");
  };

  const exportarCSV = () => {
    const headers = ["Data", "Navio", "Norma", "Item Auditado", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.data ? format(new Date(a.data), "dd/MM/yyyy") : "",
      a.navio || "",
      a.norma || "",
      a.item_auditado || "",
      a.resultado || "",
      a.comentarios?.replace(/,/g, ";") || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditorias-imca-${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
    toast.success("CSV exportado com sucesso");
  };

  const getResultadoBadgeVariant = (resultado: string | null) => {
    switch (resultado) {
      case "Conforme":
        return "default";
      case "Não Conforme":
        return "destructive";
      case "Observação":
        return "secondary";
      case "N/A":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <Input
            placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="max-w-lg"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={exportarPDF} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Frota auditada:</strong> {frota.length > 0 ? frota.join(", ") : "Nenhum navio registrado"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>Total de auditorias:</strong> {auditoriasFiltradas.length}
        </p>
      </div>

      <div className="space-y-4">
        {auditoriasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {filtro
                  ? "Nenhuma auditoria encontrada com os filtros aplicados"
                  : "Nenhuma auditoria cadastrada"}
              </p>
            </CardContent>
          </Card>
        ) : (
          auditoriasFiltradas.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      🚢 {a.navio || "Navio não informado"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "Data não informada"} - Norma: {a.norma || "N/A"}
                    </p>
                  </div>
                  <Badge variant={getResultadoBadgeVariant(a.resultado)}>
                    {a.resultado || "N/A"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Item auditado:</strong> {a.item_auditado || "N/A"}
                  </p>
                  {a.comentarios && (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-sm">
                        <strong>Comentários:</strong> {a.comentarios}
                      </p>
                    </div>
                  )}
                </div>

                {a.resultado === "Não Conforme" && (
                  <div className="mt-4 space-y-2">
                    <Button
                      disabled={loadingIA === a.id}
                      onClick={() =>
                        explicarIA(
                          a.id,
                          a.navio || "Navio não informado",
                          a.item_auditado || "Item não informado",
                          a.norma || "Norma não informada"
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      {loadingIA === a.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando explicação...
                        </>
                      ) : (
                        "🧠 Explicar com IA"
                      )}
                    </Button>
                    {explicacao[a.id] && (
                      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                        <p className="text-sm">
                          <strong className="text-blue-700 dark:text-blue-300">
                            📘 Explicação IA:
                          </strong>
                          <br />
                          <span className="text-blue-900 dark:text-blue-100">
                            {explicacao[a.id]}
                          </span>
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
