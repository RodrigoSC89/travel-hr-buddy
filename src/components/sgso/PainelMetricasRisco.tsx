"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"

interface MetricData {
  auditoria_id: string
  embarcacao: string
  falhas_criticas: number
  mes?: string
}

export function PainelMetricasRisco() {
  const [dados, setDados] = useState<MetricData[]>([])
  const [embarcacoes, setEmbarcacoes] = useState<string[]>([])
  const [filtro, setFiltro] = useState("Todos")

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data: MetricData[]) => {
        setDados(data)
        const unique = Array.from(new Set(data.map((d) => d.embarcacao)))
        setEmbarcacoes(["Todos", ...unique])
      })
  }, [])

  const dadosFiltrados = filtro === "Todos" ? dados : dados.filter((d) => d.embarcacao === filtro)

  // Aggregate data by month for temporal evolution
  const dadosTemporais = dadosFiltrados.reduce((acc: Record<string, { mes: string; falhas_criticas: number }>, item) => {
    const mes = item.mes || "N/A"
    if (!acc[mes]) {
      acc[mes] = { mes, falhas_criticas: 0 }
    }
    acc[mes].falhas_criticas += item.falhas_criticas
    return acc
  }, {})

  const dadosTemporaisArray = Object.values(dadosTemporais)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">📊 Métricas de Risco</h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Filtrar por embarcação:</label>
                <select
                  className="border rounded px-3 py-2 text-sm bg-white"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                >
                  {embarcacoes.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosFiltrados} margin={{ top: 10, right: 30, left: 10, bottom: 100 }}>
                <XAxis
                  dataKey="auditoria_id"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="falhas_criticas" fill="#dc2626" name="Falhas Críticas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">📈 Evolução Temporal de Risco</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosTemporaisArray}>
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="falhas_criticas" stroke="#dc2626" name="Falhas Críticas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
