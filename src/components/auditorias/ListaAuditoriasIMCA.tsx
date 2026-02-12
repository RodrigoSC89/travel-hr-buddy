/**
 * Lista Auditorias IMCA Component
 * PATCH 870 - Migrated to edge-function-helper for stable environment handling
 */

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { usePDFExport } from "@/hooks/use-pdf-export";
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/supabase/edge-function-helper";
interface Auditoria {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  comentarios: string;
  resultado: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável";
  data: string;
}

const corResultado: Record<string, string> = {
  "Conforme": "bg-success text-success-foreground",
  "Não Conforme": "bg-destructive text-destructive-foreground",
  "Parcialmente Conforme": "bg-warning text-warning-foreground",
  "Não Aplicável": "bg-muted text-muted-foreground",
};

export default function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [frota, setFrota] = useState<string[]>([]);
  const [cronStatus, setCronStatus] = useState<string>("Carregando...");
  const [filtro, setFiltro] = useState("");
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const [plano, setPlano] = useState<Record<string, string>>({});
  const pdfRef = useRef<HTMLDivElement>(null);
  const { getJsPDF, isLoading: isPDFLoading } = usePDFExport();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const response = await fetch(getEdgeFunctionUrl("auditorias-lista"), {
        method: "GET",
        headers: getEdgeFunctionHeaders(),
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const data = await response.json();
      setAuditorias(data.auditorias || []);
      setFrota(data.frota || []);
      setCronStatus(data.cronStatus || "Status desconhecido");
    } catch (error) {
      logger.error("Erro ao carregar auditorias:", error);
      toast.error("Erro ao carregar auditorias");
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

  const exportarCSV = () => {
    const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.navio,
      format(new Date(a.data), "dd/MM/yyyy"),
      a.norma,
      a.item_auditado,
      a.resultado,
      a.comentarios,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditorias-imca-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exportado com sucesso!");
  };

  const exportarPDF = async () => {
    if (!pdfRef.current) return;

    try {
      toast.info("Gerando PDF...");
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const jsPDF = await getJsPDF();
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`auditorias-imca-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      logger.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const explicarIA = async (id: string, navio: string, item: string, norma: string) => {
    setLoadingIA(id);
    try {
      // Get explanation
      const resExplain = await fetch(getEdgeFunctionUrl("auditorias-explain"), {
        method: "POST",
        headers: getEdgeFunctionHeaders(),
        body: JSON.stringify({ navio, item, norma }),
      });
      const dataExplain = await resExplain.json();
      setExplicacao((prev) => ({ ...prev, [id]: dataExplain.resultado }));

      // Get action plan
      const resPlano = await fetch(getEdgeFunctionUrl("auditorias-plano"), {
        method: "POST",
        headers: getEdgeFunctionHeaders(),
        body: JSON.stringify({ navio, item, norma }),
      });
      const dataPlano = await resPlano.json();
      setPlano((prev) => ({ ...prev, [id]: dataPlano.plano }));
      toast.success("Análise IA gerada com sucesso!");
    } catch (error) {
      logger.error("Erro ao gerar análise IA:", error);
      toast.error("Erro ao gerar análise IA");
    } finally {
      setLoadingIA(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto mt-8 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h2>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Exportar CSV
          </Button>
          <Button onClick={exportarPDF} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Exportar PDF
          </Button>
        </div>
      </div>

      <Input
        placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <div className="text-sm text-muted-foreground mt-2">
        Frota auditada: {frota.length > 0 ? frota.join(", ") : "Nenhuma"} | ⏱️ Cron de auditorias: {cronStatus}
      </div>

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>Nenhuma auditoria encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          auditoriasFiltradas.map((a) => (
            <Card key={a.id} className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">🚢 {a.navio}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(a.data), "dd/MM/yyyy")} - Norma: {a.norma}
                    </p>
                  </div>
                  <Badge className={corResultado[a.resultado]}>{a.resultado}</Badge>
                </div>
                <p className="text-sm">
                  <strong>Item auditado:</strong> {a.item_auditado}
                </p>
                <p className="text-sm">
                  <strong>Comentários:</strong> {a.comentarios}
                </p>

                {a.resultado === "Não Conforme" && (
                  <div className="mt-2 space-y-2">
                    <Button
                      disabled={loadingIA === a.id}
                      onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                      className="w-full md:w-auto"
                    >
                      {loadingIA === a.id ? "Gerando análise..." : "🧠 Análise IA e Plano de Ação"}
                    </Button>
                    {explicacao[a.id] && (
                      <div className="text-sm text-muted-foreground border p-3 rounded bg-muted/50">
                        <strong>📘 Explicação IA:</strong>
                        <br />
                        <div className="mt-1 whitespace-pre-wrap">{explicacao[a.id]}</div>
                      </div>
                    )}
                    {plano[a.id] && (
                      <div className="text-sm text-info border border-info/30 p-3 rounded bg-info/5">
                        <strong>📋 Plano de Ação:</strong>
                        <br />
                        <div className="mt-1 whitespace-pre-wrap">{plano[a.id]}</div>
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
