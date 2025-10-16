"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import html2pdf from "html2pdf.js"
import { saveAs } from "file-saver"

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
  const [auditorias, setAuditorias] = useState<Auditoria[]>([])
  const [filtro, setFiltro] = useState("")
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/auditorias/list")
      .then((res) => res.json())
      .then((data) => setAuditorias(data))
      .catch((error) => {
        console.error("Error fetching auditorias:", error)
        setAuditorias([])
      })
  }, [])

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  }

  const auditoriasFiltradas = auditorias.filter((a) =>
    [a.navio, a.norma, a.resultado, a.item_auditado].some((v) => 
      v && v.toLowerCase().includes(filtro.toLowerCase())
    )
  )

  const exportarCSV = () => {
    const header = ["Navio", "Data", "Norma", "Item", "Resultado", "Comentários"]
    const rows = auditoriasFiltradas.map((a) => [
      a.navio, 
      a.data, 
      a.norma, 
      a.item_auditado, 
      a.resultado, 
      a.comentarios
    ])
    const csv = [header, ...rows].map((e) => e.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "auditorias_imca.csv")
  }

  const exportarPDF = () => {
    if (!pdfRef.current) return
    html2pdf().from(pdfRef.current).set({
      margin: 0.5,
      filename: "auditorias_imca.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }).save()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h2>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} className="bg-blue-600 text-white">Exportar CSV</Button>
          <Button onClick={exportarPDF} className="bg-zinc-700 text-white">Exportar PDF</Button>
        </div>
      </div>

      <Input 
        placeholder="🔍 Filtrar por navio, norma, item ou resultado..." 
        value={filtro} 
        onChange={(e) => setFiltro(e.target.value)} 
      />

      <div ref={pdfRef} className="space-y-4">
        {auditoriasFiltradas.map((a) => (
          <Card key={a.id} className="shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">🚢 {a.navio}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.data ? format(new Date(a.data), 'dd/MM/yyyy') : 'Data não informada'} - Norma: {a.norma}
                  </p>
                </div>
                <Badge className={corResultado[a.resultado] || "bg-gray-100 text-gray-800"}>{a.resultado}</Badge>
              </div>
              <p className="text-sm"><strong>Item auditado:</strong> {a.item_auditado}</p>
              <p className="text-sm"><strong>Comentários:</strong> {a.comentarios}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
