-- Create documents table for collaborative editing
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users must be authenticated to view documents
CREATE POLICY "Users must be authenticated to view documents"
  ON public.documents
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Users must be authenticated to insert documents
CREATE POLICY "Users must be authenticated to insert documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users must be authenticated to update documents
CREATE POLICY "Users must be authenticated to update documents"
  ON public.documents
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users must be authenticated to delete documents
CREATE POLICY "Users must be authenticated to delete documents"
  ON public.documents
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON public.documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS documents_updated_by_idx ON public.documents(updated_by);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents(created_at DESC);

-- Add comment
COMMENT ON TABLE public.documents IS 'Table for storing collaborative documents with real-time editing support';
