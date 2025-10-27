# 🟢 PATCH 246 – Mission Control: Finalização Total

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** ALTA 🟢  
**Módulo:** Mission Control / Tactical Operations

---

## 📋 Objetivo

Ativar todo o fluxo tático do Mission Control, incluindo planejamento de missão, execução automatizada, workflows, autonomia e logging completo de ações e recursos alocados.

---

## 🎯 Resultados Esperados

- ✅ Sistema de planejamento de missão completo
- ✅ Interface de execução em tempo real
- ✅ Workflows automatizados
- ✅ Sistema de autonomia funcional
- ✅ AI Command Center integrado
- ✅ Logging detalhado de todas as ações
- ✅ Rastreamento de recursos alocados
- ✅ Dashboard de status de missão

---

## 🗄️ Estrutura de Banco de Dados

```sql
-- mission_plans
CREATE TABLE mission_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transport', 'inspection', 'rescue', 'patrol', 'survey')),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'ready', 'active', 'completed', 'cancelled', 'failed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  objective TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  estimated_duration_hours DECIMAL(6,2),
  actual_duration_hours DECIMAL(6,2),
  commander_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- mission_phases
CREATE TABLE mission_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES mission_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase_order INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'skipped', 'failed')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  dependencies UUID[], -- IDs of phases that must complete first
  automation_enabled BOOLEAN DEFAULT false,
  automation_config JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- mission_resources
CREATE TABLE mission_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES mission_plans(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('vessel', 'crew', 'equipment', 'budget')),
  resource_id UUID NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  allocated_at TIMESTAMPTZ DEFAULT now(),
  released_at TIMESTAMPTZ,
  utilization_percent DECIMAL(5,2),
  notes TEXT
);

-- mission_actions
CREATE TABLE mission_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES mission_plans(id),
  phase_id UUID REFERENCES mission_phases(id),
  action_type TEXT NOT NULL,
  action_name TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
  result JSONB,
  error_message TEXT
);

-- mission_workflows
CREATE TABLE mission_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'scheduled', 'event', 'condition')),
  trigger_config JSONB,
  workflow_definition JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_mission_plans_status ON mission_plans(status);
CREATE INDEX idx_mission_phases_mission ON mission_phases(mission_id);
CREATE INDEX idx_mission_resources_mission ON mission_resources(mission_id);
CREATE INDEX idx_mission_actions_mission ON mission_actions(mission_id);
```

---

## 🛠️ Módulos a Implementar

### 1. Mission Planning Interface

**Arquivo:** `src/modules/mission-control/components/MissionPlanner.tsx`

