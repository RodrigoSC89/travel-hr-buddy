-- Add admin access policies for AI generated documents
-- This migration allows admins and hr_managers to view all documents

-- Drop existing restrictive policies and recreate with admin access
DROP POLICY IF EXISTS "Users can view their own AI documents" ON public.ai_generated_documents;
DROP POLICY IF EXISTS "Users can create AI documents" ON public.ai_generated_documents;
DROP POLICY IF EXISTS "Users can update their own AI documents" ON public.ai_generated_documents;
DROP POLICY IF EXISTS "Users can delete their own AI documents" ON public.ai_generated_documents;

-- Policy: Users can view their own documents OR admins/hr_managers can view all documents
CREATE POLICY "Users and admins can view AI documents" ON public.ai_generated_documents
  FOR SELECT
  TO authenticated
  USING (
    generated_by = auth.uid() OR 
    public.get_user_role() IN ('admin', 'hr_manager')
  );

-- Policy: Users can create their own documents
CREATE POLICY "Users can create AI documents" ON public.ai_generated_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (generated_by = auth.uid());

-- Policy: Users can update their own documents OR admins/hr_managers can update all documents
CREATE POLICY "Users and admins can update AI documents" ON public.ai_generated_documents
  FOR UPDATE
  TO authenticated
  USING (
    generated_by = auth.uid() OR 
    public.get_user_role() IN ('admin', 'hr_manager')
  );

-- Policy: Users can delete their own documents OR admins/hr_managers can delete all documents
CREATE POLICY "Users and admins can delete AI documents" ON public.ai_generated_documents
  FOR DELETE
  TO authenticated
  USING (
    generated_by = auth.uid() OR 
    public.get_user_role() IN ('admin', 'hr_manager')
  );
