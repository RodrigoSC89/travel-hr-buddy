"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

interface Auditoria {
  id: string;
  navio: string;
  data: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Observação";
  comentarios: string;
}

export function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [explicacao, setExplicacao] = useState<Record<string, string>>({});
  const [loadingIA, setLoadingIA] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auditorias/list")
      .then((res) => res.json())
      .then((data) => setAuditorias(data))
      .catch((error) => console.error("Error fetching auditorias:", error));
  }, []);

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  };

  const auditoriasFiltradas = auditorias.filter((a) =>
    [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
      v?.toLowerCase().includes(filtro.toLowerCase())
    )
  );

  const exportarCSV = () => {
    const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.navio, 
      a.data, 
      a.norma, 
      a.item_auditado, 
      a.resultado, 
      a.comentarios
    ]);
    const csv = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "auditorias_imca.csv");
  };

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    html2pdf().from(pdfRef.current).set({
      margin: 0.5,
      filename: "auditorias_imca.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }).save();
  };

  const explicarIA = async (id: string, navio: string, item: string, norma: string) => {
    setLoadingIA(id);
    try {
      const res = await fetch("/api/auditorias/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navio, item, norma }),
      });
      const data = await res.json();
      setExplicacao((prev) => ({ ...prev, [id]: data.resultado }));
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      setExplicacao((prev) => ({ 
        ...prev, 
        [id]: "Erro ao gerar explicação. Tente novamente." 
      }));
    } finally {
      setLoadingIA(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={exportarCSV} 
            variant="outline"
            disabled={auditoriasFiltradas.length === 0}
          >
            Exportar CSV
          </Button>
          <Button 
            onClick={exportarPDF} 
            variant="outline"
            disabled={auditoriasFiltradas.length === 0}
          >
            Exportar PDF
          </Button>
        </div>

        <Input 
          placeholder="🔍 Filtrar por navio, norma, item ou resultado..." 
          value={filtro} 
          onChange={(e) => setFiltro(e.target.value)} 
        />
      </div>

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {filtro ? "Nenhuma auditoria encontrada com os filtros aplicados" : "Nenhuma auditoria registrada"}
            </CardContent>
          </Card>
        )}

        {auditoriasFiltradas.map((a) => (
          <Card key={a.id} className="shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">🚢 {a.navio}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.data && format(new Date(a.data), 'dd/MM/yyyy')} - Norma: {a.norma}
                  </p>
                </div>
                <Badge className={corResultado[a.resultado]}>
                  {a.resultado}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium">Item auditado: {a.item_auditado}</p>
              </div>

              {a.comentarios && (
                <div className="text-sm text-muted-foreground">
                  <strong>Comentários:</strong> {a.comentarios}
                </div>
              )}

              {a.resultado === "Não Conforme" && (
                <div className="mt-2 space-y-2">
                  <Button 
                    disabled={loadingIA === a.id} 
                    onClick={() => explicarIA(a.id, a.navio, a.item_auditado, a.norma)}
                    size="sm"
                  >
                    {loadingIA === a.id ? "Gerando explicação..." : "🧠 Explicar com IA"}
                  </Button>
                  {explicacao[a.id] && (
                    <div className="text-sm text-muted-foreground border p-3 rounded-md bg-muted/50">
                      <strong>📘 Explicação IA:</strong>
                      <br />
                      <div className="mt-2 whitespace-pre-wrap">{explicacao[a.id]}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {auditoriasFiltradas.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          ✅ IA embarcada ativada para explicar Não Conformidades em auditorias técnicas!
        </div>
      )}
    </div>
  );
}
