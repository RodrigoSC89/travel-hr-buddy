"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"

interface DadosEmbarcacao {
  embarcacao: string
  risco: "baixo" | "moderado" | "alto"
  total: number
  por_mes: Record<string, number>
}

export function PainelSGSO() {
  const [dados, setDados] = useState<DadosEmbarcacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to fetch from Supabase edge function
        const { supabase } = await import("@/integrations/supabase/client")
        const { data, error: functionError } = await supabase.functions.invoke("sgso-panel-data")
        
        if (functionError) {
          console.warn("Supabase function error, using mock data:", functionError)
          // Use mock data if the function doesn't exist yet
          setDados(getMockData())
        } else {
          setDados(data || getMockData())
        }
      } catch (err) {
        console.warn("Error fetching SGSO data, using mock data:", err)
        setDados(getMockData())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const corPorRisco = {
    baixo: "bg-green-100 text-green-800",
    moderado: "bg-yellow-100 text-yellow-800",
    alto: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados SGSO...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar dados</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = dados.flatMap((d) =>
    Object.entries(d.por_mes).map(([mes, valor]: [string, number]) => ({
      embarcacao: d.embarcacao,
      mes,
      falhas: valor,
    }))
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🧭 Painel SGSO - Risco Operacional por Embarcação</h2>

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
        <h3 className="text-lg font-semibold mb-4">📊 Comparativo Mensal de Falhas</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
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

// Mock data function for fallback
function getMockData(): DadosEmbarcacao[] {
  return [
    {
      embarcacao: "Navio Alpha",
      risco: "baixo",
      total: 3,
      por_mes: {
        "Jan": 1,
        "Fev": 0,
        "Mar": 1,
        "Abr": 0,
        "Mai": 1,
        "Jun": 0,
      }
    },
    {
      embarcacao: "Navio Beta",
      risco: "moderado",
      total: 8,
      por_mes: {
        "Jan": 2,
        "Fev": 1,
        "Mar": 2,
        "Abr": 1,
        "Mai": 1,
        "Jun": 1,
      }
    },
    {
      embarcacao: "Navio Gamma",
      risco: "alto",
      total: 15,
      por_mes: {
        "Jan": 3,
        "Fev": 4,
        "Mar": 2,
        "Abr": 3,
        "Mai": 2,
        "Jun": 1,
      }
    }
  ]
}
