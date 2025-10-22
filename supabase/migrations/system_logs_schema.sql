-- PATCH_25.7: Realtime Diagnostics & Vercel LogSync
-- Supabase Database Schema for system_logs table

-- Create system_logs table for storing runtime and build diagnostics
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  message TEXT,
  context JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(type);

-- Add Row Level Security (RLS) policies
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all logs
CREATE POLICY "Allow authenticated users to read system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert logs
CREATE POLICY "Allow service role to insert system logs"
  ON system_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow anon users to insert logs (for client-side error tracking)
CREATE POLICY "Allow anon users to insert system logs"
  ON system_logs FOR INSERT
  TO anon
  WITH CHECK (true);
