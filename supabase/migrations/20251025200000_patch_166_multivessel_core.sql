-- PATCH 166.0: Multivessel Core Support
-- Enable native support for multiple vessels in database and operation logic

-- Add vessel_id to mmi_logs for vessel-specific maintenance tracking
ALTER TABLE IF EXISTS public.mmi_logs 
ADD COLUMN IF NOT EXISTS vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE;

-- Add vessel_id to watchdog_events for vessel-specific monitoring
ALTER TABLE IF EXISTS watchdog_events 
ADD COLUMN IF NOT EXISTS vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL;

-- Add vessel_id to maintenance_records (already has it, but ensure index)
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vessel_id ON maintenance_records(vessel_id);

-- Add vessel_id to compliance_audit_logs for vessel-specific compliance tracking
ALTER TABLE IF EXISTS compliance_audit_logs 
ADD COLUMN IF NOT EXISTS vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE;

-- Create missions table for tracking multi-vessel operations
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mission_type text NOT NULL CHECK (mission_type IN ('sar', 'evacuation', 'transport', 'patrol', 'training', 'emergency', 'custom')),
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled', 'failed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  description text,
  start_time timestamptz,
  end_time timestamptz,
  estimated_duration interval,
  actual_duration interval,
  coordination_data jsonb DEFAULT '{}'::jsonb,
  ai_recommendations jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mission_vessels junction table for multi-vessel missions
CREATE TABLE IF NOT EXISTS mission_vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('primary', 'support', 'backup', 'observer')),
  assigned_at timestamptz DEFAULT now(),
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'withdrawn')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mission_id, vessel_id)
);

-- Create mission_logs for tracking mission events
CREATE TABLE IF NOT EXISTS mission_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  log_type text NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'status_change', 'coordination', 'ai_decision')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_mmi_logs_vessel_id ON public.mmi_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_watchdog_events_vessel_id ON watchdog_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_vessel_id ON compliance_audit_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_mission_type ON missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_vessels_mission_id ON mission_vessels(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_vessels_vessel_id ON mission_vessels(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission_id ON mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_vessel_id ON mission_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_created_at ON mission_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for missions
CREATE POLICY "Authenticated users can read missions"
  ON missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete missions"
  ON missions FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for mission_vessels
CREATE POLICY "Authenticated users can read mission vessels"
  ON mission_vessels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage mission vessels"
  ON mission_vessels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mission vessels"
  ON mission_vessels FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can remove mission vessels"
  ON mission_vessels FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for mission_logs
CREATE POLICY "Authenticated users can read mission logs"
  ON mission_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create mission logs"
  ON mission_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

CREATE TRIGGER mission_vessels_updated_at
  BEFORE UPDATE ON mission_vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE missions IS 'PATCH 166.0: Multi-vessel mission coordination and tracking';
COMMENT ON TABLE mission_vessels IS 'PATCH 166.0: Junction table linking missions to participating vessels';
COMMENT ON TABLE mission_logs IS 'PATCH 166.0: Event logs for mission activities and coordination';
COMMENT ON COLUMN missions.coordination_data IS 'JSON data for inter-vessel coordination details';
COMMENT ON COLUMN missions.ai_recommendations IS 'AI-generated recommendations for mission execution';

-- Insert sample mission data for testing
INSERT INTO missions (name, mission_type, status, priority, description, start_time, coordination_data)
VALUES
  ('SAR Operation Alpha', 'sar', 'planned', 'critical', 'Search and rescue operation in sector 7-G', now() + interval '2 hours', '{"coordination_required": true, "weather_conditions": "moderate", "estimated_search_area": "50 sq km"}'::jsonb),
  ('Cargo Transport Beta', 'transport', 'active', 'normal', 'Cargo delivery to offshore platform', now() - interval '1 day', '{"cargo_weight": "2500 tons", "destination": "Platform Alpha"}'::jsonb),
  ('Emergency Evacuation Gamma', 'evacuation', 'completed', 'high', 'Emergency medical evacuation', now() - interval '2 days', '{"patients": 3, "medical_priority": "urgent"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Link vessels to sample missions (assuming vessels exist from previous migration)
INSERT INTO mission_vessels (mission_id, vessel_id, role, status)
SELECT 
  m.id,
  v.id,
  CASE 
    WHEN v.vessel_type = 'Research Vessel' THEN 'support'
    ELSE 'primary'
  END,
  'active'
FROM missions m
CROSS JOIN vessels v
WHERE m.name = 'Cargo Transport Beta'
  AND v.status = 'active'
LIMIT 2
ON CONFLICT (mission_id, vessel_id) DO NOTHING;