```typescript
export function MissionPlanner() {
  const [mission, setMission] = useState<MissionPlan>({
    name: '',
    type: 'transport',
    objective: '',
    startDate: new Date(),
    priority: 'normal',
    phases: []
  })
  
  const createMission = useMutation({
    mutationFn: async (mission: MissionPlan) => {
      const { data, error } = await supabase
        .from('mission_plans')
        .insert(mission)
        .select()
        .single()
      
      if (error) throw error
      
      // Create phases
      if (mission.phases.length > 0) {
        await supabase.from('mission_phases').insert(
          mission.phases.map((phase, index) => ({
            mission_id: data.id,
            ...phase,
            phase_order: index + 1
          }))
        )
      }
      
      return data
    }
  })
  
  return (
    <div className="mission-planner">
      <Card>
        <CardHeader>
          <CardTitle>Create Mission Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <Input
              label="Mission Name"
              value={mission.name}
              onChange={(e) => setMission({ ...mission, name: e.target.value })}
            />
            
            <Select
              label="Mission Type"
              value={mission.type}
              onChange={(value) => setMission({ ...mission, type: value })}
            >
              <option value="transport">Transport</option>
              <option value="inspection">Inspection</option>
              <option value="rescue">Rescue</option>
              <option value="patrol">Patrol</option>
              <option value="survey">Survey</option>
            </Select>
            
            <Textarea
              label="Objective"
              value={mission.objective}
              onChange={(e) => setMission({ ...mission, objective: e.target.value })}
            />
            
            <PhaseBuilder
              phases={mission.phases}
              onChange={(phases) => setMission({ ...mission, phases })}
            />
            
            <ResourceAllocator
              missionId={mission.id}
              onResourcesAllocated={handleResourcesAllocated}
            />
            
            <Button type="submit">Create Mission</Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Mission Execution Dashboard

**Arquivo:** `src/modules/mission-control/components/MissionExecutionDashboard.tsx`

```typescript
export function MissionExecutionDashboard({ missionId }: { missionId: string }) {
  const { data: mission } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_plans')
        .select(`
          *,
          phases:mission_phases(*),
          resources:mission_resources(*),
          actions:mission_actions(*)
        `)
        .eq('id', missionId)
        .single()
      
      if (error) throw error
      return data
    },
    refetchInterval: 5000 // Update every 5 seconds
  })
  
  const currentPhase = mission?.phases.find(p => p.status === 'active')
  const progress = calculateProgress(mission)
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{mission?.name}</CardTitle>
          <Badge variant={getStatusVariant(mission?.status)}>
            {mission?.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Progress</Label>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground mt-1">
                {progress.toFixed(1)}% Complete
              </p>
            </div>
            
            <div>
              <Label>Current Phase</Label>
              <p className="font-medium">{currentPhase?.name || 'Not started'}</p>
            </div>
            
            <div>
              <Label>Resources Allocated</Label>
              <ResourceList resources={mission?.resources} />
            </div>
            
            <div>
              <Label>Recent Actions</Label>
              <ActionTimeline actions={mission?.actions} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Phase Execution</CardTitle>
        </CardHeader>
        <CardContent>
          <PhaseExecutor missionId={missionId} />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3. AI Command Center

**Arquivo:** `src/modules/mission-control/ai-command/AICommandCenter.tsx`

```typescript
export function AICommandCenter({ missionId }: { missionId: string }) {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [autoMode, setAutoMode] = useState(false)
  
  // Get AI recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['ai-recommendations', missionId],
    queryFn: () => aiService.getMissionRecommendations(missionId),
    refetchInterval: 30000 // Every 30 seconds
  })
  
  const executeSuggestion = useMutation({
    mutationFn: async (suggestion: AISuggestion) => {
      // Log action
      await supabase.from('mission_actions').insert({
        mission_id: missionId,
        action_type: 'ai_suggestion',
        action_name: suggestion.action,
        description: suggestion.rationale,
        performed_by: null, // AI
        status: 'success'
      })
      
      // Execute the actual action
      return await aiService.executeAction(suggestion)
    }
  })
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Command Center</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            checked={autoMode}
            onCheckedChange={setAutoMode}
          />
          <Label>Autonomous Mode</Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations?.map(rec => (
            <div key={rec.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{rec.action}</h4>
                  <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="secondary">
                      Confidence: {(rec.confidence * 100).toFixed(0)}%
                    </Badge>
                    <Badge variant="outline">
                      Priority: {rec.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => executeSuggestion.mutate(rec)}
                  disabled={autoMode}
                >
                  Execute
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4. Workflow Automation

**Arquivo:** `src/modules/mission-control/workflows/WorkflowEngine.tsx`

```typescript
export class WorkflowEngine {
  async executeWorkflow(workflowId: string, context: any) {
    const { data: workflow } = await supabase
      .from('mission_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()
    
    if (!workflow) throw new Error('Workflow not found')
    
    const definition = workflow.workflow_definition as WorkflowDefinition
    
    for (const step of definition.steps) {
      try {
        await this.executeStep(step, context)
        
        // Log success
        await this.logWorkflowStep(workflowId, step.id, 'success')
      } catch (error) {
        // Log failure
        await this.logWorkflowStep(workflowId, step.id, 'failed', error)
        
        if (step.onError === 'stop') {
          throw error
        }
      }
    }
  }
  
  private async executeStep(step: WorkflowStep, context: any) {
    switch (step.type) {
      case 'condition':
        return this.evaluateCondition(step.condition, context)
      
      case 'action':
        return this.performAction(step.action, context)
      
      case 'parallel':
        return Promise.all(
          step.steps.map(s => this.executeStep(s, context))
        )
      
      case 'wait':
        return new Promise(resolve => 
          setTimeout(resolve, step.duration)
        )
      
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }
}

// Workflow Builder Component
export function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    name: '',
    steps: []
  })
  
  return (
    <div className="workflow-builder">
      <WorkflowCanvas
        workflow={workflow}
        onChange={setWorkflow}
      />
      
      <WorkflowStepLibrary
        onAddStep={(step) => {
          setWorkflow({
            ...workflow,
            steps: [...workflow.steps, step]
          })
        }}
      />
    </div>
  )
}
```

### 5. Autonomy System

**Arquivo:** `src/modules/mission-control/autonomy/AutonomySystem.tsx`

```typescript
export class AutonomySystem {
  private enabled = false
  private intervalId?: NodeJS.Timeout
  
