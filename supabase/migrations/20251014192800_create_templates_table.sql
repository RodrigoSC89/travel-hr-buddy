-- Create templates table for storing document templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
-- Users can view their own templates and public templates
CREATE POLICY "Users can view own templates"
  ON public.templates
  FOR SELECT
  USING (
    auth.uid() = created_by OR is_private = false
  );

-- Users can insert their own templates
CREATE POLICY "Users can insert own templates"
  ON public.templates
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON public.templates
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON public.templates
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create index for better query performance
CREATE INDEX idx_templates_created_by ON public.templates(created_by);
CREATE INDEX idx_templates_is_favorite ON public.templates(is_favorite);
CREATE INDEX idx_templates_created_at ON public.templates(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
