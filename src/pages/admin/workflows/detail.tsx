'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, X, Edit2, Save, Trash2, Calendar, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { MultiTenantWrapper } from '@/components/layout/multi-tenant-wrapper'
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper'
import { ModuleHeader } from '@/components/ui/module-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  assigned_to?: string
  due_date?: string
  position: number
  created_at: string
}

interface User {
  id: string
  email: string
  full_name?: string
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: ''
  })
  const { toast } = useToast()

  const statusColumns: { status: WorkflowStep['status']; label: string; color: string }[] = [
    { status: 'pendente', label: 'Pendente', color: 'bg-gray-100 border-gray-300' },
    { status: 'em_progresso', label: 'Em Progresso', color: 'bg-blue-100 border-blue-300' },
    { status: 'concluido', label: 'Concluído', color: 'bg-green-100 border-green-300' }
  ]

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

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true })
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  async function createStep() {
    if (!id || !newStep.title.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um título para a etapa',
        variant: 'destructive'
      })
      return
    }

    try {
      const maxPosition = Math.max(...steps.map(s => s.position), -1)
      const { error } = await supabase
        .from('smart_workflow_steps')
        .insert({
          workflow_id: id,
          title: newStep.title,
          description: newStep.description || null,
          assigned_to: newStep.assigned_to || null,
          due_date: newStep.due_date || null,
          status: 'pendente',
          position: maxPosition + 1
        })
      
      if (error) throw error
      
      setNewStep({ title: '', description: '', assigned_to: '', due_date: '' })
      setIsDialogOpen(false)
      toast({
        title: 'Sucesso',
        description: 'Etapa criada com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error creating step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a etapa',
        variant: 'destructive'
      })
    }
  }

  async function updateStep(stepId: string, updates: Partial<WorkflowStep>) {
    try {
      const { error } = await supabase
        .from('smart_workflow_steps')
        .update(updates)
        .eq('id', stepId)
      
      if (error) throw error
      
      toast({
        title: 'Sucesso',
        description: 'Etapa atualizada com sucesso!'
      })
      fetchSteps()
      setEditingStep(null)
    } catch (error) {
      console.error('Error updating step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a etapa',
        variant: 'destructive'
      })
    }
  }

  async function deleteStep(stepId: string) {
    try {
      const { error } = await supabase
        .from('smart_workflow_steps')
        .delete()
        .eq('id', stepId)
      
      if (error) throw error
      
      toast({
        title: 'Sucesso',
        description: 'Etapa removida com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error deleting step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a etapa',
        variant: 'destructive'
      })
    }
  }

  const handleDragStart = (stepId: string) => {
    setDraggedStep(stepId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetStatus: WorkflowStep['status']) => {
    if (!draggedStep) return

    const step = steps.find(s => s.id === draggedStep)
    if (!step || step.status === targetStatus) {
      setDraggedStep(null)
      return
    }

    // Get all steps in the target status
    const targetSteps = steps.filter(s => s.status === targetStatus)
    const maxPosition = Math.max(...targetSteps.map(s => s.position), -1)

    await updateStep(draggedStep, {
      status: targetStatus,
      position: maxPosition + 1
    })

    setDraggedStep(null)
  }

  const getStepsByStatus = (status: WorkflowStep['status']) => {
    return steps.filter(s => s.status === status).sort((a, b) => a.position - b.position)
  }

  const getUserName = (userId?: string) => {
    if (!userId) return 'Não atribuído'
    const user = users.find(u => u.id === userId)
    return user?.full_name || user?.email || 'Usuário'
  }

  useEffect(() => {
    fetchWorkflow()
    fetchSteps()
    fetchUsers()
  }, [id])

  if (isLoading) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando fluxo de trabalho...</p>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    )
  }

  if (!workflow) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Fluxo de trabalho não encontrado</p>
            <Button asChild className="mt-4">
              <Link to="/admin/workflows">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    )
  }

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/workflows">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <ModuleHeader
          title={workflow.title}
          description={workflow.description || 'Quadro Kanban de tarefas'}
          gradient="blue"
        />

        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Total de tarefas: {steps.length}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Adicione uma nova tarefa ao fluxo de trabalho
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Título da tarefa..."
                    value={newStep.title}
                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Detalhes da tarefa..."
                    value={newStep.description}
                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Responsável</Label>
                  <Select
                    value={newStep.assigned_to}
                    onValueChange={(value) => setNewStep({ ...newStep, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newStep.due_date}
                    onChange={(e) => setNewStep({ ...newStep, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createStep}>Criar Tarefa</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusColumns.map((column) => (
            <div key={column.status} className="flex flex-col">
              <div className={`rounded-t-lg p-4 border-t-4 ${column.color}`}>
                <h3 className="font-semibold text-lg">{column.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {getStepsByStatus(column.status).length} tarefa(s)
                </p>
              </div>
              <div
                className="flex-1 bg-gray-50 rounded-b-lg p-4 space-y-3 min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.status)}
              >
                {getStepsByStatus(column.status).map((step) => (
                  <Card
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(step.id)}
                    className="cursor-move hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEditingStep(step)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja remover esta tarefa?')) {
                                deleteStep(step.id)
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      )}
                      <div className="flex flex-col gap-2 text-xs">
                        {step.assigned_to && (
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            <span>{getUserName(step.assigned_to)}</span>
                          </div>
                        )}
                        {step.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(step.due_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Step Dialog */}
        <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>
                Atualize as informações da tarefa
              </DialogDescription>
            </DialogHeader>
            {editingStep && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título *</Label>
                  <Input
                    id="edit-title"
                    value={editingStep.title}
                    onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editingStep.description || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assigned">Responsável</Label>
                  <Select
                    value={editingStep.assigned_to || ''}
                    onValueChange={(value) => setEditingStep({ ...editingStep, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-due-date">Data de vencimento</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editingStep.due_date || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, due_date: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingStep(null)}>
                Cancelar
              </Button>
              <Button onClick={() => editingStep && updateStep(editingStep.id, editingStep)}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  )
}
