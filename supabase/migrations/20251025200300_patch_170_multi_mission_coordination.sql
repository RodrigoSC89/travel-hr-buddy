-- PATCH 170.0: Multi-Mission Coordination Tables
-- Support for AI-driven multi-vessel mission coordination

-- Create mission_coordination_plans table
CREATE TABLE IF NOT EXISTS mission_coordination_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  plan_data jsonb NOT NULL,
  ai_confidence numeric(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  status text DEFAULT 'active' CHECK (status IN ('active', 'revised', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coordination_updates table for tracking mission progress
CREATE TABLE IF NOT EXISTS coordination_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  update_type text NOT NULL CHECK (update_type IN ('status', 'position', 'resource', 'emergency', 'checkpoint')),
  update_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create mission_checkpoints table for timeline tracking
CREATE TABLE IF NOT EXISTS mission_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  checkpoint_name text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  actual_time timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed', 'skipped')),
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mission_resources table for resource tracking
CREATE TABLE IF NOT EXISTS mission_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('fuel', 'personnel', 'equipment', 'medical', 'food', 'water', 'communications')),
  resource_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'depleted', 'reserved')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_coordination_plans_mission ON mission_coordination_plans(mission_id);
CREATE INDEX IF NOT EXISTS idx_coordination_plans_status ON mission_coordination_plans(status);
CREATE INDEX IF NOT EXISTS idx_coordination_plans_created_at ON mission_coordination_plans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coordination_updates_mission ON coordination_updates(mission_id);
CREATE INDEX IF NOT EXISTS idx_coordination_updates_vessel ON coordination_updates(vessel_id);
CREATE INDEX IF NOT EXISTS idx_coordination_updates_type ON coordination_updates(update_type);
CREATE INDEX IF NOT EXISTS idx_coordination_updates_created_at ON coordination_updates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_mission ON mission_checkpoints(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_status ON mission_checkpoints(status);
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_scheduled_time ON mission_checkpoints(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_mission_resources_mission ON mission_resources(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_resources_vessel ON mission_resources(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mission_resources_type ON mission_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_mission_resources_status ON mission_resources(status);

-- Enable Row Level Security
ALTER TABLE mission_coordination_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_resources ENABLE ROW LEVEL SECURITY;

-- RLS policies for mission_coordination_plans
CREATE POLICY "Users can read coordination plans"
  ON mission_coordination_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create coordination plans"
  ON mission_coordination_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update coordination plans"
  ON mission_coordination_plans FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for coordination_updates
CREATE POLICY "Users can read coordination updates"
  ON coordination_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create coordination updates"
  ON coordination_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS policies for mission_checkpoints
CREATE POLICY "Users can read mission checkpoints"
  ON mission_checkpoints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create mission checkpoints"
  ON mission_checkpoints FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update mission checkpoints"
  ON mission_checkpoints FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for mission_resources
CREATE POLICY "Users can read mission resources"
  ON mission_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage mission resources"
  ON mission_resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update mission resources"
  ON mission_resources FOR UPDATE
  TO authenticated
  USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER coordination_plans_updated_at
  BEFORE UPDATE ON mission_coordination_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

CREATE TRIGGER mission_checkpoints_updated_at
  BEFORE UPDATE ON mission_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

CREATE TRIGGER mission_resources_updated_at
  BEFORE UPDATE ON mission_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

-- Create function to complete checkpoint
CREATE OR REPLACE FUNCTION complete_checkpoint(p_checkpoint_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE mission_checkpoints
  SET 
    status = 'completed',
    actual_time = now(),
    updated_at = now()
  WHERE id = p_checkpoint_id
    AND status != 'completed';
END;
$$ LANGUAGE plpgsql;

-- Create function to get mission progress
CREATE OR REPLACE FUNCTION get_mission_progress(p_mission_id uuid)
RETURNS TABLE (
  total_checkpoints bigint,
  completed_checkpoints bigint,
  delayed_checkpoints bigint,
  completion_percentage numeric,
  estimated_completion timestamptz
) AS $$
DECLARE
  total bigint;
  completed bigint;
  delayed bigint;
  last_checkpoint timestamptz;
BEGIN
  SELECT COUNT(*) INTO total
  FROM mission_checkpoints
  WHERE mission_id = p_mission_id;
  
  SELECT COUNT(*) INTO completed
  FROM mission_checkpoints
  WHERE mission_id = p_mission_id AND status = 'completed';
  
  SELECT COUNT(*) INTO delayed
  FROM mission_checkpoints
  WHERE mission_id = p_mission_id AND status = 'delayed';
  
  SELECT MAX(scheduled_time) INTO last_checkpoint
  FROM mission_checkpoints
  WHERE mission_id = p_mission_id;
  
  RETURN QUERY
  SELECT
    total as total_checkpoints,
    completed as completed_checkpoints,
    delayed as delayed_checkpoints,
    CASE WHEN total > 0 THEN ROUND((completed::numeric / total::numeric) * 100, 2) ELSE 0 END as completion_percentage,
    last_checkpoint as estimated_completion;
END;
$$ LANGUAGE plpgsql;

-- Create function to get resource availability
CREATE OR REPLACE FUNCTION get_resource_availability(p_mission_id uuid, p_resource_type text DEFAULT NULL)
RETURNS TABLE (
  resource_type text,
  total_quantity numeric,
  available_quantity numeric,
  in_use_quantity numeric,
  depletion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mr.resource_type,
    SUM(mr.quantity) as total_quantity,
    SUM(CASE WHEN mr.status = 'available' THEN mr.quantity ELSE 0 END) as available_quantity,
    SUM(CASE WHEN mr.status = 'in-use' THEN mr.quantity ELSE 0 END) as in_use_quantity,
    CASE 
      WHEN SUM(mr.quantity) > 0 
      THEN ROUND((SUM(CASE WHEN mr.status IN ('in-use', 'depleted') THEN mr.quantity ELSE 0 END) / SUM(mr.quantity)) * 100, 2)
      ELSE 0 
    END as depletion_rate
  FROM mission_resources mr
  WHERE mr.mission_id = p_mission_id
    AND (p_resource_type IS NULL OR mr.resource_type = p_resource_type)
  GROUP BY mr.resource_type;
END;
$$ LANGUAGE plpgsql;

-- Create function to get mission coordination stats
CREATE OR REPLACE FUNCTION get_coordination_stats(p_mission_id uuid)
RETURNS TABLE (
  vessel_count bigint,
  coordination_updates_count bigint,
  last_update_time timestamptz,
  avg_response_time interval,
  critical_updates_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT vessel_id) FROM mission_vessels WHERE mission_id = p_mission_id) as vessel_count,
    (SELECT COUNT(*) FROM coordination_updates WHERE mission_id = p_mission_id) as coordination_updates_count,
    (SELECT MAX(created_at) FROM coordination_updates WHERE mission_id = p_mission_id) as last_update_time,
    (SELECT AVG(cu2.created_at - cu1.created_at) 
     FROM coordination_updates cu1 
     JOIN coordination_updates cu2 ON cu1.vessel_id = cu2.vessel_id 
     WHERE cu1.mission_id = p_mission_id 
       AND cu2.mission_id = p_mission_id 
       AND cu2.created_at > cu1.created_at
     LIMIT 100) as avg_response_time,
    (SELECT COUNT(*) FROM coordination_updates WHERE mission_id = p_mission_id AND update_type = 'emergency') as critical_updates_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE mission_coordination_plans IS 'PATCH 170.0: AI-generated coordination plans for multi-vessel missions';
COMMENT ON TABLE coordination_updates IS 'PATCH 170.0: Real-time updates from vessels during mission execution';
COMMENT ON TABLE mission_checkpoints IS 'PATCH 170.0: Timeline checkpoints for mission progress tracking';
COMMENT ON TABLE mission_resources IS 'PATCH 170.0: Resource tracking and management for missions';

COMMENT ON FUNCTION complete_checkpoint IS 'Marks a mission checkpoint as completed with actual completion time';
COMMENT ON FUNCTION get_mission_progress IS 'Returns progress statistics for a mission';
COMMENT ON FUNCTION get_resource_availability IS 'Returns resource availability and depletion rates for a mission';
COMMENT ON FUNCTION get_coordination_stats IS 'Returns coordination statistics for a mission';

-- Insert sample coordination data for existing missions
INSERT INTO mission_checkpoints (mission_id, checkpoint_name, scheduled_time, status)
SELECT 
  id,
  'Mission Start',
  start_time,
  CASE 
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'active' THEN 'in-progress'
    ELSE 'pending'
  END
FROM missions
WHERE start_time IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert sample resources for active missions
INSERT INTO mission_resources (mission_id, resource_type, resource_name, quantity, unit, status)
SELECT 
  m.id,
  'fuel',
  'Diesel Fuel',
  1000,
  'liters',
  'available'
FROM missions m
WHERE m.status = 'active'
LIMIT 3
ON CONFLICT DO NOTHING;
