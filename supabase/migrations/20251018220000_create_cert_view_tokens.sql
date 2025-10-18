-- Create cert_view_tokens table for External Auditor Certification Viewer
-- This allows external auditors to access specific vessel certifications via secure tokens

CREATE TABLE IF NOT EXISTS cert_view_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  
  -- Permissions configuration
  can_view_audits BOOLEAN DEFAULT true,
  can_view_documents BOOLEAN DEFAULT true,
  can_view_metrics BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  auditor_name TEXT,
  auditor_email TEXT,
  
  -- Audit trail
  ip_addresses TEXT[], -- Array of IPs that accessed the token
  user_agents TEXT[]   -- Array of user agents that accessed the token
);

-- Create index for faster token lookups
CREATE INDEX idx_cert_view_tokens_token ON cert_view_tokens(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_cert_view_tokens_vessel ON cert_view_tokens(vessel_id);
CREATE INDEX idx_cert_view_tokens_expires ON cert_view_tokens(expires_at) WHERE revoked_at IS NULL;

-- Enable Row Level Security
ALTER TABLE cert_view_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view tokens they created
CREATE POLICY "Users can view their own tokens"
  ON cert_view_tokens
  FOR SELECT
  USING (auth.uid() = created_by);

-- Allow authenticated users to create tokens for their organization's vessels
CREATE POLICY "Users can create tokens for their organization"
  ON cert_view_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = cert_view_tokens.organization_id
    )
  );

-- Allow authenticated users to update (revoke) tokens they created
CREATE POLICY "Users can update their own tokens"
  ON cert_view_tokens
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Function to create a certification token
CREATE OR REPLACE FUNCTION create_cert_token(
  p_vessel_id UUID,
  p_organization_id UUID,
  p_expires_in_days INTEGER DEFAULT 7,
  p_auditor_name TEXT DEFAULT NULL,
  p_auditor_email TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a secure random token
  v_token := encode(gen_random_bytes(32), 'base64');
  v_token := replace(replace(replace(v_token, '+', '-'), '/', '_'), '=', '');
  
  -- Calculate expiration
  v_expires_at := now() + (p_expires_in_days || ' days')::INTERVAL;
  
  -- Insert the token
  INSERT INTO cert_view_tokens (
    token,
    vessel_id,
    organization_id,
    created_by,
    expires_at,
    auditor_name,
    auditor_email,
    notes
  ) VALUES (
    v_token,
    p_vessel_id,
    p_organization_id,
    auth.uid(),
    v_expires_at,
    p_auditor_name,
    p_auditor_email,
    p_notes
  );
  
  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate a certification token
CREATE OR REPLACE FUNCTION validate_cert_token(
  p_token TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  vessel_id UUID,
  organization_id UUID,
  can_view_audits BOOLEAN,
  can_view_documents BOOLEAN,
  can_view_metrics BOOLEAN,
  auditor_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Find the token
  SELECT * INTO v_record
  FROM cert_view_tokens
  WHERE token = p_token
  AND revoked_at IS NULL
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, false, false, false, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Update access tracking
  UPDATE cert_view_tokens
  SET 
    last_accessed_at = now(),
    access_count = access_count + 1,
    ip_addresses = CASE 
      WHEN p_ip_address IS NOT NULL THEN 
        array_append(COALESCE(ip_addresses, ARRAY[]::TEXT[]), p_ip_address)
      ELSE ip_addresses
    END,
    user_agents = CASE 
      WHEN p_user_agent IS NOT NULL THEN 
        array_append(COALESCE(user_agents, ARRAY[]::TEXT[]), p_user_agent)
      ELSE user_agents
    END
  WHERE token = p_token;
  
  RETURN QUERY SELECT 
    true,
    v_record.vessel_id,
    v_record.organization_id,
    v_record.can_view_audits,
    v_record.can_view_documents,
    v_record.can_view_metrics,
    v_record.auditor_name,
    v_record.expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke a certification token
CREATE OR REPLACE FUNCTION revoke_cert_token(p_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE cert_view_tokens
  SET revoked_at = now()
  WHERE token = p_token
  AND created_by = auth.uid()
  AND revoked_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired tokens (to be run by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_cert_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM cert_view_tokens
  WHERE expires_at < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE cert_view_tokens IS 'Secure tokens for external auditor access to vessel certifications';
COMMENT ON FUNCTION create_cert_token IS 'Creates a new certification viewer token with configurable expiration';
COMMENT ON FUNCTION validate_cert_token IS 'Validates a token and returns associated permissions and data';
COMMENT ON FUNCTION revoke_cert_token IS 'Revokes a certification token (can only revoke own tokens)';
COMMENT ON FUNCTION cleanup_expired_cert_tokens IS 'Removes expired tokens older than 30 days';
