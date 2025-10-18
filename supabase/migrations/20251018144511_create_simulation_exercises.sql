-- Create simulation_exercises table for tracking onboard simulation exercises
-- Manages mandatory simulations per regulatory requirements (IMCA, MTS, IBAMA)
CREATE TABLE IF NOT EXISTS simulation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DP', 'Blackout', 'Abandono', 'Incêndio', 'Man Overboard', 'Derramamento')),
  normative_reference TEXT, -- IMCA M220, IBAMA SGSO, MTS, etc
  frequency_days INT NOT NULL DEFAULT 90, -- 30, 90, 180 days
  last_simulation DATE,
  next_due DATE,
  crew_participants TEXT[], -- Array of crew member names/IDs
  notes TEXT,
  attachments TEXT[], -- Links to Supabase Storage (videos, checklists, images)
  result TEXT, -- Pass/Fail, Score, etc
  lessons_learned TEXT, -- Post-exercise learnings
  gpt_suggestions TEXT, -- AI-generated improvement suggestions
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE simulation_exercises ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all simulations
CREATE POLICY "Allow authenticated users to read simulation_exercises"
  ON simulation_exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert simulations
CREATE POLICY "Allow authenticated users to insert simulation_exercises"
  ON simulation_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update simulations
CREATE POLICY "Allow authenticated users to update simulation_exercises"
  ON simulation_exercises
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete simulations
CREATE POLICY "Allow authenticated users to delete simulation_exercises"
  ON simulation_exercises
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_vessel ON simulation_exercises(vessel_id);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_type ON simulation_exercises(type);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_status ON simulation_exercises(status);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_next_due ON simulation_exercises(next_due);
CREATE INDEX IF NOT EXISTS idx_simulation_exercises_last_simulation ON simulation_exercises(last_simulation);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_simulation_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simulation_exercises_updated_at
  BEFORE UPDATE ON simulation_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_simulation_exercises_updated_at();

-- Create function to calculate next_due date based on frequency
CREATE OR REPLACE FUNCTION calculate_simulation_next_due()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_simulation IS NOT NULL THEN
    NEW.next_due = NEW.last_simulation + (NEW.frequency_days || ' days')::INTERVAL;
    
    -- Update status based on next_due date
    IF NEW.next_due < CURRENT_DATE THEN
      NEW.status = 'overdue';
    ELSIF NEW.last_simulation IS NOT NULL THEN
      NEW.status = 'completed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simulation_exercises_calculate_next_due
  BEFORE INSERT OR UPDATE ON simulation_exercises
  FOR EACH ROW
  EXECUTE FUNCTION calculate_simulation_next_due();

-- Create function to get overdue simulations
CREATE OR REPLACE FUNCTION get_overdue_simulations()
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  type TEXT,
  normative_reference TEXT,
  next_due DATE,
  days_overdue INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.vessel_id,
    se.type,
    se.normative_reference,
    se.next_due,
    (CURRENT_DATE - se.next_due)::INT as days_overdue
  FROM simulation_exercises se
  WHERE se.next_due < CURRENT_DATE
    AND se.status IN ('scheduled', 'overdue')
  ORDER BY se.next_due ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get upcoming simulations (next 30 days)
CREATE OR REPLACE FUNCTION get_upcoming_simulations()
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  type TEXT,
  normative_reference TEXT,
  next_due DATE,
  days_until_due INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.vessel_id,
    se.type,
    se.normative_reference,
    se.next_due,
    (se.next_due - CURRENT_DATE)::INT as days_until_due
  FROM simulation_exercises se
  WHERE se.next_due BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND se.status = 'scheduled'
  ORDER BY se.next_due ASC;
END;
$$ LANGUAGE plpgsql;
