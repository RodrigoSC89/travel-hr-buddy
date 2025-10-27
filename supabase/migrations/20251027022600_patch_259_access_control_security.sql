-- PATCH 259: Access Control & Security Monitor
-- Objetivo: Implementar controle de acesso e monitoramento de segurança operacional
-- Note: Some tables (access_logs, user_roles) already exist from migration 20251025022200
-- This patch extends and enhances the existing access control system

-- ============================================
-- Security Incidents Table
-- ============================================
CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number text UNIQUE NOT NULL,
  incident_type text NOT NULL CHECK (incident_type IN (
    'unauthorized_access',
    'data_breach',
    'system_intrusion',
    'policy_violation',
    'suspicious_activity',
    'malware_detected',
    'phishing_attempt',
    'physical_security',
    'other'
  )),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'reported' CHECK (status IN (
    'reported',
    'under_investigation',
    'confirmed',
    'mitigated',
    'resolved',
    'false_positive',
    'closed'
  )),
  
  -- Incident Details
  title text NOT NULL,
  description text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  reported_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  
  -- Affected Resources
  affected_user_id uuid REFERENCES auth.users(id),
  affected_module text,
  affected_resource text,
  affected_vessel_id uuid REFERENCES vessels(id),
  
  -- Detection
  detection_method text CHECK (detection_method IN ('automated', 'manual', 'user_report', 'audit', 'third_party')),
  detection_source text,
  
  -- Impact Assessment
  impact_level text CHECK (impact_level IN ('none', 'minimal', 'moderate', 'significant', 'severe')),
  data_compromised boolean DEFAULT false,
  systems_affected jsonb DEFAULT '[]'::jsonb,
  estimated_impact_cost numeric,
  
  -- Response
  assigned_to uuid REFERENCES auth.users(id),
  investigation_notes text,
  mitigation_actions jsonb DEFAULT '[]'::jsonb,
  resolution_summary text,
  lessons_learned text,
  
  -- Related Data
  related_access_logs jsonb DEFAULT '[]'::jsonb,
  related_incidents jsonb DEFAULT '[]'::jsonb,
  evidence_files jsonb DEFAULT '[]'::jsonb,
  
  -- Compliance
  regulatory_reported boolean DEFAULT false,
  regulatory_report_date timestamptz,
  regulatory_reference text,
  
  -- Alerts
  alerts_triggered jsonb DEFAULT '[]'::jsonb,
  notifications_sent jsonb DEFAULT '[]'::jsonb,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Security incidents indexes
CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detected_at ON security_incidents(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_incidents_affected_user ON security_incidents(affected_user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assigned_to ON security_incidents(assigned_to);

-- ============================================
-- User Access Levels Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_access_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Access Level
  access_level text NOT NULL DEFAULT 'standard' CHECK (access_level IN (
    'view_only',
    'standard',
    'advanced',
    'admin',
    'super_admin'
  )),
  
  -- Module Permissions
  module_permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
  -- Format: {"module_name": {"read": true, "write": false, "delete": false, "admin": false}}
  
  -- Feature Flags
  feature_access jsonb DEFAULT '{}'::jsonb,
  -- Format: {"feature_name": true/false}
  
  -- Resource Access
  vessel_access jsonb DEFAULT '[]'::jsonb, -- Array of vessel IDs user can access
  department_access jsonb DEFAULT '[]'::jsonb, -- Array of departments
  location_access jsonb DEFAULT '[]'::jsonb, -- Geographic restrictions
  
  -- Time-based Access
  access_start_date timestamptz,
  access_end_date timestamptz,
  is_temporary boolean DEFAULT false,
  
  -- Access Restrictions
  ip_whitelist jsonb DEFAULT '[]'::jsonb,
  ip_blacklist jsonb DEFAULT '[]'::jsonb,
  time_restrictions jsonb DEFAULT '{}'::jsonb, -- Working hours restrictions
  
  -- Multi-factor Authentication
  mfa_required boolean DEFAULT false,
  mfa_method text CHECK (mfa_method IN ('none', 'totp', 'sms', 'email', 'hardware_token')),
  mfa_verified_at timestamptz,
  
  -- Session Management
  max_concurrent_sessions integer DEFAULT 3,
  session_timeout_minutes integer DEFAULT 480, -- 8 hours
  
  -- Approval & Review
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  last_reviewed_at timestamptz,
  next_review_date timestamptz,
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'revoked')),
  suspension_reason text,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- User access levels indexes
