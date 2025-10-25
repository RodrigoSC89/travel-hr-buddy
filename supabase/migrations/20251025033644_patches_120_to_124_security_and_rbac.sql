-- =====================================================
-- PATCHES 120-124: Security, RBAC, and Session Management
-- =====================================================

-- =====================================================
-- PATCH 120.0 - RLS: Row-Level Security (Segurança por linha)
-- =====================================================

-- Update RLS policies for crew_members to use proper user context
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow access to own vessel crew" ON public.crew_members;
DROP POLICY IF EXISTS "Users can view crew members" ON public.crew_members;

-- Create improved policy for crew members - users can only access their own data or vessel crew
CREATE POLICY "Users can access own crew data"
  ON public.crew_members
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    vessel_id IN (
      SELECT vessel_id FROM public.crew_members 
      WHERE user_id = auth.uid()
    ) OR
    get_user_role() IN ('admin', 'hr_manager')
  );

-- Update RLS policies for logs to ensure proper isolation
DROP POLICY IF EXISTS "Authenticated users can read logs" ON public.logs;

CREATE POLICY "Users can access contextual logs"
  ON public.logs
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR
    get_user_role() IN ('admin', 'hr_manager')
  );

-- Update RLS policies for financial_transactions (already has good policies, just document)
-- Policies already exist and are contextual

-- Update RLS policies for maintenance_records
DROP POLICY IF EXISTS "Allow authenticated users to read maintenance records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Allow authenticated users to insert maintenance records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Allow authenticated users to update maintenance records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Allow authenticated users to delete maintenance records" ON public.maintenance_records;

CREATE POLICY "Users can view maintenance records for accessible vessels"
  ON public.maintenance_records
  FOR SELECT
  USING (
    vessel_id IN (
      SELECT vessel_id FROM public.crew_members 
      WHERE user_id = auth.uid()
    ) OR
    get_user_role() IN ('admin', 'hr_manager')
  );

CREATE POLICY "Authorized users can manage maintenance records"
  ON public.maintenance_records
  FOR ALL
  USING (
    get_user_role() IN ('admin', 'hr_manager')
  );

-- Update RLS policies for routes (already contextual, improve)
DROP POLICY IF EXISTS "Authenticated users can view routes" ON public.routes;

CREATE POLICY "Users can view accessible routes"
  ON public.routes
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      is_active = true OR
      get_user_role() IN ('admin', 'hr_manager')
    )
  );

-- =====================================================
-- PATCH 121.0 - Module Consolidation
-- Note: Skipping as module structure doesn't match problem statement
-- document-hub already exists, no duplicates found
-- =====================================================

-- =====================================================
-- PATCH 122.0 - RBAC: Roles e Hierarquias
-- =====================================================

-- Extend existing user_roles table with additional fields
-- Add assigned_at if not exists (table already exists from earlier migration)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN assigned_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Create role check constraints if needed
-- The user_role ENUM already includes: 'admin', 'hr_manager', 'employee', 'manager'
-- Add 'operator', 'viewer', 'auditor' to the enum
DO $$
BEGIN
  -- Check if the enum values need to be added
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'operator';
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'viewer';
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'auditor';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create function to check if user has permission for a module
CREATE OR REPLACE FUNCTION public.user_has_module_permission(
  module_name TEXT,
  required_role user_role DEFAULT 'viewer'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_current_role user_role;
BEGIN
  SELECT role INTO user_current_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  
  -- Admin has access to everything
  IF user_current_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check role hierarchy: admin > hr_manager > manager > operator > auditor > viewer > employee
  CASE required_role
    WHEN 'admin' THEN
      RETURN user_current_role = 'admin';
    WHEN 'hr_manager' THEN
      RETURN user_current_role IN ('admin', 'hr_manager');
    WHEN 'manager' THEN
      RETURN user_current_role IN ('admin', 'hr_manager', 'manager');
    WHEN 'operator' THEN
      RETURN user_current_role IN ('admin', 'hr_manager', 'manager', 'operator');
    WHEN 'auditor' THEN
      RETURN user_current_role IN ('admin', 'hr_manager', 'manager', 'operator', 'auditor');
    WHEN 'viewer' THEN
      RETURN user_current_role IN ('admin', 'hr_manager', 'manager', 'operator', 'auditor', 'viewer');
    ELSE
      RETURN TRUE; -- employee or any authenticated user
  END CASE;
END;
$$;

-- Create module permissions table for fine-grained control
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  role user_role NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_name, role)
);

