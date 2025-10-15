-- ============================================================================
-- MMI Complete Schema Migration
-- Version: 1.0.0
-- Description: Complete database schema for MMI (Intelligent Maintenance Module)
-- Created: 2025-10-15
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. MMI SYSTEMS TABLE
-- ============================================================================
-- Ship systems catalog with criticality tracking

CREATE TABLE IF NOT EXISTS public.mmi_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID, -- Optional: references vessels(id) if vessels table exists
  system_name TEXT NOT NULL,
  system_type TEXT NOT NULL CHECK (system_type IN ('propulsion', 'electrical', 'navigation', 'safety', 'auxiliary')),
  criticality TEXT NOT NULL CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
  description TEXT,
  compliance_metadata JSONB DEFAULT '{}'::JSONB, -- NORMAM, SOLAS, MARPOL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mmi_systems
CREATE INDEX IF NOT EXISTS idx_mmi_systems_vessel ON public.mmi_systems(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mmi_systems_criticality ON public.mmi_systems(criticality);
CREATE INDEX IF NOT EXISTS idx_mmi_systems_type ON public.mmi_systems(system_type);

-- RLS for mmi_systems
ALTER TABLE public.mmi_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mmi_systems"
  ON public.mmi_systems FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert mmi_systems"
  ON public.mmi_systems FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update mmi_systems"
  ON public.mmi_systems FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.mmi_systems IS 'Ship systems catalog with criticality levels';
COMMENT ON COLUMN public.mmi_systems.compliance_metadata IS 'NORMAM, SOLAS, MARPOL compliance data (JSONB)';

-- ============================================================================
-- 2. MMI COMPONENTS TABLE
-- ============================================================================
-- Components with hourometer tracking and maintenance intervals

CREATE TABLE IF NOT EXISTS public.mmi_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID REFERENCES public.mmi_systems(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  current_hours NUMERIC(10,2) DEFAULT 0 CHECK (current_hours >= 0),
  maintenance_interval_hours NUMERIC(10,2) NOT NULL CHECK (maintenance_interval_hours > 0),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  is_operational BOOLEAN DEFAULT true,
  component_type TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mmi_components
CREATE INDEX IF NOT EXISTS idx_mmi_components_system ON public.mmi_components(system_id);
CREATE INDEX IF NOT EXISTS idx_mmi_components_hours ON public.mmi_components(current_hours);
CREATE INDEX IF NOT EXISTS idx_mmi_components_operational ON public.mmi_components(is_operational);
CREATE INDEX IF NOT EXISTS idx_mmi_components_next_maintenance ON public.mmi_components(next_maintenance_date);

-- RLS for mmi_components
ALTER TABLE public.mmi_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mmi_components"
  ON public.mmi_components FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert mmi_components"
  ON public.mmi_components FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update mmi_components"
  ON public.mmi_components FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.mmi_components IS 'Components with hourometer tracking and maintenance intervals';
COMMENT ON COLUMN public.mmi_components.current_hours IS 'Current operating hours';
COMMENT ON COLUMN public.mmi_components.maintenance_interval_hours IS 'Hours between maintenance';

-- ============================================================================
-- 3. MMI JOBS TABLE (ENHANCED)
-- ============================================================================
-- Maintenance jobs with AI embeddings for similarity search

CREATE TABLE IF NOT EXISTS public.mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.mmi_components(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'postponed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  due_date DATE,
  completed_date DATE,
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002 (1536 dimensions)
  suggestion_ia TEXT, -- AI-generated suggestion
  can_postpone BOOLEAN DEFAULT true,
  postponement_count INTEGER DEFAULT 0,
  assigned_to UUID, -- Optional: references profiles(id)
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mmi_jobs
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_component ON public.mmi_jobs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_priority ON public.mmi_jobs(priority, status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_due_date ON public.mmi_jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_created ON public.mmi_jobs(created_at DESC);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_embedding ON public.mmi_jobs 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- RLS for mmi_jobs
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mmi_jobs"
  ON public.mmi_jobs FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert mmi_jobs"
  ON public.mmi_jobs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update mmi_jobs"
  ON public.mmi_jobs FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete mmi_jobs"
  ON public.mmi_jobs FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.mmi_jobs IS 'Maintenance jobs with AI embeddings for similarity search';
COMMENT ON COLUMN public.mmi_jobs.embedding IS 'OpenAI text-embedding-ada-002 vector (1536 dimensions)';
COMMENT ON COLUMN public.mmi_jobs.suggestion_ia IS 'AI-generated maintenance suggestion';

-- ============================================================================
-- 4. MMI OS (WORK ORDERS) TABLE
-- ============================================================================
-- Work orders with auto-generated OS numbers

CREATE TABLE IF NOT EXISTS public.mmi_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE SET NULL,
  os_number TEXT UNIQUE NOT NULL, -- Format: OS-YYYYNNNN
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID, -- Optional: references profiles(id)
  start_date DATE,
  completion_date DATE,
  work_description TEXT,
  parts_used JSONB DEFAULT '[]'::JSONB, -- Array of parts: [{name, quantity, cost}]
  labor_hours NUMERIC(5,2),
  parts_cost NUMERIC(10,2) DEFAULT 0,
  labor_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) GENERATED ALWAYS AS (COALESCE(parts_cost, 0) + COALESCE(labor_cost, 0)) STORED,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  feedback TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mmi_os
CREATE INDEX IF NOT EXISTS idx_mmi_os_job ON public.mmi_os(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_os_number ON public.mmi_os(os_number);
CREATE INDEX IF NOT EXISTS idx_mmi_os_status ON public.mmi_os(status);
CREATE INDEX IF NOT EXISTS idx_mmi_os_assigned ON public.mmi_os(assigned_to);
CREATE INDEX IF NOT EXISTS idx_mmi_os_dates ON public.mmi_os(start_date, completion_date);

-- RLS for mmi_os
ALTER TABLE public.mmi_os ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mmi_os"
  ON public.mmi_os FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert mmi_os"
  ON public.mmi_os FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update mmi_os"
  ON public.mmi_os FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.mmi_os IS 'Work orders with auto-generated OS numbers';
COMMENT ON COLUMN public.mmi_os.os_number IS 'Auto-generated work order number (OS-YYYYNNNN)';
COMMENT ON COLUMN public.mmi_os.effectiveness_rating IS 'Work order effectiveness rating (1-5 stars)';

-- ============================================================================
-- 5. MMI HOUROMETER LOGS TABLE
-- ============================================================================
-- Complete audit trail for operating hours

CREATE TABLE IF NOT EXISTS public.mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.mmi_components(id) ON DELETE CASCADE,
  previous_hours NUMERIC(10,2) NOT NULL,
  new_hours NUMERIC(10,2) NOT NULL,
  hours_added NUMERIC(10,2) GENERATED ALWAYS AS (new_hours - previous_hours) STORED,
  recorded_by TEXT DEFAULT 'system', -- 'system' or user_id
  source TEXT DEFAULT 'automated' CHECK (source IN ('automated', 'manual', 'sensor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mmi_hourometer_logs
CREATE INDEX IF NOT EXISTS idx_hourometer_logs_component ON public.mmi_hourometer_logs(component_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hourometer_logs_source ON public.mmi_hourometer_logs(source);

-- RLS for mmi_hourometer_logs
ALTER TABLE public.mmi_hourometer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mmi_hourometer_logs"
  ON public.mmi_hourometer_logs FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert mmi_hourometer_logs"
  ON public.mmi_hourometer_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.mmi_hourometer_logs IS 'Complete audit trail for component operating hours';
COMMENT ON COLUMN public.mmi_hourometer_logs.hours_added IS 'Calculated delta (new_hours - previous_hours)';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: match_mmi_jobs
-- Purpose: Vector similarity search for finding similar maintenance jobs
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  similarity FLOAT,
  component_id UUID,
  due_date DATE,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_jobs.id,
    mmi_jobs.title,
    mmi_jobs.description,
    mmi_jobs.status,
    mmi_jobs.priority,
    1 - (mmi_jobs.embedding <=> query_embedding) AS similarity,
    mmi_jobs.component_id,
    mmi_jobs.due_date,
    mmi_jobs.created_at
  FROM public.mmi_jobs
  WHERE mmi_jobs.embedding IS NOT NULL
    AND 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_mmi_jobs IS 'Find similar maintenance jobs using cosine similarity on embeddings';

-- Function: generate_os_number
-- Purpose: Auto-generate work order numbers in format OS-YYYYNNNN
CREATE OR REPLACE FUNCTION generate_os_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  os_number TEXT;
BEGIN
  -- Get current year
  current_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(os_number FROM 9) AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM public.mmi_os
  WHERE os_number LIKE 'OS-' || current_year || '%';
  
  -- Format: OS-YYYYNNNN (e.g., OS-20250001)
  os_number := 'OS-' || current_year || LPAD(next_number::TEXT, 4, '0');
  
  RETURN os_number;
END;
$$;

COMMENT ON FUNCTION generate_os_number IS 'Auto-generate work order number in format OS-YYYYNNNN';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update mmi_systems.updated_at
CREATE OR REPLACE FUNCTION update_mmi_systems_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mmi_systems_updated_at
  BEFORE UPDATE ON public.mmi_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_systems_updated_at();

-- Trigger: Update mmi_components.updated_at
CREATE OR REPLACE FUNCTION update_mmi_components_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mmi_components_updated_at
  BEFORE UPDATE ON public.mmi_components
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_components_updated_at();

-- Trigger: Update mmi_jobs.updated_at
CREATE OR REPLACE FUNCTION update_mmi_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mmi_jobs_updated_at
  BEFORE UPDATE ON public.mmi_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_jobs_updated_at();

-- Trigger: Update mmi_os.updated_at
CREATE OR REPLACE FUNCTION update_mmi_os_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mmi_os_updated_at
  BEFORE UPDATE ON public.mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_os_updated_at();

-- Trigger: Auto-generate OS number on insert
CREATE OR REPLACE FUNCTION set_os_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.os_number IS NULL OR NEW.os_number = '' THEN
    NEW.os_number := generate_os_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_os_number
  BEFORE INSERT ON public.mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION set_os_number();

-- Trigger: Calculate next maintenance date for components
CREATE OR REPLACE FUNCTION calculate_next_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_hours IS NOT NULL AND NEW.maintenance_interval_hours IS NOT NULL THEN
    -- Estimate next maintenance date (assuming 8 hours/day average usage)
    NEW.next_maintenance_date := CURRENT_DATE + 
      ((NEW.maintenance_interval_hours - (NEW.current_hours - FLOOR(NEW.current_hours / NEW.maintenance_interval_hours) * NEW.maintenance_interval_hours)) / 8.0)::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_next_maintenance
  BEFORE INSERT OR UPDATE OF current_hours, maintenance_interval_hours ON public.mmi_components
  FOR EACH ROW
  EXECUTE FUNCTION calculate_next_maintenance();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample system
INSERT INTO public.mmi_systems (system_name, system_type, criticality, description, compliance_metadata)
VALUES 
  (
    'Sistema de Propulsão Principal',
    'propulsion',
    'critical',
    'Motor diesel principal e sistema de transmissão',
    '{"normam": ["NORMAM-05"], "solas": ["II-1"], "marpol": ["Annex VI"]}'::JSONB
  ),
  (
    'Sistema Elétrico Principal',
    'electrical',
    'critical',
    'Geradores e distribuição elétrica',
    '{"normam": ["NORMAM-05"], "solas": ["II-1"]}'::JSONB
  ),
  (
    'Sistema de Navegação',
    'navigation',
    'high',
    'Equipamentos de navegação e comunicação',
    '{"solas": ["V"]}'::JSONB
  )
ON CONFLICT DO NOTHING;

-- Insert sample components
INSERT INTO public.mmi_components (
  system_id,
  component_name,
  current_hours,
  maintenance_interval_hours,
  is_operational,
  component_type,
  manufacturer,
  model
)
SELECT
  s.id,
  'Motor Principal ME-4500',
  1850.0,
  2000.0,
  true,
  'Diesel Engine',
  'Caterpillar',
  'CAT 3516'
FROM public.mmi_systems s
WHERE s.system_name = 'Sistema de Propulsão Principal'
ON CONFLICT DO NOTHING;

INSERT INTO public.mmi_components (
  system_id,
  component_name,
  current_hours,
  maintenance_interval_hours,
  is_operational,
  component_type,
  manufacturer,
  model
)
SELECT
  s.id,
  'Gerador Principal GE-1',
  3200.0,
  5000.0,
  true,
  'Generator',
  'Cummins',
  'C450D5'
FROM public.mmi_systems s
WHERE s.system_name = 'Sistema Elétrico Principal'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS (Optional - adjust based on your security model)
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables to anon and authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant insert, update, delete to authenticated users
GRANT INSERT, UPDATE, DELETE ON public.mmi_systems TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mmi_components TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mmi_jobs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mmi_os TO authenticated;
GRANT INSERT, UPDATE ON public.mmi_hourometer_logs TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION match_mmi_jobs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_os_number TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE 'MMI Complete Schema Migration completed successfully!';
  RAISE NOTICE 'Tables created: mmi_systems, mmi_components, mmi_jobs, mmi_os, mmi_hourometer_logs';
  RAISE NOTICE 'Functions created: match_mmi_jobs, generate_os_number';
  RAISE NOTICE 'Triggers created: updated_at automation, os_number generation, next_maintenance calculation';
END $$;
