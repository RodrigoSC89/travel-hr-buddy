-- Create assistant_logs table to store AI assistant query history
CREATE TABLE IF NOT EXISTS assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  action TEXT,
  target TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_id ON assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON assistant_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_user_email ON assistant_logs(user_email);

-- Enable Row Level Security
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for assistant_logs
-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own logs"
  ON assistant_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow admin users to view all logs
CREATE POLICY "Admins can view all logs"
  ON assistant_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow users to view their own logs
CREATE POLICY "Users can view their own logs"
  ON assistant_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
