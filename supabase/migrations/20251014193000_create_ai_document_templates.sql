-- Create AI Document Templates table
CREATE TABLE IF NOT EXISTS public.ai_document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_private BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_document_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own templates and public templates
CREATE POLICY "Users can view their own templates and public templates" 
ON public.ai_document_templates
  FOR SELECT USING (
    created_by = auth.uid() 
    OR is_private = false
  );

-- Policy: Users can create templates
CREATE POLICY "Users can create templates" 
ON public.ai_document_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own templates
CREATE POLICY "Users can update their own templates" 
ON public.ai_document_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete their own templates" 
ON public.ai_document_templates
  FOR DELETE USING (created_by = auth.uid());

-- Indices for performance
CREATE INDEX idx_ai_document_templates_created_by ON public.ai_document_templates(created_by);
CREATE INDEX idx_ai_document_templates_created_at ON public.ai_document_templates(created_at DESC);
CREATE INDEX idx_ai_document_templates_is_favorite ON public.ai_document_templates(is_favorite);
CREATE INDEX idx_ai_document_templates_title ON public.ai_document_templates USING gin(to_tsvector('portuguese', title));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_document_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ai_document_templates_updated_at_trigger
  BEFORE UPDATE ON public.ai_document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_document_templates_updated_at();
