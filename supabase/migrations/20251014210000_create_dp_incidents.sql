-- Create dp_incidents table for DP Intelligence Center
CREATE TABLE IF NOT EXISTS dp_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  class_dp TEXT NOT NULL CHECK (class_dp IN ('DP1', 'DP2', 'DP3')),
  vessel TEXT NOT NULL,
  location TEXT NOT NULL,
  summary TEXT,
  root_cause TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'reviewed', 'closed')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  imca_reference TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE dp_incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all incidents
CREATE POLICY "Allow authenticated users to read dp_incidents"
  ON dp_incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert incidents
CREATE POLICY "Allow authenticated users to insert dp_incidents"
  ON dp_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update incidents
CREATE POLICY "Allow authenticated users to update dp_incidents"
  ON dp_incidents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX idx_dp_incidents_class_dp ON dp_incidents(class_dp);
CREATE INDEX idx_dp_incidents_status ON dp_incidents(status);
CREATE INDEX idx_dp_incidents_date ON dp_incidents(date DESC);
CREATE INDEX idx_dp_incidents_vessel ON dp_incidents(vessel);
CREATE INDEX idx_dp_incidents_location ON dp_incidents(location);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dp_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_dp_incidents_updated_at
  BEFORE UPDATE ON dp_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_dp_incidents_updated_at();

-- Insert sample data for testing
INSERT INTO dp_incidents (title, date, class_dp, vessel, location, summary, root_cause, severity, imca_reference, status)
VALUES
  (
    'Perda temporária de posição durante operação de drilling',
    '2024-10-01',
    'DP2',
    'Drillship Ocean Explorer',
    'Bacia de Santos - Poço XY-123',
    'Durante operação de perfuração em águas profundas, o sistema DP apresentou perda parcial de thrusters após falha no sistema de energia. A embarcação derivou 15m antes da recuperação total.',
    'Falha no UPS do sistema de controle de thrusters causada por sobrecarga térmica',
    'high',
    'IMCA M 252',
    'pending'
  ),
  (
    'Falha de redundância em sistema de referência',
    '2024-09-15',
    'DP3',
    'FPSO Petrobras XXIII',
    'Bacia de Campos - Campo de Marlim',
    'Durante operações rotineiras, o sistema DGPS primário apresentou falha intermitente. O sistema secundário assumiu corretamente, mas investigação revelou degradação de antena.',
    'Degradação de cabo de antena DGPS por exposição prolongada a ambiente salino',
    'medium',
    'IMCA M 190',
    'reviewed'
  ),
  (
    'Drive-off durante operação de ROV',
    '2024-08-22',
    'DP2',
    'DSV Deep Ocean',
    'Bacia de Espírito Santo - Subsea Manifold',
    'Durante operação de ROV em profundidade de 1200m, houve perda súbita de posição resultando em drive-off de 45m. ROV foi recuperado sem danos.',
    'Erro humano: operador desabilitou temporariamente zona de exclusão durante mudança de turno',
    'critical',
    'IMCA M 103',
    'analyzing'
  ),
  (
    'Blackout parcial afetando sistema DP',
    '2024-07-10',
    'DP2',
    'PSV Atlantic Support',
    'Terminal de Angra dos Reis',
    'Durante operação de transferência de carga, houve blackout parcial que afetou um dos painéis do sistema DP. Sistema operou em modo degradado por 20 minutos.',
    'Falha em disjuntor principal devido a desgaste de contatos',
    'high',
    'IMCA M 166',
    'closed'
  );

-- Add comments to table and columns
COMMENT ON TABLE dp_incidents IS 'Armazena incidentes de Posicionamento Dinâmico para análise de inteligência e IA';
COMMENT ON COLUMN dp_incidents.class_dp IS 'Classe DP da embarcação: DP1, DP2 ou DP3';
COMMENT ON COLUMN dp_incidents.ai_analysis IS 'Análise técnica gerada por IA (GPT-4) incluindo normas, causas e recomendações';
COMMENT ON COLUMN dp_incidents.imca_reference IS 'Referência às diretrizes IMCA aplicáveis (ex: M190, M103, M166)';
