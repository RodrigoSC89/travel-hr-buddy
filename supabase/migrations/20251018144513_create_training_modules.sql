-- Create training_modules table for defining training courses
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Safety', 
    'Technical', 
    'DP Operations', 
    'Emergency Response', 
    'SGSO Compliance',
    'Equipment Operation',
    'Other'
  )),
  duration_hours NUMERIC NOT NULL DEFAULT 1,
  validity_days INT, -- Days until retraining required (e.g., 365, 730)
  required_for_positions TEXT[], -- Array of positions requiring this training
  normative_reference TEXT, -- IMCA M117, MTS, IBAMA, etc
  content_url TEXT, -- Link to training materials
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crew_training_records table for tracking individual training completions
CREATE TABLE IF NOT EXISTS crew_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  training_module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
  date_completed DATE,
  result TEXT, -- Pass/Fail, Score, Certificate Level, etc
  cert_url TEXT, -- PDF certificate stored in Supabase Storage
  valid_until DATE,
  notes TEXT,
  instructor TEXT,
  linked_incident_id UUID, -- Reference to dp_incidents or other failure tables
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 
    'in_progress', 
    'completed', 
    'failed', 
    'expired'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for training_modules
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read training_modules"
  ON training_modules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert training_modules"
  ON training_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update training_modules"
  ON training_modules
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add RLS policies for crew_training_records
ALTER TABLE crew_training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read crew_training_records"
  ON crew_training_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert crew_training_records"
  ON crew_training_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update crew_training_records"
  ON crew_training_records
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_modules_category ON training_modules(category);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_crew_id ON crew_training_records(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_training_module_id ON crew_training_records(training_module_id);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_status ON crew_training_records(status);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_valid_until ON crew_training_records(valid_until);
CREATE INDEX IF NOT EXISTS idx_crew_training_records_linked_incident ON crew_training_records(linked_incident_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_training_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER training_modules_updated_at
  BEFORE UPDATE ON training_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_training_modules_updated_at();

CREATE OR REPLACE FUNCTION update_crew_training_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crew_training_records_updated_at
  BEFORE UPDATE ON crew_training_records
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_training_records_updated_at();

-- Function to calculate valid_until date and update status
CREATE OR REPLACE FUNCTION calculate_training_validity()
RETURNS TRIGGER AS $$
DECLARE
  module_validity_days INT;
BEGIN
  IF NEW.date_completed IS NOT NULL AND NEW.status = 'completed' THEN
    -- Get validity_days from the training module
    SELECT validity_days INTO module_validity_days
    FROM training_modules
    WHERE id = NEW.training_module_id;
    
    IF module_validity_days IS NOT NULL THEN
      NEW.valid_until = NEW.date_completed + (module_validity_days || ' days')::INTERVAL;
    END IF;
  END IF;
  
  -- Check if training has expired
  IF NEW.valid_until IS NOT NULL AND NEW.valid_until < CURRENT_DATE THEN
    NEW.status = 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crew_training_records_calculate_validity
  BEFORE INSERT OR UPDATE ON crew_training_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_training_validity();

-- Function to get training statistics for a crew member
CREATE OR REPLACE FUNCTION get_crew_training_stats(p_crew_id UUID)
RETURNS TABLE (
  crew_id UUID,
  crew_name TEXT,
  position TEXT,
  total_trainings BIGINT,
  completed_trainings BIGINT,
  expired_trainings BIGINT,
  upcoming_expirations BIGINT,
  compliance_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id as crew_id,
    cm.full_name as crew_name,
    cm.position,
    COUNT(ctr.id)::BIGINT as total_trainings,
    COUNT(ctr.id) FILTER (WHERE ctr.status = 'completed')::BIGINT as completed_trainings,
    COUNT(ctr.id) FILTER (WHERE ctr.status = 'expired')::BIGINT as expired_trainings,
    COUNT(ctr.id) FILTER (WHERE ctr.valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')::BIGINT as upcoming_expirations,
    CASE 
      WHEN COUNT(ctr.id) > 0 
      THEN ROUND((COUNT(ctr.id) FILTER (WHERE ctr.status = 'completed')::NUMERIC / COUNT(ctr.id)::NUMERIC) * 100, 2)
      ELSE 0
    END as compliance_percentage
  FROM crew_members cm
  LEFT JOIN crew_training_records ctr ON cm.id = ctr.crew_id
  WHERE cm.id = p_crew_id
  GROUP BY cm.id, cm.full_name, cm.position;
END;
$$ LANGUAGE plpgsql;

-- Function to get expired trainings
CREATE OR REPLACE FUNCTION get_expired_trainings()
RETURNS TABLE (
  id UUID,
  crew_id UUID,
  crew_name TEXT,
  training_title TEXT,
  valid_until DATE,
  days_expired INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ctr.id,
    ctr.crew_id,
    cm.full_name as crew_name,
    tm.title as training_title,
    ctr.valid_until,
    (CURRENT_DATE - ctr.valid_until)::INT as days_expired
  FROM crew_training_records ctr
  JOIN crew_members cm ON ctr.crew_id = cm.id
  JOIN training_modules tm ON ctr.training_module_id = tm.id
  WHERE ctr.valid_until < CURRENT_DATE
    AND ctr.status = 'expired'
  ORDER BY ctr.valid_until ASC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample training modules
INSERT INTO training_modules (title, description, category, duration_hours, validity_days, normative_reference) VALUES
  ('DP Operations Fundamentals', 'Basic Dynamic Positioning operations training', 'DP Operations', 8, 365, 'IMCA M117'),
  ('Emergency Response Procedures', 'Emergency response and evacuation procedures', 'Emergency Response', 4, 180, 'IBAMA SGSO'),
  ('Fire Fighting Level 1', 'Basic firefighting and prevention', 'Safety', 8, 365, 'STCW A-VI/1'),
  ('Blackout Recovery', 'Procedures for blackout scenarios and recovery', 'Technical', 4, 180, 'MTS Guidelines'),
  ('Man Overboard Response', 'MOB procedures and rescue operations', 'Emergency Response', 2, 180, 'ISM Code'),
  ('SGSO Compliance Training', 'Safety Management System overview and compliance', 'SGSO Compliance', 4, 365, 'IBAMA SGSO')
ON CONFLICT DO NOTHING;
