-- PATCH 123-124 Part 2b: Create Tables and Functions (Fixed)

-- 1. Create access_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_accessed TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'denied', 'error')),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Create module_permissions table
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  module_name TEXT NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(role, module_name)
);

-- 3. Create session_tokens table
CREATE TABLE IF NOT EXISTS public.session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_module ON public.access_logs(module_accessed);
CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON public.session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_token ON public.session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_session_tokens_expires_at ON public.session_tokens(expires_at);

-- 5. Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_tokens ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for access_logs (using DO block to avoid errors)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'access_logs' AND policyname = 'Users can view their own access logs'
  ) THEN
    CREATE POLICY "Users can view their own access logs"
      ON public.access_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'access_logs' AND policyname = 'Admins can view all access logs'
  ) THEN
    CREATE POLICY "Admins can view all access logs"
      ON public.access_logs FOR SELECT
      USING (public.get_user_role() IN ('admin', 'auditor'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'access_logs' AND policyname = 'System can insert access logs'
  ) THEN
    CREATE POLICY "System can insert access logs"
      ON public.access_logs FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 7. RLS Policies for module_permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'module_permissions' AND policyname = 'Everyone can view module permissions'
  ) THEN
    CREATE POLICY "Everyone can view module permissions"
      ON public.module_permissions FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'module_permissions' AND policyname = 'Admins can manage module permissions'
  ) THEN
    CREATE POLICY "Admins can manage module permissions"
      ON public.module_permissions FOR ALL
      USING (public.get_user_role() = 'admin');
  END IF;
END $$;

-- 8. RLS Policies for session_tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'session_tokens' AND policyname = 'Users can view their own sessions'
  ) THEN
    CREATE POLICY "Users can view their own sessions"
      ON public.session_tokens FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'session_tokens' AND policyname = 'Users can create their own sessions'
  ) THEN
    CREATE POLICY "Users can create their own sessions"
      ON public.session_tokens FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'session_tokens' AND policyname = 'Users can update their own sessions'
  ) THEN
    CREATE POLICY "Users can update their own sessions"
      ON public.session_tokens FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 9. Function: log_user_action
CREATE OR REPLACE FUNCTION public.log_user_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.access_logs (
    user_id,
    module_accessed,
    action,
    result,
    details,
    severity
  ) VALUES (
    auth.uid(),
    p_resource_type,
    p_action,
    p_status,
    p_details || jsonb_build_object('resource_id', p_resource_id),
    CASE 
      WHEN p_status = 'error' THEN 'critical'
      WHEN p_status = 'failure' THEN 'warning'
      ELSE 'info'
    END
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 10. Function: get_active_sessions
CREATE OR REPLACE FUNCTION public.get_active_sessions()
RETURNS TABLE (
  id UUID,
  token TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  revoked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.token,
    st.device_info,
    st.created_at,
    st.expires_at,
    st.last_activity_at,
    st.revoked
  FROM public.session_tokens st
  WHERE st.user_id = auth.uid()
    AND st.expires_at > NOW()
  ORDER BY st.created_at DESC;
END;
$$;

-- 11. Function: create_session_token
CREATE OR REPLACE FUNCTION public.create_session_token(
  p_device_info JSONB DEFAULT '{}',
  p_expires_in_hours INTEGER DEFAULT 720
)
RETURNS TABLE (
  token_id UUID,
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_token_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_token := encode(gen_random_bytes(32), 'base64');
  v_expires_at := NOW() + (p_expires_in_hours || ' hours')::INTERVAL;
  
  INSERT INTO public.session_tokens (
    user_id,
    token,
    device_info,
    expires_at
  ) VALUES (
    auth.uid(),
    v_token,
    p_device_info,
    v_expires_at
  ) RETURNING id INTO v_token_id;
  
  RETURN QUERY SELECT v_token_id, v_token, v_expires_at;
END;
$$;

-- 12. Function: revoke_session_token
CREATE OR REPLACE FUNCTION public.revoke_session_token(
  p_token_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.session_tokens
  SET 
    revoked = true,
    revoked_at = NOW(),
    revoked_reason = p_reason
  WHERE id = p_token_id
    AND user_id = auth.uid();
    
  RETURN FOUND;
END;
$$;

-- 13. Function: validate_session_token
CREATE OR REPLACE FUNCTION public.validate_session_token(
  p_token TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (st.revoked = false AND st.expires_at > NOW())::BOOLEAN as is_valid,
    st.user_id,
    st.expires_at
  FROM public.session_tokens st
  WHERE st.token = p_token;
  
  UPDATE public.session_tokens
  SET last_activity_at = NOW()
  WHERE token = p_token;
END;
$$;

-- 14. Seed module_permissions
INSERT INTO public.module_permissions (role, module_name, can_read, can_write, can_delete, can_manage)
VALUES
  ('admin', 'users', true, true, true, true),
  ('admin', 'certificates', true, true, true, true),
  ('admin', 'vessels', true, true, true, true),
  ('admin', 'reports', true, true, true, true),
  ('admin', 'analytics', true, true, true, true),
  ('admin', 'system_settings', true, true, true, true),
  ('hr_manager', 'users', true, true, false, true),
  ('hr_manager', 'certificates', true, true, true, true),
  ('hr_manager', 'vessels', true, false, false, false),
  ('hr_manager', 'reports', true, true, false, false),
  ('hr_manager', 'analytics', true, false, false, false),
  ('hr_analyst', 'users', true, true, false, false),
  ('hr_analyst', 'certificates', true, true, false, false),
  ('hr_analyst', 'reports', true, true, false, false),
  ('hr_analyst', 'analytics', true, false, false, false),
  ('auditor', 'users', true, false, false, false),
  ('auditor', 'certificates', true, false, false, false),
  ('auditor', 'vessels', true, false, false, false),
  ('auditor', 'reports', true, false, false, false),
  ('auditor', 'analytics', true, false, false, false),
  ('employee', 'certificates', true, false, false, false),
  ('employee', 'reports', true, false, false, false)
ON CONFLICT (role, module_name) DO NOTHING;