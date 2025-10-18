-- ETAPA 35: External Auditor Certification Viewer
-- Create cert_view_tokens table for token-based access

CREATE TABLE IF NOT EXISTS cert_view_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '{
    "view_audits": true,
    "view_documents": true,
    "view_metrics": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_token ON cert_view_tokens(token) WHERE NOT revoked;
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_vessel ON cert_view_tokens(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_org ON cert_view_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_expires ON cert_view_tokens(expires_at) WHERE NOT revoked;

-- Enable RLS
ALTER TABLE cert_view_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view tokens for their organization"
  ON cert_view_tokens FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create tokens"
  ON cert_view_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = cert_view_tokens.organization_id
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update tokens"
  ON cert_view_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = cert_view_tokens.organization_id
      AND role IN ('admin', 'manager')
    )
  );

-- Function to create certification token
CREATE OR REPLACE FUNCTION create_cert_token(
  p_vessel_id UUID,
  p_organization_id UUID,
  p_expires_in_days INTEGER DEFAULT 7,
  p_permissions JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = p_organization_id
    AND role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to create certification token';
  END IF;
  
  -- Calculate expiration
  v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  
  -- Insert token
  INSERT INTO cert_view_tokens (
    vessel_id,
    organization_id,
    expires_at,
    permissions,
    notes,
    created_by
  ) VALUES (
    p_vessel_id,
    p_organization_id,
    v_expires_at,
    COALESCE(p_permissions, '{
      "view_audits": true,
      "view_documents": true,
      "view_metrics": true
    }'::jsonb),
    p_notes,
    auth.uid()
  )
  RETURNING token INTO v_token;
  
  RETURN v_token;
END;
$$;

-- Function to validate and track token usage
CREATE OR REPLACE FUNCTION validate_cert_token(p_token UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  vessel_id UUID,
  organization_id UUID,
  permissions JSONB,
  vessel_name TEXT,
  organization_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update view count and last accessed
  UPDATE cert_view_tokens
  SET 
    view_count = view_count + 1,
    last_accessed_at = NOW()
  WHERE token = p_token
    AND NOT revoked
    AND expires_at > NOW();
  
  -- Return token information
  RETURN QUERY
  SELECT 
    CASE 
      WHEN cvt.token IS NOT NULL THEN TRUE
      ELSE FALSE
    END as is_valid,
    cvt.vessel_id,
    cvt.organization_id,
    cvt.permissions,
    v.name as vessel_name,
    o.name as organization_name
  FROM cert_view_tokens cvt
  LEFT JOIN vessels v ON v.id = cvt.vessel_id
  LEFT JOIN organizations o ON o.id = cvt.organization_id
  WHERE cvt.token = p_token
    AND NOT cvt.revoked
    AND cvt.expires_at > NOW();
END;
$$;

-- Function to revoke token
CREATE OR REPLACE FUNCTION revoke_cert_token(p_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id UUID;
BEGIN
  -- Get token's organization
  SELECT organization_id INTO v_organization_id
  FROM cert_view_tokens
  WHERE token = p_token;
  
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = v_organization_id
    AND role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to revoke token';
  END IF;
  
  -- Revoke token
  UPDATE cert_view_tokens
  SET 
    revoked = TRUE,
    revoked_at = NOW(),
    revoked_by = auth.uid()
  WHERE token = p_token;
  
  RETURN TRUE;
END;
$$;

-- Add comment
COMMENT ON TABLE cert_view_tokens IS 'ETAPA 35: Token-based access for external auditors to view compliance data';
