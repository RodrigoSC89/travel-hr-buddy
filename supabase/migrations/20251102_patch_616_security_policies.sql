-- PATCH 616: Advanced Security Policies
-- Row Level Security policies for critical system tables
-- Created: 2025-11-02

-- ============================================================================
-- SYSTEM LOGS - Admin only access
-- ============================================================================

-- Enable RLS on system_logs if not already enabled
ALTER TABLE IF EXISTS system_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "system_logs_admin_only" ON system_logs;
DROP POLICY IF EXISTS "system_logs_read_auditor" ON system_logs;

-- Admin can do everything on system_logs
CREATE POLICY "system_logs_admin_only"
ON system_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Auditors can read system_logs
CREATE POLICY "system_logs_read_auditor"
ON system_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('auditor', 'admin', 'super_admin')
  )
);

-- ============================================================================
-- AUDIT TRAIL - Strict access control
-- ============================================================================

ALTER TABLE IF EXISTS audit_trail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_trail_admin_only" ON audit_trail;
DROP POLICY IF EXISTS "audit_trail_read_auditor" ON audit_trail;

-- Only admins can modify audit trail
CREATE POLICY "audit_trail_admin_only"
ON audit_trail
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Auditors and admins can read audit trail
CREATE POLICY "audit_trail_read_auditor"
ON audit_trail
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('auditor', 'admin', 'super_admin')
  )
);

-- ============================================================================
-- AI LOGS - Performance and decision logging
-- ============================================================================

ALTER TABLE IF EXISTS ia_performance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ia_logs_admin_read" ON ia_performance_log;
DROP POLICY IF EXISTS "ia_logs_tenant_scope" ON ia_performance_log;

-- Admins can read all AI logs
CREATE POLICY "ia_logs_admin_read"
ON ia_performance_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'auditor')
  )
);

-- Users can only see AI logs for their tenant
CREATE POLICY "ia_logs_tenant_scope"
ON ia_performance_log
FOR SELECT
TO authenticated
USING (
  -- Users with explicit organization membership
  tenant_id IN (
    SELECT organization_id
    FROM organization_users
    WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- PERFORMANCE METRICS - Monitoring access
-- ============================================================================

ALTER TABLE IF EXISTS performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_metrics_admin" ON performance_metrics;
DROP POLICY IF EXISTS "performance_metrics_tenant" ON performance_metrics;

-- Admins can access all performance metrics
CREATE POLICY "performance_metrics_admin"
ON performance_metrics
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Users can read metrics for their organization
CREATE POLICY "performance_metrics_tenant"
ON performance_metrics
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_users
    WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- SECURITY EVENTS - Fail2Ban and login tracking
-- ============================================================================

-- Create security_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_events_admin_only" ON security_events;

-- Only system and admins can write security events
CREATE POLICY "security_events_admin_only"
ON security_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================================================
-- LOGIN LOGS - Enhanced tracking
-- ============================================================================

-- Create login_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS login_logs_user_id_created_at_idx 
ON login_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS login_logs_ip_address_created_at_idx 
ON login_logs(ip_address, created_at DESC);

ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "login_logs_own_read" ON login_logs;
DROP POLICY IF EXISTS "login_logs_admin_all" ON login_logs;

-- Users can read their own login logs
CREATE POLICY "login_logs_own_read"
ON login_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can access all login logs
CREATE POLICY "login_logs_admin_all"
ON login_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'auditor')
  )
);

-- ============================================================================
-- TOKEN ACTIVITY LOGS - JWT and session tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS token_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  token_type TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_activity_user_id_idx 
ON token_activity_logs(user_id, created_at DESC);

ALTER TABLE token_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "token_activity_own_read" ON token_activity_logs;
DROP POLICY IF EXISTS "token_activity_admin_all" ON token_activity_logs;

-- Users can read their own token activity
CREATE POLICY "token_activity_own_read"
ON token_activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can access all token activity
CREATE POLICY "token_activity_admin_all"
ON token_activity_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'auditor')
  )
);

-- ============================================================================
-- INTEGRITY LOGS - Data consistency tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  module TEXT NOT NULL,
  error_type TEXT NOT NULL,
  relation TEXT,
  message TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS integrity_logs_module_timestamp_idx 
ON integrity_logs(module, timestamp DESC);

CREATE INDEX IF NOT EXISTS integrity_logs_resolved_idx 
ON integrity_logs(resolved) WHERE NOT resolved;

ALTER TABLE integrity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "integrity_logs_admin_all" ON integrity_logs;

-- Only admins can access integrity logs
CREATE POLICY "integrity_logs_admin_all"
ON integrity_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'auditor')
  )
);

-- ============================================================================
-- FUNCTIONS - Helper functions for security
-- ============================================================================

-- Function to check if user has required role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    user_id,
    event_type,
    severity,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    p_event_type,
    p_severity,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE security_events IS 'PATCH 616: Security event logging for fail2ban and monitoring';
COMMENT ON TABLE login_logs IS 'PATCH 616: Enhanced login tracking with IP and user agent';
COMMENT ON TABLE token_activity_logs IS 'PATCH 616: JWT and session token activity tracking';
COMMENT ON TABLE integrity_logs IS 'PATCH 616: Data integrity issue logging from cross-module validation';