  async start(missionId: string) {
    this.enabled = true
    
    this.intervalId = setInterval(async () => {
      await this.autonomousDecisionCycle(missionId)
    }, 10000) // Every 10 seconds
  }
  
  stop() {
    this.enabled = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
  
  private async autonomousDecisionCycle(missionId: string) {
    // 1. Observe environment
    const state = await this.observeState(missionId)
    
    // 2. Analyze situation
    const analysis = await this.analyzeState(state)
    
    // 3. Make decision
    if (analysis.requiresAction) {
      const decision = await this.makeDecision(analysis)
      
      // 4. Execute action (if confidence is high enough)
      if (decision.confidence > 0.8) {
        await this.executeAction(decision.action, missionId)
      } else {
        // Request human approval
        await this.requestApproval(decision, missionId)
      }
    }
  }
  
  private async observeState(missionId: string) {
    const [mission, telemetry, alerts] = await Promise.all([
      supabase.from('mission_plans').select('*').eq('id', missionId).single(),
      supabase.from('vessel_telemetry').select('*').order('timestamp', { ascending: false }).limit(10),
      supabase.from('alerts').select('*').eq('status', 'active')
    ])
    
    return { mission, telemetry, alerts }
  }
  
  private async analyzeState(state: any) {
    // Use AI to analyze current state
    const analysis = await aiService.analyzeMissionState(state)
    return analysis
  }
  
  private async makeDecision(analysis: any) {
    const decision = await aiService.recommendAction(analysis)
    return decision
  }
  
  private async executeAction(action: any, missionId: string) {
    // Log autonomous action
    await supabase.from('mission_actions').insert({
      mission_id: missionId,
      action_type: 'autonomous',
      action_name: action.name,
      description: action.description,
      performed_by: null,
      result: action.result
    })
    
    // Execute the action
    await actionExecutor.execute(action)
  }
}
```

---

## ✅ Checklist de Validação

### Planning
- [ ] Mission planning interface completa
- [ ] Phase definition funcional
- [ ] Resource allocation working
- [ ] Dependencies handling

### Execution
- [ ] Real-time execution dashboard
- [ ] Phase progression automática
- [ ] Action logging completo
- [ ] Status tracking preciso

### AI Command
- [ ] AI recommendations geradas
- [ ] Action execution funcional
- [ ] Autonomous mode operacional
- [ ] Confidence scoring

### Workflows
- [ ] Workflow builder UI
- [ ] Workflow execution engine
- [ ] Step types implementados
- [ ] Error handling

### Autonomy
- [ ] Autonomous decision cycle
- [ ] State observation
- [ ] Decision making
- [ ] Human-in-the-loop quando necessário

---

**STATUS:** 🟢 AGUARDANDO IMPLEMENTAÇÃO  
**PRÓXIMO PATCH:** PATCH 247 – Analytics Core com Pipelines Reais
