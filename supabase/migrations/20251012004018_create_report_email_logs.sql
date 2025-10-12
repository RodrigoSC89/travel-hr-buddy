-- Create report_email_logs table for tracking email report sends
CREATE TABLE IF NOT EXISTS report_email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  error_details TEXT,
  report_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_report_email_logs_sent_at ON report_email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_email_logs_status ON report_email_logs(status);
CREATE INDEX IF NOT EXISTS idx_report_email_logs_report_type ON report_email_logs(report_type);

-- Enable Row Level Security (RLS)
ALTER TABLE report_email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin read access
CREATE POLICY "Admin users can view email logs"
  ON report_email_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Create policy for service role to insert logs
CREATE POLICY "Service role can insert email logs"
  ON report_email_logs
  FOR INSERT
  WITH CHECK (true);
