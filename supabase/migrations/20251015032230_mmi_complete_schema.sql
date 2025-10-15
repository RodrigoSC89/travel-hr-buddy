-- MMI Complete Database Schema
-- Version 2.0 - Full implementation with 5 core tables
-- Requires pgvector extension for similarity search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: mmi_systems
-- Represents major ship systems (propulsion, electrical, hydraulic, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mmi_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  vessel_id UUID, -- Reference to vessels table (if it exists)
  criticality TEXT CHECK (criticality IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('operational', 'maintenance', 'failed', 'inactive')) DEFAULT 'operational',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for mmi_systems
CREATE INDEX IF NOT EXISTS idx_mmi_systems_vessel ON public.mmi_systems(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mmi_systems_criticality ON public.mmi_systems(criticality);
CREATE INDEX IF NOT EXISTS idx_mmi_systems_status ON public.mmi_systems(status);

-- RLS for mmi_systems
ALTER TABLE public.mmi_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.mmi_systems
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.mmi_systems
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.mmi_systems
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE 2: mmi_components
-- Individual components within systems
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mmi_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID REFERENCES public.mmi_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  component_type TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  operational_hours INTEGER DEFAULT 0,
  max_hours_before_maintenance INTEGER DEFAULT 1000,
  status TEXT CHECK (status IN ('operational', 'maintenance', 'failed', 'retired')) DEFAULT 'operational',
  last_maintenance_date TIMESTAMPTZ,
  next_maintenance_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for mmi_components
CREATE INDEX IF NOT EXISTS idx_mmi_components_system ON public.mmi_components(system_id);
CREATE INDEX IF NOT EXISTS idx_mmi_components_status ON public.mmi_components(status);
CREATE INDEX IF NOT EXISTS idx_mmi_components_hours ON public.mmi_components(operational_hours);
CREATE INDEX IF NOT EXISTS idx_mmi_components_next_maintenance ON public.mmi_components(next_maintenance_date);

-- RLS for mmi_components
ALTER TABLE public.mmi_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.mmi_components
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.mmi_components
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.mmi_components
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE 3: mmi_jobs (Enhanced version)
-- Maintenance jobs with AI embeddings for similarity search
-- ============================================================================

-- Drop old simple version if it exists
DROP TABLE IF EXISTS public.mmi_jobs CASCADE;

CREATE TABLE public.mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES public.mmi_components(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT CHECK (job_type IN ('preventive', 'corrective', 'predictive', 'inspection')) DEFAULT 'preventive',
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'postponed', 'cancelled')) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  can_postpone BOOLEAN DEFAULT false,
  postponement_count INTEGER DEFAULT 0,
  original_due_date TIMESTAMPTZ,
  suggestion_ia TEXT,
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for mmi_jobs
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_component ON public.mmi_jobs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_priority ON public.mmi_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_due_date ON public.mmi_jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_assigned_to ON public.mmi_jobs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_created_by ON public.mmi_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_job_type ON public.mmi_jobs(job_type);

-- Vector similarity index
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_embedding ON public.mmi_jobs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RLS for mmi_jobs
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.mmi_jobs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.mmi_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for job creators and assignees" ON public.mmi_jobs
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    auth.role() = 'authenticated'
  );

-- ============================================================================
-- TABLE 4: mmi_os (Enhanced version - Work Orders)
-- Work orders linked to maintenance jobs
-- ============================================================================

-- Drop old simple version if it exists and recreate
DROP TABLE IF EXISTS public.mmi_os CASCADE;

CREATE TABLE public.mmi_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.mmi_jobs(id) ON DELETE CASCADE,
  os_number TEXT UNIQUE,
  opened_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  parts_used JSONB DEFAULT '[]'::JSONB,
  labor_hours DECIMAL(5,2),
  labor_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  notes TEXT,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for mmi_os
