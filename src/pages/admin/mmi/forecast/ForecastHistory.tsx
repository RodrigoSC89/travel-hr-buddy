'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Forecast = {
  id: string
  vessel_name: string
  system_name: string
  hourmeter: number
  last_maintenance: string[]
  forecast_text: string
  created_at: string
}

export default function ForecastHistoryPage() {
  const [data, setData] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/mmi/forecast/all')
      .then(res => res.json())
      .then((forecasts) => {
        // Transform the data to match expected format
        const transformed = forecasts.map((f: any) => ({
          ...f,
          last_maintenance: Array.isArray(f.last_maintenance) 
            ? f.last_maintenance 
            : []
        }))
        setData(transformed)
      })
      .catch((err) => {
        console.error('Error loading forecasts:', err)
        setData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📚 Histórico de Forecasts</h1>
        <p className="text-muted-foreground">Carregando forecasts...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📚 Histórico de Forecasts</h1>

      {data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum forecast encontrado. Gere um forecast na página de MMI para ver o histórico aqui.
          </CardContent>
        </Card>
      ) : (
        data.map((f) => (
          <Card key={f.id}>
            <CardContent className="space-y-2 p-4">
              <div><b>🚢 Embarcação:</b> {f.vessel_name}</div>
              <div><b>⚙️ Sistema:</b> {f.system_name}</div>
              <div><b>⏱ Horímetro:</b> {f.hourmeter}h</div>
              <div><b>📅 Manutenções:</b> {f.last_maintenance.join(', ') || 'Nenhuma'}</div>
              <div className="whitespace-pre-line border rounded-md p-3 text-sm bg-gray-100 dark:bg-gray-800">
                {f.forecast_text}
              </div>
              <Button 
                variant="default"
                onClick={() => alert('📦 Ordem de serviço gerada com base neste forecast!')}>
                📄 Gerar OS
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
