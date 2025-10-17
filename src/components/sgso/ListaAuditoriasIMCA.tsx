"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

type Auditoria = {
  id: string
  navio: string
  data: string
  norma: string
  item_auditado: string
  resultado: "Conforme" | "Não Conforme" | "Observação"
  comentarios: string
}

export function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAuditorias = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auditorias/list");
        const result = await res.json();
        
        if (result.success) {
          setAuditorias(result.data || []);
          setError(null);
        } else {
          setError(result.error || "Erro ao carregar auditorias");
        }
      } catch (err) {
        setError("Erro ao conectar com o servidor");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditorias();
  }, []);

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  };

  const auditoriasFiltradas = auditorias.filter((a) =>
    [a.navio, a.norma, a.resultado, a.item_auditado]
      .some((v) => v && v.toLowerCase().includes(filtro.toLowerCase()))
  );

  const exportarCSV = () => {
    const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.navio, 
      a.data, 
      a.norma, 
      a.item_auditado, 
      a.resultado, 
      a.comentarios || ""
    ]);
    
    // Add UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const csv = BOM + [header, ...rows]
      .map((row) => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
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

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-semibold">Erro ao carregar auditorias</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📋 Auditorias Técnicas Registradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportarCSV} variant="outline" size="sm">
              Exportar CSV
            </Button>
            <Button onClick={exportarPDF} variant="outline" size="sm">
              Exportar PDF
            </Button>
          </div>

          <Input 
            placeholder="🔍 Filtrar por navio, norma, item ou resultado..." 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full"
          />

          {auditoriasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma auditoria encontrada</p>
              {filtro && <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>}
            </div>
          ) : (
            <div ref={pdfRef} className="space-y-3">
              {auditoriasFiltradas.map((a) => (
                <Card key={a.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold text-lg">🚢 {a.navio}</h3>
                        <p className="text-sm text-muted-foreground">
                          {a.data && format(new Date(a.data), "dd/MM/yyyy")} - Norma: {a.norma}
                        </p>
                      </div>
                      <Badge className={corResultado[a.resultado] || "bg-gray-100 text-gray-800"}>
                        {a.resultado}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Item auditado:</span> {a.item_auditado}
                      </p>
                      {a.comentarios && (
                        <p className="text-sm">
                          <span className="font-medium">Comentários:</span> {a.comentarios}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
