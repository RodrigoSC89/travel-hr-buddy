# 🧪 PATCH 261 – Workflow Builder (Task Automation) Validation

## 📋 Objective
Validar o construtor visual de automação de tarefas com execução real.

---

## ✅ Validation Checklist

### 1️⃣ Workflow Creation & Management
- [ ] É possível criar um novo workflow com múltiplos nós?
- [ ] Workflows podem ser salvos com dados persistentes no Supabase?
- [ ] A edição de workflows existentes funciona corretamente?
- [ ] Workflows podem ser clonados?
- [ ] É possível ativar/desativar workflows?

### 2️⃣ Triggers & Events
- [ ] Trigger por horário (cron) dispara corretamente?
- [ ] Trigger por evento do sistema funciona?
- [ ] Trigger por webhook é configurável?
- [ ] Trigger manual funciona corretamente?
- [ ] Múltiplos triggers no mesmo workflow são suportados?

### 3️⃣ Actions & Execution
- [ ] Ações são executadas na ordem correta?
- [ ] Criar tarefa automaticamente funciona?
- [ ] Enviar notificação funciona?
- [ ] Atualizar dados funciona?
- [ ] Ações condicionais (if/else) funcionam?

### 4️⃣ Logging & Audit
- [ ] Logs de execução são registrados corretamente?
- [ ] Logs incluem timestamp, status, e detalhes?
- [ ] É possível visualizar histórico de execuções?
- [ ] Erros são capturados e logados?
- [ ] Performance metrics são registradas?

### 5️⃣ Validation & Safety
- [ ] O sistema previne loops infinitos?
- [ ] Workflows inválidos são detectados antes da execução?
- [ ] Dependências circulares são bloqueadas?
- [ ] Limites de execução são respeitados?
- [ ] Rollback funciona em caso de erro?

---

## 🗄️ Required Database Schema

### Table: `workflows`
```sql
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT CHECK (trigger_type IN ('schedule', 'event', 'webhook', 'manual')),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  is_valid BOOLEAN DEFAULT true,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_executed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflows_user ON public.workflows(created_by);
CREATE INDEX idx_workflows_active ON public.workflows(is_active);
CREATE INDEX idx_workflows_trigger ON public.workflows(trigger_type);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workflows"
  ON public.workflows FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their workflows"
  ON public.workflows FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their workflows"
  ON public.workflows FOR DELETE
  USING (auth.uid() = created_by);
```

### Table: `workflow_executions`
```sql
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  trigger_source TEXT,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  steps_completed INTEGER DEFAULT 0,
  steps_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_executions_workflow ON public.workflow_executions(workflow_id);
CREATE INDEX idx_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_executions_started ON public.workflow_executions(started_at);

ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view executions of their workflows"
  ON public.workflow_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows
      WHERE workflows.id = workflow_executions.workflow_id
      AND workflows.created_by = auth.uid()
    )
  );
```

### Table: `workflow_execution_logs`
```sql
CREATE TABLE IF NOT EXISTS public.workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_execution_logs_execution ON public.workflow_execution_logs(execution_id);
CREATE INDEX idx_execution_logs_status ON public.workflow_execution_logs(status);

ALTER TABLE public.workflow_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs of their workflow executions"
  ON public.workflow_execution_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_executions we
      JOIN public.workflows w ON w.id = we.workflow_id
      WHERE we.id = workflow_execution_logs.execution_id
      AND w.created_by = auth.uid()
    )
  );
```

### Table: `workflow_templates`
```sql
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates are viewable by all"
  ON public.workflow_templates FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Workflow Builder module exists at `src/modules/task-automation/`
- Basic UI components for workflow creation
- Routes configured in App.tsx

### ⚠️ Partial
- Node types may be limited
- Execution engine may not be complete
- Validation logic may be basic

### ❌ Missing
- Workflow execution engine
- Trigger scheduling system
- Advanced validation rules
- Template system
- Comprehensive logging

---

## 🧪 Test Scenarios

### Scenario 1: Create Simple Workflow
1. Navigate to `/task-automation`
2. Click "New Workflow"
3. Add trigger node (manual)
4. Add action node (create task)
5. Connect nodes
6. Save workflow
7. **Expected**: Workflow saved with valid structure

### Scenario 2: Execute Workflow
1. Create workflow with manual trigger
2. Add multiple action nodes
3. Save and activate workflow
4. Click "Execute"
5. **Expected**: 
   - Execution logged in `workflow_executions`
   - All actions executed in order
   - Success status recorded

### Scenario 3: Schedule Workflow
1. Create workflow with schedule trigger
2. Set cron expression (e.g., "0 9 * * *" for daily at 9am)
3. Save and activate
4. Wait for scheduled time
5. **Expected**: Workflow executes automatically at scheduled time

### Scenario 4: Conditional Logic
1. Create workflow with condition node
2. Add two branches (if/else)
3. Configure condition
4. Execute with different inputs
5. **Expected**: Correct branch executed based on condition

### Scenario 5: Error Handling
1. Create workflow with invalid action
2. Try to execute
3. **Expected**:
   - Execution fails gracefully
   - Error logged in `workflow_execution_logs`
   - Clear error message shown to user

### Scenario 6: Loop Prevention
1. Try to create workflow with circular dependency
2. Connect node A → B → C → A
3. Try to save
4. **Expected**: System prevents save and shows validation error

---

## 📊 Node Types

| Type | Description | Status |
|------|-------------|--------|
| **Trigger** | Manual, Schedule, Event, Webhook | ⚠️ |
| **Action** | Create Task, Send Notification, Update Data | ⚠️ |
| **Logic** | Condition, Loop, Switch | ⚠️ |
| **Data** | Transform, Filter, Merge | ⚠️ |
| **Integration** | API Call, Database Query | ⚠️ |

---

## ⚡ Performance Requirements

| Metric | Target | Acceptable | Status |
|--------|--------|------------|--------|
| Workflow Save Time | <500ms | <1s | ⚠️ |
| Execution Start Time | <1s | <2s | ⚠️ |
| Simple Workflow Execution | <3s | <5s | ⚠️ |
| Complex Workflow Execution | <10s | <30s | ⚠️ |
| Concurrent Executions | 50+ | 20+ | ⚠️ |

---

## 🚀 Next Steps

1. **Execution Engine**
   - Create workflow execution service
   - Implement node execution handlers
   - Add error handling and rollback
   - Support async operations

2. **Trigger System**
   - Implement cron scheduler
   - Create event listener system
   - Add webhook endpoint
   - Support multiple trigger types

3. **Validation**
   - Implement cycle detection
   - Add node validation rules
   - Check execution limits
   - Validate data flow

4. **UI Enhancements**
   - Add visual workflow designer
   - Implement drag-and-drop
   - Add node configuration panels
   - Show real-time execution status

5. **Testing**
   - Test all node types
   - Validate trigger mechanisms
   - Test error scenarios
   - Load test with multiple concurrent workflows

6. **Documentation**
   - Create node type reference
   - Document trigger configuration
   - Add workflow examples
   - Create troubleshooting guide

---

**Status**: 🟡 Partial Implementation  
**Priority**: 🔴 High  
**Estimated Completion**: 8-12 hours
