-- PATCH 535 - Supabase RLS Security Enhancement
-- Enable Row-Level Security on critical tables
-- Created: 2025-10-29

-- =============================================================================
-- 1. Enable RLS on financial_transactions table
-- =============================================================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Finance admins can view all transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Finance admins can manage all transactions" ON public.financial_transactions;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.financial_transactions
  FOR SELECT
  USING (
    auth.uid() = created_by::uuid
    OR
    auth.uid() IN (
      SELECT user_id 
      FROM public.profiles 
      WHERE role IN ('admin', 'finance_manager')
    )
  );

-- Policy: Users can insert transactions
CREATE POLICY "Users can insert their own transactions"
  ON public.financial_transactions
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by::uuid
  );

-- Policy: Finance admins can view all transactions
CREATE POLICY "Finance admins can view all transactions"
  ON public.financial_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'finance_manager')
    )
  );

-- Policy: Finance admins can update transactions
CREATE POLICY "Finance admins can update transactions"
  ON public.financial_transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'finance_manager')
    )
  );

-- =============================================================================
-- 2. Enable RLS on logs table (general system logs)
-- =============================================================================

-- Enable RLS on logs table
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.logs;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own logs"
  ON public.logs
  FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'system_admin')
    )
  );

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON public.logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'system_admin')
    )
  );

-- Policy: System can insert logs (authenticated users)
CREATE POLICY "Authenticated users can insert logs"
  ON public.logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- =============================================================================
-- 3. Verify crew_members RLS (already enabled, add additional policies)
-- =============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.crew_members ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for consistency
DROP POLICY IF EXISTS "Crew members can view their own data" ON public.crew_members;
DROP POLICY IF EXISTS "HR can manage all crew members" ON public.crew_members;
DROP POLICY IF EXISTS "Managers can view crew members" ON public.crew_members;

-- Policy: Crew members can view their own data
CREATE POLICY "Crew members can view their own data"
  ON public.crew_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_manager', 'operations_manager')
    )
  );

-- Policy: HR managers can manage all crew members
CREATE POLICY "HR managers can manage all crew members"
  ON public.crew_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_manager')
    )
  );

-- Policy: Operations managers can view crew members
CREATE POLICY "Operations managers can view crew members"
  ON public.crew_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'operations_manager')
    )
  );

-- =============================================================================
-- 4. Create access_logs table for audit trail
-- =============================================================================

-- Create access_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON public.access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource_type ON public.access_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON public.access_logs(status);

-- Enable RLS on access_logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own access logs
CREATE POLICY "Users can view their own access logs"
  ON public.access_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'security_admin')
    )
  );

-- Policy: System can insert access logs
CREATE POLICY "System can insert access logs"
  ON public.access_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Policy: Admins can view all access logs
CREATE POLICY "Admins can view all access logs"
  ON public.access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'security_admin')
    )
  );

-- =============================================================================
-- 5. Create helper function to log access
-- =============================================================================

-- Function to log access
CREATE OR REPLACE FUNCTION public.log_access(
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.access_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    status,
    error_message,
    metadata,
    created_at
  )
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_status,
    p_error_message,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_access TO authenticated;

-- =============================================================================
-- 6. Create trigger functions for automatic access logging
-- =============================================================================

-- Function to log crew_members access
CREATE OR REPLACE FUNCTION public.log_crew_members_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.log_access(
      'INSERT',
      'crew_members',
      NEW.id::text,
      'success',
      NULL,
      jsonb_build_object('name', NEW.name, 'role', NEW.role)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM public.log_access(
      'UPDATE',
      'crew_members',
      NEW.id::text,
      'success',
      NULL,
      jsonb_build_object('changed_fields', to_jsonb(NEW) - to_jsonb(OLD))
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.log_access(
      'DELETE',
      'crew_members',
      OLD.id::text,
      'success',
      NULL,
      jsonb_build_object('name', OLD.name)
    );
    RETURN OLD;
  END IF;
END;
$$;

-- Function to log financial_transactions access
CREATE OR REPLACE FUNCTION public.log_financial_transactions_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.log_access(
      'INSERT',
      'financial_transactions',
      NEW.id::text,
      'success',
      NULL,
      jsonb_build_object('type', NEW.type, 'amount', NEW.amount, 'category', NEW.category)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM public.log_access(
      'UPDATE',
      'financial_transactions',
      NEW.id::text,
      'success',
      NULL,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.log_access(
      'DELETE',
      'financial_transactions',
      OLD.id::text,
      'success',
      NULL,
      jsonb_build_object('type', OLD.type, 'amount', OLD.amount)
    );
    RETURN OLD;
  END IF;
END;
$$;

-- Create triggers for automatic logging
DROP TRIGGER IF EXISTS trigger_log_crew_members_access ON public.crew_members;
CREATE TRIGGER trigger_log_crew_members_access
  AFTER INSERT OR UPDATE OR DELETE ON public.crew_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_crew_members_access();

DROP TRIGGER IF EXISTS trigger_log_financial_transactions_access ON public.financial_transactions;
CREATE TRIGGER trigger_log_financial_transactions_access
  AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_transactions_access();

-- =============================================================================
-- 7. Comments for documentation
-- =============================================================================

COMMENT ON TABLE public.access_logs IS 'PATCH 535: Audit trail for all access to critical resources';
COMMENT ON FUNCTION public.log_access IS 'PATCH 535: Helper function to log user access to resources';
COMMENT ON FUNCTION public.log_crew_members_access IS 'PATCH 535: Automatic logging for crew_members table operations';
COMMENT ON FUNCTION public.log_financial_transactions_access IS 'PATCH 535: Automatic logging for financial_transactions table operations';

-- =============================================================================
-- 8. Grant appropriate permissions
-- =============================================================================

-- Grant select on access_logs to authenticated users (their own data only, via RLS)
GRANT SELECT ON public.access_logs TO authenticated;
GRANT INSERT ON public.access_logs TO authenticated;

-- =============================================================================
-- Verification Queries (for testing)
-- =============================================================================

-- Verify RLS is enabled
DO $$
BEGIN
  RAISE NOTICE 'RLS Status Check:';
  RAISE NOTICE 'crew_members RLS: %', (
    SELECT relrowsecurity FROM pg_class WHERE relname = 'crew_members'
  );
  RAISE NOTICE 'financial_transactions RLS: %', (
    SELECT relrowsecurity FROM pg_class WHERE relname = 'financial_transactions'
  );
  RAISE NOTICE 'logs RLS: %', (
    SELECT relrowsecurity FROM pg_class WHERE relname = 'logs'
  );
  RAISE NOTICE 'access_logs RLS: %', (
    SELECT relrowsecurity FROM pg_class WHERE relname = 'access_logs'
  );
END $$;