CREATE INDEX IF NOT EXISTS idx_user_access_levels_user ON user_access_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_levels_level ON user_access_levels(access_level);
CREATE INDEX IF NOT EXISTS idx_user_access_levels_status ON user_access_levels(status);
CREATE INDEX IF NOT EXISTS idx_user_access_levels_review_date ON user_access_levels(next_review_date);

-- ============================================
-- Access Audit Trail Table
-- ============================================
CREATE TABLE IF NOT EXISTS access_audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  access_level_id uuid REFERENCES user_access_levels(id),
  
  -- Change Details
  action text NOT NULL CHECK (action IN (
    'granted',
    'modified',
    'suspended',
    'revoked',
    'escalated',
    'downgraded',
    'reviewed',
    'expired'
  )),
  
  -- Change Context
  previous_level text,
  new_level text,
  previous_permissions jsonb,
  new_permissions jsonb,
  
  -- Change Reason
  reason text NOT NULL,
  justification text,
  
  -- Approval
  requested_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  effective_date timestamptz DEFAULT now(),
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Access audit trail indexes
CREATE INDEX IF NOT EXISTS idx_access_audit_trail_user ON access_audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_trail_action ON access_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_access_audit_trail_date ON access_audit_trail(effective_date DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_trail ENABLE ROW LEVEL SECURITY;

-- Security incidents policies
CREATE POLICY "Allow security admins to read all incidents"
  ON security_incidents FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_access_levels 
      WHERE user_id = auth.uid() 
        AND access_level IN ('admin', 'super_admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Allow assigned users to read their incidents"
  ON security_incidents FOR SELECT TO authenticated 
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() = affected_user_id 
    OR auth.uid() = created_by
  );

CREATE POLICY "Allow security admins to manage incidents"
  ON security_incidents FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_access_levels 
      WHERE user_id = auth.uid() 
        AND access_level IN ('admin', 'super_admin')
        AND status = 'active'
    )
  );

-- User access levels policies
CREATE POLICY "Allow users to read their own access level"
  ON user_access_levels FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to read all access levels"
  ON user_access_levels FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_access_levels 
      WHERE user_id = auth.uid() 
        AND access_level IN ('admin', 'super_admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Allow super admins to manage access levels"
  ON user_access_levels FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_access_levels 
      WHERE user_id = auth.uid() 
        AND access_level = 'super_admin'
        AND status = 'active'
    )
  );

-- Access audit trail policies
CREATE POLICY "Allow users to read their own audit trail"
  ON access_audit_trail FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to read all audit trails"
  ON access_audit_trail FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_access_levels 
      WHERE user_id = auth.uid() 
        AND access_level IN ('admin', 'super_admin')
        AND status = 'active'
    )
  );

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_access_levels_updated_at BEFORE UPDATE ON user_access_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Access Violation Detection Trigger
-- ============================================

CREATE OR REPLACE FUNCTION detect_access_violation()
RETURNS TRIGGER AS $$
DECLARE
  v_incident_id uuid;
  v_failed_attempts integer;
BEGIN
  -- Check if result is a violation
  IF NEW.result IN ('failure', 'denied', 'error') THEN
    -- Count recent failed attempts
    SELECT COUNT(*) INTO v_failed_attempts
    FROM access_logs
    WHERE user_id = NEW.user_id
      AND module_accessed = NEW.module_accessed
      AND result IN ('failure', 'denied')
      AND timestamp > now() - interval '15 minutes';
    
    -- Create security incident if threshold exceeded
    IF v_failed_attempts >= 5 THEN
      INSERT INTO security_incidents (
        incident_number,
        incident_type,
        severity,
        title,
        description,
        affected_user_id,
        affected_module,
        detection_method,
        detection_source,
        impact_level
      ) VALUES (
        'INC-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8),
        'unauthorized_access',
        CASE 
          WHEN v_failed_attempts >= 10 THEN 'high'
          WHEN v_failed_attempts >= 7 THEN 'medium'
          ELSE 'low'
        END,
        'Multiple failed access attempts detected',
        format('User attempted to access %s module %s times in 15 minutes', NEW.module_accessed, v_failed_attempts),
        NEW.user_id,
        NEW.module_accessed,
        'automated',
        'access_logs_monitor',
        'moderate'
      )
      RETURNING id INTO v_incident_id;
      
      -- Update severity in access log
      NEW.severity := 'critical';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER access_violation_detection BEFORE INSERT ON access_logs
  FOR EACH ROW EXECUTE FUNCTION detect_access_violation();

-- ============================================
-- Access Level Expiration Check
-- ============================================

