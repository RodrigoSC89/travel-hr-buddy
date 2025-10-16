import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

interface Auditoria {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável";
  comentarios: string;
  data: string;
}

const corResultado: Record<string, string> = {
  "Conforme": "bg-green-500 text-white",
  "Não Conforme": "bg-red-500 text-white",
  "Parcialmente Conforme": "bg-yellow-500 text-white",
  "Não Aplicável": "bg-gray-500 text-white",
};

export default function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const pdfRef = useRef<HTMLDivElement>(null);

  // Carregar auditorias
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

      setAuditorias((data || []) as Auditoria[]);
    } catch (error) {
      console.error("Erro ao carregar auditorias:", error);
      toast.error("Erro ao carregar auditorias");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar auditorias
  const auditoriasFiltradas = auditorias.filter((a) => {
    const termo = filtro.toLowerCase();
    return (
      a.navio?.toLowerCase().includes(termo) ||
      a.norma?.toLowerCase().includes(termo) ||
      a.item_auditado?.toLowerCase().includes(termo) ||
      a.resultado?.toLowerCase().includes(termo) ||
      a.comentarios?.toLowerCase().includes(termo)
    );
  });

  // Obter frota única
  const frota = Array.from(new Set(auditorias.map((a) => a.navio).filter(Boolean)));

  // Explicar com IA
  const explicarIA = async (id: string, navio: string, itemAuditado: string, norma: string) => {
    setLoadingIA(id);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/mmi-copilot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Explique detalhadamente por que o item "${itemAuditado}" do navio "${navio}" está em não conformidade com a norma "${norma}". Forneça recomendações práticas para correção.`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar explicação da IA");
      }

      const result = await response.json();
      setExplicacao((prev) => ({
        ...prev,
        [id]: result.response || "Não foi possível gerar uma explicação.",
      }));
      toast.success("Explicação gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao explicar com IA:", error);
      toast.error("Erro ao gerar explicação");
    } finally {
      setLoadingIA(null);
    }
  };

  // Exportar para PDF
  const exportarPDF = async () => {
    if (!pdfRef.current) return;

    try {
      toast.info("Gerando PDF...");
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
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
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  // Exportar para CSV
  const exportarCSV = () => {
    try {
      const headers = ["Navio", "Norma", "Item Auditado", "Resultado", "Comentários", "Data"];
      const rows = auditoriasFiltradas.map((a) => [
        a.navio || "",
        a.norma || "",
        a.item_auditado || "",
        a.resultado || "",
        a.comentarios || "",
        a.data ? format(new Date(a.data), "dd/MM/yyyy") : "",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `auditorias-imca-${new Date().toISOString().split("T")[0]}.csv`);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando auditorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📋 Histórico de Auditorias IMCA</h1>
        <div className="flex gap-2">
          <Button onClick={exportarPDF} disabled={auditoriasFiltradas.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={exportarCSV} disabled={auditoriasFiltradas.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Input
        placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <div className="text-sm text-muted-foreground mt-2">
        Frota auditada: {frota.length > 0 ? frota.join(", ") : "Nenhum navio registrado"}
      </div>

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.map((a) => (
          <Card key={a.id} className="shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">🚢 {a.navio || "Navio não informado"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "Data não informada"} - Norma:{" "}
                    {a.norma || "Não informada"}
                  </p>
                </div>
                <Badge className={corResultado[a.resultado] || "bg-gray-500 text-white"}>
                  {a.resultado || "Não informado"}
                </Badge>
              </div>
              <p className="text-sm">
                <strong>Item auditado:</strong> {a.item_auditado || "Não informado"}
              </p>
              <p className="text-sm">
                <strong>Comentários:</strong> {a.comentarios || "Sem comentários"}
              </p>

              {a.resultado === "Não Conforme" && (
                <div className="mt-2">
                  <Button
                    disabled={loadingIA === a.id}
                    onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                  >
                    {loadingIA === a.id ? "Gerando explicação..." : "🧠 Explicar com IA"}
                  </Button>
                  {explicacao[a.id] && (
                    <div className="text-sm text-muted-foreground mt-2 border p-2 rounded">
                      <strong>📘 Explicação IA:</strong>
                      <br />
                      {explicacao[a.id]}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {auditoriasFiltradas.length === 0 && !loading && (
        <Card className="shadow-sm">
          <CardContent className="p-6 text-center text-gray-500">
            <p>
              {filtro
                ? "Nenhuma auditoria encontrada com os critérios de filtro."
                : "Nenhuma auditoria registrada no sistema."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
