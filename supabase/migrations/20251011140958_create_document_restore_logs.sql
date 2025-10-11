-- Create document_restore_logs table for tracking document restorations
CREATE TABLE IF NOT EXISTS public.document_restore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  version_id UUID NOT NULL,
  restored_by UUID NOT NULL REFERENCES auth.users(id),
  restored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_restore_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for document_restore_logs
-- Only admins and hr_managers can view restore logs
CREATE POLICY "Admins can view restore logs" 
ON public.document_restore_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only authenticated users can insert restore logs
CREATE POLICY "Authenticated users can insert restore logs" 
ON public.document_restore_logs FOR INSERT
WITH CHECK (auth.uid() = restored_by);

-- Create view to join restore logs with user profiles
CREATE OR REPLACE VIEW public.get_restore_logs_with_profiles AS
SELECT
  r.id,
  r.document_id,
  r.version_id,
  r.restored_by,
  r.restored_at,
  p.email
FROM public.document_restore_logs r
LEFT JOIN public.profiles p ON r.restored_by = p.id
ORDER BY r.restored_at DESC;

-- Create RPC function to query the view (for easier client access)
CREATE OR REPLACE FUNCTION public.get_restore_logs_with_profiles()
RETURNS TABLE (
  id UUID,
  document_id UUID,
  version_id UUID,
  restored_by UUID,
  restored_at TIMESTAMP WITH TIME ZONE,
  email TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    r.id,
    r.document_id,
    r.version_id,
    r.restored_by,
    r.restored_at,
    p.email
  FROM public.document_restore_logs r
  LEFT JOIN public.profiles p ON r.restored_by = p.id
  ORDER BY r.restored_at DESC;
$$;
