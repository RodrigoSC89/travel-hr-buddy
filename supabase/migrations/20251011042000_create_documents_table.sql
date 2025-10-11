-- Create documents table for general document management
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create index for better query performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- RLS Policies: Users can view their own documents
CREATE POLICY "Users can view their own documents" 
ON public.documents
FOR SELECT 
USING (user_id = auth.uid());

-- RLS Policies: Admins can view all documents (based on user_roles table)
CREATE POLICY "Admins can view all documents" 
ON public.documents
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Users can create their own documents
CREATE POLICY "Users can create documents" 
ON public.documents
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" 
ON public.documents
FOR UPDATE 
USING (user_id = auth.uid());

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON public.documents
FOR DELETE 
USING (user_id = auth.uid());

-- Admins can update all documents
CREATE POLICY "Admins can update all documents" 
ON public.documents
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Admins can delete all documents
CREATE POLICY "Admins can delete all documents" 
ON public.documents
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);
