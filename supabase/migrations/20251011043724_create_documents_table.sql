-- Create documents table for document management
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can view documents
CREATE POLICY "Authenticated users can view documents" ON public.documents
  FOR SELECT TO authenticated
  USING (true);

-- Policy: users can create documents
CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: users can update their own documents
CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Policy: users can delete their own documents
CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Indices for better performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
