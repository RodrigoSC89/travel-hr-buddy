-- Create templates table for AI-powered document templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own templates and public templates
CREATE POLICY "Users can view own and public templates"
  ON public.templates
  FOR SELECT
  USING (
    auth.uid() = created_by OR is_private = false
  );

-- Users can create their own templates
CREATE POLICY "Users can create templates"
  ON public.templates
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only the author can update their templates
CREATE POLICY "Users can update own templates"
  ON public.templates
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Only the author can delete their templates
CREATE POLICY "Users can delete own templates"
  ON public.templates
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON public.templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_is_favorite ON public.templates(is_favorite);
CREATE INDEX IF NOT EXISTS idx_templates_is_private ON public.templates(is_private);
CREATE INDEX IF NOT EXISTS idx_templates_title ON public.templates(title);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_templates_updated_at();
