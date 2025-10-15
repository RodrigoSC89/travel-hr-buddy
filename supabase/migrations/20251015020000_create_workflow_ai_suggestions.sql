-- Create workflow_ai_suggestions table for storing AI-generated suggestions
CREATE TABLE IF NOT EXISTS public.workflow_ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etapa TEXT NOT NULL,
    tipo_sugestao TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    criticidade TEXT NOT NULL,
    responsavel_sugerido TEXT NOT NULL,
    origem TEXT NOT NULL DEFAULT 'Copilot',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Optional: link to workflow if needed
    workflow_id UUID REFERENCES public.smart_workflows(id) ON DELETE CASCADE,
    
    -- Additional metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS policies
ALTER TABLE public.workflow_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read AI suggestions
CREATE POLICY "Users can view workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create AI suggestions
CREATE POLICY "Users can create workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update AI suggestions
CREATE POLICY "Users can update workflow_ai_suggestions"
    ON public.workflow_ai_suggestions
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow users to delete AI suggestions
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
CREATE INDEX idx_workflow_ai_suggestions_created_at ON public.workflow_ai_suggestions(created_at DESC);
CREATE INDEX idx_workflow_ai_suggestions_workflow_id ON public.workflow_ai_suggestions(workflow_id);
CREATE INDEX idx_workflow_ai_suggestions_status ON public.workflow_ai_suggestions(status);
CREATE INDEX idx_workflow_ai_suggestions_origem ON public.workflow_ai_suggestions(origem);
