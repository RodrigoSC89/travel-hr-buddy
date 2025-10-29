-- PATCH 513 - Unified Central Logs System
-- Creates a centralized log table for all system logs with filtering and export capabilities

-- Create central_logs table
CREATE TABLE IF NOT EXISTS central_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin TEXT NOT NULL, -- Source of the log (AI, Watchdog, Automation, API, etc.)
  type TEXT NOT NULL, -- Log type (info, warning, error, critical, audit)
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  module TEXT NOT NULL, -- Module that generated the log
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Additional structured data
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_central_logs_origin ON central_logs(origin);
CREATE INDEX IF NOT EXISTS idx_central_logs_type ON central_logs(type);
CREATE INDEX IF NOT EXISTS idx_central_logs_severity ON central_logs(severity);
CREATE INDEX IF NOT EXISTS idx_central_logs_module ON central_logs(module);
CREATE INDEX IF NOT EXISTS idx_central_logs_timestamp ON central_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_central_logs_user_id ON central_logs(user_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_central_logs_origin_type_timestamp 
  ON central_logs(origin, type, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE central_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all logs
CREATE POLICY "Allow authenticated users to read central logs"
  ON central_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert central logs"
  ON central_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only admins can delete logs
CREATE POLICY "Allow admins to delete central logs"
  ON central_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to clean old logs (optional maintenance)
CREATE OR REPLACE FUNCTION clean_old_central_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM central_logs
  WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get log statistics
CREATE OR REPLACE FUNCTION get_central_log_stats(
  time_period TEXT DEFAULT '24h'
)
RETURNS TABLE (
  origin TEXT,
  type TEXT,
  severity TEXT,
  count BIGINT
) AS $$
DECLARE
  interval_value INTERVAL;
BEGIN
  -- Convert time_period to interval
  CASE time_period
    WHEN '1h' THEN interval_value := '1 hour'::INTERVAL;
    WHEN '24h' THEN interval_value := '24 hours'::INTERVAL;
    WHEN '7d' THEN interval_value := '7 days'::INTERVAL;
    WHEN '30d' THEN interval_value := '30 days'::INTERVAL;
    ELSE interval_value := '24 hours'::INTERVAL;
  END CASE;

  RETURN QUERY
  SELECT 
    cl.origin,
    cl.type,
    cl.severity,
    COUNT(*) as count
  FROM central_logs cl
  WHERE cl.timestamp >= NOW() - interval_value
  GROUP BY cl.origin, cl.type, cl.severity
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON central_logs TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_central_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_central_log_stats TO authenticated;

-- Comment on table
COMMENT ON TABLE central_logs IS 'PATCH 513 - Centralized logging system for all application modules';
