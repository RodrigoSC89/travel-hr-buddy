'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MMIForecastPage() {
  const [vesselName, setVesselName] = useState('')
  const [systemName, setSystemName] = useState('')
  const [hourmeter, setHourmeter] = useState('')
  const [maintenanceDates, setMaintenanceDates] = useState('')
  const [forecast, setForecast] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setForecast('')
    setLoading(true)

    try {
      const res = await fetch('/api/mmi/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vessel_name: vesselName,
          system_name: systemName,
          current_hourmeter: parseFloat(hourmeter) || 0,
          last_maintenance_dates: maintenanceDates.split('\n').filter(line => line.trim())
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let result = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          
          // Parse SSE format: data: {"content": "text"}\n\n
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring(6)
                const data = JSON.parse(jsonStr)
                if (data.content) {
                  result += data.content
                  setForecast(result)
                }
              } catch (e) {
                // If not JSON, append as plain text
                result += line.substring(6)
                setForecast(result)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating forecast:', error)
      setForecast(`Erro ao gerar previsão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧠 Forecast IA - Manutenção Inteligente</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>🚢 Embarcação</Label>
            <Input 
              value={vesselName} 
              onChange={(e) => setVesselName(e.target.value)} 
              placeholder="Ex: PSV Ocean STAR"
            />
          </div>

          <div>
            <Label>⚙️ Sistema</Label>
            <Input 
              value={systemName} 
              onChange={(e) => setSystemName(e.target.value)} 
              placeholder="Ex: Motor Principal MAN B&W"
            />
          </div>

          <div>
            <Label>⏱ Horímetro atual</Label>
            <Input 
              type="number" 
              value={hourmeter} 
              onChange={(e) => setHourmeter(e.target.value)} 
              placeholder="Ex: 12500"
            />
          </div>

          <div>
            <Label>🧾 Datas das últimas manutenções (uma por linha)</Label>
            <Textarea
              rows={4}
              value={maintenanceDates}
              onChange={(e) => setMaintenanceDates(e.target.value)}
              placeholder="12/04/2025 - troca de óleo&#10;20/06/2025 - verificação de pressão"
            />
          </div>

          <Button disabled={loading} onClick={handleSubmit} className="w-full">
            {loading ? 'Gerando previsão...' : '📡 Gerar Forecast'}
          </Button>
        </div>

        <div>
          <Label>📈 Previsão IA</Label>
          <Textarea 
            rows={18} 
            value={forecast} 
            readOnly 
            placeholder="A previsão da IA aparecerá aqui..."
            className="min-h-[400px] font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}
