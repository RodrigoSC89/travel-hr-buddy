'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface RestoreSummary {
  total: number
  unique_docs: number
  avg_per_day: number
}

interface RestoreDataPoint {
  day: string
  count: number
}

export default function PersonalRestoreDashboard() {
  const [summary, setSummary] = useState<RestoreSummary | null>(null)
  const [trend, setTrend] = useState<RestoreDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    try {
      const session = await supabase.auth.getSession()
      const email = session.data.session?.user?.email
      if (!email) {
        setLoading(false)
        return
      }

      const { data: trendData } = await supabase.rpc('get_restore_count_by_day_with_email', {
        email_input: email,
      })

      const { data: summaryData } = await supabase.rpc('get_restore_summary', {
        email_input: email,
      })

      setTrend(trendData || [])
      setSummary(summaryData?.[0] || null)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📈 Seu Painel de Restaurações</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Total de restaurações</div>
            <div className="text-2xl font-bold">{summary.total}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Docs únicos</div>
            <div className="text-2xl font-bold">{summary.unique_docs}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Média por dia</div>
            <div className="text-2xl font-bold">{summary.avg_per_day}</div>
          </Card>
        </div>
      )}

      {trend.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-2">📊 Restaurações por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend.reverse()}>
              <XAxis
                dataKey="day"
                tickFormatter={(d) => format(new Date(d), 'dd/MM')}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
