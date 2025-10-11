-- Create documents table for general document management
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own documents
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (user_id = auth.uid());

-- Policy: Admins can view all documents
CREATE POLICY "Admins can view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      WHERE ou.user_id = auth.uid() 
      AND ou.role IN ('owner', 'admin')
      AND ou.status = 'active'
    )
  );

-- Policy: Users can create documents
CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (user_id = auth.uid());

-- Policy: Admins can update all documents
CREATE POLICY "Admins can update all documents" ON public.documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      WHERE ou.user_id = auth.uid() 
      AND ou.role IN ('owner', 'admin')
      AND ou.status = 'active'
    )
  );

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (user_id = auth.uid());

-- Policy: Admins can delete all documents
CREATE POLICY "Admins can delete all documents" ON public.documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      WHERE ou.user_id = auth.uid() 
      AND ou.role IN ('owner', 'admin')
      AND ou.status = 'active'
    )
  );

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_documents_updated_at();
