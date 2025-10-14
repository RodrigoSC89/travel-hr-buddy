'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Workflow, Calendar, User, CheckSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { MultiTenantWrapper } from '@/components/layout/multi-tenant-wrapper'
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper'
import { ModuleHeader } from '@/components/ui/module-header'

interface SmartWorkflow {
  id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
  created_by?: string
  category?: string
  tags?: string[]
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  async function fetchWorkflow() {
    if (!id) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('smart_workflows')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setWorkflow(data)
    } catch (error) {
      console.error('Error fetching workflow:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o fluxo de trabalho',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflow()
  }, [id])

  if (isLoading) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    )
  }

  if (!workflow) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <div className="p-6">
            <Card className="p-12 text-center">
              <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Fluxo de trabalho não encontrado
              </h3>
              <Button asChild className="mt-4">
                <Link to="/admin/workflows">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para workflows
                </Link>
              </Button>
            </Card>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    )
  }

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Workflow}
          title={workflow.title}
          description="Gerencie as etapas e tarefas deste fluxo de trabalho"
          gradient="blue"
          badges={[
            { icon: Workflow, label: workflow.status === 'active' ? 'Ativo' : 'Rascunho' },
            { icon: Calendar, label: new Date(workflow.created_at).toLocaleDateString('pt-BR') }
          ]}
        />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link to="/admin/workflows">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Etapas do Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Visualização Kanban em Desenvolvimento
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Em breve você poderá criar e mover tarefas entre etapas, 
                  definir responsáveis, datas e acompanhar o progresso em 
                  um quadro Kanban interativo.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">🎯 Próximas funcionalidades:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Criar etapas personalizadas</li>
                      <li>✓ Adicionar tarefas em cada etapa</li>
                      <li>✓ Arrastar tarefas entre etapas (Kanban)</li>
                      <li>✓ Atribuir responsáveis</li>
                      <li>✓ Definir prazos e prioridades</li>
                      <li>✓ Filtros e exportações</li>
                      <li>✓ Sugestões de IA</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {workflow.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{workflow.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  workflow.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.status === 'active' ? 'Ativo' : 'Rascunho'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Data de Criação</span>
                <span className="text-sm">
                  {new Date(workflow.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Última Atualização</span>
                <span className="text-sm">
                  {new Date(workflow.updated_at).toLocaleString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  )
}
