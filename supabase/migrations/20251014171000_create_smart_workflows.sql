-- Create smart_workflows table for managing workflow templates
CREATE TABLE IF NOT EXISTS public.smart_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Additional metadata
    category TEXT,
    tags TEXT[],
    config JSONB DEFAULT '{}'::jsonb
);

-- Add RLS policies
ALTER TABLE public.smart_workflows ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read workflows
CREATE POLICY "Users can view smart_workflows"
    ON public.smart_workflows
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create workflows
CREATE POLICY "Users can create smart_workflows"
    ON public.smart_workflows
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own workflows
CREATE POLICY "Users can update their own smart_workflows"
    ON public.smart_workflows
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- Allow users to delete their own workflows
CREATE POLICY "Users can delete their own smart_workflows"
    ON public.smart_workflows
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_smart_workflows_updated_at
    BEFORE UPDATE ON public.smart_workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_smart_workflows_created_at ON public.smart_workflows(created_at DESC);
CREATE INDEX idx_smart_workflows_created_by ON public.smart_workflows(created_by);
CREATE INDEX idx_smart_workflows_status ON public.smart_workflows(status);
