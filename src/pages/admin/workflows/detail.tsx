'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Workflow, Calendar, User, CheckSquare, Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
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

interface Profile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
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
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  
  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState<WorkflowStep['status']>('pendente')
  const [formAssignedTo, setFormAssignedTo] = useState<string>('')
  const [formDueDate, setFormDueDate] = useState('')
  
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

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .order('full_name', { ascending: true })
      
      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
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

  async function createStepWithDialog() {
    if (!formTitle.trim() || !id) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('smart_workflow_steps')
        .insert({
          workflow_id: id,
          title: formTitle,
          description: formDescription || null,
          status: formStatus,
          assigned_to: formAssignedTo || null,
          due_date: formDueDate || null,
          position: steps.length,
          created_by: user?.id
        })
      
      if (error) throw error
      
      // Reset form
      setFormTitle('')
      setFormDescription('')
      setFormStatus('pendente')
      setFormAssignedTo('')
      setFormDueDate('')
      setIsCreateDialogOpen(false)
      
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error creating step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa',
        variant: 'destructive'
      })
    }
  }

  async function updateStep() {
    if (!editingStep || !formTitle.trim()) return
    
    try {
      const { error } = await supabase
        .from('smart_workflow_steps')
        .update({
          title: formTitle,
          description: formDescription || null,
          status: formStatus,
          assigned_to: formAssignedTo || null,
          due_date: formDueDate || null
        })
        .eq('id', editingStep.id)
      
      if (error) throw error
      
      setIsEditDialogOpen(false)
      setEditingStep(null)
      
      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error updating step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa',
        variant: 'destructive'
      })
    }
  }

  async function deleteStep(stepId: string) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    
    try {
      const { error } = await supabase
        .from('smart_workflow_steps')
        .delete()
        .eq('id', stepId)
      
      if (error) throw error
      
      toast({
        title: 'Sucesso',
        description: 'Tarefa excluída com sucesso!'
      })
      fetchSteps()
    } catch (error) {
      console.error('Error deleting step:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa',
        variant: 'destructive'
      })
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, step: WorkflowStep) => {
    setDraggedStep(step)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: WorkflowStep['status']) => {
    e.preventDefault()
    
    if (!draggedStep || draggedStep.status === targetStatus) {
      setDraggedStep(null)
      return
    }
    
    await updateStepStatus(draggedStep.id, targetStatus)
    setDraggedStep(null)
  }

  const openEditDialog = (step: WorkflowStep) => {
    setEditingStep(step)
    setFormTitle(step.title)
    setFormDescription(step.description || '')
    setFormStatus(step.status)
    setFormAssignedTo(step.assigned_to || '')
    setFormDueDate(step.due_date || '')
    setIsEditDialogOpen(true)
  }

  const openCreateDialog = () => {
    setFormTitle('')
    setFormDescription('')
    setFormStatus('pendente')
    setFormAssignedTo('')
    setFormDueDate('')
    setIsCreateDialogOpen(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addStep()
    }
  }

  useEffect(() => {
    fetchWorkflow()
    fetchSteps()
    fetchProfiles()
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
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Tarefa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Digite o título da tarefa"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Digite a descrição da tarefa"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formStatus} onValueChange={(value) => setFormStatus(value as WorkflowStep['status'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assigned_to">Atribuir para</Label>
                    <Select value={formAssignedTo} onValueChange={setFormAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || profile.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Data de Vencimento</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createStepWithDialog} disabled={!formTitle.trim()}>
                    Criar Tarefa
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Kanban Board */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                🧱 Quadro Kanban
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_COLUMNS.map((statusColumn) => (
                  <div 
                    key={statusColumn.value}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusColumn.value)}
                    className="space-y-3"
                  >
                    <Card className={`p-4 ${statusColumn.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-semibold capitalize">
                          {statusColumn.label}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {steps.filter(s => s.status === statusColumn.value).length} tarefas
                        </span>
                      </div>
                      
                      <div className="space-y-2 min-h-[200px]">
                        {steps
                          .filter(s => s.status === statusColumn.value)
                          .map((step) => {
                            const assignedProfile = profiles.find(p => p.id === step.assigned_to)
                            return (
                              <Card
                                key={step.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, step)}
                                className={`p-3 bg-white hover:shadow-lg transition-all cursor-move ${
                                  draggedStep?.id === step.id ? 'opacity-50' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium text-sm">{step.title}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditDialog(step)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteStep(step.id)}
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {step.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                    {step.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 flex-wrap mt-2 text-xs text-muted-foreground">
                                  {assignedProfile && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>{assignedProfile.full_name || assignedProfile.email}</span>
                                    </div>
                                  )}
                                  {step.due_date && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(step.due_date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            )
                          })}
                        
                        {steps.filter(s => s.status === statusColumn.value).length === 0 && (
                          <div className="text-center py-12 text-sm text-muted-foreground">
                            Arraste tarefas aqui
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Título *</Label>
                  <Input
                    id="edit-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Digite a descrição da tarefa"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formStatus} onValueChange={(value) => setFormStatus(value as WorkflowStep['status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_progresso">Em Progresso</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-assigned_to">Atribuir para</Label>
                  <Select value={formAssignedTo} onValueChange={setFormAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || profile.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-due_date">Data de Vencimento</Label>
                  <Input
                    id="edit-due_date"
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={updateStep} disabled={!formTitle.trim()}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
