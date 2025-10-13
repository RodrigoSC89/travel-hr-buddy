-- Migration: Create documents table for collaborative editing
-- Purpose: Create a dedicated table for documents with collaborative editing support

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
-- Users can view all documents (for collaborative editing)
CREATE POLICY "Users can view documents" 
  ON public.documents
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Users can create documents
CREATE POLICY "Users can create documents" 
  ON public.documents
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update documents
CREATE POLICY "Users can update documents" 
  ON public.documents
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Users can delete documents
CREATE POLICY "Users can delete documents" 
  ON public.documents
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_documents_updated_by ON public.documents(updated_by);
CREATE INDEX idx_documents_updated_at ON public.documents(updated_at DESC);

-- Comments
COMMENT ON TABLE public.documents IS 'Stores collaborative documents with real-time editing support';
