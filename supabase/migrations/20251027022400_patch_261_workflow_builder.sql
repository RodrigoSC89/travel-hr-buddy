-- PATCH 261: Workflow Builder - Task Automation Tables
-- Creates tables for visual workflow builder with triggers and actions

-- 1. Workflow Templates Table
CREATE TABLE IF NOT EXISTS public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Metadata
    tags TEXT[],
    version INTEGER DEFAULT 1
);

-- 2. Workflow Triggers Table
CREATE TABLE IF NOT EXISTS public.workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('schedule', 'event', 'module_action', 'manual')),
    trigger_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Schedule specific fields
    cron_expression TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Event specific fields
    event_type TEXT,
    event_source TEXT,
    
    -- Module action specific fields
    module_name TEXT,
    action_name TEXT
);

-- 3. Workflow Actions Table
CREATE TABLE IF NOT EXISTS public.workflow_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('send_email', 'create_task', 'update_record', 'send_notification', 'webhook', 'api_call')),
    action_config JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Conditional execution
    conditions JSONB DEFAULT '{}'::jsonb,
    
    -- Retry configuration
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- 4. Workflow Execution Log Table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    trigger_id UUID REFERENCES public.workflow_triggers(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    execution_log JSONB DEFAULT '[]'::jsonb,
    
    -- Execution context
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    context JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_templates
CREATE POLICY "Users can view workflow_templates"
    ON public.workflow_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create workflow_templates"
    ON public.workflow_templates FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their workflow_templates"
    ON public.workflow_templates FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their workflow_templates"
    ON public.workflow_templates FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- RLS Policies for workflow_triggers
CREATE POLICY "Users can view workflow_triggers"
    ON public.workflow_triggers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage workflow_triggers"
    ON public.workflow_triggers FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.workflow_templates 
        WHERE id = workflow_triggers.workflow_id 
        AND created_by = auth.uid()
    ));

-- RLS Policies for workflow_actions
CREATE POLICY "Users can view workflow_actions"
    ON public.workflow_actions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage workflow_actions"
    ON public.workflow_actions FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.workflow_templates 
        WHERE id = workflow_actions.workflow_id 
        AND created_by = auth.uid()
    ));

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view workflow_executions"
    ON public.workflow_executions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can manage workflow_executions"
    ON public.workflow_executions FOR ALL
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX idx_workflow_templates_created_by ON public.workflow_templates(created_by);
CREATE INDEX idx_workflow_templates_active ON public.workflow_templates(is_active);
CREATE INDEX idx_workflow_triggers_workflow_id ON public.workflow_triggers(workflow_id);
CREATE INDEX idx_workflow_triggers_type ON public.workflow_triggers(trigger_type);
CREATE INDEX idx_workflow_actions_workflow_id ON public.workflow_actions(workflow_id);
CREATE INDEX idx_workflow_actions_order ON public.workflow_actions(workflow_id, order_index);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_workflow_executions_started_at ON public.workflow_executions(started_at DESC);

-- Create update triggers
CREATE TRIGGER update_workflow_templates_updated_at
    BEFORE UPDATE ON public.workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_triggers_updated_at
    BEFORE UPDATE ON public.workflow_triggers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_actions_updated_at
    BEFORE UPDATE ON public.workflow_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
