-- Create templates table for AI-powered template management
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false
);

-- Enable RLS for templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view public templates or their own private templates
CREATE POLICY "Users can view public templates and their own" 
ON public.templates 
FOR SELECT 
USING (is_private = false OR created_by = auth.uid());

-- RLS Policy: Users can create their own templates
CREATE POLICY "Users can create their own templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- RLS Policy: Users can update their own templates
CREATE POLICY "Users can update their own templates" 
ON public.templates 
FOR UPDATE 
USING (created_by = auth.uid());

-- RLS Policy: Users can delete their own templates
CREATE POLICY "Users can delete their own templates" 
ON public.templates 
FOR DELETE 
USING (created_by = auth.uid());

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_is_private ON public.templates(is_private);
CREATE INDEX IF NOT EXISTS idx_templates_is_favorite ON public.templates(is_favorite);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON public.templates(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER templates_updated_at_trigger
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_templates_updated_at();
