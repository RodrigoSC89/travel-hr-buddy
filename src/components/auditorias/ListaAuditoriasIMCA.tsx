import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

interface Auditoria {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Não Aplicável";
  comentarios: string;
  data: string;
}

const corResultado: Record<string, string> = {
  "Conforme": "bg-green-500 text-white",
  "Não Conforme": "bg-red-500 text-white",
  "Não Aplicável": "bg-gray-500 text-white",
};

export default function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const [plano, setPlano] = useState<Record<string, string>>({});
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarAuditorias();
  }, []);

  const carregarAuditorias = async () => {
    try {
      const { data, error } = await supabase
        .from("auditorias_imca")
        .select("*")
        .order("data", { ascending: false });

      if (error) {
        console.error("Error loading auditorias:", error);
        toast.error("Erro ao carregar auditorias");
        return;
      }

      setAuditorias(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar auditorias");
    }
  };

  const auditoriasFiltradas = auditorias.filter((a) => {
    const termoFiltro = filtro.toLowerCase();
    return (
      a.navio?.toLowerCase().includes(termoFiltro) ||
      a.norma?.toLowerCase().includes(termoFiltro) ||
      a.item_auditado?.toLowerCase().includes(termoFiltro) ||
      a.resultado?.toLowerCase().includes(termoFiltro)
    );
  });

  const frota = [...new Set(auditorias.map((a) => a.navio).filter(Boolean))];

  const exportarCSV = () => {
    const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.navio || "",
      a.data ? format(new Date(a.data), "dd/MM/yyyy") : "",
      a.norma || "",
      a.item_auditado || "",
      a.resultado || "",
      a.comentarios || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "auditorias_imca.csv");
    toast.success("CSV exportado com sucesso!");
  };

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    
    toast.info("Gerando PDF...");
    
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 0.5,
        filename: "auditorias_imca.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        toast.success("PDF exportado com sucesso!");
      })
      .catch((error: Error) => {
        console.error("Error generating PDF:", error);
        toast.error("Erro ao gerar PDF");
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
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ navio, item, norma }),
      });

      const dataExplain = await resExplain.json();
      setExplicacao((prev) => ({ ...prev, [id]: dataExplain.resultado }));

      // Get action plan
      const resPlano = await fetch(`${SUPABASE_URL}/functions/v1/auditorias-plano`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ navio, item, norma }),
      });

      const dataPlano = await resPlano.json();
      setPlano((prev) => ({ ...prev, [id]: dataPlano.plano }));

      toast.success("Análise IA gerada com sucesso!");
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      toast.error("Erro ao gerar análise IA");
    } finally {
      setLoadingIA(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">📋 Auditorias Técnicas Registradas</h1>
        
        <div className="flex gap-2">
          <Button onClick={exportarCSV} variant="outline">
            Exportar CSV
          </Button>
          <Button onClick={exportarPDF} variant="outline">
            Exportar PDF
          </Button>
        </div>

        <Input
          placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        {frota.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Frota auditada: {frota.join(", ")}
          </div>
        )}
      </div>

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.map((a) => (
          <Card key={a.id} className="shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">🚢 {a.navio || "Sem navio"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "Sem data"} - Norma: {a.norma || "N/A"}
                  </p>
                </div>
                <Badge className={corResultado[a.resultado] || ""}>{a.resultado}</Badge>
              </div>
              
              <p className="text-sm">
                <strong>Item auditado:</strong> {a.item_auditado || "N/A"}
              </p>
              
              <p className="text-sm">
                <strong>Comentários:</strong> {a.comentarios || "Sem comentários"}
              </p>

              {a.resultado === "Não Conforme" && (
                <div className="mt-2 space-y-2">
                  <Button
                    disabled={loadingIA === a.id}
                    onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                    size="sm"
                  >
                    {loadingIA === a.id ? "Gerando análise..." : "🧠 Análise IA e Plano de Ação"}
                  </Button>
                  
                  {explicacao[a.id] && (
                    <div className="text-sm text-muted-foreground border p-2 rounded">
                      <strong>📘 Explicação IA:</strong>
                      <br />
                      {explicacao[a.id]}
                    </div>
                  )}
                  
                  {plano[a.id] && (
                    <div className="text-sm text-blue-800 border border-blue-300 p-2 rounded bg-blue-50">
                      <strong>📋 Plano de Ação:</strong>
                      <br />
                      <div className="whitespace-pre-wrap">{plano[a.id]}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {auditoriasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma auditoria encontrada
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
