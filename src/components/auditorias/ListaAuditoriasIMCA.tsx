import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";
import { supabase } from "@/integrations/supabase/client";

interface Auditoria {
  id: string;
  navio: string;
  data: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Não Aplicável";
  comentarios: string;
}

const corResultado: Record<string, string> = {
  "Conforme": "bg-green-600 text-white",
  "Não Conforme": "bg-red-600 text-white",
  "Não Aplicável": "bg-gray-500 text-white",
};

export default function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const [plano, setPlano] = useState<Record<string, string>>({});
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarAuditorias();
  }, []);

  const carregarAuditorias = async () => {
    try {
      setLoading(true);
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
    const searchText = filtro.toLowerCase();
    return (
      a.navio?.toLowerCase().includes(searchText) ||
      a.norma?.toLowerCase().includes(searchText) ||
      a.item_auditado?.toLowerCase().includes(searchText) ||
      a.resultado?.toLowerCase().includes(searchText)
    );
  });

  const frota = [...new Set(auditorias.map((a) => a.navio).filter(Boolean))];

  const exportarCSV = () => {
    const headers = ["Navio", "Data", "Norma", "Item Auditado", "Resultado", "Comentários"];
    const rows = auditorias.map((a) => [
      a.navio || "",
      a.data ? format(new Date(a.data), "dd/MM/yyyy") : "",
      a.norma || "",
      a.item_auditado || "",
      a.resultado || "",
      a.comentarios || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "auditorias_imca.csv");
  };

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 0.5,
        filename: "auditorias_imca.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const explicarIA = async (id: string, navio: string, item: string, norma: string) => {
    setLoadingIA(id);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/auditorias-explain`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ navio, item, norma }),
      });
      const data = await res.json();
      setExplicacao((prev) => ({ ...prev, [id]: data.resultado }));

      const planoRes = await fetch(`${SUPABASE_URL}/functions/v1/auditorias-plano`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ navio, item, norma }),
      });
      const planoData = await planoRes.json();
      setPlano((prev) => ({ ...prev, [id]: planoData.plano }));
    } catch (error) {
      console.error("Erro ao gerar análise IA:", error);
      toast.error("Erro ao gerar análise com IA");
    } finally {
      setLoadingIA(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando auditorias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h2>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} className="bg-blue-600 text-white">
            Exportar CSV
          </Button>
          <Button onClick={exportarPDF} className="bg-zinc-700 text-white">
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
        Frota auditada: {frota.length > 0 ? frota.join(", ") : "Nenhuma auditoria registrada"}
      </div>

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.map((a) => (
          <Card key={a.id} className="shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">🚢 {a.navio || "N/A"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "N/A"} - Norma: {a.norma || "N/A"}
                  </p>
                </div>
                <Badge className={corResultado[a.resultado]}>{a.resultado}</Badge>
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
                    onClick={() =>
                      explicarIA(a.id, a.navio, a.item_auditado, a.norma)
                    }
                  >
                    {loadingIA === a.id
                      ? "Gerando análise..."
                      : "🧠 Análise IA e Plano de Ação"}
                  </Button>
                  {explicacao[a.id] && (
                    <div className="text-sm text-muted-foreground border p-2 rounded">
                      <strong>📘 Explicação IA:</strong>
                      <br />
                      {explicacao[a.id]}
                    </div>
                  )}
                  {plano[a.id] && (
                    <div className="text-sm text-blue-800 border border-blue-300 p-2 rounded">
                      <strong>📋 Plano de Ação:</strong>
                      <br />
                      {plano[a.id]}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {auditoriasFiltradas.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {filtro
            ? "Nenhuma auditoria encontrada com os filtros aplicados"
            : "Nenhuma auditoria registrada"}
        </div>
      )}
    </div>
  );
}
