'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Workflow, Calendar, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { MultiTenantWrapper } from '@/components/layout/multi-tenant-wrapper'
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper'
import { ModuleHeader } from '@/components/ui/module-header'
import { seedSuggestionsForWorkflow } from '@/lib/workflows/seedSuggestions'

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

export default function SmartWorkflowPage() {
  const [workflows, setWorkflows] = useState<SmartWorkflow[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  async function fetchWorkflows() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('smart_workflows')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setWorkflows(data || [])
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os fluxos de trabalho',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function createWorkflow() {
    if (!newTitle.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um título para o fluxo de trabalho',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsCreating(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: newWorkflow, error } = await supabase
        .from('smart_workflows')
        .insert({ 
          title: newTitle,
          created_by: user?.id 
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Seed automatic suggestions for the new workflow
      if (newWorkflow) {
        try {
          await seedSuggestionsForWorkflow(newWorkflow.id)
        } catch (suggestionError) {
          console.error('Failed to seed suggestions:', suggestionError)
          // Don't fail the workflow creation if suggestions fail
          toast({
            title: 'Aviso',
            description: 'Fluxo criado, mas algumas sugestões não puderam ser adicionadas.',
            variant: 'default'
          })
        }
      }
      
      setNewTitle('')
      toast({
        title: 'Sucesso',
        description: 'Fluxo de trabalho criado com sucesso!'
      })
      fetchWorkflows()
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o fluxo de trabalho',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createWorkflow()
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Workflow}
          title="🧠 Smart Workflows"
          description="Gerencie fluxos de trabalho inteligentes e automatizados"
          gradient="blue"
          badges={[
            { icon: Workflow, label: 'Automação' },
            { icon: Calendar, label: 'Etapas' },
            { icon: User, label: 'Responsáveis' }
          ]}
        />

        <div className="p-6 space-y-6">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                placeholder="Novo fluxo (ex: Aprovação de Viagens)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
              />
            </div>
            <Button 
              onClick={createWorkflow}
              disabled={isCreating || !newTitle.trim()}
            >
              <Plus className="w-4 h-4 mr-1" /> 
              {isCreating ? 'Criando...' : 'Criar'}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : workflows.length === 0 ? (
            <Card className="p-12 text-center">
              <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum fluxo de trabalho ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro fluxo de trabalho inteligente
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workflows.map((wf) => (
                <Card key={wf.id} className="p-4 hover:shadow-lg transition">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{wf.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        wf.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {wf.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </span>
                    </div>
                    
                    {wf.description && (
                      <p className="text-sm text-muted-foreground">
                        {wf.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(wf.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      asChild
                    >
                      <Link to={`/admin/workflows/${wf.id}`}>
                        Ver etapas
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  )
}
