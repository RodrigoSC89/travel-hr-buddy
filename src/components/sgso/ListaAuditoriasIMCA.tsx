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
    fetch("/api/auditorias/list")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAuditorias(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading auditorias:", error);
        setError("Erro ao carregar auditorias");
        setLoading(false);
      });
  }, []);

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  };

  const auditoriasFiltradas = auditorias.filter((a) =>
    [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
      v && v.toLowerCase().includes(filtro.toLowerCase())
    )
  );

  const exportarCSV = () => {
    const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"];
    const rows = auditoriasFiltradas.map((a) => [
      a.navio || "",
      a.data ? format(new Date(a.data), "dd/MM/yyyy") : "",
      a.norma || "",
      a.item_auditado || "",
      a.resultado || "",
      a.comentarios || ""
    ]);
    const csv = [header, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "auditorias_imca.csv");
  };

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    const opt = {
      margin: 0.5,
      filename: "auditorias_imca.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Carregando auditorias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h1>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} variant="outline">
            Exportar CSV
          </Button>
          <Button onClick={exportarPDF} variant="outline">
            Exportar PDF
          </Button>
        </div>
      </div>

      <Input
        placeholder="🔍 Filtrar por navio, norma, item ou resultado..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-md"
      />

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 text-center">
                {filtro ? "Nenhuma auditoria encontrada com o filtro aplicado" : "Nenhuma auditoria registrada"}
              </p>
            </CardContent>
          </Card>
        ) : (
          auditoriasFiltradas.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">🚢 {a.navio || "Sem identificação"}</h3>
                    <p className="text-sm text-gray-600">
                      {a.data ? format(new Date(a.data), "dd/MM/yyyy") : "Data não informada"} - Norma: {a.norma || "N/A"}
                    </p>
                  </div>
                  <Badge className={corResultado[a.resultado] || "bg-gray-100 text-gray-800"}>
                    {a.resultado || "N/A"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Item auditado:</strong> {a.item_auditado || "Não especificado"}
                  </p>
                  {a.comentarios && (
                    <p className="text-sm">
                      <strong>Comentários:</strong> {a.comentarios}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
