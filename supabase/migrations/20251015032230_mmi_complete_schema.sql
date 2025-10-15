-- MMI Complete Schema Migration
-- Version: 1.0.0
-- Date: 2025-10-15
-- Description: Complete database schema for MMI (Módulo de Manutenção Inteligente)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================================================
-- TABLE 1: mmi_systems
-- Ship systems with criticality tracking
-- =======================================================================================
CREATE TABLE IF NOT EXISTS public.mmi_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criticality TEXT NOT NULL DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  vessel_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for mmi_systems
CREATE INDEX IF NOT EXISTS idx_mmi_systems_criticality ON public.mmi_systems(criticality);
CREATE INDEX IF NOT EXISTS idx_mmi_systems_vessel ON public.mmi_systems(vessel_name);

-- Enable RLS for mmi_systems
ALTER TABLE public.mmi_systems ENABLE ROW LEVEL SECURITY;

-- RLS policies for mmi_systems
CREATE POLICY "Users can view all mmi_systems" ON public.mmi_systems 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert mmi_systems" ON public.mmi_systems 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update mmi_systems" ON public.mmi_systems 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete mmi_systems" ON public.mmi_systems 
  FOR DELETE USING (auth.role() = 'authenticated');

-- =======================================================================================
-- TABLE 2: mmi_components
-- Component tracking with hourometers
-- =======================================================================================
CREATE TABLE IF NOT EXISTS public.mmi_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  system_id UUID REFERENCES public.mmi_systems(id) ON DELETE CASCADE,
  current_hours DECIMAL NOT NULL DEFAULT 0,
  maintenance_interval_hours DECIMAL NOT NULL DEFAULT 1000,
  last_maintenance_date DATE,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'failed', 'decommissioned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for mmi_components
CREATE INDEX IF NOT EXISTS idx_mmi_components_system_id ON public.mmi_components(system_id);
CREATE INDEX IF NOT EXISTS idx_mmi_components_status ON public.mmi_components(status);
CREATE INDEX IF NOT EXISTS idx_mmi_components_hours ON public.mmi_components(current_hours);

-- Enable RLS for mmi_components
ALTER TABLE public.mmi_components ENABLE ROW LEVEL SECURITY;

-- RLS policies for mmi_components
CREATE POLICY "Users can view all mmi_components" ON public.mmi_components 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert mmi_components" ON public.mmi_components 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update mmi_components" ON public.mmi_components 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete mmi_components" ON public.mmi_components 
  FOR DELETE USING (auth.role() = 'authenticated');

-- =======================================================================================
-- TABLE 3: mmi_jobs (Enhanced with AI embeddings)
-- Maintenance jobs with vector similarity search capability
-- =======================================================================================
CREATE TABLE IF NOT EXISTS public.mmi_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  component_id UUID REFERENCES public.mmi_components(id) ON DELETE SET NULL,
  component TEXT, -- Fallback for legacy data
  asset_name TEXT,
  vessel TEXT,
  due_date DATE,
  can_postpone BOOLEAN DEFAULT true,
  suggestion_ia TEXT,
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for mmi_jobs
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON public.mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_priority ON public.mmi_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_component_id ON public.mmi_jobs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_due_date ON public.mmi_jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_created_by ON public.mmi_jobs(created_by);

-- Create vector index for similarity search
CREATE INDEX IF NOT EXISTS mmi_jobs_embedding_idx ON public.mmi_jobs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS for mmi_jobs
ALTER TABLE public.mmi_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for mmi_jobs
CREATE POLICY "Users can view all mmi_jobs" ON public.mmi_jobs 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert mmi_jobs" ON public.mmi_jobs 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update mmi_jobs" ON public.mmi_jobs 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own mmi_jobs" ON public.mmi_jobs 
  FOR UPDATE USING (auth.uid() = created_by);

-- =======================================================================================
-- TABLE 4: mmi_os (Work Orders with auto-generated OS numbers)
-- =======================================================================================
CREATE TABLE IF NOT EXISTS public.mmi_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_number TEXT UNIQUE NOT NULL, -- Format: OS-YYYYNNNN
  job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  opened_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  parts_used JSONB,
  labor_hours DECIMAL,
  total_cost DECIMAL,
  completion_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for mmi_os
