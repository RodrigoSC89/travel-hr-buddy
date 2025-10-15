-- Create table for MMI OS (Work Order) IA feed
-- This table stores historical maintenance actions and their effectiveness
-- Used by the MMI Copilot to learn from past experiences

CREATE TABLE IF NOT EXISTS mmi_os_ia_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  componente TEXT NOT NULL, -- Component name (e.g., "Sistema Hidráulico Principal")
  acao_realizada TEXT NOT NULL, -- Action performed
  duracao_execucao TEXT, -- Execution duration (e.g., "3 horas", "2 dias")
  efetiva BOOLEAN DEFAULT true, -- Was the action effective?
  data_execucao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observacoes TEXT, -- Additional observations
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster component queries
CREATE INDEX IF NOT EXISTS idx_mmi_os_ia_feed_componente ON mmi_os_ia_feed(componente);

-- Create index for effective actions
CREATE INDEX IF NOT EXISTS idx_mmi_os_ia_feed_efetiva ON mmi_os_ia_feed(efetiva) WHERE efetiva = true;

-- Enable Row Level Security
ALTER TABLE mmi_os_ia_feed ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all resolved actions (for learning)
CREATE POLICY "Users can view all mmi_os_ia_feed records"
  ON mmi_os_ia_feed
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own actions
CREATE POLICY "Users can insert their own mmi_os_ia_feed records"
  ON mmi_os_ia_feed
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Policy: Users can update their own actions
CREATE POLICY "Users can update their own mmi_os_ia_feed records"
  ON mmi_os_ia_feed
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mmi_os_ia_feed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mmi_os_ia_feed_updated_at
  BEFORE UPDATE ON mmi_os_ia_feed
  FOR EACH ROW
  EXECUTE FUNCTION update_mmi_os_ia_feed_updated_at();

-- Insert some sample data for testing
INSERT INTO mmi_os_ia_feed (componente, acao_realizada, duracao_execucao, efetiva, observacoes)
VALUES
  ('Sistema Hidráulico Principal', 'Substituição de selo da bomba hidráulica', '3 horas', true, 'Selo apresentava desgaste excessivo. Após substituição, pressão normalizada.'),
  ('Sistema Hidráulico Principal', 'Calibração de válvula de alívio', '1 hora', true, 'Válvula estava com ajuste incorreto. Recalibração resolveu oscilações.'),
  ('Sistema Hidráulico Principal', 'Troca de filtro hidráulico', '45 minutos', true, 'Filtro saturado causava baixo fluxo. Substituição restaurou performance.'),
  ('Motor Principal', 'Substituição de filtros de óleo', '2 horas', true, 'Filtros saturados. Troca preventiva conforme manual.'),
  ('Motor Principal', 'Ajuste de válvulas', '4 horas', true, 'Válvulas desajustadas após 500h de operação. Reajuste conforme especificações.'),
  ('Sistema de Segurança', 'Teste de válvulas de alívio', '30 minutos', true, 'Teste periódico conforme normas. Todas as válvulas operacionais.'),
  ('Sistema de Segurança', 'Calibração de sensores de pressão', '1.5 horas', true, 'Sensores com drift. Recalibração restaurou precisão.');