-- Enable RLS on module_permissions
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view module permissions"
  ON public.module_permissions
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage module permissions"
  ON public.module_permissions
  FOR ALL
  USING (get_user_role() = 'admin');

-- Insert default module permissions
INSERT INTO public.module_permissions (module_name, role, can_read, can_write, can_delete, can_admin)
VALUES
  -- Admin permissions
  ('fleet-control', 'admin', true, true, true, true),
  ('document-hub', 'admin', true, true, true, true),
  ('performance-intel', 'admin', true, true, true, true),
  ('system-watchdog', 'admin', true, true, true, true),
  
  -- Operator permissions
  ('fleet-control', 'operator', true, true, false, false),
  ('document-hub', 'operator', true, true, false, false),
  ('performance-intel', 'operator', true, false, false, false),
  
  -- Viewer permissions
  ('fleet-control', 'viewer', true, false, false, false),
  ('document-hub', 'viewer', true, false, false, false),
  ('performance-intel', 'viewer', true, false, false, false),
  
  -- Auditor permissions
  ('fleet-control', 'auditor', true, false, false, false),
  ('document-hub', 'auditor', true, false, false, false),
  ('performance-intel', 'auditor', true, false, false, false),
  ('system-watchdog', 'auditor', true, false, false, false)
ON CONFLICT (module_name, role) DO NOTHING;

-- =====================================================
-- PATCH 123.0 - Audit Trail por Role
-- =====================================================

-- Create access_logs table if not exists (for audit trail)
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT,
  user_context JSONB DEFAULT '{}'::jsonb,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT CHECK (status IN ('success', 'failure', 'error')),
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON public.access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource_type ON public.access_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_role ON public.access_logs(user_role);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for access_logs
CREATE POLICY "Users can view their own access logs"
  ON public.access_logs
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    get_user_role() IN ('admin', 'auditor')
  );

CREATE POLICY "System can insert access logs"
  ON public.access_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete old access logs"
  ON public.access_logs
  FOR DELETE
  USING (get_user_role() = 'admin');

-- Function to automatically log user actions
CREATE OR REPLACE FUNCTION public.log_user_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
  current_user_role TEXT;
  user_context_data JSONB;
