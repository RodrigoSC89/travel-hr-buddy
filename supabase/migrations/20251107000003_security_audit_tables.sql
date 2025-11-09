-- Security Audit and Logging Tables
-- Comprehensive security monitoring and audit trail

-- ============================================
-- Table: security_audit_logs
-- Stores all security-related events
-- ============================================
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'AUTH_ATTEMPT', 'AUTH_SUCCESS', 'AUTH_FAILURE',
    'RATE_LIMIT', 'VALIDATION_ERROR',
    'SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT',
    'UNAUTHORIZED_ACCESS', 'DATA_BREACH_ATTEMPT',
    'API_KEY_CREATED', 'API_KEY_REVOKED',
    'PASSWORD_CHANGED', 'MFA_ENABLED', 'MFA_DISABLED'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  method TEXT,
  request_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_audit_logs(ip_address);

-- ============================================
-- Table: rate_limit_violations
-- Tracks rate limit violations
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  violation_count INTEGER DEFAULT 1,
  first_violation_at TIMESTAMPTZ NOT NULL,
  last_violation_at TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_violations_ip ON rate_limit_violations(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_violations_user ON rate_limit_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_violations_blocked ON rate_limit_violations(blocked_until) WHERE blocked_until IS NOT NULL;

-- ============================================
-- Table: api_keys
-- Stores API keys for external integrations
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  permissions JSONB DEFAULT '[]'::jsonb,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  last_used_at TIMESTAMPTZ,
  last_used_ip INET,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id),
  revocation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(revoked, expires_at) WHERE revoked = FALSE;

-- ============================================
-- Table: failed_login_attempts
-- Tracks failed login attempts for blocking
-- ============================================
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ NOT NULL,
  last_attempt_at TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_logins_blocked ON failed_login_attempts(blocked_until) WHERE blocked_until IS NOT NULL;

-- ============================================
-- Table: suspicious_activities
-- Flags suspicious user behavior
-- ============================================
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'MULTIPLE_FAILED_LOGINS',
    'UNUSUAL_LOCATION',
    'UNUSUAL_TIME',
    'RAPID_API_CALLS',
    'DATA_EXFILTRATION_ATTEMPT',
    'PRIVILEGE_ESCALATION_ATTEMPT',
    'SQL_INJECTION',
    'XSS_ATTEMPT',
    'CSRF_ATTEMPT'
  )),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  investigated BOOLEAN DEFAULT FALSE,
  investigated_by UUID REFERENCES user_profiles(id),
  investigated_at TIMESTAMPTZ,
  investigation_notes TEXT,
  false_positive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suspicious_user ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_type ON suspicious_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_risk ON suspicious_activities(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_suspicious_uninvestigated ON suspicious_activities(investigated) WHERE investigated = FALSE;

-- ============================================
-- Table: data_access_logs
-- Audit trail for sensitive data access
-- ============================================
CREATE TABLE IF NOT EXISTS data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXPORT')),
  ip_address INET,
  sensitive_data_accessed BOOLEAN DEFAULT FALSE,
  data_category TEXT, -- PII, FINANCIAL, OPERATIONAL, etc.
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_access_user ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_table ON data_access_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_data_access_timestamp ON data_access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_sensitive ON data_access_logs(sensitive_data_accessed) WHERE sensitive_data_accessed = TRUE;

-- ============================================
-- Functions: Security helpers
-- ============================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO security_audit_logs (
    event_type,
    severity,
    user_id,
    ip_address,
    details,
    timestamp
  ) VALUES (
    p_event_type,
    p_severity,
    p_user_id,
    p_ip_address,
    p_details,
    NOW()
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address INET,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_request_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*)
  INTO v_request_count
  FROM security_audit_logs
  WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND timestamp >= v_window_start;
  
  RETURN v_request_count < p_max_requests;
END;
$$ LANGUAGE plpgsql;

-- Function to block suspicious IP
CREATE OR REPLACE FUNCTION block_suspicious_ip(
  p_ip_address INET,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO rate_limit_violations (
    ip_address,
    endpoint,
    violation_count,
    first_violation_at,
    last_violation_at,
    blocked_until
  ) VALUES (
    p_ip_address,
    'ALL',
    1,
    NOW(),
    NOW(),
    NOW() + (p_duration_minutes || ' minutes')::INTERVAL
  )
  ON CONFLICT (ip_address, endpoint)
  DO UPDATE SET
    violation_count = rate_limit_violations.violation_count + 1,
    last_violation_at = NOW(),
    blocked_until = NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers: Auto-logging sensitive operations
-- ============================================

-- Trigger to log all updates to user_profiles
CREATE OR REPLACE FUNCTION log_user_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO data_access_logs (
    user_id,
    table_name,
    record_id,
    action,
    sensitive_data_accessed,
    data_category,
    timestamp
  ) VALUES (
    auth.uid(),
    'user_profiles',
    NEW.id,
    TG_OP,
    TRUE,
    'PII',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_user_profile_changes
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_user_profile_changes();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security_audit_logs"
  ON security_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own API keys
CREATE POLICY "Users can view own api_keys"
  ON api_keys FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own api_keys"
  ON api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can revoke own api_keys"
  ON api_keys FOR UPDATE
  USING (user_id = auth.uid());

-- Service role can access everything
CREATE POLICY "Service role full access to security_audit_logs"
  ON security_audit_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to api_keys"
  ON api_keys FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE security_audit_logs IS 'Comprehensive audit trail of all security-related events';
COMMENT ON TABLE rate_limit_violations IS 'Tracks rate limit violations and IP blocking';
COMMENT ON TABLE api_keys IS 'External API keys for integrations';
COMMENT ON TABLE failed_login_attempts IS 'Failed login tracking for brute force protection';
COMMENT ON TABLE suspicious_activities IS 'Flags potentially malicious user behavior';
COMMENT ON TABLE data_access_logs IS 'Audit trail for sensitive data access';
