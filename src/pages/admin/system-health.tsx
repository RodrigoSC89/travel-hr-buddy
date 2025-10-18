'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

interface SystemStatus {
  supabase: boolean
  openai: boolean
  build: boolean
  routes: number
  pdf: boolean
  timestamp: string
}

export default function SystemHealthPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateSystem = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const results: SystemStatus = {
          supabase: false,
          openai: false,
          build: true, // If page loaded, build is OK
          routes: 0,
          pdf: false,
          timestamp: new Date().toISOString()
        }

        // Test Supabase connection
        try {
          const { data, error: supabaseError } = await supabase.from('profiles').select('count').limit(1)
          results.supabase = !supabaseError
          if (supabaseError) {
            logger.error('Supabase connection test failed:', supabaseError)
          }
        } catch (err) {
          logger.error('Supabase test error:', err)
          results.supabase = false
        }

        // Test OpenAI (check if API key is set)
        results.openai = !!import.meta.env.VITE_OPENAI_API_KEY

        // Test PDF library availability
        try {
          // Check if html2pdf or jsPDF is available
          results.pdf = typeof window !== 'undefined' && (
            // @ts-ignore
            typeof window.html2pdf !== 'undefined' || 
            // @ts-ignore
            typeof window.jspdf !== 'undefined'
          )
        } catch {
          results.pdf = false
        }

        // Count routes (approximate from current location)
        results.routes = window.location.pathname.split('/').filter(Boolean).length

        setStatus(results)
        logger.info('System validation completed:', results)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        logger.error('System validation error:', err)
      } finally {
        setLoading(false)
      }
    }

    validateSystem()
  }, [])

  const StatusIcon = ({ success }: { success: boolean }) => {
    if (success) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Carregando validação do sistema...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao validar sistema: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const allChecks = [
    { name: 'Supabase', status: status.supabase, description: 'Conexão com banco de dados' },
    { name: 'OpenAI', status: status.openai, description: 'API key configurada' },
    { name: 'Build', status: status.build, description: 'Sistema compilado com sucesso' },
    { name: 'PDF', status: status.pdf, description: 'Biblioteca PDF disponível' },
  ]

  const allPassed = allChecks.every(check => check.status)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Validação</h1>
          <p className="text-muted-foreground mt-2">
            Status geral do sistema e suas dependências
          </p>
        </div>
        {allPassed ? (
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        ) : (
          <AlertCircle className="h-10 w-10 text-yellow-500" />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allChecks.map((check) => (
          <Card key={check.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {check.name}
              </CardTitle>
              <StatusIcon success={check.status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {check.status ? 'OK ✅' : 'Erro ❌'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {check.description}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rotas
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status.routes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Segmentos na rota atual
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Validação</CardTitle>
          <CardDescription>
            Última verificação: {new Date(status.timestamp).toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status Geral:</span>
              <span className={`font-bold ${allPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                {allPassed ? '✅ Todos os sistemas operacionais' : '⚠️ Alguns sistemas precisam de atenção'}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2">Componentes Verificados:</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li><strong>Supabase:</strong> {status.supabase ? 'Conectado ✅' : 'Falha na conexão ❌'}</li>
                <li><strong>OpenAI:</strong> {status.openai ? 'API Key configurada ✅' : 'API Key não encontrada ❌'}</li>
                <li><strong>PDF:</strong> {status.pdf ? 'Biblioteca disponível ✅' : 'Biblioteca não encontrada ❌'}</li>
                <li><strong>Build:</strong> {status.build ? 'Sistema compilado ✅' : 'Erro de compilação ❌'}</li>
              </ul>
            </div>

            {!allPassed && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ação necessária:</strong> Verifique as configurações dos serviços que apresentam erro.
                  Consulte as variáveis de ambiente e certifique-se de que todas as dependências estão instaladas.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
