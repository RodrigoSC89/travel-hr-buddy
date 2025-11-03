-- PATCH 598: Training AI + LLM Feedback Engine
-- Creates tables for AI-powered training with LLM feedback

-- Create ai_training_sessions table
CREATE TABLE IF NOT EXISTS ai_training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  non_conformity_id UUID,
  module VARCHAR(50) NOT NULL,
  topic TEXT NOT NULL,
  explanation TEXT,
  llm_feedback JSONB DEFAULT '{}',
  quiz_data JSONB DEFAULT '[]',
  score DECIMAL(5,2),
  passed BOOLEAN DEFAULT false,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create ai_training_history table
CREATE TABLE IF NOT EXISTS ai_training_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES ai_training_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  explanation TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_learning_paths table
CREATE TABLE IF NOT EXISTS training_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  modules JSONB DEFAULT '[]',
  progress DECIMAL(5,2) DEFAULT 0.0,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
  ai_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_training_sessions_crew_member ON ai_training_sessions(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_sessions_module ON ai_training_sessions(module);
CREATE INDEX IF NOT EXISTS idx_ai_training_sessions_completed ON ai_training_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_ai_training_history_crew_member ON ai_training_history(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_history_session ON ai_training_history(session_id);
CREATE INDEX IF NOT EXISTS idx_training_learning_paths_crew_member ON training_learning_paths(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_training_learning_paths_status ON training_learning_paths(status);

-- Enable RLS
ALTER TABLE ai_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_learning_paths ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_training_sessions
CREATE POLICY "Users can view their own training sessions"
  ON ai_training_sessions FOR SELECT
  USING (
    auth.uid() = crew_member_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor', 'trainer')
    )
  );

CREATE POLICY "Users can create their own training sessions"
  ON ai_training_sessions FOR INSERT
  WITH CHECK (auth.uid() = crew_member_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own training sessions"
  ON ai_training_sessions FOR UPDATE
  USING (auth.uid() = crew_member_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'trainer')
  ));

-- Create RLS policies for ai_training_history
CREATE POLICY "Users can view their own training history"
  ON ai_training_history FOR SELECT
  USING (
    auth.uid() = crew_member_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor', 'trainer')
    )
  );

CREATE POLICY "Users can create their own training history entries"
  ON ai_training_history FOR INSERT
  WITH CHECK (auth.uid() = crew_member_id);

-- Create RLS policies for training_learning_paths
CREATE POLICY "Users can view their own learning paths"
  ON training_learning_paths FOR SELECT
  USING (
    auth.uid() = crew_member_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor', 'trainer')
    )
  );

CREATE POLICY "Trainers and admins can create learning paths"
  ON training_learning_paths FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'trainer')
    )
  );

CREATE POLICY "Users and trainers can update learning paths"
  ON training_learning_paths FOR UPDATE
  USING (
    auth.uid() = crew_member_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'trainer')
    )
  );

-- Create function to update learning path progress
CREATE OR REPLACE FUNCTION update_learning_path_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    UPDATE training_learning_paths lp
    SET progress = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::DECIMAL / NULLIF(COUNT(*)::DECIMAL, 0)) * 100,
        0
      )
      FROM ai_training_sessions
      WHERE crew_member_id = NEW.crew_member_id
    ),
    updated_at = NOW()
    WHERE lp.crew_member_id = NEW.crew_member_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for learning path progress
CREATE TRIGGER update_learning_path_progress_trigger
  AFTER UPDATE ON ai_training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_path_progress();

-- Create function to get training stats by crew member
CREATE OR REPLACE FUNCTION get_training_stats(p_crew_member_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', COUNT(*),
    'completed_sessions', COUNT(*) FILTER (WHERE completed_at IS NOT NULL),
    'average_score', COALESCE(AVG(score) FILTER (WHERE score IS NOT NULL), 0),
    'pass_rate', COALESCE(
      (COUNT(*) FILTER (WHERE passed = true)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::DECIMAL, 0)) * 100,
      0
    ),
    'total_duration_minutes', COALESCE(SUM(duration_minutes), 0),
    'modules_trained', jsonb_agg(DISTINCT module) FILTER (WHERE module IS NOT NULL)
  )
  INTO result
  FROM ai_training_sessions
  WHERE crew_member_id = p_crew_member_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE ai_training_sessions IS 'PATCH 598: AI Training sessions with LLM-generated content and feedback';
COMMENT ON TABLE ai_training_history IS 'PATCH 598: Detailed history of training questions and answers';
COMMENT ON TABLE training_learning_paths IS 'PATCH 598: Personalized learning paths for crew members';
