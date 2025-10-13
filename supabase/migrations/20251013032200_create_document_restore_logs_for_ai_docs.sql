-- Migration: Add document_restore_logs for ai_generated_documents
-- Purpose: Track restoration of document versions to previous states
-- Date: 2025-10-13

-- Create document_restore_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.document_restore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE SET NULL,
  restored_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  restored_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.document_restore_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_restore_logs
-- Users can view restore logs of documents they own
CREATE POLICY "Users can view restore logs of their documents" 
  ON public.document_restore_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_restore_logs.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Users can create restore logs when restoring their documents
CREATE POLICY "Users can create restore logs for their documents" 
  ON public.document_restore_logs
  FOR INSERT 
  WITH CHECK (
    restored_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_restore_logs.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_restore_logs_document_id ON public.document_restore_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_restore_logs_version_id ON public.document_restore_logs(version_id);
CREATE INDEX IF NOT EXISTS idx_document_restore_logs_restored_by ON public.document_restore_logs(restored_by);
CREATE INDEX IF NOT EXISTS idx_document_restore_logs_restored_at ON public.document_restore_logs(restored_at DESC);

-- Comments
COMMENT ON TABLE public.document_restore_logs IS 'Audit log tracking document version restorations';
COMMENT ON COLUMN public.document_restore_logs.document_id IS 'Reference to the document that was restored';
COMMENT ON COLUMN public.document_restore_logs.version_id IS 'Reference to the version that was restored to';
COMMENT ON COLUMN public.document_restore_logs.restored_by IS 'User who performed the restoration';
COMMENT ON COLUMN public.document_restore_logs.restored_at IS 'Timestamp when the restoration occurred';
