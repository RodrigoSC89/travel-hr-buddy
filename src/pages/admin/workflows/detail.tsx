'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Workflow, Calendar, User, CheckSquare, Plus } from 'lucide-react'
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

interface WorkflowStep {
  id: string
  workflow_id: string
  title: string
  description?: string
  status: 'pendente' | 'em_progresso' | 'concluido'
  position: number
  assigned_to?: string
  due_date?: string
  priority?: string
  created_at: string
  updated_at: string
  created_by?: string
  tags?: string[]
  metadata?: Record<string, any>
}

const STATUS_COLUMNS: Array<{ value: WorkflowStep['status']; label: string; color: string }> = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'em_progresso', label: 'Em Progresso', color: 'bg-blue-50 border-blue-200' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-50 border-green-200' },
]

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
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

  async function fetchSteps() {
    if (!id) return
    
    try {
      const { data, error } = await supabase
        .from('smart_workflow_steps')
        .select('*')
        .eq('workflow_id', id)
        .order('position', { ascending: true })
      
      if (error) throw error
      setSteps(data || [])
    } catch (error) {
      console.error('Error fetching steps:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as etapas',
        variant: 'destructive'
      })
    }
  }

  async function addStep() {
    if (!newTitle.trim() || !id) return
    
    try {
      setIsCreating(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('smart_workflow_steps')
        .insert({
          workflow_id: id,
          title: newTitle,
          status: 'pendente',
          position: steps.length,
          created_by: user?.id
        })
      
      if (error) throw error
      
      setNewTitle('')
      toast({
        title: 'Sucesso',
        description: 'Tarefa adicionada com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error adding step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a tarefa',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  async function updateStepStatus(stepId: string, newStatus: WorkflowStep['status']) {
    try {
      const { error } = await supabase
        .from('smart_workflow_steps')
        .update({ status: newStatus })
        .eq('id', stepId)
      
      if (error) throw error
      
      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error updating step status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addStep()
    }
  }

  useEffect(() => {
    fetchWorkflow()
    fetchSteps()
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

          {/* Add Step Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                🧱 Etapas do Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-end mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Nova tarefa ou etapa"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isCreating}
                  />
                </div>
                <Button 
                  onClick={addStep}
                  disabled={isCreating || !newTitle.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {isCreating ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {STATUS_COLUMNS.map((statusColumn) => (
                  <Card key={statusColumn.value} className={`p-4 ${statusColumn.color}`}>
                    <h3 className="text-md font-semibold capitalize mb-3">
                      {statusColumn.label}
                    </h3>

                    <div className="space-y-2">
                      {steps
                        .filter(s => s.status === statusColumn.value)
                        .map((step) => (
                          <Card key={step.id} className="p-3 bg-white hover:shadow-md transition">
                            <p className="font-medium mb-2">{step.title}</p>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {step.description}
                              </p>
                            )}
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {STATUS_COLUMNS
                                .filter(st => st.value !== statusColumn.value)
                                .map((targetStatus) => (
                                  <Button
                                    key={targetStatus.value}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStepStatus(step.id, targetStatus.value)}
                                    className="text-xs"
                                  >
                                    Mover para {targetStatus.label}
                                  </Button>
                                ))}
                            </div>
                          </Card>
                        ))}
                      
                      {steps.filter(s => s.status === statusColumn.value).length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          Nenhuma tarefa
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
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
