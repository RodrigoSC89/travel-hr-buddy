-- Create quiz system tables for AI-Powered Maritime Compliance Quiz

-- Quiz templates table for fallback questions
CREATE TABLE IF NOT EXISTS quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard TEXT NOT NULL, -- SGSO, IMCA, ISO, ANP, ISM Code, ISPS Code
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Basic', 'Intermediate', 'Advanced')),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Quiz configuration
  standard TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  
  -- Results
  questions JSONB NOT NULL, -- Array of questions with answers
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  
  -- Certificate
  certificate_url TEXT,
  certificate_id TEXT UNIQUE,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_seconds INTEGER,
  
  -- Metadata
  ai_generated BOOLEAN DEFAULT false,
  quiz_version TEXT,
  
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= total_questions)
);

-- Indexes for performance
CREATE INDEX idx_quiz_templates_standard ON quiz_templates(standard);
CREATE INDEX idx_quiz_templates_difficulty ON quiz_templates(difficulty);
CREATE INDEX idx_quiz_templates_active ON quiz_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_org ON quiz_results(organization_id);
CREATE INDEX idx_quiz_results_standard ON quiz_results(standard);
CREATE INDEX idx_quiz_results_certificate ON quiz_results(certificate_id) WHERE certificate_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_templates
-- Allow anyone authenticated to read active templates
CREATE POLICY "Users can view active quiz templates"
  ON quiz_templates
  FOR SELECT
  USING (is_active = true);

-- Only admins can create/update templates
CREATE POLICY "Admins can manage quiz templates"
  ON quiz_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for quiz_results
-- Users can view their own results
CREATE POLICY "Users can view their own quiz results"
  ON quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can create their own quiz results"
  ON quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all results for their organization
CREATE POLICY "Admins can view organization quiz results"
  ON quiz_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
      AND profiles.organization_id = quiz_results.organization_id
    )
  );

