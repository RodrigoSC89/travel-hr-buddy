-- ETAPA 35: AI-Powered Quiz System
-- Create tables for quiz management and results

-- Quiz templates table for reusable question banks
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  standard TEXT NOT NULL, -- SGSO, IMCA, ISO, ANP, ISM Code, ISPS Code
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Basic', 'Intermediate', 'Advanced')),
  questions JSONB NOT NULL, -- Array of question objects
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 30,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[]
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL,
  quiz_template_id UUID REFERENCES quiz_templates(id) ON DELETE SET NULL,
  standard TEXT NOT NULL, -- SGSO, IMCA, ISO, ANP, ISM Code, ISPS Code
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Basic', 'Intermediate', 'Advanced')),
  questions JSONB NOT NULL, -- Array of questions asked
  answers JSONB NOT NULL, -- Array of user answers
  score INTEGER NOT NULL, -- Percentage score
  passed BOOLEAN NOT NULL,
  time_taken_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  certificate_url TEXT,
  certificate_generated BOOLEAN DEFAULT FALSE,
  certificate_generated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_templates_org ON quiz_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_standard ON quiz_templates(standard);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_difficulty ON quiz_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_templates_active ON quiz_templates(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_org ON quiz_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_vessel ON quiz_results(vessel_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_template ON quiz_results(quiz_template_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_standard ON quiz_results(standard);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON quiz_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_passed ON quiz_results(passed);

-- Enable RLS
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_templates
CREATE POLICY "Users can view templates for their organization"
  ON quiz_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create templates"
  ON quiz_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = quiz_templates.organization_id
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update templates"
  ON quiz_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = quiz_templates.organization_id
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete templates"
  ON quiz_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = quiz_templates.organization_id
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for quiz_results
CREATE POLICY "Users can view their own results"
  ON quiz_results FOR SELECT
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can insert their own results"
  ON quiz_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update results"
  ON quiz_results FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Function to get quiz statistics for a user
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_quizzes INTEGER,
  passed_quizzes INTEGER,
  failed_quizzes INTEGER,
  average_score NUMERIC,
  best_score INTEGER,
  recent_quizzes JSONB
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
    COUNT(*)::INTEGER as total_quizzes,
    COUNT(*) FILTER (WHERE passed)::INTEGER as passed_quizzes,
    COUNT(*) FILTER (WHERE NOT passed)::INTEGER as failed_quizzes,
    ROUND(AVG(score), 2) as average_score,
    MAX(score)::INTEGER as best_score,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'standard', standard,
        'difficulty', difficulty,
        'score', score,
        'passed', passed,
        'completed_at', completed_at
      ) ORDER BY completed_at DESC
    ) FILTER (WHERE completed_at >= NOW() - INTERVAL '30 days') as recent_quizzes
  FROM quiz_results
  WHERE user_id = v_user_id;
END;
$$;

-- Function to get organization quiz statistics
CREATE OR REPLACE FUNCTION get_org_quiz_stats(p_organization_id UUID)
RETURNS TABLE (
  total_users INTEGER,
  total_quizzes INTEGER,
  average_score NUMERIC,
  pass_rate NUMERIC,
  by_standard JSONB,
  by_difficulty JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = p_organization_id
    AND role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to view organization statistics';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT qr.user_id)::INTEGER as total_users,
    COUNT(*)::INTEGER as total_quizzes,
    ROUND(AVG(qr.score), 2) as average_score,
    ROUND(
      (COUNT(*) FILTER (WHERE qr.passed)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as pass_rate,
    jsonb_object_agg(
      qr.standard,
      jsonb_build_object(
        'count', COUNT(*),
        'average_score', ROUND(AVG(qr.score), 2),
        'pass_rate', ROUND(
          (COUNT(*) FILTER (WHERE qr.passed)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
          2
        )
      )
    ) as by_standard,
    jsonb_object_agg(
      qr.difficulty,
      jsonb_build_object(
        'count', COUNT(*),
        'average_score', ROUND(AVG(qr.score), 2)
      )
    ) as by_difficulty
  FROM quiz_results qr
  WHERE qr.organization_id = p_organization_id
  GROUP BY qr.organization_id;
END;
$$;

-- Function to generate certificate URL
CREATE OR REPLACE FUNCTION generate_quiz_certificate(p_quiz_result_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_certificate_url TEXT;
  v_user_id UUID;
  v_score INTEGER;
  v_passed BOOLEAN;
BEGIN
  -- Get quiz result details
  SELECT user_id, score, passed
  INTO v_user_id, v_score, v_passed
  FROM quiz_results
  WHERE id = p_quiz_result_id;
  
  -- Check if user owns this result
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to quiz result';
  END IF;
  
  -- Check if quiz was passed
  IF NOT v_passed THEN
    RAISE EXCEPTION 'Certificate can only be generated for passed quizzes';
  END IF;
  
  -- Generate certificate URL (in production, this would generate actual certificate)
  v_certificate_url := '/certificates/' || p_quiz_result_id || '.pdf';
  
  -- Update quiz result
  UPDATE quiz_results
  SET 
    certificate_url = v_certificate_url,
    certificate_generated = TRUE,
    certificate_generated_at = NOW()
  WHERE id = p_quiz_result_id;
  
  RETURN v_certificate_url;
END;
$$;

-- Add comments
COMMENT ON TABLE quiz_templates IS 'ETAPA 35: Reusable quiz templates for compliance assessment';
COMMENT ON TABLE quiz_results IS 'ETAPA 35: Quiz results and certificates for crew compliance training';
