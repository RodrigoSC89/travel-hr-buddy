import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Interface representing an IMCA audit record
 */
interface Auditoria {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  comentarios: string;
  resultado: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável";
  data: string;
}

/**
 * Response type from the auditorias-lista API endpoint
 */
interface AuditoriasResponse {
  auditorias: Auditoria[];
  frota: string[];
  cronStatus: string;
}

/**
 * Color classes for different audit result statuses
 */
const corResultado: Record<string, string> = {
  "Conforme": "bg-green-500 text-white",
  "Não Conforme": "bg-red-500 text-white",
  "Parcialmente Conforme": "bg-yellow-500 text-black",
  "Não Aplicável": "bg-gray-400 text-white",
};

/**
 * Main component for displaying IMCA audit records with filtering,
 * export capabilities, and AI-powered analysis features
 */
export default function ListaAuditoriasIMCA() {
  // State management
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [frota, setFrota] = useState<string[]>([]);
  const [cronStatus, setCronStatus] = useState<string>("Carregando...");
  const [filtro, setFiltro] = useState("");
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const [plano, setPlano] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const pdfRef = useRef<HTMLDivElement>(null);

  // Environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  /**
   * Load audit data from the API
   */
  const carregarDados = useCallback(async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error("Configuração do Supabase não encontrada");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${supabaseUrl}/functions/v1/auditorias-lista`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status}`);
      }

      const data: AuditoriasResponse = await response.json();
      setAuditorias(data.auditorias || []);
      setFrota(data.frota || []);
      setCronStatus(data.cronStatus || "Status desconhecido");
    } catch (error) {
      console.error("Erro ao carregar auditorias:", error);
      toast.error("Erro ao carregar auditorias. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  // Load data on component mount
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /**
   * Filter audits based on search term
   */
  const auditoriasFiltradas = useMemo(() => {
    if (!filtro.trim()) {
      return auditorias;
    }

    const searchTerm = filtro.toLowerCase().trim();
    return auditorias.filter((a) => 
      a.navio?.toLowerCase().includes(searchTerm) ||
      a.norma?.toLowerCase().includes(searchTerm) ||
      a.item_auditado?.toLowerCase().includes(searchTerm) ||
      a.resultado?.toLowerCase().includes(searchTerm)
    );
  }, [auditorias, filtro]);

  /**
   * Export filtered audits to CSV format
   */
  const exportarCSV = useCallback(() => {
    try {
      const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
      const rows = auditoriasFiltradas.map((a) => [
        a.navio,
        format(new Date(a.data), "dd/MM/yyyy"),
        a.norma,
        a.item_auditado,
        a.resultado,
        a.comentarios || "",
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map(cell => `"${cell}"`).join(","))
        .join("\n");
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `auditorias-imca-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV. Por favor, tente novamente.");
    }
  }, [auditoriasFiltradas]);

  /**
   * Export filtered audits to PDF format
   */
  const exportarPDF = useCallback(async () => {
    if (!pdfRef.current) {
      toast.error("Erro ao gerar PDF: Referência não encontrada");
      return;
    }

    try {
      toast.info("Gerando PDF...");
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Add first page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`auditorias-imca-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF. Por favor, tente novamente.");
    }
  }, []);

  /**
   * Generate AI explanation and action plan for non-compliant audits
   */
  const explicarIA = useCallback(async (
    id: string, 
    navio: string, 
    item: string, 
    norma: string
  ) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error("Configuração do Supabase não encontrada");
      return;
    }

    setLoadingIA(id);
    
    try {
      // Fetch AI explanation
      const resExplain = await fetch(
        `${supabaseUrl}/functions/v1/auditorias-explain`, 
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ navio, item, norma }),
        }
      );

      if (!resExplain.ok) {
        throw new Error(`Erro ao obter explicação: ${resExplain.status}`);
      }

      const dataExplain = await resExplain.json();
      setExplicacao((prev) => ({ ...prev, [id]: dataExplain.resultado }));

      // Fetch action plan
      const resPlano = await fetch(
        `${supabaseUrl}/functions/v1/auditorias-plano`, 
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ navio, item, norma }),
        }
      );

      if (!resPlano.ok) {
        throw new Error(`Erro ao obter plano de ação: ${resPlano.status}`);
      }

      const dataPlano = await resPlano.json();
      setPlano((prev) => ({ ...prev, [id]: dataPlano.plano }));

      toast.success("Análise IA gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar análise IA:", error);
      toast.error("Erro ao gerar análise IA. Por favor, tente novamente.");
    } finally {
      setLoadingIA(null);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto mt-8 p-4">
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Carregando auditorias...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto mt-8 p-4">
      {/* Header with export buttons */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h2>
        <div className="flex gap-2">
          <Button 
            onClick={exportarCSV} 
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={auditoriasFiltradas.length === 0}
          >
            Exportar CSV
          </Button>
          <Button 
            onClick={exportarPDF} 
            className="bg-zinc-700 text-white hover:bg-zinc-800"
            disabled={auditoriasFiltradas.length === 0}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Search/Filter input */}
      <Input
        placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-2xl"
      />

      {/* Fleet information and cron status */}
      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Frota auditada:</strong> {frota.length > 0 ? frota.join(", ") : "Nenhuma"} 
          {" | "}
          <strong>⏱️ Cron de auditorias:</strong> {cronStatus}
        </p>
      </div>

      {/* Audit cards list */}
      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>
                {filtro ? "Nenhuma auditoria encontrada com os filtros aplicados." : "Nenhuma auditoria registrada."}
              </p>
            </CardContent>
          </Card>
        ) : (
          auditoriasFiltradas.map((a) => (
            <Card key={a.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                {/* Audit header with ship name and status badge */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">🚢 {a.navio}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(a.data), "dd/MM/yyyy")} - Norma: {a.norma}
                    </p>
                  </div>
                  <Badge className={corResultado[a.resultado] || "bg-gray-500 text-white"}>
                    {a.resultado}
                  </Badge>
                </div>

                {/* Audit details */}
                <div className="space-y-1">
                  <p className="text-sm">
                    <strong>Item auditado:</strong> {a.item_auditado}
                  </p>
                  {a.comentarios && (
                    <p className="text-sm">
                      <strong>Comentários:</strong> {a.comentarios}
                    </p>
                  )}
                </div>

                {/* AI Analysis section (only for non-compliant audits) */}
                {a.resultado === "Não Conforme" && (
                  <div className="mt-3 space-y-2 pt-3 border-t">
                    <Button
                      disabled={loadingIA === a.id}
                      onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                      className="w-full md:w-auto"
                      variant="outline"
                    >
                      {loadingIA === a.id ? (
                        <>
                          <span className="animate-pulse">Gerando análise...</span>
                        </>
                      ) : (
                        "🧠 Análise IA e Plano de Ação"
                      )}
                    </Button>
                    
                    {/* AI Explanation */}
                    {explicacao[a.id] && (
                      <div className="text-sm text-muted-foreground border p-3 rounded bg-slate-50">
                        <strong className="text-slate-900">📘 Explicação IA:</strong>
                        <div className="mt-2 whitespace-pre-wrap leading-relaxed">
                          {explicacao[a.id]}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Plan */}
                    {plano[a.id] && (
                      <div className="text-sm text-blue-800 border border-blue-300 p-3 rounded bg-blue-50">
                        <strong className="text-blue-900">📋 Plano de Ação:</strong>
                        <div className="mt-2 whitespace-pre-wrap leading-relaxed">
                          {plano[a.id]}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results summary */}
      {auditoriasFiltradas.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pb-4">
          Exibindo {auditoriasFiltradas.length} de {auditorias.length} auditoria(s)
        </div>
      )}
    </div>
  );
}
