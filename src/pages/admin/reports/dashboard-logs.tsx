'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Download } from 'lucide-react'
import { format } from 'date-fns'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

interface DashboardLog {
  id: string
  executed_at: string
  status: string
  email: string
  message: string | null
}

export default function DashboardLogs() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<DashboardLog[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  async function fetchLogs() {
    try {
      setLoading(true)
      let query = supabase
        .from('dashboard_report_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100)

      if (statusFilter) query = query.eq('status', statusFilter)
      if (dateStart) query = query.gte('executed_at', dateStart)
      if (dateEnd) query = query.lte('executed_at', dateEnd)

      const { data, error } = await query

      if (error) {
        logger.error('Error fetching dashboard logs:', error)
        toast.error('Erro ao carregar logs')
        return
      }

      setLogs(data || [])
    } catch (error) {
      logger.error('Error fetching dashboard logs:', error)
      toast.error('Erro ao carregar logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [statusFilter, dateStart, dateEnd])

  const exportCSV = () => {
    if (logs.length === 0) {
      toast.error('Nenhum log para exportar')
      return
    }

    const csv = [
      ['Data', 'Status', 'Email', 'Mensagem'].join(','),
      ...logs.map(log =>
        [
          format(new Date(log.executed_at), 'yyyy-MM-dd HH:mm'),
          log.status,
          log.email,
          log.message?.replace(/\n/g, ' ').replace(/,/g, ';') || '',
        ].map(cell => `"${cell}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard_logs_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('CSV exportado com sucesso!', {
      description: `${logs.length} registros exportados`
    })
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h2 className="text-2xl font-bold">📄 Logs de Envio de Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Auditoria de execuções automáticas de relatórios
              </p>
            </div>
          </div>
          <Button onClick={exportCSV} variant="outline" disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Input
                  placeholder="Status (success/error)"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={dateStart}
                  onChange={e => setDateStart(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Data Final</label>
                <Input
                  type="date"
                  value={dateEnd}
                  onChange={e => setDateEnd(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total de Execuções</div>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Sucessos</div>
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.status === 'success').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Erros</div>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.status === 'error').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Execuções</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                Nenhum log encontrado
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr className="text-left border-b">
                        <th className="p-3 font-medium">Data</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">E-mail</th>
                        <th className="p-3 font-medium">Mensagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 whitespace-nowrap">
                            {format(new Date(log.executed_at), 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3">{log.email}</td>
                          <td className="p-3 max-w-[300px] truncate" title={log.message || ''}>
                            {log.message || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
