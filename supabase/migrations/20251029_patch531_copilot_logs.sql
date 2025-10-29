-- PATCH 531 - Navigation Copilot v2 - Multimodal Command Logs
-- Database schema for copilot decision and command logs

-- Create table for copilot decision logs
CREATE TABLE IF NOT EXISTS copilot_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  command_action TEXT NOT NULL,
  command_parameters JSONB DEFAULT '{}'::jsonb,
  command_confidence DECIMAL(3,2),
  response_text TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_copilot_logs_user_id ON copilot_decision_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_logs_timestamp ON copilot_decision_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_copilot_logs_action ON copilot_decision_logs(command_action);
CREATE INDEX IF NOT EXISTS idx_copilot_logs_success ON copilot_decision_logs(success);

-- Add RLS policies
ALTER TABLE copilot_decision_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own logs
CREATE POLICY "Users can view own copilot logs"
  ON copilot_decision_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own logs
CREATE POLICY "Users can insert own copilot logs"
  ON copilot_decision_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_copilot_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER copilot_logs_updated_at
  BEFORE UPDATE ON copilot_decision_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_copilot_logs_updated_at();

-- Comments
COMMENT ON TABLE copilot_decision_logs IS 'PATCH 531 - Logs for Navigation Copilot voice and text commands';
COMMENT ON COLUMN copilot_decision_logs.command_action IS 'Type of action: navigate, reroute, find_port, weather, avoid_area, optimize_route';
COMMENT ON COLUMN copilot_decision_logs.command_confidence IS 'AI confidence score from 0.00 to 1.00';
COMMENT ON COLUMN copilot_decision_logs.success IS 'Whether the command was successfully executed';
