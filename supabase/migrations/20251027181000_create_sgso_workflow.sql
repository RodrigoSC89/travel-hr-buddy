-- Create sgso_plans table
CREATE TABLE IF NOT EXISTS sgso_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
  version INT DEFAULT 1,
  vessel_id UUID,
  start_date DATE,
  end_date DATE,
  owner_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sgso_actions table
CREATE TABLE IF NOT EXISTS sgso_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES sgso_plans(id) ON DELETE CASCADE,
  audit_id UUID, -- Link to audits if needed
  non_conformity_id UUID, -- Link to non-conformities
  action_type TEXT NOT NULL, -- 'preventive', 'corrective', 'improvement'
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  responsible_user_id UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_date DATE,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sgso_versions table for plan versioning
CREATE TABLE IF NOT EXISTS sgso_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES sgso_plans(id) ON DELETE CASCADE,
  version INT NOT NULL,
  plan_data JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sgso_plans_status ON sgso_plans(status);
CREATE INDEX IF NOT EXISTS idx_sgso_plans_vessel ON sgso_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sgso_plans_owner ON sgso_plans(owner_id);
CREATE INDEX IF NOT EXISTS idx_sgso_actions_plan ON sgso_actions(plan_id);
CREATE INDEX IF NOT EXISTS idx_sgso_actions_status ON sgso_actions(status);
CREATE INDEX IF NOT EXISTS idx_sgso_actions_responsible ON sgso_actions(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_sgso_versions_plan ON sgso_versions(plan_id);

-- Enable RLS
ALTER TABLE sgso_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sgso_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sgso_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sgso_plans
CREATE POLICY "Users can view SGSO plans"
  ON sgso_plans FOR SELECT
  USING (true); -- Allow all authenticated users to view

CREATE POLICY "Users can create SGSO plans"
  ON sgso_plans FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Plan owners can update their plans"
  ON sgso_plans FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = created_by);

CREATE POLICY "Plan owners can delete their plans"
  ON sgso_plans FOR DELETE
  USING (auth.uid() = owner_id OR auth.uid() = created_by);

-- RLS Policies for sgso_actions
CREATE POLICY "Users can view SGSO actions"
  ON sgso_actions FOR SELECT
  USING (true);

CREATE POLICY "Users can create SGSO actions"
  ON sgso_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sgso_plans
      WHERE sgso_plans.id = sgso_actions.plan_id
      AND (sgso_plans.owner_id = auth.uid() OR sgso_plans.created_by = auth.uid())
    )
  );

CREATE POLICY "Responsible users or plan owners can update actions"
  ON sgso_actions FOR UPDATE
  USING (
    auth.uid() = responsible_user_id OR
    EXISTS (
      SELECT 1 FROM sgso_plans
      WHERE sgso_plans.id = sgso_actions.plan_id
      AND (sgso_plans.owner_id = auth.uid() OR sgso_plans.created_by = auth.uid())
    )
  );

CREATE POLICY "Plan owners can delete actions"
  ON sgso_actions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sgso_plans
      WHERE sgso_plans.id = sgso_actions.plan_id
      AND (sgso_plans.owner_id = auth.uid() OR sgso_plans.created_by = auth.uid())
    )
  );

-- RLS Policies for sgso_versions
CREATE POLICY "Users can view plan versions"
  ON sgso_versions FOR SELECT
  USING (true);

CREATE POLICY "System can insert versions"
  ON sgso_versions FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sgso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_sgso_plans_updated_at
  BEFORE UPDATE ON sgso_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_sgso_updated_at();

CREATE TRIGGER update_sgso_actions_updated_at
  BEFORE UPDATE ON sgso_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_sgso_updated_at();

-- Function to create version snapshot when plan is updated
CREATE OR REPLACE FUNCTION create_sgso_version_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if significant fields changed
  IF (OLD.title IS DISTINCT FROM NEW.title OR
      OLD.description IS DISTINCT FROM NEW.description OR
      OLD.status IS DISTINCT FROM NEW.status) THEN
    
    INSERT INTO sgso_versions (plan_id, version, plan_data, created_by)
    VALUES (
      OLD.id,
      OLD.version,
      jsonb_build_object(
        'title', OLD.title,
        'description', OLD.description,
        'status', OLD.status,
        'start_date', OLD.start_date,
        'end_date', OLD.end_date,
        'vessel_id', OLD.vessel_id
      ),
      auth.uid()
    );
    
    -- Increment version
    NEW.version = OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sgso_plan_versioning
  BEFORE UPDATE ON sgso_plans
  FOR EACH ROW
  EXECUTE FUNCTION create_sgso_version_snapshot();
