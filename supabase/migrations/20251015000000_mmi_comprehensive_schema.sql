-- MMI Comprehensive Schema Migration
-- Creates 5 core tables for the Intelligent Maintenance Module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: mmi_systems
-- Represents major vessel systems (propulsion, hydraulic, electrical, etc.)
CREATE TABLE IF NOT EXISTS mmi_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  vessel_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vessel lookups
CREATE INDEX IF NOT EXISTS idx_mmi_systems_vessel_id ON mmi_systems(vessel_id);

-- Add RLS policies for mmi_systems
ALTER TABLE mmi_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON mmi_systems
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_systems
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON mmi_systems
  FOR UPDATE
  TO authenticated
  USING (true);

-- Table 2: mmi_components
-- Individual components within systems that require maintenance
CREATE TABLE IF NOT EXISTS mmi_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id UUID REFERENCES mmi_systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  serial_number TEXT,
  installation_date DATE,
  operational BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for component lookups
CREATE INDEX IF NOT EXISTS idx_mmi_components_system_id ON mmi_components(system_id);
CREATE INDEX IF NOT EXISTS idx_mmi_components_operational ON mmi_components(operational);

-- Add RLS policies for mmi_components
ALTER TABLE mmi_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON mmi_components
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_components
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON mmi_components
  FOR UPDATE
  TO authenticated
  USING (true);

-- Table 3: mmi_jobs
-- Maintenance jobs/tasks to be performed
CREATE TABLE IF NOT EXISTS mmi_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT CHECK (job_type IN ('preventiva', 'corretiva', 'preditiva', 'inspeção')),
  priority TEXT CHECK (priority IN ('baixa', 'média', 'alta', 'crítica')),
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluída', 'cancelada', 'postergada')),
  due_date TIMESTAMPTZ NOT NULL,
  hours_trigger INTEGER,
  suggestion_ia TEXT,
  can_postpone BOOLEAN DEFAULT FALSE,
  postpone_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for job queries
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_component_id ON mmi_jobs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_priority ON mmi_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_due_date ON mmi_jobs(due_date);

-- Add RLS policies for mmi_jobs
ALTER TABLE mmi_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON mmi_jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON mmi_jobs
  FOR UPDATE
  TO authenticated
  USING (true);

-- Table 4: mmi_work_orders (OS)
-- Work orders created from jobs
CREATE TABLE IF NOT EXISTS mmi_work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_number TEXT UNIQUE NOT NULL,
  job_id UUID REFERENCES mmi_jobs(id) ON DELETE CASCADE,
  opened_by UUID,
  closed_by UUID,
  status TEXT CHECK (status IN ('aberta', 'em_execução', 'aguardando_peças', 'concluída', 'cancelada')),
  parts_used JSONB,
  labor_hours DECIMAL(10,2),
  notes TEXT,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for work order queries
CREATE INDEX IF NOT EXISTS idx_mmi_work_orders_job_id ON mmi_work_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_work_orders_status ON mmi_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_mmi_work_orders_os_number ON mmi_work_orders(os_number);

-- Add RLS policies for mmi_work_orders
ALTER TABLE mmi_work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON mmi_work_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_work_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON mmi_work_orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Table 5: mmi_hourometer_logs
-- Tracks operational hours for components
CREATE TABLE IF NOT EXISTS mmi_hourometer_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  hours DECIMAL(10,2) NOT NULL,
  source TEXT CHECK (source IN ('manual', 'automated', 'sensor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for hourometer queries
CREATE INDEX IF NOT EXISTS idx_mmi_hourometer_logs_component_id ON mmi_hourometer_logs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_hourometer_logs_created_at ON mmi_hourometer_logs(created_at);

-- Add RLS policies for mmi_hourometer_logs
ALTER TABLE mmi_hourometer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON mmi_hourometer_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON mmi_hourometer_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate OS numbers automatically
CREATE OR REPLACE FUNCTION generate_os_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  os_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(os_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM mmi_work_orders
  WHERE os_number LIKE 'OS-' || year_part || '-%';
  
  -- Format: OS-2025-0001
  os_num := 'OS-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN os_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set os_number on insert
CREATE OR REPLACE FUNCTION set_os_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.os_number IS NULL THEN
    NEW.os_number := generate_os_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_os_number
  BEFORE INSERT ON mmi_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_os_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for all tables
CREATE TRIGGER update_mmi_systems_updated_at
  BEFORE UPDATE ON mmi_systems
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mmi_components_updated_at
  BEFORE UPDATE ON mmi_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mmi_jobs_updated_at
  BEFORE UPDATE ON mmi_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mmi_work_orders_updated_at
  BEFORE UPDATE ON mmi_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development/testing
INSERT INTO mmi_systems (name, description) VALUES
  ('Motor Principal', 'Sistema de propulsão principal do navio'),
  ('Sistema Hidráulico', 'Sistema hidráulico de bombeamento e atuação'),
  ('Sistema Elétrico', 'Geração e distribuição elétrica'),
  ('Sistema de Segurança', 'Válvulas, alarmes e equipamentos de segurança')
ON CONFLICT DO NOTHING;

-- Get system IDs for sample components
DO $$
DECLARE
  motor_id UUID;
  hidraulico_id UUID;
BEGIN
  SELECT id INTO motor_id FROM mmi_systems WHERE name = 'Motor Principal' LIMIT 1;
  SELECT id INTO hidraulico_id FROM mmi_systems WHERE name = 'Sistema Hidráulico' LIMIT 1;
  
  IF motor_id IS NOT NULL THEN
    INSERT INTO mmi_components (system_id, name, model, operational) VALUES
      (motor_id, 'Motor Diesel Principal MAN B&W', 'MAN B&W 6S50MC-C', true),
      (motor_id, 'Filtros de Óleo ME-4500', 'Parker ME-4500', true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF hidraulico_id IS NOT NULL THEN
    INSERT INTO mmi_components (system_id, name, model, operational) VALUES
      (hidraulico_id, 'Bomba Hidráulica #3', 'Rexroth A10VSO', true),
      (hidraulico_id, 'Válvulas de Alívio - Deck Principal', 'Bosch RD-500', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

COMMENT ON TABLE mmi_systems IS 'Major vessel systems requiring maintenance tracking';
COMMENT ON TABLE mmi_components IS 'Individual components within systems';
COMMENT ON TABLE mmi_jobs IS 'Maintenance jobs and tasks';
COMMENT ON TABLE mmi_work_orders IS 'Work orders (OS) created from maintenance jobs';
COMMENT ON TABLE mmi_hourometer_logs IS 'Operational hour tracking for components';