CREATE OR REPLACE FUNCTION check_access_expiration()
RETURNS void AS $$
BEGIN
  -- Update expired access levels
  UPDATE user_access_levels
  SET status = 'expired'
  WHERE status = 'active'
    AND access_end_date IS NOT NULL
    AND access_end_date < now();
    
  -- Log expiration events
  INSERT INTO access_audit_trail (
    user_id,
    access_level_id,
    action,
    reason,
    previous_level,
    new_level
  )
  SELECT 
    ual.user_id,
    ual.id,
    'expired',
    'Automatic expiration due to end date',
    ual.access_level,
    'view_only'
  FROM user_access_levels ual
  WHERE ual.status = 'expired'
    AND NOT EXISTS (
      SELECT 1 FROM access_audit_trail aat
      WHERE aat.access_level_id = ual.id
        AND aat.action = 'expired'
        AND aat.created_at > now() - interval '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Functions for Security Monitoring
-- ============================================

-- Function to get security dashboard metrics
CREATE OR REPLACE FUNCTION get_security_metrics(
  p_time_range interval DEFAULT interval '24 hours'
)
RETURNS TABLE (
  total_incidents bigint,
  critical_incidents bigint,
  open_incidents bigint,
  failed_access_attempts bigint,
  unique_affected_users bigint,
  avg_resolution_time interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_incidents,
    COUNT(*) FILTER (WHERE severity = 'critical')::bigint as critical_incidents,
    COUNT(*) FILTER (WHERE status NOT IN ('resolved', 'closed', 'false_positive'))::bigint as open_incidents,
    (SELECT COUNT(*) FROM access_logs WHERE result IN ('failure', 'denied') AND timestamp > now() - p_time_range)::bigint as failed_access_attempts,
    COUNT(DISTINCT affected_user_id)::bigint as unique_affected_users,
    AVG(resolved_at - detected_at) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time
  FROM security_incidents
  WHERE detected_at > now() - p_time_range;
END;
$$ LANGUAGE plpgsql;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id uuid,
  p_module text,
  p_action text -- 'read', 'write', 'delete', 'admin'
)
RETURNS boolean AS $$
DECLARE
  v_has_permission boolean := false;
  v_access_level text;
  v_module_perms jsonb;
BEGIN
  -- Get user access level
  SELECT access_level, module_permissions
  INTO v_access_level, v_module_perms
  FROM user_access_levels
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (access_end_date IS NULL OR access_end_date > now());
  
  -- Super admin has all permissions
  IF v_access_level = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check module-specific permissions
  IF v_module_perms ? p_module THEN
    v_has_permission := COALESCE((v_module_perms->p_module->>p_action)::boolean, false);
  END IF;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample user access levels
INSERT INTO user_access_levels (user_id, access_level, module_permissions, mfa_required, status)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'super_admin',
  '{
    "fleet_management": {"read": true, "write": true, "delete": true, "admin": true},
    "crew_management": {"read": true, "write": true, "delete": true, "admin": true},
    "logistics": {"read": true, "write": true, "delete": true, "admin": true},
    "travel_management": {"read": true, "write": true, "delete": true, "admin": true}
  }'::jsonb,
  true,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM user_access_levels WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
);

-- Insert sample security incident
INSERT INTO security_incidents (
  incident_number,
  incident_type,
  severity,
  status,
  title,
  description,
  detection_method,
  impact_level
) VALUES (
  'INC-' || to_char(now(), 'YYYYMMDD') || '-DEMO01',
  'suspicious_activity',
  'medium',
  'under_investigation',
  'Unusual access pattern detected',
  'Multiple login attempts from different IP addresses within short timeframe',
  'automated',
  'moderate'
)
ON CONFLICT (incident_number) DO NOTHING;

-- ============================================
-- Views
-- ============================================

-- View for active security incidents
CREATE OR REPLACE VIEW active_security_incidents AS
SELECT 
  si.id,
  si.incident_number,
  si.incident_type,
  si.severity,
  si.status,
  si.title,
  si.detected_at,
  si.affected_module,
  si.impact_level,
  extract(epoch from (now() - si.detected_at)) / 3600 as hours_open
FROM security_incidents si
WHERE si.status NOT IN ('resolved', 'closed', 'false_positive')
ORDER BY 
  CASE si.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END,
  si.detected_at ASC;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE security_incidents IS 'Security incident tracking and management with automated detection';
COMMENT ON TABLE user_access_levels IS 'Granular user access control with module-level permissions';
COMMENT ON TABLE access_audit_trail IS 'Audit trail for all access level changes and reviews';
