-- PATCH AUDIT-1.0: Sistema de Audit Logs para mutações CRUD
-- Registra todas as operações críticas para compliance e auditoria regulamentar

CREATE TABLE IF NOT EXISTS system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'create', 'read', 'update', 'delete', 'archive', 'restore',
    'export', 'import', 'approve', 'reject', 'login', 'logout'
  )),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  changes JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  duration_ms INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_audit_user ON system_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_action ON system_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_audit_entity ON system_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_timestamp ON system_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_audit_success ON system_audit_logs(success);

-- Enable RLS
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own audit logs
CREATE POLICY "Users can insert own audit logs"
  ON system_audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins and auditors can read all audit logs
CREATE POLICY "Admins can read all audit logs"
  ON system_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'auditor')
    )
  );

-- Policy: Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON system_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Function to auto-cleanup old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM system_audit_logs
  WHERE timestamp < NOW() - INTERVAL '90 days'
  AND action NOT IN ('delete', 'approve', 'reject'); -- Keep critical actions longer
  
  DELETE FROM system_audit_logs
  WHERE timestamp < NOW() - INTERVAL '365 days'; -- Delete everything older than 1 year
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_statistics(
  p_entity_type TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  action TEXT,
  total_count BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  avg_duration_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.action::TEXT,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE s.success = true) as success_count,
    COUNT(*) FILTER (WHERE s.success = false) as failure_count,
    AVG(s.duration_ms)::NUMERIC as avg_duration_ms
  FROM system_audit_logs s
  WHERE s.timestamp BETWEEN p_date_from AND p_date_to
  AND (p_entity_type IS NULL OR s.entity_type = p_entity_type)
  GROUP BY s.action
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for recent critical actions (useful for dashboard)
CREATE OR REPLACE VIEW recent_audit_actions AS
SELECT 
  id,
  user_email,
  action,
  entity_type,
  entity_name,
  success,
  error_message,
  timestamp
FROM system_audit_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 100;

COMMENT ON TABLE system_audit_logs IS 'PATCH AUDIT-1.0: Sistema de audit logs para compliance e auditoria regulamentar';
