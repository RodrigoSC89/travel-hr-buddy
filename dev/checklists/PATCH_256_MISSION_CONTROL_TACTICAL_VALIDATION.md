# 🧪 PATCH 256 – Mission Control (Tactical Ops) Validation

## 📋 Objective
Validar o fluxo completo de planejamento e execução de missões táticas no Mission Control.

---

## ✅ Validation Checklist

### 1️⃣ Criar, Editar e Concluir Missões
- [ ] É possível criar uma nova missão com dados persistentes no Supabase?
- [ ] A edição de missões existentes funciona corretamente?
- [ ] O status de conclusão é atualizado corretamente?
- [ ] Os dados persistem após reload da página?

### 2️⃣ Sincronização de Subtarefas
- [ ] Todas as subtarefas são criadas corretamente?
- [ ] As subtarefas são sincronizadas com entidades externas (crew, vessels)?
- [ ] O progresso das subtarefas é refletido na missão principal?
- [ ] As dependências entre tarefas funcionam corretamente?

### 3️⃣ Insight Dashboard em Tempo Real
- [ ] O painel exibe dados de status atualizados?
- [ ] O progresso é calculado corretamente?
- [ ] As métricas de KPI refletem os dados reais?
- [ ] Os gráficos e visualizações carregam sem erros?

### 4️⃣ Mission Logs
- [ ] Logs são criados automaticamente para cada ação?
- [ ] Os logs incluem timestamp, user_id e detalhes da ação?
- [ ] É possível filtrar logs por missão?
- [ ] Os logs persistem corretamente na tabela `mission_logs`?

### 5️⃣ WebSocket Real-Time Updates
- [ ] WebSocket connection é estabelecida corretamente?
- [ ] Updates em tempo real chegam sem latência excessiva (<2s)?
- [ ] Múltiplos usuários veem as mesmas atualizações?
- [ ] A conexão é resiliente a falhas de rede?

---

## 🗄️ Required Database Schema

### Table: `missions`
```sql
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES auth.users(id),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view missions"
  ON public.missions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
```

### Table: `mission_tasks`
```sql
CREATE TABLE IF NOT EXISTS public.mission_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mission_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mission tasks"
  ON public.mission_tasks FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Table: `mission_logs`
```sql
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mission logs"
  ON public.mission_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert mission logs"
  ON public.mission_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Mission Control module exists at `src/modules/mission-control/`
- Routes configured in App.tsx
- UI components for mission management

### ⚠️ Partial
- Database schema may not be complete
- WebSocket integration needs validation
- Real-time updates may be mocked

### ❌ Missing
- Comprehensive RLS policies
- Mission logs table
- WebSocket subscription hooks
- Real-time sync validation

---

## 🧪 Test Scenarios

### Scenario 1: Create and Complete Mission
1. Navigate to `/mission-control`
2. Click "New Mission"
3. Fill in: Title, Description, Priority, Assigned User
4. Save mission
5. **Expected**: Mission appears in list with "planning" status
6. Change status to "active" → "completed"
7. **Expected**: Status updates persist, logs are created

### Scenario 2: Real-Time Collaboration
1. Open mission in User A's browser
2. Open same mission in User B's browser
3. User A updates mission progress to 50%
4. **Expected**: User B sees update within 2 seconds

### Scenario 3: Subtask Dependencies
1. Create mission with 3 tasks
2. Set Task 2 to depend on Task 1
3. Try to start Task 2 while Task 1 is pending
4. **Expected**: System blocks or warns about dependency

---

## 📊 Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Mission Creation Time | < 1s | TBD | ⚠️ |
| Real-Time Update Latency | < 2s | TBD | ⚠️ |
| Query Load Time (100 missions) | < 500ms | TBD | ⚠️ |
| WebSocket Connection Stability | 99% | TBD | ⚠️ |

---

## 🚀 Next Steps

1. **Database Setup**
   - Run migration to create `missions`, `mission_tasks`, `mission_logs`
   - Configure RLS policies
   - Add indexes for performance

2. **Real-Time Integration**
   - Implement Supabase Realtime subscriptions
   - Add WebSocket connection management
   - Handle reconnection logic

3. **Testing**
   - Test all CRUD operations
   - Validate real-time updates with multiple users
   - Stress test with 100+ missions

4. **Documentation**
   - Document API endpoints
   - Create user guide for Mission Control
   - Add troubleshooting section

---

**Status**: 🟡 Partial Implementation  
**Priority**: 🔴 High  
**Estimated Completion**: 4-6 hours
