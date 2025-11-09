-- ============================================
-- CRIAÇÃO DE TABELA: Scheduled Tasks
-- Data: 2025-01-09
-- Propósito: Sistema de agendamento de tarefas automatizadas
-- ============================================

-- ============================================
-- SCHEDULED_TASKS
-- Tarefas agendadas e automatizadas
-- ============================================
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
    task_name text NOT NULL,
    task_description text,
    task_type text NOT NULL CHECK (task_type IN (
        'maintenance', 'inspection', 'training', 'drill', 'report',
        'audit', 'certification', 'inventory', 'backup', 'notification',
        'data_sync', 'analytics', 'compliance_check', 'other'
    )),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'pending', 'in_progress', 'completed', 
        'failed', 'cancelled', 'overdue'
    )),
    
    -- Scheduling
    schedule_type text NOT NULL CHECK (schedule_type IN (
        'once', 'recurring', 'cron', 'interval'
    )),
    scheduled_datetime timestamptz, -- Para agendamento único
    cron_expression text, -- Para agendamento CRON
    interval_minutes integer, -- Para intervalo fixo
    recurrence_pattern jsonb, -- Padrão de recorrência (e.g., {"frequency": "weekly", "day": "monday"})
    
    -- Execution
    last_executed_at timestamptz,
    next_execution_at timestamptz,
    execution_count integer DEFAULT 0,
    max_executions integer, -- Limite de execuções (null = ilimitado)
    execution_timeout_minutes integer DEFAULT 30,
    
    -- Assignment
    assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_team text,
    notification_recipients jsonb DEFAULT '[]', -- Array de user IDs ou emails
    
    -- Configuration
    task_config jsonb, -- Configurações específicas da tarefa
    task_metadata jsonb, -- Metadados adicionais
    dependencies jsonb DEFAULT '[]', -- IDs de tarefas que devem ser completadas antes
    
    -- Results
    last_result jsonb, -- Resultado da última execução
    last_error text,
    success_count integer DEFAULT 0,
    failure_count integer DEFAULT 0,
    
    -- Automation
    auto_retry boolean DEFAULT false,
    retry_attempts integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    retry_delay_minutes integer DEFAULT 5,
    
    -- Lifecycle
    is_active boolean DEFAULT true,
    starts_at timestamptz, -- Quando a tarefa começa a ser válida
    expires_at timestamptz, -- Quando a tarefa expira
    
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scheduled_tasks_org ON public.scheduled_tasks(organization_id);
CREATE INDEX idx_scheduled_tasks_vessel ON public.scheduled_tasks(vessel_id);
CREATE INDEX idx_scheduled_tasks_type ON public.scheduled_tasks(task_type);
CREATE INDEX idx_scheduled_tasks_status ON public.scheduled_tasks(status);
CREATE INDEX idx_scheduled_tasks_priority ON public.scheduled_tasks(priority);
CREATE INDEX idx_scheduled_tasks_assigned ON public.scheduled_tasks(assigned_to);
CREATE INDEX idx_scheduled_tasks_next_execution ON public.scheduled_tasks(next_execution_at) 
    WHERE is_active = true AND status IN ('scheduled', 'pending');
CREATE INDEX idx_scheduled_tasks_active ON public.scheduled_tasks(is_active);
CREATE INDEX idx_scheduled_tasks_schedule_type ON public.scheduled_tasks(schedule_type);

-- RLS Policies
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_tasks_select" ON public.scheduled_tasks
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = scheduled_tasks.organization_id
        )
    );

CREATE POLICY "scheduled_tasks_insert" ON public.scheduled_tasks
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = scheduled_tasks.organization_id
            AND role IN ('admin', 'manager')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "scheduled_tasks_update" ON public.scheduled_tasks
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = scheduled_tasks.organization_id
        )
        AND (
            -- Admins/managers podem atualizar tudo
            auth.uid() IN (
                SELECT user_id FROM organization_members 
                WHERE organization_id = scheduled_tasks.organization_id
                AND role IN ('admin', 'manager')
            )
            -- Assigned user pode atualizar status e resultado
            OR auth.uid() = assigned_to
            -- Service role pode atualizar
            OR auth.role() = 'service_role'
        )
    );

CREATE POLICY "scheduled_tasks_delete" ON public.scheduled_tasks
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = scheduled_tasks.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_scheduled_tasks_updated_at
    BEFORE UPDATE ON public.scheduled_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: calculate_next_execution
