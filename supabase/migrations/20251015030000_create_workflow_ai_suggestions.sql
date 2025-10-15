-- Create workflow_ai_suggestions table for managing AI-generated workflow suggestions
CREATE TABLE IF NOT EXISTS public.workflow_ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.smart_workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluido', 'dispensado')),
    suggestion_type TEXT DEFAULT 'checklist' CHECK (suggestion_type IN ('checklist', 'compliance', 'optimization', 'reminder')),
    origin_source TEXT DEFAULT 'template' CHECK (origin_source IN ('template', 'ai_generated', 'historical')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Additional fields for tracking
    is_acted_upon BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false
);

-- Add RLS policies
ALTER TABLE public.workflow_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read workflow suggestions
CREATE POLICY "Users can view workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create workflow suggestions
CREATE POLICY "Users can create workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update workflow suggestions
CREATE POLICY "Users can update workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to delete workflow suggestions
CREATE POLICY "Users can delete workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_workflow_ai_suggestions_updated_at
    BEFORE UPDATE ON public.workflow_ai_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_workflow_ai_suggestions_workflow_id ON public.workflow_ai_suggestions(workflow_id);
CREATE INDEX idx_workflow_ai_suggestions_status ON public.workflow_ai_suggestions(status);
CREATE INDEX idx_workflow_ai_suggestions_priority ON public.workflow_ai_suggestions(priority);
CREATE INDEX idx_workflow_ai_suggestions_suggestion_type ON public.workflow_ai_suggestions(suggestion_type);
