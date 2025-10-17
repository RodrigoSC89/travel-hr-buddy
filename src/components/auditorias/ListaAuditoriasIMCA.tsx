import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";

interface AuditoriaIMCA {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Não Aplicável";
  comentarios: string;
  data: string;
  created_at: string;
}

export default function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<AuditoriaIMCA[]>([]);
  const [auditoriasFiltradas, setAuditoriasFiltradas] = useState<AuditoriaIMCA[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const [plano, setPlano] = useState<Record<string, string>>({});
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarAuditorias();
  }, []);

  useEffect(() => {
    filtrarAuditorias();
  }, [filtro, auditorias]);

  const carregarAuditorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("auditorias_imca")
        .select("*")
        .not("navio", "is", null)
        .order("data", { ascending: false });

      if (error) throw error;

      setAuditorias((data as AuditoriaIMCA[]) || []);
    } catch (error) {
      console.error("Erro ao carregar auditorias:", error);
      toast.error("Erro ao carregar auditorias");
    } finally {
      setLoading(false);
    }
  };

  const filtrarAuditorias = () => {
    if (!filtro.trim()) {
      setAuditoriasFiltradas(auditorias);
      return;
    }

    const filtroLower = filtro.toLowerCase();
    const filtradas = auditorias.filter(
      (a) =>
        a.navio?.toLowerCase().includes(filtroLower) ||
        a.norma?.toLowerCase().includes(filtroLower) ||
        a.item_auditado?.toLowerCase().includes(filtroLower) ||
        a.resultado?.toLowerCase().includes(filtroLower)
    );
    setAuditoriasFiltradas(filtradas);
  };

  const exportarCSV = () => {
    if (auditoriasFiltradas.length === 0) {
      toast.error("Nenhuma auditoria para exportar");
      return;
    }

    const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.navio,
      a.data ? format(new Date(a.data), "dd/MM/yyyy") : "-",
      a.norma,
      a.item_auditado,
      a.resultado,
      a.comentarios || "-",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `auditorias_imca_${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success("CSV exportado com sucesso!");
  };

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    if (auditoriasFiltradas.length === 0) {
      toast.error("Nenhuma auditoria para exportar");
      return;
    }

    toast.info("Gerando PDF...");
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 0.5,
        filename: `auditorias_imca_${format(new Date(), "yyyy-MM-dd")}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        toast.success("PDF exportado com sucesso!");
      })
      .catch((error: Error) => {
        console.error("Erro ao exportar PDF:", error);
        toast.error("Erro ao exportar PDF");
      });
  };

  const explicarIA = async (id: string, navio: string, item: string, norma: string) => {
    setLoadingIA(id);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Get explanation
      const resExplain = await fetch(`${SUPABASE_URL}/functions/v1/auditorias-explain`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ navio, item, norma }),
      });

      const dataExplain = await resExplain.json();
      if (dataExplain.success) {
        setExplicacao((prev) => ({ ...prev, [id]: dataExplain.resultado }));
      } else {
        throw new Error(dataExplain.error || "Erro ao gerar explicação");
      }

      // Get action plan
      const resPlano = await fetch(`${SUPABASE_URL}/functions/v1/auditorias-plano`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ navio, item, norma }),
      });

      const dataPlano = await resPlano.json();
      if (dataPlano.success) {
        setPlano((prev) => ({ ...prev, [id]: dataPlano.plano }));
        toast.success("Análise IA gerada com sucesso!");
      } else {
        throw new Error(dataPlano.error || "Erro ao gerar plano");
      }
    } catch (error) {
      console.error("Erro ao gerar análise IA:", error);
      toast.error("Erro ao gerar análise IA");
    } finally {
      setLoadingIA(null);
    }
  };

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case "Conforme":
        return <Badge className="bg-green-500 text-white">🟢 Conforme</Badge>;
      case "Não Conforme":
        return <Badge className="bg-red-500 text-white">🔴 Não Conforme</Badge>;
      case "Não Aplicável":
        return <Badge className="bg-gray-500 text-white">⚫ Não Aplicável</Badge>;
      default:
        return <Badge>{resultado}</Badge>;
    }
  };

  const frota = [...new Set(auditoriasFiltradas.map((a) => a.navio))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📋 Auditorias Técnicas IMCA</h1>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={exportarPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </CardContent>
      </Card>

      {frota.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚢 Frota Auditada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{frota.join(", ")}</p>
          </CardContent>
        </Card>
      )}

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>Nenhuma auditoria encontrada</p>
            </CardContent>
          </Card>
        ) : (
          auditoriasFiltradas.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">🚢 {a.navio}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "-"} - Norma: {a.norma}
                    </p>
                  </div>
                  {getResultadoBadge(a.resultado)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Item auditado:</p>
                  <p className="text-sm text-muted-foreground">{a.item_auditado}</p>
                </div>

                {a.comentarios && (
                  <div>
                    <p className="font-semibold">Comentários:</p>
                    <p className="text-sm text-muted-foreground">{a.comentarios}</p>
                  </div>
                )}

                {a.resultado === "Não Conforme" && (
                  <div className="space-y-2">
                    <Button
                      disabled={loadingIA === a.id}
                      onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                      size="sm"
                      variant="secondary"
                    >
                      {loadingIA === a.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando análise...
                        </>
                      ) : (
                        "🧠 Análise IA e Plano de Ação"
                      )}
                    </Button>

                    {explicacao[a.id] && (
                      <div className="border rounded p-3 bg-blue-50">
                        <p className="font-semibold text-sm mb-2">📘 Explicação IA:</p>
                        <p className="text-sm whitespace-pre-line">{explicacao[a.id]}</p>
                      </div>
                    )}

                    {plano[a.id] && (
                      <div className="border rounded p-3 bg-green-50">
                        <p className="font-semibold text-sm mb-2">📋 Plano de Ação:</p>
                        <p className="text-sm whitespace-pre-line">{plano[a.id]}</p>
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
