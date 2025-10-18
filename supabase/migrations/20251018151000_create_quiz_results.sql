-- Tabela para resultados de quiz de avaliação de conformidade
-- Armazena resultados de quizzes gerados por IA para tripulação

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL, -- SGSO, IMCA, ISO, ANP, etc.
  norm_reference TEXT, -- e.g., "IMCA M117", "ISO 9001", "ANP 43/2007"
  clause_reference TEXT, -- e.g., "4.2.1", "Anexo II"
  quiz_data JSONB NOT NULL, -- Perguntas e alternativas
  answers JSONB, -- Respostas do usuário
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  passing_score INTEGER DEFAULT 80,
  time_taken_seconds INTEGER,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_number TEXT GENERATED ALWAYS AS (
    'CERT-' || UPPER(quiz_type) || '-' || TO_CHAR(issued_at, 'YYYYMMDD') || '-' || SUBSTRING(id::TEXT, 1, 8)
  ) STORED,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para otimização
CREATE INDEX idx_quiz_results_crew ON quiz_results(crew_id);
CREATE INDEX idx_quiz_results_vessel ON quiz_results(vessel_id);
CREATE INDEX idx_quiz_results_org ON quiz_results(organization_id);
CREATE INDEX idx_quiz_results_type ON quiz_results(quiz_type);
CREATE INDEX idx_quiz_results_passed ON quiz_results(passed) WHERE passed = TRUE;
CREATE INDEX idx_quiz_results_issued ON quiz_results(issued_at DESC);

-- RLS policies
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios resultados
CREATE POLICY "Users can view their own quiz results"
  ON quiz_results
  FOR SELECT
  USING (crew_id = auth.uid());

-- Policy: Admins podem ver resultados da organização
CREATE POLICY "Admins can view organization quiz results"
  ON quiz_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = quiz_results.organization_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Usuários podem inserir seus resultados
CREATE POLICY "Users can insert their quiz results"
  ON quiz_results
  FOR INSERT
  WITH CHECK (crew_id = auth.uid());

-- Tabela para perguntas e templates de quiz
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,
  norm_reference TEXT NOT NULL,
  clause_reference TEXT,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced')),
  questions JSONB NOT NULL, -- Array de perguntas com alternativas
  passing_score INTEGER DEFAULT 80,
  time_limit_minutes INTEGER,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Índices para templates
CREATE INDEX idx_quiz_templates_org ON quiz_templates(organization_id);
CREATE INDEX idx_quiz_templates_type ON quiz_templates(quiz_type);
CREATE INDEX idx_quiz_templates_norm ON quiz_templates(norm_reference);
CREATE INDEX idx_quiz_templates_active ON quiz_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_quiz_templates_tags ON quiz_templates USING GIN(tags);

-- RLS para templates
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization quiz templates"
  ON quiz_templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage quiz templates"
  ON quiz_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = quiz_templates.organization_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function para calcular score do quiz
CREATE OR REPLACE FUNCTION calculate_quiz_score(
  p_quiz_data JSONB,
  p_answers JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_questions INTEGER;
  correct_answers INTEGER := 0;
  question JSONB;
  user_answer TEXT;
  correct_answer TEXT;
BEGIN
  -- Conta total de perguntas
  total_questions := jsonb_array_length(p_quiz_data->'questions');
  
  IF total_questions = 0 THEN
    RETURN 0;
  END IF;
  
  -- Itera sobre perguntas e verifica respostas
  FOR question IN SELECT * FROM jsonb_array_elements(p_quiz_data->'questions')
  LOOP
    correct_answer := question->>'correct_answer';
    user_answer := p_answers->>((question->>'id')::TEXT);
    
    IF user_answer = correct_answer THEN
      correct_answers := correct_answers + 1;
    END IF;
  END LOOP;
  
  -- Retorna porcentagem
  RETURN (correct_answers * 100 / total_questions);
END;
$$;

-- Function para gerar certificado
CREATE OR REPLACE FUNCTION issue_certificate(
  p_quiz_result_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result RECORD;
  v_certificate JSONB;
BEGIN
  -- Busca resultado do quiz
  SELECT * INTO v_result
  FROM quiz_results
  WHERE id = p_quiz_result_id
    AND crew_id = auth.uid()
    AND passed = TRUE
    AND certificate_issued = FALSE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Quiz result not found or certificate already issued');
  END IF;
  
  -- Gera dados do certificado
  v_certificate := jsonb_build_object(
    'certificate_number', v_result.certificate_number,
    'crew_id', v_result.crew_id,
    'quiz_type', v_result.quiz_type,
    'norm_reference', v_result.norm_reference,
    'score', v_result.score,
    'issued_at', v_result.issued_at,
    'valid_until', (v_result.issued_at + INTERVAL '1 year'),
    'issuer', 'Nautilus One - Sistema de Gestão'
  );
  
  -- Atualiza registro
  UPDATE quiz_results
  SET 
    certificate_issued = TRUE,
    certificate_data = v_certificate
  WHERE id = p_quiz_result_id;
  
  RETURN v_certificate;
END;
$$;

-- Function para obter estatísticas de quiz
CREATE OR REPLACE FUNCTION get_quiz_statistics(
  p_crew_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_quiz_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_quizzes', COUNT(*),
    'passed', COUNT(*) FILTER (WHERE passed = TRUE),
    'failed', COUNT(*) FILTER (WHERE passed = FALSE),
    'average_score', ROUND(AVG(score), 2),
    'certificates_issued', COUNT(*) FILTER (WHERE certificate_issued = TRUE),
    'by_type', (
      SELECT jsonb_object_agg(quiz_type, jsonb_build_object(
        'count', COUNT(*),
        'passed', COUNT(*) FILTER (WHERE passed = TRUE),
        'avg_score', ROUND(AVG(score), 2)
      ))
      FROM quiz_results qr2
      WHERE (p_crew_id IS NULL OR qr2.crew_id = p_crew_id)
        AND (p_organization_id IS NULL OR qr2.organization_id = p_organization_id)
      GROUP BY qr2.quiz_type
    )
  )
  INTO stats
  FROM quiz_results
  WHERE (p_crew_id IS NULL OR crew_id = p_crew_id)
    AND (p_organization_id IS NULL OR organization_id = p_organization_id)
    AND (p_quiz_type IS NULL OR quiz_type = p_quiz_type);
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$;

COMMENT ON TABLE quiz_results IS 'Resultados de quizzes de avaliação de conformidade para tripulação';
COMMENT ON TABLE quiz_templates IS 'Templates e banco de perguntas para quizzes de conformidade';
COMMENT ON FUNCTION calculate_quiz_score IS 'Calcula score do quiz baseado nas respostas';
COMMENT ON FUNCTION issue_certificate IS 'Emite certificado para quiz aprovado';
COMMENT ON FUNCTION get_quiz_statistics IS 'Retorna estatísticas de desempenho em quizzes';
