-- PATCH 186.0 - Production Security Lockdown
-- Comprehensive RLS audit and security enhancements for production stability

-- =============================================================================
-- SECTION 1: Audit and ensure RLS is enabled on all critical tables
-- =============================================================================

-- Enable RLS on auth-related tables (if not already enabled)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organization_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on financial tables
ALTER TABLE IF EXISTS public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on crew management tables
ALTER TABLE IF EXISTS public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.crew_assignments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on all log tables for audit trail protection
ALTER TABLE IF EXISTS public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assistant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cron_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_restore_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assistant_report_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mmi_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sensitive operational tables
ALTER TABLE IF EXISTS public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.voyages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maritime_certificates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on intelligence and AI tables
ALTER TABLE IF EXISTS public.ai_generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.smart_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dp_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sgso_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auditorias_imca ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 2: Enhanced security policies for critical tables
-- =============================================================================

-- Profiles: Users can only view and update their own profile
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Error logs: Only admins can view, system can insert
DO $$ BEGIN
  DROP POLICY IF EXISTS "System can insert error logs" ON public.error_logs;
  CREATE POLICY "System can insert error logs" ON public.error_logs
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
  CREATE POLICY "Admins can view error logs" ON public.error_logs
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Audit logs: Only admins can view, system can insert
DO $$ BEGIN
  DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
  CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
  CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- SECTION 3: Security helper functions
-- =============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE user_id = auth.uid() 
      AND organization_id = org_id 
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission for crew member
CREATE OR REPLACE FUNCTION public.can_access_crew_member(crew_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin can access all
  IF public.is_admin() THEN
    RETURN true;
  END IF;
  
  -- User can access their own crew record
  RETURN EXISTS (
    SELECT 1 FROM public.crew_members 
    WHERE id = crew_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SECTION 4: Enhanced security for sensitive operations
-- =============================================================================

-- Cron execution logs: Only system and admins
DO $$ BEGIN
  DROP POLICY IF EXISTS "System can manage cron logs" ON public.cron_execution_logs;
  CREATE POLICY "System can manage cron logs" ON public.cron_execution_logs
    FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Assistant logs: Users can view their own, admins can view all
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own assistant logs" ON public.assistant_logs;
  CREATE POLICY "Users can view own assistant logs" ON public.assistant_logs
    FOR SELECT USING (
      user_id = auth.uid() OR public.is_admin()
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own assistant logs" ON public.assistant_logs;
  CREATE POLICY "Users can insert own assistant logs" ON public.assistant_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- SECTION 5: Security audit trail
-- =============================================================================

-- Create security audit log if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT,
  resource_id UUID,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_user ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_event ON public.security_audit_log(event_type);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit" ON public.security_audit_log
  FOR SELECT USING (public.is_admin());

-- System can insert security audit logs
CREATE POLICY "System can insert security audit" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- SECTION 6: Comments and documentation
-- =============================================================================

COMMENT ON TABLE public.security_audit_log IS 'PATCH 186.0: Security audit trail for production monitoring';
COMMENT ON FUNCTION public.is_admin() IS 'PATCH 186.0: Helper function to check admin privileges';
COMMENT ON FUNCTION public.user_belongs_to_org(UUID) IS 'PATCH 186.0: Helper function to check organization membership';
COMMENT ON FUNCTION public.can_access_crew_member(UUID) IS 'PATCH 186.0: Helper function to check crew member access';

-- =============================================================================
-- COMPLETION
-- =============================================================================
-- This migration establishes production-grade security with:
-- 1. RLS enabled on all critical tables
-- 2. Enhanced policies for sensitive data
-- 3. Security helper functions
-- 4. Comprehensive audit trail
-- 5. Protection for logs and admin operations