CREATE UNIQUE INDEX IF NOT EXISTS idx_mmi_os_number ON public.mmi_os(os_number);
CREATE INDEX IF NOT EXISTS idx_mmi_os_job_id ON public.mmi_os(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_os_status ON public.mmi_os(status);
CREATE INDEX IF NOT EXISTS idx_mmi_os_opened_by ON public.mmi_os(opened_by);
CREATE INDEX IF NOT EXISTS idx_mmi_os_assigned_to ON public.mmi_os(assigned_to);

-- Enable RLS for mmi_os
ALTER TABLE public.mmi_os ENABLE ROW LEVEL SECURITY;

-- RLS policies for mmi_os
CREATE POLICY "Users can view all mmi_os" ON public.mmi_os 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert mmi_os" ON public.mmi_os 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update mmi_os" ON public.mmi_os 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own mmi_os" ON public.mmi_os 
  FOR UPDATE USING (auth.uid() = opened_by OR auth.uid() = assigned_to);

-- =======================================================================================
-- TABLE 5: mmi_hourometer_logs
-- Audit trail for operating hours
-- =======================================================================================
CREATE TABLE IF NOT EXISTS public.mmi_hourometer_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID NOT NULL REFERENCES public.mmi_components(id) ON DELETE CASCADE,
  hours_before DECIMAL NOT NULL,
  hours_after DECIMAL NOT NULL,
  hours_increment DECIMAL GENERATED ALWAYS AS (hours_after - hours_before) STORED,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'automatic', 'sensor')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for mmi_hourometer_logs
CREATE INDEX IF NOT EXISTS idx_mmi_hourometer_logs_component_id ON public.mmi_hourometer_logs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_hourometer_logs_created_at ON public.mmi_hourometer_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_mmi_hourometer_logs_source ON public.mmi_hourometer_logs(source);

-- Enable RLS for mmi_hourometer_logs
ALTER TABLE public.mmi_hourometer_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for mmi_hourometer_logs
CREATE POLICY "Users can view all mmi_hourometer_logs" ON public.mmi_hourometer_logs 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert mmi_hourometer_logs" ON public.mmi_hourometer_logs 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =======================================================================================
-- FUNCTION 1: match_mmi_jobs
-- Vector similarity search for finding similar maintenance jobs
-- =======================================================================================
CREATE OR REPLACE FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  component TEXT,
  asset_name TEXT,
  vessel TEXT,
  similarity float
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
    mmi_jobs.component,
    mmi_jobs.asset_name,
    mmi_jobs.vessel,
    1 - (mmi_jobs.embedding <=> query_embedding) as similarity
  FROM public.mmi_jobs
  WHERE 1 - (mmi_jobs.embedding <=> query_embedding) > match_threshold
    AND mmi_jobs.embedding IS NOT NULL
  ORDER BY mmi_jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =======================================================================================
-- FUNCTION 2: generate_os_number
-- Automatic OS number generation in format OS-YYYYNNNN
-- =======================================================================================
CREATE OR REPLACE FUNCTION generate_os_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
  sequence_num INT;
  os_num TEXT;
BEGIN
  -- Get next sequence number for the year
  SELECT COALESCE(MAX(SUBSTRING(os_number FROM 8)::INT), 0) + 1
  INTO sequence_num
  FROM public.mmi_os
  WHERE os_number LIKE 'OS-' || year || '%';
  
  -- Format as OS-YYYYNNNN
  os_num := 'OS-' || year || LPAD(sequence_num::TEXT, 4, '0');
  RETURN os_num;
END;
$$;

-- =======================================================================================
-- TRIGGER 1: Auto-generate OS number on insert
-- =======================================================================================
CREATE OR REPLACE FUNCTION set_os_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.os_number IS NULL OR NEW.os_number = '' THEN
    NEW.os_number := generate_os_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_os_number
  BEFORE INSERT ON public.mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION set_os_number();

-- =======================================================================================
-- TRIGGER 2: Update updated_at timestamp
-- =======================================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for all tables with updated_at
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

-- =======================================================================================
-- TRIGGER 3: Auto-set completed_at timestamp
-- =======================================================================================
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_completed_at
  BEFORE UPDATE ON public.mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- =======================================================================================
-- SAMPLE DATA
-- Insert sample data for testing and demonstration
-- =======================================================================================

