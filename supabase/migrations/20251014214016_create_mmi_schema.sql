-- 🛠️ Supabase Schema: Módulo Manutenção Inteligente (MMI)
-- Migration: Create MMI (Intelligent Maintenance Module) tables

-- Tabela: ativos da frota
CREATE TABLE IF NOT EXISTS mmi_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Ex: 603.0004.02
  vessel TEXT, -- Nome da embarcação
  location TEXT, -- Compartimento ou subsistema
  critical BOOLEAN DEFAULT false, -- Se é crítico para DP
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_assets
CREATE INDEX IF NOT EXISTS idx_mmi_assets_vessel ON mmi_assets(vessel);
CREATE INDEX IF NOT EXISTS idx_mmi_assets_critical ON mmi_assets(critical);
CREATE INDEX IF NOT EXISTS idx_mmi_assets_code ON mmi_assets(code);

-- Tabela: componentes técnicos
CREATE TABLE IF NOT EXISTS mmi_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES mmi_assets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Subcódigo se houver
  type TEXT, -- Ex: motor, bomba, sensor
  manufacturer TEXT,
  serial_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_components
CREATE INDEX IF NOT EXISTS idx_mmi_components_asset_id ON mmi_components(asset_id);
CREATE INDEX IF NOT EXISTS idx_mmi_components_type ON mmi_components(type);

-- Tabela: jobs de manutenção
CREATE TABLE IF NOT EXISTS mmi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, em_andamento, concluido, postergado
  priority TEXT DEFAULT 'normal', -- baixa, normal, alta, crítica
  due_date DATE,
  created_by UUID REFERENCES auth.users(id),
  justification TEXT,
  suggestion_ia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_jobs
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_component_id ON mmi_jobs(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_status ON mmi_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_priority ON mmi_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_due_date ON mmi_jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_created_by ON mmi_jobs(created_by);

-- Tabela: ordens de serviço
CREATE TABLE IF NOT EXISTS mmi_os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES mmi_jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'aberta', -- aberta, aprovada, em_execucao, finalizada
  opened_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_os
CREATE INDEX IF NOT EXISTS idx_mmi_os_job_id ON mmi_os(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_os_status ON mmi_os(status);
CREATE INDEX IF NOT EXISTS idx_mmi_os_opened_by ON mmi_os(opened_by);

-- Tabela: histórico técnico
CREATE TABLE IF NOT EXISTS mmi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE SET NULL,
  event_type TEXT, -- falha, troca, inspeção
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_history
CREATE INDEX IF NOT EXISTS idx_mmi_history_component_id ON mmi_history(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_history_event_type ON mmi_history(event_type);
CREATE INDEX IF NOT EXISTS idx_mmi_history_created_at ON mmi_history(created_at);

-- Tabela: horímetros manuais / IoT
CREATE TABLE IF NOT EXISTS mmi_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES mmi_components(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  source TEXT DEFAULT 'manual', -- manual, ocr, iot
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mmi_hours
CREATE INDEX IF NOT EXISTS idx_mmi_hours_component_id ON mmi_hours(component_id);
CREATE INDEX IF NOT EXISTS idx_mmi_hours_source ON mmi_hours(source);
CREATE INDEX IF NOT EXISTS idx_mmi_hours_read_at ON mmi_hours(read_at);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE mmi_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmi_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmi_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmi_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmi_hours ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mmi_assets
CREATE POLICY "Allow authenticated users to view assets"
  ON mmi_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert assets"
  ON mmi_assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update assets"
  ON mmi_assets FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for mmi_components
CREATE POLICY "Allow authenticated users to view components"
  ON mmi_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert components"
  ON mmi_components FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update components"
  ON mmi_components FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for mmi_jobs
CREATE POLICY "Allow authenticated users to view jobs"
  ON mmi_jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert jobs"
  ON mmi_jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update jobs"
  ON mmi_jobs FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for mmi_os
CREATE POLICY "Allow authenticated users to view service orders"
  ON mmi_os FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert service orders"
  ON mmi_os FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update service orders"
  ON mmi_os FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for mmi_history
CREATE POLICY "Allow authenticated users to view history"
  ON mmi_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert history"
  ON mmi_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for mmi_hours
CREATE POLICY "Allow authenticated users to view hours"
  ON mmi_hours FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert hours"
  ON mmi_hours FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_mmi_assets_updated_at
  BEFORE UPDATE ON mmi_assets
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

CREATE TRIGGER update_mmi_os_updated_at
  BEFORE UPDATE ON mmi_os
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE mmi_assets IS 'Ativos da frota - embarcações e equipamentos principais';
COMMENT ON TABLE mmi_components IS 'Componentes técnicos dos ativos';
COMMENT ON TABLE mmi_jobs IS 'Jobs de manutenção preventiva e corretiva';
COMMENT ON TABLE mmi_os IS 'Ordens de serviço vinculadas aos jobs';
COMMENT ON TABLE mmi_history IS 'Histórico técnico de eventos dos componentes';
COMMENT ON TABLE mmi_hours IS 'Horímetros e leituras de uso (manual, OCR, IoT)';
