-- PATCH 513: Central Logs System
-- Unified logging infrastructure with optimized indexing

-- Create central_logs table
CREATE TABLE IF NOT EXISTS central_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,           -- AI, Watchdog, Automation, API
  type TEXT NOT NULL,              -- info, warning, error, critical, audit
  severity TEXT NOT NULL,          -- low, medium, high, critical
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create optimized indexes for fast queries (<100ms target)
CREATE INDEX IF NOT EXISTS idx_central_logs_origin ON central_logs(origin);
CREATE INDEX IF NOT EXISTS idx_central_logs_type ON central_logs(type);
CREATE INDEX IF NOT EXISTS idx_central_logs_severity ON central_logs(severity);
CREATE INDEX IF NOT EXISTS idx_central_logs_module ON central_logs(module);
CREATE INDEX IF NOT EXISTS idx_central_logs_timestamp ON central_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_central_logs_created_at ON central_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_central_logs_composite 
  ON central_logs(origin, type, severity, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE central_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all logs
CREATE POLICY "Allow authenticated users to read central logs"
  ON central_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert central logs"
  ON central_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Helper function to clean old logs (older than 90 days)
CREATE OR REPLACE FUNCTION clean_old_central_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM central_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Helper function to get log statistics
CREATE OR REPLACE FUNCTION get_central_log_stats(
  time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  origin TEXT,
  type TEXT,
  severity TEXT,
  count BIGINT,
  latest_timestamp TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.origin,
    cl.type,
    cl.severity,
    COUNT(*) as count,
    MAX(cl.timestamp) as latest_timestamp
  FROM central_logs cl
  WHERE cl.timestamp >= NOW() - (time_range_hours || ' hours')::INTERVAL
  GROUP BY cl.origin, cl.type, cl.severity
  ORDER BY count DESC;
END;
$$;

-- Add comment to table
COMMENT ON TABLE central_logs IS 'PATCH 513: Unified central logging system for all platform components';
COMMENT ON FUNCTION clean_old_central_logs IS 'Removes logs older than 90 days';
COMMENT ON FUNCTION get_central_log_stats IS 'Returns aggregated log statistics for specified time range';
