-- Migration: Create certification viewer tokens and quiz system tables
-- ETAPA 35: Automated Testing + Certification Viewer + AI Quiz

-- ============================================
-- 1. CERTIFICATION VIEWER TOKEN SYSTEM
-- ============================================

-- Create cert_view_tokens table for external auditor access
CREATE TABLE IF NOT EXISTS cert_view_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  vessel_id UUID,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  permissions JSONB DEFAULT '{"view_audits": true, "view_documents": true, "view_incidents": false, "view_metrics": true}'::jsonb,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_token ON cert_view_tokens(token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_vessel ON cert_view_tokens(vessel_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cert_view_tokens_expires ON cert_view_tokens(expires_at) WHERE is_active = true;

-- Function to create certification token
CREATE OR REPLACE FUNCTION create_cert_token(
  p_vessel_id UUID,
  p_organization_id UUID,
  p_expires_in_days INTEGER DEFAULT 7,
  p_permissions JSONB DEFAULT '{"view_audits": true, "view_documents": true}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_token UUID;
BEGIN
  INSERT INTO cert_view_tokens (
    vessel_id,
    organization_id,
    created_by,
    expires_at,
    permissions
  ) VALUES (
    p_vessel_id,
    p_organization_id,
    auth.uid(),
    now() + (p_expires_in_days || ' days')::interval,
    p_permissions
  ) RETURNING token INTO v_token;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and track token access
CREATE OR REPLACE FUNCTION validate_cert_token(p_token UUID) 
RETURNS TABLE (
  is_valid BOOLEAN,
  vessel_id UUID,
  organization_id UUID,
  permissions JSONB
) AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  SELECT * INTO v_token_record
  FROM cert_view_tokens
  WHERE token = p_token
    AND is_active = true
    AND expires_at > now();
  
  IF FOUND THEN
    -- Update access tracking
    UPDATE cert_view_tokens
    SET access_count = access_count + 1,
        last_accessed_at = now()
    WHERE token = p_token;
    
    RETURN QUERY SELECT 
      true,
      v_token_record.vessel_id,
      v_token_record.organization_id,
      v_token_record.permissions;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for cert_view_tokens
ALTER TABLE cert_view_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create tokens for their organization"
  ON cert_view_tokens FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their organization's tokens"
  ON cert_view_tokens FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 2. QUIZ SYSTEM
-- ============================================

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES auth.users(id),
  quiz_type TEXT NOT NULL, -- SGSO, IMCA, ISO, ANP, ISM, ISPS
  norm_reference TEXT, -- e.g., 'IMCA M117', 'ISO 9001'
  clause_reference TEXT, -- e.g., '4.2.1'
  difficulty_level TEXT DEFAULT 'intermediate', -- basic, intermediate, advanced
  questions JSONB NOT NULL, -- Array of question objects
  answers JSONB NOT NULL, -- User's answers
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_taken_seconds INTEGER,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_id UUID,
  certificate_valid_until TIMESTAMP WITH TIME ZONE,
  vessel_id UUID,
  organization_id UUID,
  CONSTRAINT valid_quiz_type CHECK (quiz_type IN ('SGSO', 'IMCA', 'ISO', 'ANP', 'ISM', 'ISPS', 'OTHER'))
);

-- Create quiz_templates table for reusable question banks
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quiz_type TEXT NOT NULL,
  norm_reference TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  questions JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  organization_id UUID
);

-- Create indexes for quiz system
CREATE INDEX IF NOT EXISTS idx_quiz_results_crew ON quiz_results(crew_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_type ON quiz_results(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_results_passed ON quiz_results(passed);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON quiz_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_type ON quiz_templates(quiz_type);

-- Function to calculate quiz score
CREATE OR REPLACE FUNCTION calculate_quiz_score(
  p_questions JSONB,
  p_answers JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_total_questions INTEGER;
  v_correct_answers INTEGER := 0;
  v_question JSONB;
  v_i INTEGER;
BEGIN
  v_total_questions := jsonb_array_length(p_questions);
  
  FOR v_i IN 0..v_total_questions-1 LOOP
    v_question := p_questions->v_i;
    
    -- Compare answer with correct answer
    IF (v_question->>'correct_answer') = (p_answers->v_i->>'answer') THEN
      v_correct_answers := v_correct_answers + 1;
    END IF;
  END LOOP;
  
  RETURN (v_correct_answers * 100 / v_total_questions);
END;
$$ LANGUAGE plpgsql;

-- Function to issue certificate for passed quiz
CREATE OR REPLACE FUNCTION issue_quiz_certificate(p_quiz_result_id UUID)
RETURNS UUID AS $$
DECLARE
  v_certificate_id UUID;
  v_quiz_record RECORD;
BEGIN
  SELECT * INTO v_quiz_record
  FROM quiz_results
  WHERE id = p_quiz_result_id
    AND passed = true
    AND certificate_issued = false;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  v_certificate_id := gen_random_uuid();
  
  UPDATE quiz_results
  SET certificate_issued = true,
      certificate_id = v_certificate_id,
      certificate_valid_until = now() + interval '1 year'
  WHERE id = p_quiz_result_id;
  
  RETURN v_certificate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for quiz system
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz results"
  ON quiz_results FOR SELECT
  USING (crew_id = auth.uid());

CREATE POLICY "Users can insert their own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (crew_id = auth.uid());

CREATE POLICY "Users can view quiz templates in their organization"
  ON quiz_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    ) OR is_active = true
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON cert_view_tokens TO authenticated;
GRANT ALL ON quiz_results TO authenticated;
GRANT ALL ON quiz_templates TO authenticated;

-- Comments for documentation
COMMENT ON TABLE cert_view_tokens IS 'Token-based access for external auditors and certification bodies';
COMMENT ON TABLE quiz_results IS 'Quiz results and certification records for crew compliance assessment';
COMMENT ON TABLE quiz_templates IS 'Reusable question banks for compliance quizzes';
COMMENT ON FUNCTION create_cert_token IS 'Creates a time-limited access token for external auditors';
COMMENT ON FUNCTION validate_cert_token IS 'Validates token and tracks access for audit trail';
COMMENT ON FUNCTION calculate_quiz_score IS 'Calculates quiz score based on correct answers';
COMMENT ON FUNCTION issue_quiz_certificate IS 'Issues a certificate for passed quizzes';
