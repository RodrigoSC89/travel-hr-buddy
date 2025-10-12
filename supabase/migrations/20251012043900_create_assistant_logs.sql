-- Create assistant_logs table for tracking all AI Assistant interactions
CREATE TABLE IF NOT EXISTS assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  origin VARCHAR(50) DEFAULT 'assistant' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON assistant_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_origin ON assistant_logs(origin);

-- Enable Row Level Security
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own assistant logs"
  ON assistant_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admin users can view all logs
CREATE POLICY "Admin users can view all assistant logs"
  ON assistant_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Authenticated users can insert their own logs
CREATE POLICY "Users can insert their own assistant logs"
  ON assistant_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can insert logs (for API route)
CREATE POLICY "Service role can insert assistant logs"
  ON assistant_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE assistant_logs IS 'Stores all AI Assistant interactions for audit trails and user history';
