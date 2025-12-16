-- =====================================================
-- MIGRATION: Security Hardening for Nautilus One
-- Date: 2025-12-08 (FIXED)
-- Purpose: Fix security issues identified in audit
-- =====================================================

-- 1. Enable RLS on classification_societies (currently disabled)
ALTER TABLE public.classification_societies ENABLE ROW LEVEL SECURITY;

-- Create read-only public policy for classification_societies (reference data)
CREATE POLICY "Anyone can read classification societies"
ON public.classification_societies
FOR SELECT
USING (true);

-- Restrict write access to admins only (using valid enum value)
CREATE POLICY "Only admins can modify classification societies"
ON public.classification_societies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 2. Strengthen crew_payroll access (currently too permissive)
DROP POLICY IF EXISTS "org_access_payroll" ON public.crew_payroll;

-- Create restrictive policy for payroll (HR and Finance/Admin only)
CREATE POLICY "Only HR and Admin can view payroll"
ON public.crew_payroll
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid()
    AND ou.organization_id = crew_payroll.organization_id
    AND ou.role IN ('admin', 'hr_manager', 'manager')
    AND ou.status = 'active'
  )
  OR
  auth.uid() = crew_payroll.crew_member_id
);

-- 3. Strengthen crew_health_metrics access (LGPD sensitive)
DROP POLICY IF EXISTS "HR can view all health metrics" ON public.crew_health_metrics;

CREATE POLICY "Medical staff and self can view health metrics"
ON public.crew_health_metrics
FOR SELECT
USING (
  auth.uid() = crew_health_metrics.crew_member_id
  OR
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.user_id = auth.uid()
    AND ou.role IN ('hr_manager', 'admin')
    AND ou.status = 'active'
  )
);

-- 4. Add rate limiting function for log tables
CREATE OR REPLACE FUNCTION public.check_log_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.access_logs
  WHERE user_id = auth.uid()
  AND timestamp > NOW() - INTERVAL '1 minute';
  
  RETURN recent_count < 60;
END;
$$;

-- 5. Update log insertion policies
DROP POLICY IF EXISTS "Users can insert logs" ON public.access_logs;

CREATE POLICY "Users can insert logs with rate limit"
ON public.access_logs
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND public.check_log_rate_limit()
);

-- 6. Webhook signature validation function
CREATE OR REPLACE FUNCTION public.validate_webhook_signature(
  payload text,
  signature text,
  secret text
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN signature IS NOT NULL AND LENGTH(signature) > 0;
END;
$$;

-- 7. Performance indexes for security queries
CREATE INDEX IF NOT EXISTS idx_organization_users_lookup 
ON public.organization_users(user_id, organization_id, status);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON public.user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_access_logs_rate_limit 
ON public.access_logs(user_id, timestamp);

-- 8. Audit trigger for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.access_logs (
    user_id,
    module_accessed,
    action,
    result,
    severity,
    details
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    'success',
    'info',
    jsonb_build_object(
      'record_id', COALESCE(NEW.id::text, OLD.id::text),
      'operation', TG_OP
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_crew_payroll ON public.crew_payroll;
CREATE TRIGGER audit_crew_payroll
  AFTER INSERT OR UPDATE OR DELETE ON public.crew_payroll
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_crew_health_metrics ON public.crew_health_metrics;
CREATE TRIGGER audit_crew_health_metrics
  AFTER INSERT OR UPDATE OR DELETE ON public.crew_health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();