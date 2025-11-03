-- PATCH 599: Drills Inteligentes com LLM
-- Creates tables for intelligent drill scenarios and crew response tracking

-- Table: drill_scenarios
-- AI-generated emergency drill scenarios
CREATE TABLE IF NOT EXISTS drill_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_title TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('FIRE', 'ABANDON_SHIP', 'MAN_OVERBOARD', 'COLLISION', 'POLLUTION', 'MEDICAL', 'SECURITY', 'GENERAL')),
  difficulty TEXT CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert')),
  description TEXT NOT NULL,
  scenario_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_responses JSONB DEFAULT '[]'::jsonb,
  evaluation_criteria JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 30,
  vessel_id UUID,
  generated_from_failures JSONB DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: drill_executions
-- Tracks when drills are executed
CREATE TABLE IF NOT EXISTS drill_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES drill_scenarios(id) ON DELETE CASCADE,
  vessel_id UUID NOT NULL,
  execution_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  participants JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  actual_duration_minutes INTEGER,
  weather_conditions TEXT,
  notes TEXT,
  conducted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: drill_responses
-- Records crew member responses during drills
CREATE TABLE IF NOT EXISTS drill_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES drill_executions(id) ON DELETE CASCADE,
  crew_member_id UUID NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  reaction_time_seconds INTEGER,
  actions_taken JSONB DEFAULT '[]'::jsonb,
  mistakes JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  overall_score NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  ai_evaluation TEXT,
  evaluator_notes TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: drill_corrective_actions
-- AI-generated corrective action plans based on drill performance
CREATE TABLE IF NOT EXISTS drill_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES drill_executions(id) ON DELETE CASCADE,
  crew_member_id UUID,
  issue_identified TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  training_required BOOLEAN DEFAULT false,
  training_type TEXT,
  deadline TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: drill_schedule
-- Automatic scheduling for drills (monthly, quarterly)
CREATE TABLE IF NOT EXISTS drill_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES drill_scenarios(id),
  vessel_id UUID NOT NULL,
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
  next_scheduled_date TIMESTAMPTZ NOT NULL,
  last_execution_date TIMESTAMPTZ,
  auto_schedule BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  notification_days_before INTEGER DEFAULT 7,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_drill_scenarios_type ON drill_scenarios(scenario_type);
CREATE INDEX idx_drill_scenarios_vessel_id ON drill_scenarios(vessel_id);
CREATE INDEX idx_drill_scenarios_created_at ON drill_scenarios(created_at);

CREATE INDEX idx_drill_executions_scenario_id ON drill_executions(scenario_id);
CREATE INDEX idx_drill_executions_vessel_id ON drill_executions(vessel_id);
CREATE INDEX idx_drill_executions_execution_date ON drill_executions(execution_date);
CREATE INDEX idx_drill_executions_status ON drill_executions(status);

CREATE INDEX idx_drill_responses_execution_id ON drill_responses(execution_id);
CREATE INDEX idx_drill_responses_crew_member ON drill_responses(crew_member_id);

CREATE INDEX idx_drill_corrective_actions_execution_id ON drill_corrective_actions(execution_id);
CREATE INDEX idx_drill_corrective_actions_crew_member ON drill_corrective_actions(crew_member_id);
CREATE INDEX idx_drill_corrective_actions_status ON drill_corrective_actions(status);
CREATE INDEX idx_drill_corrective_actions_priority ON drill_corrective_actions(priority);

CREATE INDEX idx_drill_schedule_vessel_id ON drill_schedule(vessel_id);
CREATE INDEX idx_drill_schedule_next_scheduled ON drill_schedule(next_scheduled_date);
CREATE INDEX idx_drill_schedule_active ON drill_schedule(active);

-- Enable Row Level Security
ALTER TABLE drill_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view drill scenarios for their vessels"
  ON drill_scenarios FOR SELECT
  USING (auth.uid() = created_by OR vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create drill scenarios"
  ON drill_scenarios FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view drill executions for their vessels"
  ON drill_executions FOR SELECT
  USING (vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create drill executions"
  ON drill_executions FOR INSERT
  WITH CHECK (auth.uid() = conducted_by);

CREATE POLICY "Users can view drill responses"
  ON drill_responses FOR SELECT
  USING (true);

CREATE POLICY "Users can record drill responses"
  ON drill_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view corrective actions"
  ON drill_corrective_actions FOR SELECT
  USING (true);

CREATE POLICY "Users can create corrective actions"
  ON drill_corrective_actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view drill schedules for their vessels"
  ON drill_schedule FOR SELECT
  USING (vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage drill schedules"
  ON drill_schedule FOR ALL
  USING (auth.uid() = created_by);

-- Triggers
CREATE TRIGGER update_drill_scenarios_updated_at
  BEFORE UPDATE ON drill_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_executions_updated_at
  BEFORE UPDATE ON drill_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_responses_updated_at
  BEFORE UPDATE ON drill_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_corrective_actions_updated_at
  BEFORE UPDATE ON drill_corrective_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_schedule_updated_at
  BEFORE UPDATE ON drill_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
