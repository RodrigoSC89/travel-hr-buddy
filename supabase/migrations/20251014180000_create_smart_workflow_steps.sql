-- Create smart_workflow_steps table for managing workflow tasks
CREATE TABLE IF NOT EXISTS public.smart_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.smart_workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluido')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Additional metadata
    priority TEXT CHECK (priority IN ('baixa', 'media', 'alta')) DEFAULT 'media',
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS policies
ALTER TABLE public.smart_workflow_steps ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read workflow steps
CREATE POLICY "Users can view smart_workflow_steps"
    ON public.smart_workflow_steps
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create workflow steps
CREATE POLICY "Users can create smart_workflow_steps"
    ON public.smart_workflow_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update workflow steps
CREATE POLICY "Users can update smart_workflow_steps"
    ON public.smart_workflow_steps
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow users to delete workflow steps
CREATE POLICY "Users can delete smart_workflow_steps"
    ON public.smart_workflow_steps
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_smart_workflow_steps_updated_at
    BEFORE UPDATE ON public.smart_workflow_steps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_smart_workflow_steps_workflow_id ON public.smart_workflow_steps(workflow_id);
CREATE INDEX idx_smart_workflow_steps_status ON public.smart_workflow_steps(status);
CREATE INDEX idx_smart_workflow_steps_assigned_to ON public.smart_workflow_steps(assigned_to);
CREATE INDEX idx_smart_workflow_steps_due_date ON public.smart_workflow_steps(due_date);
CREATE INDEX idx_smart_workflow_steps_position ON public.smart_workflow_steps(workflow_id, position);