-- Sample systems
INSERT INTO public.mmi_systems (name, description, criticality, vessel_name)
VALUES 
  ('Sistema de Propulsão Principal', 'Motor principal e sistemas auxiliares', 'critical', 'Navio Atlantic Star'),
  ('Sistema Hidráulico', 'Bombas e válvulas hidráulicas', 'high', 'Navio Oceanic Explorer'),
  ('Sistema Elétrico', 'Geradores e distribuição elétrica', 'critical', 'Navio Pacific Voyager'),
  ('Sistema de Segurança', 'Equipamentos de segurança e emergência', 'critical', 'Navio Atlantic Star')
ON CONFLICT DO NOTHING;

-- Sample components
INSERT INTO public.mmi_components (name, system_id, current_hours, maintenance_interval_hours, status)
SELECT 
  'Gerador Diesel STBD #2',
  (SELECT id FROM public.mmi_systems WHERE name = 'Sistema Elétrico' LIMIT 1),
  1850,
  2000,
  'operational'
WHERE NOT EXISTS (SELECT 1 FROM public.mmi_components WHERE name = 'Gerador Diesel STBD #2');

INSERT INTO public.mmi_components (name, system_id, current_hours, maintenance_interval_hours, status)
SELECT 
  'Bomba Hidráulica #3',
  (SELECT id FROM public.mmi_systems WHERE name = 'Sistema Hidráulico' LIMIT 1),
  950,
  1000,
  'operational'
WHERE NOT EXISTS (SELECT 1 FROM public.mmi_components WHERE name = 'Bomba Hidráulica #3');

-- Sample jobs (historical completed jobs for similarity search)
INSERT INTO public.mmi_jobs (title, description, status, priority, component, asset_name, vessel, due_date)
VALUES 
  (
    'Falha no gerador STBD',
    'Gerador STBD apresentando ruído incomum e aumento de temperatura durante operação. Identificado desgaste no ventilador e necessidade de limpeza de dutos. Resolvido com troca de ventilador e limpeza completa.',
    'completed',
    'high',
    'Gerador Diesel',
    'Gerador STBD #2',
    'Navio Atlantic Star',
    '2024-04-15'
  ),
  (
    'Manutenção preventiva bomba hidráulica',
    'Bomba hidráulica principal apresentando vibração excessiva. Histórico indica desgaste acelerado nas últimas 200h de operação. Substituídos rolamentos e vedações.',
    'completed',
    'medium',
    'Sistema Hidráulico',
    'Bomba Hidráulica #3',
    'Navio Oceanic Explorer',
    '2024-03-20'
  ),
  (
    'Falha válvula de segurança',
    'Válvula de alívio #2 com leitura fora do padrão. Substituição imediata recomendada. Impacto crítico na segurança operacional.',
    'completed',
    'critical',
    'Sistema de Segurança',
    'Válvulas de Alívio',
    'Navio Pacific Voyager',
    '2024-05-10'
  )
ON CONFLICT DO NOTHING;

-- =======================================================================================
-- COMMENTS
-- Add helpful comments to tables and columns
-- =======================================================================================
COMMENT ON TABLE public.mmi_systems IS 'Ship systems with criticality tracking';
COMMENT ON TABLE public.mmi_components IS 'Component tracking with hourometers';
COMMENT ON TABLE public.mmi_jobs IS 'Maintenance jobs with AI embeddings for similarity search';
COMMENT ON TABLE public.mmi_os IS 'Work orders with auto-generated OS numbers';
COMMENT ON TABLE public.mmi_hourometer_logs IS 'Audit trail for operating hours';

COMMENT ON COLUMN public.mmi_jobs.embedding IS 'OpenAI ada-002 1536-dimensional vector embedding';
COMMENT ON COLUMN public.mmi_os.os_number IS 'Auto-generated OS number in format OS-YYYYNNNN';
COMMENT ON COLUMN public.mmi_hourometer_logs.hours_increment IS 'Computed column: hours_after - hours_before';

-- =======================================================================================
-- GRANT PERMISSIONS
-- =======================================================================================
GRANT ALL ON public.mmi_systems TO authenticated;
GRANT ALL ON public.mmi_components TO authenticated;
GRANT ALL ON public.mmi_jobs TO authenticated;
GRANT ALL ON public.mmi_os TO authenticated;
GRANT ALL ON public.mmi_hourometer_logs TO authenticated;

GRANT ALL ON public.mmi_systems TO service_role;
GRANT ALL ON public.mmi_components TO service_role;
GRANT ALL ON public.mmi_jobs TO service_role;
GRANT ALL ON public.mmi_os TO service_role;
GRANT ALL ON public.mmi_hourometer_logs TO service_role;