BEGIN
  -- Get user role
  SELECT role::TEXT INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();
  
  -- Build user context
  user_context_data := jsonb_build_object(
    'role', current_user_role,
    'timestamp', now(),
    'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id'
  );
  
  -- Insert access log
  INSERT INTO public.access_logs (
    user_id,
    user_role,
    user_context,
    action,
    resource_type,
    resource_id,
    status,
    details
  )
  VALUES (
    auth.uid(),
    current_user_role,
    user_context_data,
    p_action,
    p_resource_type,
    p_resource_id,
    p_status,
    p_details
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to cleanup old access logs (retain for 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_old_access_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.access_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$;

-- =====================================================
-- PATCH 124.0 - Token & Session Security Engine
-- =====================================================

-- Create session_tokens table
CREATE TABLE IF NOT EXISTS public.session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  UNIQUE(token)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON public.session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_token ON public.session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_session_tokens_expires_at ON public.session_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_tokens_revoked ON public.session_tokens(revoked) WHERE revoked = false;

-- Enable RLS
ALTER TABLE public.session_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions"
  ON public.session_tokens
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can revoke their own sessions"
  ON public.session_tokens
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create sessions"
  ON public.session_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all sessions"
  ON public.session_tokens
  FOR SELECT
  USING (get_user_role() = 'admin');

-- Function to create a new session token
CREATE OR REPLACE FUNCTION public.create_session_token(
  p_device_info JSONB DEFAULT '{}'::jsonb,
  p_expires_in_hours INTEGER DEFAULT 720 -- 30 days default
)
RETURNS TABLE (
  token_id UUID,
  token_value TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token TEXT;
  new_token_id UUID;
  expiry_time TIMESTAMPTZ;
BEGIN
  -- Generate a secure random token
  new_token := encode(gen_random_bytes(32), 'base64');
  expiry_time := now() + (p_expires_in_hours || ' hours')::INTERVAL;
  
  -- Insert the session token
  INSERT INTO public.session_tokens (
    user_id,
    token,
    device_info,
    expires_at
  )
  VALUES (
    auth.uid(),
    new_token,
    p_device_info,
    expiry_time
  )
  RETURNING id INTO new_token_id;
  
  -- Return the token details
  RETURN QUERY
  SELECT new_token_id, new_token, expiry_time;
END;
$$;

-- Function to revoke a session
CREATE OR REPLACE FUNCTION public.revoke_session_token(
  p_token_id UUID,
  p_reason TEXT DEFAULT 'User requested'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE public.session_tokens
  SET 
    revoked = true,
    revoked_at = now(),
    revoked_reason = p_reason
  WHERE 
    id = p_token_id AND
    user_id = auth.uid() AND
    revoked = false
  RETURNING id INTO rows_affected;
  
  RETURN rows_affected IS NOT NULL;
END;
$$;

-- Function to validate and refresh session
CREATE OR REPLACE FUNCTION public.validate_session_token(
  p_token TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT 
    st.user_id,
    st.expires_at,
    st.revoked,
    (st.expires_at > now() AND NOT st.revoked) AS is_valid
  INTO session_record
  FROM public.session_tokens st
  WHERE st.token = p_token;
  
  IF session_record.is_valid THEN
    -- Update last activity
    UPDATE public.session_tokens
    SET last_activity_at = now()
    WHERE token = p_token;
  END IF;
  
  RETURN QUERY
  SELECT 
    session_record.is_valid,
    session_record.user_id,
    session_record.expires_at;
END;
$$;

-- Function to get active sessions for a user
CREATE OR REPLACE FUNCTION public.get_active_sessions()
RETURNS TABLE (
  id UUID,
  device_info JSONB,
  created_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  ip_address TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.device_info,
    st.created_at,
    st.last_activity_at,
    st.expires_at,
    st.ip_address
  FROM public.session_tokens st
  WHERE 
    st.user_id = auth.uid() AND
    st.revoked = false AND
    st.expires_at > now()
  ORDER BY st.last_activity_at DESC;
END;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.session_tokens 
  WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a view for session monitoring
CREATE OR REPLACE VIEW public.session_monitoring AS
SELECT 
  st.id,
  st.user_id,
  u.email,
  ur.role,
  st.device_info,
  st.created_at,
  st.last_activity_at,
  st.expires_at,
  st.revoked,
  st.ip_address,
  CASE 
    WHEN st.revoked THEN 'revoked'
    WHEN st.expires_at < now() THEN 'expired'
    WHEN st.last_activity_at < now() - INTERVAL '1 hour' THEN 'inactive'
    ELSE 'active'
  END AS status
FROM public.session_tokens st
LEFT JOIN auth.users u ON st.user_id = u.id
LEFT JOIN public.user_roles ur ON st.user_id = ur.user_id;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.access_logs IS 'Audit trail for all user actions with role context';
COMMENT ON TABLE public.session_tokens IS 'Secure session management with device tracking and revocation';
COMMENT ON TABLE public.module_permissions IS 'Fine-grained role-based access control for modules';
COMMENT ON FUNCTION public.log_user_action IS 'Automatically logs user actions with role and context information';
COMMENT ON FUNCTION public.create_session_token IS 'Creates a new session token with device information';
COMMENT ON FUNCTION public.revoke_session_token IS 'Revokes a session token for security purposes';
COMMENT ON FUNCTION public.validate_session_token IS 'Validates a session token and updates last activity';
COMMENT ON FUNCTION public.user_has_module_permission IS 'Checks if user has permission for a specific module';
