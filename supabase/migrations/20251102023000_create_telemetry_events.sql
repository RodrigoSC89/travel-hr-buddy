-- PATCH 638: Telemetry Events
-- Store user interaction telemetry for UX improvements

CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  element_id TEXT,
  element_name TEXT,
  action TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  user_agent TEXT,
  is_error BOOLEAN DEFAULT FALSE,
  error_message TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_is_error ON telemetry_events(is_error);
CREATE INDEX IF NOT EXISTS idx_telemetry_element_id ON telemetry_events(element_id);

-- Enable RLS
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert their own events
CREATE POLICY "Users can insert own telemetry"
  ON telemetry_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for admins to read all telemetry
CREATE POLICY "Admins can read all telemetry"
  ON telemetry_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to analyze telemetry and suggest improvements
CREATE OR REPLACE FUNCTION analyze_telemetry_issues()
RETURNS TABLE (
  issue_type TEXT,
  element_id TEXT,
  count BIGINT,
  suggestion TEXT
) AS $$
BEGIN
  -- Find elements with excessive clicks
  RETURN QUERY
  SELECT 
    'excessive_clicks'::TEXT,
    t.element_id,
    COUNT(*) as count,
    'Element is being clicked frequently but may not be responding properly'::TEXT
  FROM telemetry_events t
  WHERE t.event_type = 'click'
    AND t.timestamp > NOW() - INTERVAL '24 hours'
  GROUP BY t.element_id
  HAVING COUNT(*) > 50
  ORDER BY COUNT(*) DESC;

  -- Find elements with errors
  RETURN QUERY
  SELECT 
    'error_prone'::TEXT,
    t.element_id,
    COUNT(*) as count,
    CONCAT('Element has ', COUNT(*), ' errors - investigate and fix')::TEXT
  FROM telemetry_events t
  WHERE t.is_error = TRUE
    AND t.timestamp > NOW() - INTERVAL '24 hours'
  GROUP BY t.element_id
  HAVING COUNT(*) > 5
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old telemetry (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_telemetry()
RETURNS void AS $$
BEGIN
  DELETE FROM telemetry_events
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE telemetry_events IS 'PATCH 638: User interaction telemetry for continuous UX improvements';
