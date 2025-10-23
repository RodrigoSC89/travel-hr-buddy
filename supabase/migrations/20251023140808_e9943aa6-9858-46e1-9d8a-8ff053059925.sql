-- Fix search_path for audit center function (using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_audit_center_logs_updated_at()
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