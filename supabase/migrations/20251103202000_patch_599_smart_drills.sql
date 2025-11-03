-- PATCH 599: Smart Drills
-- Creates tables for AI-powered emergency drill management

-- Create smart_drills table
CREATE TABLE IF NOT EXISTS smart_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  drill_type VARCHAR(50) NOT NULL, -- fire, man_overboard, abandon_ship, collision, etc.
  scenario TEXT NOT NULL,
  objectives JSONB DEFAULT '[]',
  vessel_id UUID,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  recurrence_pattern VARCHAR(50) -- monthly, quarterly, annually
);

-- Create drill_responses table
CREATE TABLE IF NOT EXISTS drill_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id UUID REFERENCES smart_drills(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  response_time_seconds INTEGER,
  actions_taken JSONB DEFAULT '[]',
  score DECIMAL(5,2),
  feedback TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drill_evaluations table
CREATE TABLE IF NOT EXISTS drill_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id UUID REFERENCES smart_drills(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2) NOT NULL,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  corrective_plan TEXT,
  ai_analysis JSONB DEFAULT '{}',
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drill_corrective_actions table
CREATE TABLE IF NOT EXISTS drill_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id UUID REFERENCES smart_drills(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES drill_evaluations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  responsible_person UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  completion_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_smart_drills_vessel ON smart_drills(vessel_id);
CREATE INDEX IF NOT EXISTS idx_smart_drills_type ON smart_drills(drill_type);
CREATE INDEX IF NOT EXISTS idx_smart_drills_status ON smart_drills(status);
CREATE INDEX IF NOT EXISTS idx_smart_drills_scheduled_date ON smart_drills(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_drill_responses_drill ON drill_responses(drill_id);
CREATE INDEX IF NOT EXISTS idx_drill_responses_crew ON drill_responses(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_drill_evaluations_drill ON drill_evaluations(drill_id);
CREATE INDEX IF NOT EXISTS idx_drill_corrective_actions_drill ON drill_corrective_actions(drill_id);
CREATE INDEX IF NOT EXISTS idx_drill_corrective_actions_status ON drill_corrective_actions(status);

-- Enable RLS
ALTER TABLE smart_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_corrective_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for smart_drills
CREATE POLICY "Users can view drills"
  ON smart_drills FOR SELECT
  USING (true);

CREATE POLICY "Admins and safety officers can create drills"
  ON smart_drills FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer', 'supervisor')
    )
  );

CREATE POLICY "Admins and safety officers can update drills"
  ON smart_drills FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer', 'supervisor')
    )
  );

-- Create RLS policies for drill_responses
CREATE POLICY "Users can view their own responses or admins can view all"
  ON drill_responses FOR SELECT
  USING (
    auth.uid() = crew_member_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer', 'supervisor')
    )
  );

CREATE POLICY "Users can create their own responses"
  ON drill_responses FOR INSERT
  WITH CHECK (auth.uid() = crew_member_id);

-- Create RLS policies for drill_evaluations
CREATE POLICY "Users can view evaluations"
  ON drill_evaluations FOR SELECT
  USING (true);

CREATE POLICY "Safety officers and admins can create evaluations"
  ON drill_evaluations FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer')
    )
  );

CREATE POLICY "Evaluators can update their own evaluations"
  ON drill_evaluations FOR UPDATE
  USING (
    auth.uid() = evaluator_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer')
    )
  );

-- Create RLS policies for drill_corrective_actions
CREATE POLICY "Users can view corrective actions"
  ON drill_corrective_actions FOR SELECT
  USING (true);

CREATE POLICY "Safety officers and admins can create corrective actions"
  ON drill_corrective_actions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer')
    )
  );

CREATE POLICY "Responsible persons can update their assigned actions"
  ON drill_corrective_actions FOR UPDATE
  USING (
    auth.uid() = responsible_person OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer')
    )
  );

-- Create function to update drill status
CREATE OR REPLACE FUNCTION update_drill_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for drill status
CREATE TRIGGER update_drill_status_trigger
  BEFORE UPDATE ON smart_drills
  FOR EACH ROW
  EXECUTE FUNCTION update_drill_status();

-- Create function to generate drill statistics
CREATE OR REPLACE FUNCTION get_drill_statistics(p_vessel_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_drills', COUNT(*),
    'completed_drills', COUNT(*) FILTER (WHERE status = 'completed'),
    'scheduled_drills', COUNT(*) FILTER (WHERE status = 'scheduled'),
    'average_score', COALESCE(AVG((
      SELECT overall_score FROM drill_evaluations de WHERE de.drill_id = sd.id
    )), 0),
    'drills_by_type', jsonb_object_agg(
      drill_type,
      COUNT(*) FILTER (WHERE drill_type = sd.drill_type)
    )
  )
  INTO result
  FROM smart_drills sd
  WHERE p_vessel_id IS NULL OR vessel_id = p_vessel_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE smart_drills IS 'PATCH 599: AI-generated emergency drills with intelligent scheduling';
COMMENT ON TABLE drill_responses IS 'PATCH 599: Crew responses to emergency drills';
COMMENT ON TABLE drill_evaluations IS 'PATCH 599: Evaluations and AI analysis of drill performance';
COMMENT ON TABLE drill_corrective_actions IS 'PATCH 599: Corrective actions from drill evaluations';
