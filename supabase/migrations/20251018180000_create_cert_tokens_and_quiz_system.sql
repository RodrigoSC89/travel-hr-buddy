-- ETAPA 35: External Auditor Certification Viewer + AI Quiz System
-- This migration creates tables and functions for:
-- 1. Token-based certification viewer for external auditors
-- 2. AI-powered quiz system for compliance assessment

-- =====================================================
-- PART 1: External Auditor Certification Viewer
-- =====================================================

-- Create cert_view_tokens table for token-based access
CREATE TABLE IF NOT EXISTS cert_view_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  permissions JSONB DEFAULT '{"view_audits": true, "view_documents": true, "view_metrics": true}'::jsonb,
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_token ON cert_view_tokens(token);
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_vessel ON cert_view_tokens(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_org ON cert_view_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_expires ON cert_view_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_active ON cert_view_tokens(is_active);

-- Enable RLS
ALTER TABLE cert_view_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cert_view_tokens
CREATE POLICY "Users can view their organization's tokens"
  ON cert_view_tokens FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create tokens"
  ON cert_view_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update tokens"
  ON cert_view_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function to create certification token
CREATE OR REPLACE FUNCTION create_cert_token(
  p_vessel_id UUID,
  p_organization_id UUID,
  p_expires_in_days INTEGER DEFAULT 7,
  p_permissions JSONB DEFAULT '{"view_audits": true, "view_documents": true, "view_metrics": true}'::jsonb,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token UUID;
  v_user_role TEXT;
BEGIN
  -- Check if user is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE user_id = auth.uid();

  IF v_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only admins can create certification tokens';
  END IF;

  -- Insert new token
  INSERT INTO cert_view_tokens (
    vessel_id,
    organization_id,
    created_by,
    expires_at,
    permissions,
    notes
  ) VALUES (
    p_vessel_id,
    p_organization_id,
    auth.uid(),
    NOW() + (p_expires_in_days || ' days')::INTERVAL,
    p_permissions,
    p_notes
  )
  RETURNING token INTO v_token;

  RETURN v_token;
END;
$$;

-- Function to validate certification token
CREATE OR REPLACE FUNCTION validate_cert_token(p_token UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  vessel_id UUID,
  organization_id UUID,
  permissions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Get token record
  SELECT * INTO v_token_record
  FROM cert_view_tokens
  WHERE token = p_token
    AND is_active = TRUE
    AND expires_at > NOW();

  IF FOUND THEN
    -- Update access tracking
    UPDATE cert_view_tokens
    SET view_count = view_count + 1,
        last_accessed_at = NOW()
    WHERE token = p_token;

    -- Return validation result
    RETURN QUERY
    SELECT 
      TRUE as is_valid,
      v_token_record.vessel_id,
      v_token_record.organization_id,
      v_token_record.permissions;
  ELSE
    -- Token not found or expired
    RETURN QUERY
    SELECT 
      FALSE as is_valid,
      NULL::UUID as vessel_id,
      NULL::UUID as organization_id,
      NULL::JSONB as permissions;
  END IF;
END;
$$;

-- =====================================================
-- PART 2: AI-Powered Quiz System
-- =====================================================

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL,
  quiz_type TEXT NOT NULL, -- SGSO, IMCA, ISO, ANP, ISM, ISPS
  difficulty_level TEXT NOT NULL, -- basic, intermediate, advanced
  norm_reference TEXT,
  clause_reference TEXT,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_id UUID,
  certificate_valid_until TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_taken_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_org ON quiz_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_vessel ON quiz_results(vessel_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_type ON quiz_results(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_results_passed ON quiz_results(passed);
CREATE INDEX IF NOT EXISTS idx_quiz_results_cert ON quiz_results(certificate_issued);

-- Enable RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_results
CREATE POLICY "Users can view their own quiz results"
  ON quiz_results FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all quiz results in their organization"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
      AND organization_id = quiz_results.organization_id
    )
  );

-- Create quiz_templates table for reusable question banks
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  norm_reference TEXT,
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_templates_org ON quiz_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_type ON quiz_templates(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_active ON quiz_templates(is_active);

-- Enable RLS
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_templates
CREATE POLICY "Users can view templates in their organization"
  ON quiz_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage templates"
  ON quiz_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function to issue certificate after passing quiz
CREATE OR REPLACE FUNCTION issue_quiz_certificate(p_quiz_result_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_certificate_id UUID;
  v_quiz_record RECORD;
BEGIN
  -- Get quiz result
  SELECT * INTO v_quiz_record
  FROM quiz_results
  WHERE id = p_quiz_result_id
    AND user_id = auth.uid()
    AND passed = TRUE
    AND certificate_issued = FALSE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz result not found or certificate already issued';
  END IF;

  -- Generate certificate ID
  v_certificate_id := gen_random_uuid();

  -- Update quiz result with certificate info
  UPDATE quiz_results
  SET certificate_issued = TRUE,
      certificate_id = v_certificate_id,
      certificate_valid_until = NOW() + INTERVAL '1 year'
  WHERE id = p_quiz_result_id;

  RETURN v_certificate_id;
END;
$$;

-- Function to get user's quiz statistics
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  quiz_type TEXT,
  total_attempts INTEGER,
  passed_attempts INTEGER,
  average_score NUMERIC,
  best_score INTEGER,
  latest_attempt TIMESTAMPTZ,
  has_valid_certificate BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT 
    qr.quiz_type,
    COUNT(*)::INTEGER as total_attempts,
    COUNT(*) FILTER (WHERE qr.passed)::INTEGER as passed_attempts,
    ROUND(AVG(qr.score)::NUMERIC, 2) as average_score,
    MAX(qr.score) as best_score,
    MAX(qr.completed_at) as latest_attempt,
    EXISTS (
      SELECT 1 FROM quiz_results cert
      WHERE cert.user_id = v_user_id
        AND cert.quiz_type = qr.quiz_type
        AND cert.certificate_issued = TRUE
        AND cert.certificate_valid_until > NOW()
    ) as has_valid_certificate
  FROM quiz_results qr
  WHERE qr.user_id = v_user_id
  GROUP BY qr.quiz_type;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON cert_view_tokens TO anon;
GRANT ALL ON quiz_results TO authenticated;
GRANT ALL ON quiz_templates TO authenticated;

-- Comments for documentation
COMMENT ON TABLE cert_view_tokens IS 'Token-based access for external auditors to view certification data';
COMMENT ON TABLE quiz_results IS 'Stores quiz attempts, scores, and certificate information';
COMMENT ON TABLE quiz_templates IS 'Reusable question banks for quizzes';
COMMENT ON FUNCTION create_cert_token IS 'Creates a time-limited certification token for external auditors';
COMMENT ON FUNCTION validate_cert_token IS 'Validates a certification token and tracks access';
COMMENT ON FUNCTION issue_quiz_certificate IS 'Issues a certificate after passing a quiz';
COMMENT ON FUNCTION get_user_quiz_stats IS 'Returns quiz statistics for a user';
