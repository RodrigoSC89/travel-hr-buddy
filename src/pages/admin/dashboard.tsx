'use client'

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function UnifiedDashboard() {
  const [role, setRole] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')
  const [trend, setTrend] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const publicMode = window.location.search.includes('public=1')
      setIsPublic(publicMode)
      setPublicUrl(`${window.location.origin}/admin/dashboard?public=1`)

      if (!publicMode) {
        supabase.auth.getUser().then(({ data }) => {
          const roleClaim = data?.user?.user_metadata?.role || 'user'
          setRole(roleClaim)
        })
      }
    }
  }, [])

  useEffect(() => {
    async function fetchTrend() {
      const { data } = await supabase.rpc('get_restore_count_by_day_with_email', {
        email_input: null,
      })
      setTrend(data || [])
    }
    fetchTrend()
  }, [])

  const cards = [
    {
      href: '/admin/checklists/dashboard',
      title: '✅ Checklists',
      description: 'Progresso e status por equipe',
      roles: ['admin', 'gestor'],
    },
    {
      href: '/admin/restore/personal',
      title: '📦 Restaurações Pessoais',
      description: 'Seu painel diário com gráfico',
      roles: ['admin', 'user', 'gestor'],
    },
    {
      href: '/admin/assistant/logs',
      title: '🤖 Histórico de IA',
      description: 'Consultas recentes e exportações',
      roles: ['admin', 'gestor'],
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          if (isPublic || card.roles.includes(role)) {
            return (
              <Card key={i} className="hover:shadow-lg">
                <Link to={card.href + (isPublic ? '?public=1' : '')} className="block p-4">
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </Link>
              </Card>
            )
          }
          return null
        })}
      </div>

      {trend.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">📈 Restaurações (últimos 15 dias)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend.reverse()}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {isPublic && (
        <p className="text-center text-sm text-muted-foreground col-span-full mt-4">
          🔒 Modo público somente leitura
        </p>
      )}

      {!isPublic && (
        <Card className="p-4">
          <h3 className="font-semibold">🔗 Link público com QR Code</h3>
          <p className="text-sm text-muted">Compartilhe este painel com acesso de leitura:</p>
          <p className="mt-2 text-blue-600 underline break-all">{publicUrl}</p>
          <QRCodeSVG value={publicUrl} size={128} className="mt-4" />
        </Card>
      )}
    </div>
  )
}
