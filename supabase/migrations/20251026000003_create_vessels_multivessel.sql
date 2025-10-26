-- PATCH 204.0: Multi-Vessel Support
-- Create vessels table and update RLS policies for vessel-scoped data

-- Create vessels table
CREATE TABLE IF NOT EXISTS vessels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- cargo, passenger, tanker, container, etc.
  imo_number TEXT UNIQUE,
  mmsi TEXT,
  call_sign TEXT,
  flag TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  
  -- Technical specifications
  length_meters DECIMAL(10, 2),
  beam_meters DECIMAL(10, 2),
  draft_meters DECIMAL(10, 2),
  gross_tonnage INTEGER,
  net_tonnage INTEGER,
  deadweight_tonnage INTEGER,
  
  -- Operational data
  year_built INTEGER,
  home_port TEXT,
  owner_company TEXT,
  operator_company TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_vessels_name ON vessels(name);
CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_status ON vessels(status);
CREATE INDEX idx_vessels_type ON vessels(type);

-- Enable RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vessels table
CREATE POLICY "Users can view all vessels"
  ON vessels FOR SELECT
  USING (true); -- All authenticated users can see all vessels

CREATE POLICY "Admins can manage vessels"
  ON vessels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_vessels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vessels
CREATE TRIGGER vessels_updated_at
  BEFORE UPDATE ON vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_vessels_updated_at();

-- Add vessel_id column to existing tables for multi-vessel support
-- (Only add if not exists)

-- Mission logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'mission_logs' AND column_name = 'vessel_id') THEN
    ALTER TABLE mission_logs ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL;
    CREATE INDEX idx_mission_logs_vessel ON mission_logs(vessel_id);
  END IF;
END $$;

-- Fleet data (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fleet') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fleet' AND column_name = 'vessel_id') THEN
      ALTER TABLE fleet ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE;
      CREATE INDEX idx_fleet_vessel ON fleet(vessel_id);
    END IF;
  END IF;
END $$;

-- Maintenance logs (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_logs' AND column_name = 'vessel_id') THEN
      ALTER TABLE maintenance_logs ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE;
      CREATE INDEX idx_maintenance_logs_vessel ON maintenance_logs(vessel_id);
    END IF;
  END IF;
END $$;

-- Compliance records (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compliance_records') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_records' AND column_name = 'vessel_id') THEN
      ALTER TABLE compliance_records ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE;
      CREATE INDEX idx_compliance_records_vessel ON compliance_records(vessel_id);
    END IF;
  END IF;
END $$;

-- Update cognitive_feedback to ensure vessel_id exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'cognitive_feedback' AND column_name = 'vessel_id') THEN
    ALTER TABLE cognitive_feedback ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL;
    CREATE INDEX idx_cognitive_feedback_vessel_id ON cognitive_feedback(vessel_id);
  END IF;
END $$;

-- Insert sample vessels for testing (optional - can be removed in production)
INSERT INTO vessels (name, type, imo_number, status, flag, metadata) VALUES
  ('MV Nautilus One', 'container', '9999001', 'active', 'BR', '{"capacity": 5000}'::jsonb),
  ('MT Ocean Star', 'tanker', '9999002', 'active', 'BR', '{"capacity": 150000}'::jsonb),
  ('SS Discovery', 'research', '9999003', 'maintenance', 'US', '{"equipment": "advanced"}'::jsonb)
ON CONFLICT (imo_number) DO NOTHING;

-- Create helper function to get vessels for current user
CREATE OR REPLACE FUNCTION get_user_vessels()
RETURNS SETOF vessels AS $$
BEGIN
  -- For now, return all vessels
  -- In production, this can be filtered by user permissions/assignments
  RETURN QUERY SELECT * FROM vessels WHERE status = 'active' ORDER BY name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
