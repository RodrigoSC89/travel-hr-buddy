-- Create document_versions table for tracking document history
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of their own documents
CREATE POLICY "Users can view versions of their own documents" ON public.document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.ai_generated_documents WHERE generated_by = auth.uid()
    )
  );

-- Policy: Users can create versions for their own documents
CREATE POLICY "Users can create versions for their own documents" ON public.document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM public.ai_generated_documents WHERE generated_by = auth.uid()
    )
  );

-- Indices for performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);
