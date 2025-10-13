-- Create documents table for collaborative editing
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users must be authenticated to read documents
CREATE POLICY "Authenticated users can read documents"
  ON public.documents
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users must be authenticated to insert documents
CREATE POLICY "Authenticated users can insert documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users must be authenticated to update documents
CREATE POLICY "Authenticated users can update documents"
  ON public.documents
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Users must be authenticated to delete documents
CREATE POLICY "Authenticated users can delete documents"
  ON public.documents
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_updated_by ON public.documents(updated_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_documents_updated_at();
