-- PATCH 598: IA Explicativa + Treinamento de Tripulação
-- Creates tables for AI explanatory engine and crew training system

-- Table: noncompliance_explanations
-- Stores AI-generated explanations for compliance findings
CREATE TABLE IF NOT EXISTS noncompliance_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('MLC', 'PSC', 'LSA_FFA', 'OVID')),
  original_finding TEXT NOT NULL,
  technical_explanation TEXT NOT NULL,
  simple_explanation TEXT NOT NULL,
  corrective_actions JSONB DEFAULT '[]'::jsonb,
  related_regulations JSONB DEFAULT '[]'::jsonb,
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  vessel_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: crew_training_quizzes
-- AI-generated quizzes based on crew errors
CREATE TABLE IF NOT EXISTS crew_training_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL,
  quiz_title TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('MLC', 'PSC', 'LSA_FFA', 'OVID', 'GENERAL')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_from_errors JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER DEFAULT 15,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: crew_training_results
-- Tracks quiz results and learning progress
CREATE TABLE IF NOT EXISTS crew_training_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES crew_training_quizzes(id) ON DELETE CASCADE,
  crew_member_id UUID NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_taken_seconds INTEGER,
  passed BOOLEAN DEFAULT false,
  feedback TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: crew_learning_progress
-- Aggregates learning metrics per crew member per module
CREATE TABLE IF NOT EXISTS crew_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('MLC', 'PSC', 'LSA_FFA', 'OVID', 'GENERAL')),
  total_quizzes_taken INTEGER DEFAULT 0,
  total_quizzes_passed INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  last_training_date TIMESTAMPTZ,
  improvement_rate NUMERIC(5,2) DEFAULT 0,
  weak_areas JSONB DEFAULT '[]'::jsonb,
  strong_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crew_member_id, module_type)
);

-- Indexes for performance
CREATE INDEX idx_noncompliance_explanations_finding_type ON noncompliance_explanations(finding_type);
CREATE INDEX idx_noncompliance_explanations_user_id ON noncompliance_explanations(user_id);
CREATE INDEX idx_noncompliance_explanations_vessel_id ON noncompliance_explanations(vessel_id);
CREATE INDEX idx_noncompliance_explanations_generated_at ON noncompliance_explanations(generated_at);

CREATE INDEX idx_crew_training_quizzes_crew_member ON crew_training_quizzes(crew_member_id);
CREATE INDEX idx_crew_training_quizzes_type ON crew_training_quizzes(quiz_type);
CREATE INDEX idx_crew_training_quizzes_created_at ON crew_training_quizzes(created_at);

CREATE INDEX idx_crew_training_results_quiz_id ON crew_training_results(quiz_id);
CREATE INDEX idx_crew_training_results_crew_member ON crew_training_results(crew_member_id);
CREATE INDEX idx_crew_training_results_completed_at ON crew_training_results(completed_at);

CREATE INDEX idx_crew_learning_progress_crew_member ON crew_learning_progress(crew_member_id);
CREATE INDEX idx_crew_learning_progress_module_type ON crew_learning_progress(module_type);

-- Enable Row Level Security
ALTER TABLE noncompliance_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_training_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_training_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for noncompliance_explanations
CREATE POLICY "Users can view explanations for their vessels"
  ON noncompliance_explanations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM user_vessel_access WHERE vessel_id = noncompliance_explanations.vessel_id
  ));

CREATE POLICY "Users can create explanations"
  ON noncompliance_explanations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crew_training_quizzes
CREATE POLICY "Users can view quizzes for their crew"
  ON crew_training_quizzes FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT user_id FROM crew_members WHERE id = crew_training_quizzes.crew_member_id
  ));

CREATE POLICY "Users can create quizzes"
  ON crew_training_quizzes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for crew_training_results
CREATE POLICY "Crew members can view their own results"
  ON crew_training_results FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM crew_members WHERE id = crew_training_results.crew_member_id
  ));

CREATE POLICY "Users can record training results"
  ON crew_training_results FOR INSERT
  WITH CHECK (true);

-- RLS Policies for crew_learning_progress
CREATE POLICY "Users can view crew learning progress"
  ON crew_learning_progress FOR SELECT
  USING (true);

CREATE POLICY "System can update learning progress"
  ON crew_learning_progress FOR ALL
  USING (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_noncompliance_explanations_updated_at
  BEFORE UPDATE ON noncompliance_explanations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_training_quizzes_updated_at
  BEFORE UPDATE ON crew_training_quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_learning_progress_updated_at
  BEFORE UPDATE ON crew_learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
