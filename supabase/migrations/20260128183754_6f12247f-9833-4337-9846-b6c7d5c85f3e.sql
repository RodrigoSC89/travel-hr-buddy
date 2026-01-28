-- =====================================================
-- SECURITY HARDENING PATCH 902 - Audit Chain & RLS
-- =====================================================

-- 1. Create tamper-proof audit chain table
CREATE TABLE IF NOT EXISTS public.security_audit_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number BIGSERIAL NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  previous_hash TEXT,
  current_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_security_audit_chain_timestamp ON security_audit_chain(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_chain_user ON security_audit_chain(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_chain_action ON security_audit_chain(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_chain_block ON security_audit_chain(block_number);

-- Enable RLS
ALTER TABLE public.security_audit_chain ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit chain
CREATE POLICY "Admins can view audit chain" ON security_audit_chain
  FOR SELECT USING (public.is_admin());

-- System can insert (via service role)
CREATE POLICY "System can insert audit records" ON security_audit_chain
  FOR INSERT WITH CHECK (true);

-- No updates or deletes allowed (immutable)
-- These policies will simply not exist, making UPDATE/DELETE impossible

-- 2. Function to calculate audit hash
CREATE OR REPLACE FUNCTION public.calculate_audit_hash(
  p_timestamp TIMESTAMPTZ,
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_previous_hash TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      COALESCE(p_timestamp::TEXT, '') || 
      COALESCE(p_user_id::TEXT, '') || 
      COALESCE(p_action_type, '') || 
      COALESCE(p_resource_type, '') || 
      COALESCE(p_previous_hash, 'genesis'),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Trigger to auto-hash audit entries
CREATE OR REPLACE FUNCTION public.auto_hash_audit_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash TEXT;
BEGIN
  -- Get hash of previous record
  SELECT current_hash INTO v_previous_hash
  FROM public.security_audit_chain
  ORDER BY block_number DESC
  LIMIT 1;
  
  -- Set previous hash and calculate new hash
  NEW.previous_hash := v_previous_hash;
  NEW.current_hash := public.calculate_audit_hash(
    NEW.timestamp,
    NEW.user_id,
    NEW.action_type,
    NEW.resource_type,
    v_previous_hash
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_chain_hash_trigger
  BEFORE INSERT ON public.security_audit_chain
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_hash_audit_entry();

-- 4. Function to verify audit chain integrity
CREATE OR REPLACE FUNCTION public.verify_audit_chain_integrity()
RETURNS TABLE (
  is_valid BOOLEAN,
  broken_at_block BIGINT,
  broken_at_id UUID,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
  v_expected_hash TEXT;
  v_previous_hash TEXT := NULL;
BEGIN
  FOR v_record IN
    SELECT * FROM public.security_audit_chain ORDER BY block_number ASC
  LOOP
    -- Calculate expected hash
    v_expected_hash := public.calculate_audit_hash(
      v_record.timestamp,
      v_record.user_id,
      v_record.action_type,
      v_record.resource_type,
      v_previous_hash
    );
    
    -- Verify hash matches
    IF v_expected_hash != v_record.current_hash THEN
      RETURN QUERY SELECT FALSE, v_record.block_number, v_record.id, 'Hash mismatch detected'::TEXT;
      RETURN;
    END IF;
    
    -- Verify chain linkage
    IF v_record.previous_hash IS DISTINCT FROM v_previous_hash THEN
      RETURN QUERY SELECT FALSE, v_record.block_number, v_record.id, 'Chain broken - previous hash mismatch'::TEXT;
      RETURN;
    END IF;
    
    v_previous_hash := v_record.current_hash;
  END LOOP;
  
  RETURN QUERY SELECT TRUE, NULL::BIGINT, NULL::UUID, 'Audit chain is valid and intact'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create blocked_entities table for Fail2Ban persistence
CREATE TABLE IF NOT EXISTS public.blocked_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('ip', 'user', 'api_key')),
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_blocked_entities_identifier ON blocked_entities(identifier);
CREATE INDEX IF NOT EXISTS idx_blocked_entities_expires ON blocked_entities(expires_at);

ALTER TABLE public.blocked_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked entities" ON blocked_entities
  FOR ALL USING (public.is_admin());

-- 6. API key rotation tracking
CREATE TABLE IF NOT EXISTS public.api_key_rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  key_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  revoked_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_api_key_rotations_org ON api_key_rotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_key_rotations_hash ON api_key_rotations(key_hash);

ALTER TABLE public.api_key_rotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys" ON api_key_rotations
  FOR ALL USING (public.is_admin());

-- 7. Harden existing sensitive tables RLS policies
-- Ensure access_logs cannot be modified

DROP POLICY IF EXISTS "prevent_access_log_updates" ON access_logs;
DROP POLICY IF EXISTS "prevent_access_log_deletes" ON access_logs;

-- Create function to prevent modifications
CREATE OR REPLACE FUNCTION public.prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Modification of audit records is not allowed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply to access_logs
DROP TRIGGER IF EXISTS prevent_access_log_update ON access_logs;
CREATE TRIGGER prevent_access_log_update
  BEFORE UPDATE ON access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_modification();

DROP TRIGGER IF EXISTS prevent_access_log_delete ON access_logs;
CREATE TRIGGER prevent_access_log_delete
  BEFORE DELETE ON access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_modification();

-- 8. Add webhook signature verification table
CREATE TABLE IF NOT EXISTS public.webhook_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  endpoint_url TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  algorithm TEXT DEFAULT 'sha256',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.webhook_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage webhooks" ON webhook_signatures
  FOR ALL USING (public.is_admin());

-- 9. Session security enhancements - add device fingerprint
ALTER TABLE public.active_sessions 
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'standard' CHECK (security_level IN ('standard', 'elevated', 'high'));

-- 10. Create security metrics view
CREATE OR REPLACE VIEW public.security_metrics AS
SELECT
  (SELECT COUNT(*) FROM access_logs WHERE action = 'login_failed' AND timestamp > now() - INTERVAL '24 hours') AS failed_logins_24h,
  (SELECT COUNT(*) FROM access_logs WHERE action = 'login_success' AND timestamp > now() - INTERVAL '24 hours') AS successful_logins_24h,
  (SELECT COUNT(*) FROM blocked_entities WHERE expires_at > now()) AS active_blocks,
  (SELECT COUNT(*) FROM active_sessions WHERE is_active = true) AS active_sessions,
  (SELECT COUNT(*) FROM access_logs WHERE severity = 'critical' AND timestamp > now() - INTERVAL '24 hours') AS critical_events_24h,
  (SELECT COUNT(*) FROM security_audit_chain WHERE timestamp > now() - INTERVAL '24 hours') AS audit_entries_24h;