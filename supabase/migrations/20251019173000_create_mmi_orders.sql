-- Create mmi_orders table for MMI work order management
CREATE TABLE IF NOT EXISTS mmi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Crítica', 'Alta', 'Média', 'Baixa')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em andamento', 'concluída', 'cancelada')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create index on commonly queried columns for performance
CREATE INDEX IF NOT EXISTS idx_mmi_orders_status ON mmi_orders(status);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_created_at ON mmi_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mmi_orders_vessel_name ON mmi_orders(vessel_name);

-- Enable Row Level Security
ALTER TABLE mmi_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all orders
CREATE POLICY "Allow authenticated users to read orders"
  ON mmi_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert orders
CREATE POLICY "Allow authenticated users to insert orders"
  ON mmi_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update orders
CREATE POLICY "Allow authenticated users to update orders"
  ON mmi_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mmi_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mmi_orders_updated_at
  BEFORE UPDATE ON mmi_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_orders_updated_at();

-- Insert sample data for testing
INSERT INTO mmi_orders (vessel_name, system_name, priority, status, description) VALUES
  ('PSV Maersk Challenger', 'Sistema Hidráulico Principal', 'Crítica', 'pendente', 
   'Vazamento detectado na bomba hidráulica principal.\nRequer inspeção imediata e possível substituição de vedações.\nRisco de falha operacional se não corrigido.'),
  ('PSV Ocean Star', 'Motor Principal Starboard', 'Alta', 'em andamento', 
   'Manutenção preventiva programada do motor principal.\nTroca de filtros e análise de óleo.\nPrevisão de conclusão: 3 dias.'),
  ('AHTS Thunder', 'Sistema de Combate a Incêndio', 'Média', 'pendente',
   'Inspeção anual do sistema de combate a incêndio.\nTestar bombas e verificar sprinklers.\nAgendado para próxima semana.'),
  ('PSV Atlantic Wind', 'Gerador de Emergência', 'Alta', 'concluída',
   'Reparo do gerador de emergência completado.\nSubstituição de alternador e testes realizados com sucesso.\nSistema operacional.'),
  ('AHTS Sea Power', 'Guindaste Principal', 'Baixa', 'pendente',
   'Manutenção de rotina do guindaste.\nLubrificação e inspeção visual.\nNão urgente.');
