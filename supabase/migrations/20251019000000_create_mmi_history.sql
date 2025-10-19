-- Create mmi_history table for MMI maintenance history tracking
CREATE TABLE IF NOT EXISTS mmi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name TEXT,
  system_name TEXT,
  task_description TEXT,
  executed_at TIMESTAMP,
  status TEXT CHECK (status IN ('executado', 'pendente', 'atrasado')),
  created_at TIMESTAMP DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_mmi_history_vessel_name ON mmi_history(vessel_name);
CREATE INDEX IF NOT EXISTS idx_mmi_history_status ON mmi_history(status);
CREATE INDEX IF NOT EXISTS idx_mmi_history_executed_at ON mmi_history(executed_at DESC);

-- Enable Row Level Security
ALTER TABLE mmi_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read mmi_history"
  ON mmi_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert mmi_history"
  ON mmi_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update mmi_history"
  ON mmi_history
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO mmi_history (vessel_name, system_name, task_description, executed_at, status)
VALUES
  ('Vessel A', 'Sistema Propulsão', 'Manutenção preventiva do motor principal', '2025-10-15 10:00:00', 'executado'),
  ('Vessel A', 'Sistema Elétrico', 'Inspeção do gerador auxiliar', '2025-10-16 14:30:00', 'executado'),
  ('Vessel B', 'Sistema Hidráulico', 'Troca de óleo do sistema hidráulico', '2025-10-17 09:00:00', 'pendente'),
  ('Vessel B', 'Sistema Navegação', 'Calibração do GPS', '2025-10-18 11:00:00', 'pendente'),
  ('Vessel C', 'Sistema Segurança', 'Teste de alarmes de incêndio', '2025-10-12 08:00:00', 'atrasado'),
  ('Vessel C', 'Sistema Propulsão', 'Revisão do sistema de refrigeração', '2025-10-13 15:00:00', 'atrasado');
