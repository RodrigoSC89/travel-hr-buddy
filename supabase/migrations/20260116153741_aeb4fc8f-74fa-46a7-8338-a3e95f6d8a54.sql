-- Fix function search_path for security compliance
-- This addresses the "Function Search Path Mutable" security warning

-- Drop and recreate the function with proper search_path
CREATE OR REPLACE FUNCTION public.update_checklists_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.update_checklists_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_checklists_updated_at() TO authenticated;

-- Also fix any other common trigger functions that might exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;