-- Calcula próxima data de execução baseado no schedule_type
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_next_execution(task_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_task record;
    v_next_execution timestamptz;
    v_base_time timestamptz;
BEGIN
    SELECT * INTO v_task
    FROM scheduled_tasks
    WHERE id = task_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Base time: última execução ou agora
    v_base_time := COALESCE(v_task.last_executed_at, now());
    
    CASE v_task.schedule_type
        WHEN 'once' THEN
            -- Uma única vez
            IF v_task.last_executed_at IS NULL THEN
                v_next_execution := v_task.scheduled_datetime;
            ELSE
                v_next_execution := NULL; -- Já executou
            END IF;
            
        WHEN 'interval' THEN
            -- Intervalo fixo
            v_next_execution := v_base_time + (v_task.interval_minutes || ' minutes')::interval;
            
        WHEN 'recurring' THEN
            -- Padrão de recorrência (simplificado - pode ser expandido)
            -- Exemplo: {"frequency": "daily", "hour": 9}
            v_next_execution := v_base_time + INTERVAL '1 day';
            
        WHEN 'cron' THEN
            -- CRON expression (requer extensão pg_cron ou cálculo manual)
            -- Por simplicidade, retorna próximo dia no mesmo horário
            v_next_execution := v_base_time + INTERVAL '1 day';
            
        ELSE
            v_next_execution := NULL;
    END CASE;
    
    -- Verificar se não excedeu max_executions
    IF v_task.max_executions IS NOT NULL AND 
       v_task.execution_count >= v_task.max_executions THEN
        v_next_execution := NULL;
    END IF;
    
    -- Verificar se não expirou
    IF v_task.expires_at IS NOT NULL AND v_next_execution > v_task.expires_at THEN
        v_next_execution := NULL;
    END IF;
    
    RETURN v_next_execution;
END;
$$;

-- ============================================
-- FUNÇÃO: mark_task_executed
-- Marca tarefa como executada e calcula próxima execução
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_task_executed(
    p_task_id uuid,
    p_success boolean,
    p_result jsonb DEFAULT NULL,
    p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_next_execution timestamptz;
BEGIN
    -- Atualizar contadores e resultado
    UPDATE scheduled_tasks
    SET 
        last_executed_at = now(),
        execution_count = execution_count + 1,
        success_count = success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
        failure_count = failure_count + CASE WHEN p_success THEN 0 ELSE 1 END,
        last_result = p_result,
        last_error = p_error,
        retry_attempts = CASE WHEN p_success THEN 0 ELSE retry_attempts + 1 END,
        status = CASE 
            WHEN p_success THEN 'completed'
            WHEN NOT p_success AND auto_retry AND retry_attempts < max_retries THEN 'pending'
            WHEN NOT p_success THEN 'failed'
        END,
        updated_at = now()
    WHERE id = p_task_id;
    
    -- Calcular próxima execução
    v_next_execution := calculate_next_execution(p_task_id);
    
    -- Atualizar next_execution_at e status
    UPDATE scheduled_tasks
    SET 
        next_execution_at = v_next_execution,
        status = CASE 
            WHEN v_next_execution IS NULL AND status = 'completed' THEN 'completed'
            WHEN v_next_execution IS NOT NULL THEN 'scheduled'
            ELSE status
        END
    WHERE id = p_task_id;
END;
$$;

-- ============================================
-- FUNÇÃO: get_pending_tasks
-- Retorna tarefas pendentes para execução
-- ============================================
CREATE OR REPLACE FUNCTION public.get_pending_tasks(p_limit integer DEFAULT 100)
RETURNS TABLE (
    task_id uuid,
    task_name text,
    task_type text,
    organization_id uuid,
    vessel_id uuid,
    next_execution_at timestamptz,
    task_config jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        id,
        task_name,
        task_type,
        organization_id,
        vessel_id,
        next_execution_at,
        task_config
    FROM scheduled_tasks
    WHERE is_active = true
    AND status IN ('scheduled', 'pending')
    AND next_execution_at <= now()
    AND (starts_at IS NULL OR starts_at <= now())
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY priority DESC, next_execution_at ASC
    LIMIT p_limit;
$$;

-- ============================================
-- FUNÇÃO: get_overdue_tasks
-- Identifica e marca tarefas atrasadas
-- ============================================
CREATE OR REPLACE FUNCTION public.get_overdue_tasks()
RETURNS TABLE (
    task_id uuid,
    task_name text,
    organization_id uuid,
    days_overdue integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        id,
        task_name,
        organization_id,
        EXTRACT(DAY FROM (now() - next_execution_at))::integer as days_overdue
    FROM scheduled_tasks
    WHERE is_active = true
    AND status = 'scheduled'
    AND next_execution_at < now() - INTERVAL '1 day'
    ORDER BY next_execution_at ASC;
$$;

-- ============================================
-- TRIGGER: Auto-marcar tarefas atrasadas
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_mark_overdue_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE scheduled_tasks
    SET status = 'overdue'
    WHERE is_active = true
    AND status = 'scheduled'
    AND next_execution_at < now() - INTERVAL '1 day';
END;
$$;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE scheduled_tasks IS 'Sistema de agendamento de tarefas automatizadas e recorrentes';
COMMENT ON FUNCTION calculate_next_execution IS 'Calcula a próxima data de execução baseado no tipo de agendamento';
COMMENT ON FUNCTION mark_task_executed IS 'Marca tarefa como executada, atualiza contadores e calcula próxima execução';
COMMENT ON FUNCTION get_pending_tasks IS 'Retorna tarefas pendentes prontas para execução';
COMMENT ON FUNCTION get_overdue_tasks IS 'Identifica tarefas atrasadas';
COMMENT ON FUNCTION auto_mark_overdue_tasks IS 'Marca automaticamente tarefas como atrasadas';
