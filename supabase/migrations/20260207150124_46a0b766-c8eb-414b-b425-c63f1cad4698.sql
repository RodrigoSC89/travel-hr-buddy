-- Create a SECURITY DEFINER function that returns aggregate counts only
-- This is safe because it only returns numbers, never actual row data
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'vessels', (SELECT count(*) FROM vessels),
    'crew', (SELECT count(*) FROM crew_members),
    'audits', (SELECT count(*) FROM internal_audits),
    'documents', (SELECT count(*) FROM ai_documents),
    'maintenance', (SELECT count(*) FROM mmi_maintenance_jobs),
    'certificates', (SELECT count(*) FROM certificates)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_system_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_system_stats() TO authenticated;