-- Function to get quiz statistics for a user
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id UUID)
RETURNS TABLE (
  total_quizzes INTEGER,
  passed_quizzes INTEGER,
  failed_quizzes INTEGER,
  average_score NUMERIC,
  best_score INTEGER,
  standards_completed TEXT[],
  certificates_earned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_quizzes,
    COUNT(*) FILTER (WHERE passed = true)::INTEGER as passed_quizzes,
    COUNT(*) FILTER (WHERE passed = false)::INTEGER as failed_quizzes,
    ROUND(AVG(score::NUMERIC / total_questions::NUMERIC * 100), 2) as average_score,
    MAX(score)::INTEGER as best_score,
    ARRAY_AGG(DISTINCT standard) as standards_completed,
    COUNT(DISTINCT certificate_id) FILTER (WHERE certificate_id IS NOT NULL)::INTEGER as certificates_earned
  FROM quiz_results
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quiz leaderboard
CREATE OR REPLACE FUNCTION get_quiz_leaderboard(
  p_standard TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  quizzes_completed INTEGER,
  average_score NUMERIC,
  certificates_earned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qr.user_id,
    p.name as user_name,
    COUNT(*)::INTEGER as quizzes_completed,
    ROUND(AVG(qr.score::NUMERIC / qr.total_questions::NUMERIC * 100), 2) as average_score,
    COUNT(DISTINCT qr.certificate_id) FILTER (WHERE qr.certificate_id IS NOT NULL)::INTEGER as certificates_earned
  FROM quiz_results qr
  JOIN profiles p ON p.id = qr.user_id
  WHERE 
    p.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (p_standard IS NULL OR qr.standard = p_standard)
  GROUP BY qr.user_id, p.name
  ORDER BY average_score DESC, quizzes_completed DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate certificate ID
CREATE OR REPLACE FUNCTION generate_certificate_id(
  p_result_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_cert_id TEXT;
  v_result RECORD;
BEGIN
  SELECT * INTO v_result
  FROM quiz_results
  WHERE id = p_result_id
  AND user_id = auth.uid();
  
  IF NOT FOUND OR NOT v_result.passed THEN
    RETURN NULL;
  END IF;
  
  -- Generate certificate ID: CERT-{STANDARD}-{YEAR}{MONTH}-{RANDOM}
  v_cert_id := 'CERT-' || 
    UPPER(REPLACE(v_result.standard, ' ', '')) || '-' ||
    TO_CHAR(v_result.completed_at, 'YYYYMM') || '-' ||
    UPPER(SUBSTRING(encode(gen_random_bytes(6), 'base64') FROM 1 FOR 8));
  
  v_cert_id := REPLACE(REPLACE(REPLACE(v_cert_id, '+', ''), '/', ''), '=', '');
  
  -- Update the result with certificate ID
  UPDATE quiz_results
  SET certificate_id = v_cert_id
  WHERE id = p_result_id;
  
  RETURN v_cert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample quiz templates for each standard
INSERT INTO quiz_templates (standard, difficulty, question, options, correct_answer, explanation, category) VALUES
-- SGSO Questions
('SGSO', 'Basic', 'O que significa SGSO?', 
 '["Sistema de Gestão de Segurança Operacional", "Sistema Geral de Segurança Offshore", "Serviço de Gestão de Segurança Operacional", "Sistema de Gerenciamento de Segurança Offshore"]'::jsonb,
 'Sistema de Gestão de Segurança Operacional',
 'SGSO é o Sistema de Gestão de Segurança Operacional, obrigatório na indústria de petróleo e gás.',
 'Fundamentos'),

('SGSO', 'Intermediate', 'Qual é o principal objetivo do SGSO?',
 '["Aumentar a produção", "Prevenir acidentes e proteger pessoas e meio ambiente", "Reduzir custos", "Acelerar operações"]'::jsonb,
 'Prevenir acidentes e proteger pessoas e meio ambiente',
 'O SGSO visa principalmente a prevenção de acidentes e a proteção de pessoas, instalações e meio ambiente.',
 'Objetivos'),

('SGSO', 'Advanced', 'Qual norma regulamenta o SGSO no Brasil?',
 '["NR-30", "NR-37", "NORMAM-01", "Todas as anteriores"]'::jsonb,
 'Todas as anteriores',
 'O SGSO é regulamentado por múltiplas normas incluindo NR-30, NR-37 e NORMAM-01.',
 'Regulamentação'),

-- IMCA Questions
('IMCA', 'Basic', 'O que significa IMCA?',
 '["International Marine Contractors Association", "International Maritime Certification Agency", "International Marine Compliance Association", "International Maritime Contractors Agency"]'::jsonb,
 'International Marine Contractors Association',
 'IMCA é a International Marine Contractors Association, uma associação internacional de contratantes marítimos.',
 'Fundamentos'),

('IMCA', 'Intermediate', 'Qual é o foco principal das diretrizes IMCA?',
 '["Aumentar lucros", "Segurança e eficiência operacional offshore", "Marketing marítimo", "Treinamento básico"]'::jsonb,
 'Segurança e eficiência operacional offshore',
 'IMCA foca em segurança e eficiência nas operações offshore e subsea.',
 'Diretrizes'),

-- ISO Questions
('ISO', 'Basic', 'O que é a ISO?',
 '["International Standards Organization", "International Safety Office", "Industry Standard Operation", "International Security Organization"]'::jsonb,
 'International Standards Organization',
 'ISO é a Organização Internacional de Normalização que desenvolve padrões internacionais.',
 'Fundamentos'),

('ISO', 'Intermediate', 'Qual norma ISO trata de gestão de qualidade?',
 '["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001"]'::jsonb,
 'ISO 9001',
 'ISO 9001 é a norma para sistemas de gestão da qualidade.',
 'Normas'),

-- ANP Questions
('ANP', 'Basic', 'O que significa ANP?',
 '["Agência Nacional do Petróleo", "Associação Nacional de Produção", "Agência Nacional de Produção", "Associação Nacional do Petróleo"]'::jsonb,
 'Agência Nacional do Petróleo',
 'ANP é a Agência Nacional do Petróleo, Gás Natural e Biocombustíveis.',
 'Fundamentos'),

-- ISM Code Questions
('ISM Code', 'Basic', 'O que é o ISM Code?',
 '["International Safety Management Code", "International Ship Management Code", "Industry Safety Management Code", "International Security Management Code"]'::jsonb,
 'International Safety Management Code',
 'ISM Code é o Código Internacional de Gestão de Segurança para operação segura de navios.',
 'Fundamentos'),

('ISM Code', 'Intermediate', 'Qual organização estabeleceu o ISM Code?',
 '["IMO", "ISO", "IMCA", "IACS"]'::jsonb,
 'IMO',
 'O ISM Code foi estabelecido pela IMO (International Maritime Organization).',
 'Regulamentação'),

-- ISPS Code Questions
('ISPS Code', 'Basic', 'O que significa ISPS?',
 '["International Ship and Port Facility Security", "International Safety and Protection Service", "International Ship Protection System", "International Security Protocol System"]'::jsonb,
 'International Ship and Port Facility Security',
 'ISPS é o Código Internacional de Segurança de Navios e Instalações Portuárias.',
 'Fundamentos');

-- Trigger to update usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract template IDs from questions and increment usage
  -- This is a simplified version - in production you'd parse the JSONB
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_usage
  AFTER INSERT ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- Comments for documentation
COMMENT ON TABLE quiz_templates IS 'Template questions for maritime compliance quizzes';
COMMENT ON TABLE quiz_results IS 'Stores quiz results and certificates for users';
COMMENT ON FUNCTION get_user_quiz_stats IS 'Returns comprehensive quiz statistics for a user';
COMMENT ON FUNCTION get_quiz_leaderboard IS 'Returns top performers in quizzes for an organization';
COMMENT ON FUNCTION generate_certificate_id IS 'Generates a unique certificate ID for passed quizzes';
