-- PATCH 388: User Management - User Audit Logs Table
-- Migration to create user_audit_logs table for tracking user actions

CREATE TABLE IF NOT EXISTS public.user_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_organization ON public.user_audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_user ON public.user_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON public.user_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON public.user_audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view audit logs from their organization"
  ON public.user_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = user_audit_logs.organization_id
      AND role IN ('admin', 'owner')
      AND status = 'active'
    )
  );

CREATE POLICY "System can create audit logs"
  ON public.user_audit_logs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.user_audit_logs TO authenticated;
GRANT USAGE ON SEQUENCE user_audit_logs_id_seq TO authenticated;
