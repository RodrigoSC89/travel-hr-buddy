-- Migration: Create document_versions and document_comments tables
-- Purpose: Add version history and real-time comments to documents

-- =====================================================
-- Item 1: document_versions table
-- Purpose: Store version history of documents
-- =====================================================

CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_versions
-- Users can view versions of documents they have access to
CREATE POLICY "Users can view document versions they own" 
  ON public.document_versions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_versions.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Users can create versions (triggered automatically on document update)
CREATE POLICY "Users can create document versions" 
  ON public.document_versions
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_versions.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);
CREATE INDEX idx_document_versions_updated_by ON public.document_versions(updated_by);

-- =====================================================
-- Item 2: document_comments table
-- Purpose: Real-time comments on documents
-- =====================================================

CREATE TABLE IF NOT EXISTS public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_comments
-- Users can view comments on documents they have access to
CREATE POLICY "Users can view comments on their documents" 
  ON public.document_comments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_comments.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Users can create comments on documents they have access to
CREATE POLICY "Users can create comments on their documents" 
  ON public.document_comments
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.ai_generated_documents 
      WHERE id = document_comments.document_id 
      AND generated_by = auth.uid()
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
  ON public.document_comments
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
  ON public.document_comments
  FOR DELETE 
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_comments_user_id ON public.document_comments(user_id);
CREATE INDEX idx_document_comments_created_at ON public.document_comments(created_at DESC);

-- =====================================================
-- Function to automatically create version on update
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.document_versions (document_id, content, updated_by)
    VALUES (OLD.id, OLD.content, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically save version before update
CREATE TRIGGER trigger_create_document_version
  BEFORE UPDATE ON public.ai_generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_version();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.document_versions IS 'Stores historical versions of documents for version control';
COMMENT ON TABLE public.document_comments IS 'Stores real-time comments on documents for collaboration';
COMMENT ON FUNCTION public.create_document_version() IS 'Automatically creates a version entry when document content is updated';
