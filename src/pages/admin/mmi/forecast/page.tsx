'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Forecast = {
  id: string
  vessel_id?: string
  vessel_name: string
  system_name: string
  hourmeter: number
  last_maintenance: string[] | any
  forecast_text: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [filteredForecasts, setFilteredForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingOrderId, setGeneratingOrderId] = useState<string | null>(null)
  
  // Filters
  const [vesselFilter, setVesselFilter] = useState<string>('all')
  const [systemFilter, setSystemFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  
  const { toast } = useToast()

  // Fetch forecasts from API
  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const res = await fetch('/api/mmi/forecast/all')
        if (!res.ok) throw new Error('Failed to fetch forecasts')
        const data = await res.json()
        
        // Transform data to ensure correct format
        const transformed = data.map((f: any) => ({
          ...f,
          last_maintenance: Array.isArray(f.last_maintenance) 
            ? f.last_maintenance 
            : [],
          priority: f.priority || 'medium'
        }))
        
        setForecasts(transformed)
        setFilteredForecasts(transformed)
      } catch (error) {
        console.error('Error fetching forecasts:', error)
        toast({
          title: "❌ Erro ao carregar forecasts",
          description: "Não foi possível carregar os forecasts",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchForecasts()
  }, [toast])

  // Apply filters
  useEffect(() => {
    let filtered = [...forecasts]
    
    if (vesselFilter !== 'all') {
      filtered = filtered.filter(f => f.vessel_name === vesselFilter)
    }
    
    if (systemFilter !== 'all') {
      filtered = filtered.filter(f => f.system_name === systemFilter)
    }
    
    if (riskFilter !== 'all') {
      filtered = filtered.filter(f => f.priority === riskFilter)
    }
    
    setFilteredForecasts(filtered)
  }, [vesselFilter, systemFilter, riskFilter, forecasts])

  // Get unique values for filters
  const vessels = Array.from(new Set(forecasts.map(f => f.vessel_name)))
  const systems = Array.from(new Set(forecasts.map(f => f.system_name)))

  // Map priority to Portuguese risk levels
  const getRiskLevel = (priority: string): { level: string, variant: 'destructive' | 'default' | 'secondary' | 'outline' } => {
    switch (priority) {
      case 'critical':
        return { level: 'alto', variant: 'destructive' }
      case 'high':
        return { level: 'alto', variant: 'destructive' }
      case 'medium':
        return { level: 'médio', variant: 'default' }
      case 'low':
        return { level: 'baixo', variant: 'secondary' }
      default:
        return { level: 'médio', variant: 'default' }
    }
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "critical":
        return { text: "Crítica", badge: "🔴", value: "crítica" };
      case "high":
        return { text: "Alta", badge: "🟠", value: "alta" };
      case "medium":
        return { text: "Normal", badge: "🟡", value: "normal" };
      case "low":
        return { text: "Baixa", badge: "🟢", value: "baixa" };
      default:
        return { text: "Normal", badge: "🟡", value: "normal" };
    }
  };

  // Generate work order
  const handleGenerateOrder = async (forecast: Forecast) => {
    setGeneratingOrderId(forecast.id)
    
    try {
      const priority = getPriorityLabel(forecast.priority);
      
      const res = await fetch("/api/os/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forecast_id: forecast.id,
          vessel_name: forecast.vessel_name,
          system_name: forecast.system_name,
          description: forecast.forecast_text,
          priority: priority.value,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "✅ OS criada com sucesso!",
          description: `Ordem de Serviço para ${forecast.system_name}`,
        });
      } else {
        toast({
          title: "❌ Falha ao gerar OS",
          description: data.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating order:", error);
      toast({
        title: "❌ Erro ao gerar OS",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setGeneratingOrderId(null);
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Sistema', 'Embarcação', 'Próxima Execução', 'Risco', 'Justificativa']
    const rows = filteredForecasts.map(f => {
      const risk = getRiskLevel(f.priority)
      const date = f.created_at ? format(new Date(f.created_at), 'dd/MM/yyyy') : 'N/A'
      return [
        f.system_name,
        f.vessel_name,
        date,
        risk.level,
        f.forecast_text.replace(/"/g, '""') // Escape quotes
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `forecasts_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "✅ CSV exportado",
      description: `${filteredForecasts.length} forecast(s) exportado(s)`,
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">📊 Forecasts de Manutenção (IA)</h1>
        <p className="text-muted-foreground">Carregando forecasts...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">📊 Forecasts de Manutenção (IA)</h1>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          📤 Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">🚢 Embarcação</label>
          <Select value={vesselFilter} onValueChange={setVesselFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {vessels.map(vessel => (
                <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">⚙️ Sistema</label>
          <Select value={systemFilter} onValueChange={setSystemFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {systems.map(system => (
                <SelectItem key={system} value={system}>{system}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">⚠️ Risco</label>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="critical">Alto</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="low">Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Sistema</th>
              <th className="p-2 text-left">Embarcação</th>
              <th className="p-2 text-left">Próxima Execução</th>
              <th className="p-2 text-left">Risco</th>
              <th className="p-2 text-left">Justificativa</th>
              <th className="p-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredForecasts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Nenhum forecast encontrado
                </td>
              </tr>
            ) : (
              filteredForecasts.map((f) => {
                const risk = getRiskLevel(f.priority)
                const date = f.created_at ? format(new Date(f.created_at), 'dd/MM/yyyy') : 'N/A'
                
                return (
                  <tr key={f.id} className="border-t hover:bg-muted/50">
                    <td className="p-2">{f.system_name}</td>
                    <td className="p-2">{f.vessel_name}</td>
                    <td className="p-2">{date}</td>
                    <td className="p-2">
                      <Badge variant={risk.variant}>
                        {risk.level}
                      </Badge>
                    </td>
                    <td className="p-2 max-w-md truncate" title={f.forecast_text}>
                      {f.forecast_text}
                    </td>
                    <td className="p-2 text-right">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleGenerateOrder(f)}
                        disabled={generatingOrderId === f.id}
                      >
                        {generatingOrderId === f.id ? "⏳ Gerando..." : "➕ Gerar OS"}
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
