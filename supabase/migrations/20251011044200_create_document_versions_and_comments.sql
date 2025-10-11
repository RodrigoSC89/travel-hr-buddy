-- Create table for document versions (version history)
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document comments (real-time comments)
CREATE TABLE IF NOT EXISTS public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- Policies for document_versions
-- Users can view versions of documents they can access
CREATE POLICY "Users can view document versions" ON public.document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.ai_generated_documents 
      WHERE generated_by = auth.uid()
    )
  );

-- Admins can view all versions
CREATE POLICY "Admins can view all document versions" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert versions when documents are updated
CREATE POLICY "System can create document versions" ON public.document_versions
  FOR INSERT WITH CHECK (true);

-- Policies for document_comments
-- Users can view comments on documents they can access
CREATE POLICY "Users can view document comments" ON public.document_comments
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.ai_generated_documents 
      WHERE generated_by = auth.uid()
    )
  );

-- Admins can view all comments
CREATE POLICY "Admins can view all document comments" ON public.document_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can create comments on documents they can access
CREATE POLICY "Users can create document comments" ON public.document_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    document_id IN (
      SELECT id FROM public.ai_generated_documents 
      WHERE generated_by = auth.uid()
    )
  );

-- Admins can create comments on any document
CREATE POLICY "Admins can create document comments" ON public.document_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_comments_created_at ON public.document_comments(created_at DESC);
CREATE INDEX idx_document_comments_user_id ON public.document_comments(user_id);
