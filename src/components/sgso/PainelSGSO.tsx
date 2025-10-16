"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { saveAs } from "file-saver"

interface VesselData {
  embarcacao: string
  risco: "baixo" | "moderado" | "alto"
  total: number
  por_mes: Record<string, number>
}

export function PainelSGSO() {
  const [dados, setDados] = useState<VesselData[]>([])

  useEffect(() => {
    fetch("/api/admin/sgso")
      .then((res) => res.json())
      .then((data) => setDados(data))
  }, [])

  const corPorRisco = {
    baixo: "bg-green-100 text-green-800",
    moderado: "bg-yellow-100 text-yellow-800",
    alto: "bg-red-100 text-red-800",
  }

  const exportarCSV = () => {
    const header = ["Embarcação", "Risco", "Total de Falhas"]
    const rows = dados.map((d) => [d.embarcacao, d.risco, d.total])
    const csv = [header, ...rows].map((e) => e.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "relatorio_sgso.csv")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🧭 Painel SGSO - Risco Operacional por Embarcação</h2>
        <Button onClick={exportarCSV} className="bg-blue-600 hover:bg-blue-700 text-white">Exportar CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dados.map((d) => (
          <Card key={d.embarcacao} className="shadow-md">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">🚢 {d.embarcacao}</h3>
              <p className={cn("inline-block px-2 py-1 rounded mt-2 text-sm font-medium", corPorRisco[d.risco])}>
                Risco: {d.risco.toUpperCase()}
              </p>
              <p className="mt-2 text-sm">Falhas críticas: {d.total}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6">
        <h3 className="text-lg font-semibold">📊 Comparativo Mensal de Falhas</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={dados.flatMap((d) =>
              Object.entries(d.por_mes).map(([mes, valor]: [string, any]) => ({
                embarcacao: d.embarcacao,
                mes,
                falhas: valor,
              }))
            )}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          >
            <XAxis dataKey="mes" angle={-45} textAnchor="end" interval={0} height={100} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="falhas" fill="#ef4444" name="Falhas Críticas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
