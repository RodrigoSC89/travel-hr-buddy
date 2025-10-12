-- Add explicit foreign key relationship from ai_generated_documents.generated_by to profiles.id
-- This provides better type safety and clarity for queries joining document authors with their profile data

-- First, ensure all existing generated_by values reference valid profiles
-- (This should already be the case since both reference auth.users(id))

-- Drop the existing foreign key to auth.users if it exists
ALTER TABLE public.ai_generated_documents 
  DROP CONSTRAINT IF EXISTS ai_generated_documents_generated_by_fkey;

-- Add a new foreign key relationship to profiles table
ALTER TABLE public.ai_generated_documents
  ADD CONSTRAINT ai_generated_documents_generated_by_fkey 
  FOREIGN KEY (generated_by) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- Create an index on generated_by if it doesn't exist (for better join performance)
CREATE INDEX IF NOT EXISTS idx_ai_generated_documents_generated_by 
  ON public.ai_generated_documents(generated_by);