CREATE INDEX IF NOT EXISTS idx_mmi_os_job ON public.mmi_os(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_os_status ON public.mmi_os(status);
CREATE INDEX IF NOT EXISTS idx_mmi_os_number ON public.mmi_os(os_number);
CREATE INDEX IF NOT EXISTS idx_mmi_os_opened_by ON public.mmi_os(opened_by);
CREATE INDEX IF NOT EXISTS idx_mmi_os_assigned_to ON public.mmi_os(assigned_to);
CREATE INDEX IF NOT EXISTS idx_mmi_os_opened_at ON public.mmi_os(opened_at DESC);

-- RLS for mmi_os
ALTER TABLE public.mmi_os ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.mmi_os
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.mmi_os
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for OS creators and assignees" ON public.mmi_os
  FOR UPDATE USING (
    auth.uid() = opened_by OR 
    auth.uid() = assigned_to OR
    auth.role() = 'authenticated'
  );

-- ============================================================================
-- TABLE 5: mmi_hourometer_logs
-- Audit trail for component operating hours
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES public.mmi_components(id) ON DELETE CASCADE,
  hours_recorded INTEGER NOT NULL,
  previous_hours INTEGER,
  increment INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by TEXT DEFAULT 'system',
  source TEXT CHECK (source IN ('automatic', 'manual', 'sensor')) DEFAULT 'automatic',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for mmi_hourometer_logs
CREATE INDEX IF NOT EXISTS idx_hourometer_component ON public.mmi_hourometer_logs(component_id);
CREATE INDEX IF NOT EXISTS idx_hourometer_recorded_at ON public.mmi_hourometer_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_hourometer_source ON public.mmi_hourometer_logs(source);

-- RLS for mmi_hourometer_logs
ALTER TABLE public.mmi_hourometer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.mmi_hourometer_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and system" ON public.mmi_hourometer_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: match_mmi_jobs (Vector similarity search)
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
  metadata JSONB,
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
    mmi_jobs.metadata,
    mmi_jobs.created_at
  FROM public.mmi_jobs
  WHERE mmi_jobs.embedding IS NOT NULL
    AND 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Generate OS number
CREATE OR REPLACE FUNCTION generate_os_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INT;
  os_num TEXT;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(os_number FROM 8) AS INT)), 0) + 1
  INTO sequence_num
  FROM public.mmi_os
  WHERE os_number LIKE 'OS-' || year_prefix || '%';
  
  os_num := 'OS-' || year_prefix || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN os_num;
END;
$$;

-- Trigger: Auto-generate OS number
CREATE OR REPLACE FUNCTION set_os_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.os_number IS NULL THEN
    NEW.os_number := generate_os_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_os_number
  BEFORE INSERT ON public.mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION set_os_number();

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mmi_systems_updated_at
  BEFORE UPDATE ON public.mmi_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mmi_components_updated_at
  BEFORE UPDATE ON public.mmi_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mmi_jobs_updated_at
  BEFORE UPDATE ON public.mmi_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mmi_os_updated_at
  BEFORE UPDATE ON public.mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.mmi_systems IS 'Major ship systems (propulsion, electrical, hydraulic, etc.)';
COMMENT ON TABLE public.mmi_components IS 'Individual components within ship systems';
COMMENT ON TABLE public.mmi_jobs IS 'Maintenance jobs with AI embeddings for similarity search';
COMMENT ON TABLE public.mmi_os IS 'Work orders (Ordem de Serviço) for executing maintenance jobs';
COMMENT ON TABLE public.mmi_hourometer_logs IS 'Audit trail for component operating hours';

COMMENT ON COLUMN public.mmi_jobs.embedding IS 'OpenAI text-embedding-ada-002 vector (1536 dimensions)';
COMMENT ON FUNCTION match_mmi_jobs IS 'Find similar jobs based on embedding cosine similarity';
COMMENT ON FUNCTION generate_os_number IS 'Generate unique OS number in format OS-YYYYNNNN';
