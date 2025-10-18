-- Tabela para tokens de visualização de certificadoras
-- Permite acesso temporário de leitura para auditores externos

CREATE TABLE IF NOT EXISTS cert_view_tokens (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{
    "view_audits": true,
    "view_documents": true,
    "view_incidents": true,
    "view_metrics": true
  }'::jsonb,
  notes TEXT
);

-- Índices para otimização de consultas
CREATE INDEX idx_cert_tokens_vessel ON cert_view_tokens(vessel_id);
CREATE INDEX idx_cert_tokens_org ON cert_view_tokens(organization_id);
CREATE INDEX idx_cert_tokens_expires ON cert_view_tokens(expires_at);
CREATE INDEX idx_cert_tokens_active ON cert_view_tokens(is_active) WHERE is_active = TRUE;

-- RLS policies
ALTER TABLE cert_view_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver tokens da sua organização
CREATE POLICY "Users can view tokens from their organization"
  ON cert_view_tokens
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Admins podem criar tokens
CREATE POLICY "Admins can create tokens"
  ON cert_view_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = cert_view_tokens.organization_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins podem atualizar tokens
CREATE POLICY "Admins can update tokens"
  ON cert_view_tokens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = cert_view_tokens.organization_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function para validar token e retornar permissões
CREATE OR REPLACE FUNCTION validate_cert_token(token_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Busca token válido
  SELECT jsonb_build_object(
    'valid', TRUE,
    'vessel_id', vessel_id,
    'organization_id', organization_id,
    'permissions', permissions,
    'expires_at', expires_at
  )
  INTO result
  FROM cert_view_tokens
  WHERE token = token_id
    AND is_active = TRUE
    AND expires_at > NOW();
  
  -- Se token encontrado, incrementa contador de acesso
  IF result IS NOT NULL THEN
    UPDATE cert_view_tokens
    SET 
      accessed_at = NOW(),
      access_count = access_count + 1
    WHERE token = token_id;
  ELSE
    -- Token inválido ou expirado
    result := jsonb_build_object('valid', FALSE);
  END IF;
  
  RETURN result;
END;
$$;

-- Function para criar novo token
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
  new_token UUID;
BEGIN
  INSERT INTO cert_view_tokens (
    vessel_id,
    organization_id,
    expires_at,
    created_by,
    permissions,
    notes
  ) VALUES (
    p_vessel_id,
    p_organization_id,
    NOW() + (p_expires_in_days || ' days')::INTERVAL,
    auth.uid(),
    COALESCE(p_permissions, '{
      "view_audits": true,
      "view_documents": true,
      "view_incidents": true,
      "view_metrics": true
    }'::jsonb),
    p_notes
  )
  RETURNING token INTO new_token;
  
  RETURN new_token;
END;
$$;

-- Function para revogar token
CREATE OR REPLACE FUNCTION revoke_cert_token(token_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cert_view_tokens
  SET is_active = FALSE
  WHERE token = token_id
    AND organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    );
  
  RETURN FOUND;
END;
$$;

COMMENT ON TABLE cert_view_tokens IS 'Tokens de acesso temporário para visualização de certificadoras externas';
COMMENT ON FUNCTION validate_cert_token IS 'Valida token e retorna permissões de acesso';
COMMENT ON FUNCTION create_cert_token IS 'Cria novo token de acesso com prazo de validade';
COMMENT ON FUNCTION revoke_cert_token IS 'Revoga token de acesso';
