-- Create DP Incidents table for Dynamic Positioning Intelligence Center
-- This table stores incident data from IMCA and other DP-related events

CREATE TABLE IF NOT EXISTS public.dp_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL, -- e.g., "IMCA-2025-009"
  title TEXT NOT NULL,
  description TEXT,
  incident_date DATE,
  vessel_name TEXT,
  vessel_class TEXT, -- DP Class 1, 2, or 3
  incident_type TEXT, -- "position_loss", "drive_off", "system_failure", "human_error", etc.
  severity TEXT, -- "critical", "high", "medium", "low"
  location TEXT, -- Geographic location
  water_depth NUMERIC, -- in meters
  
  -- Root cause analysis
  root_cause TEXT,
  contributing_factors TEXT[],
  
  -- IMCA Standards
  imca_standards TEXT[], -- e.g., ["M190", "M103"]
  imca_reference TEXT,
  
  -- Technical details
  system_involved TEXT[], -- e.g., ["gyro", "thruster", "power", "reference_system"]
  equipment_failure TEXT,
  weather_conditions TEXT,
  
  -- Analysis and recommendations
  corrective_actions TEXT[],
  preventive_measures TEXT[],
  lessons_learned TEXT,
  
  -- PEO-DP compliance
  peo_dp_section TEXT, -- Which section of PEO-DP applies
  compliance_status TEXT, -- "compliant", "non_compliant", "partially_compliant"
  
  -- AI Analysis (will be populated by the analyze endpoint)
  ai_analysis JSONB, -- Stores GPT-4 analysis results
  ai_recommendations TEXT[],
  
  -- Metadata
  reported_by TEXT,
  status TEXT DEFAULT 'reported', -- "reported", "under_investigation", "analyzed", "closed"
  attachments TEXT[],
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_incident_id ON public.dp_incidents(incident_id);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_incident_type ON public.dp_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_vessel_class ON public.dp_incidents(vessel_class);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_severity ON public.dp_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_status ON public.dp_incidents(status);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_imca_standards ON public.dp_incidents USING GIN(imca_standards);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_tags ON public.dp_incidents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_date ON public.dp_incidents(incident_date DESC);

-- Enable Row Level Security
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read dp_incidents"
  ON public.dp_incidents
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert dp_incidents"
  ON public.dp_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own dp_incidents"
  ON public.dp_incidents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own dp_incidents"
  ON public.dp_incidents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_dp_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dp_incidents_updated_at
  BEFORE UPDATE ON public.dp_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dp_incidents_updated_at();

-- Insert sample IMCA incidents for testing
INSERT INTO public.dp_incidents (
  incident_id,
  title,
  description,
  incident_date,
  vessel_class,
  incident_type,
  severity,
  root_cause,
  imca_standards,
  system_involved,
  corrective_actions,
  preventive_measures,
  status,
  tags
) VALUES
(
  'IMCA-2025-009',
  'Perda de posição durante operação de perfuração',
  'Embarcação DP Classe 2 sofreu perda temporária de posição devido a falha simultânea de dois sistemas de referência (DGPS e Gyro principal). Operação de perfuração foi suspensa imediatamente.',
  '2025-01-15',
  'DP Class 2',
  'position_loss',
  'high',
  'Falha simultânea de sistemas redundantes não detectada pelo sistema de monitoramento',
  ARRAY['M190', 'M103', 'M182'],
  ARRAY['dgps', 'gyro', 'reference_system'],
  ARRAY[
    'Substituição imediata dos sistemas de referência defeituosos',
    'Revisão do sistema de alarmes e monitoramento',
    'Implementação de checklist pré-operacional mais rigoroso'
  ],
  ARRAY[
    'Manutenção preventiva quinzenal de sistemas de referência',
    'Treinamento adicional para DPOs sobre identificação precoce de falhas',
    'Implementação de sistema de backup terciário para operações críticas'
  ],
  'analyzed',
  ARRAY['imca', 'position_loss', 'reference_system', 'drilling']
),
(
  'IMCA-2025-014',
  'Drive-off durante aproximação de plataforma',
  'Evento de Drive-off durante aproximação de FPSO em águas profundas. Embarcação DP Classe 3 acelerou inesperadamente devido a erro de configuração no sistema de controle de thrusters.',
  '2025-02-03',
  'DP Class 3',
  'drive_off',
  'critical',
  'Erro humano na configuração do modo de controle - transição incorreta entre modos manual e automático',
  ARRAY['M190', 'M117'],
  ARRAY['thruster', 'control_system', 'human_error'],
  ARRAY[
    'Revisão completa dos procedimentos de transição de modos de controle',
    'Implementação de confirmação dupla para mudanças críticas de modo',
    'Retreinamento completo da equipe de bridge'
  ],
  ARRAY[
    'Implementação de simulador para treinamento de transições de modo',
    'Checklist mandatório com verificação por segundo operador',
    'Sistema de alerta visual e sonoro durante transições de modo'
  ],
  'analyzed',
  ARRAY['imca', 'drive_off', 'human_error', 'fpso', 'critical']
),
(
  'INC-2024-087',
  'Falha de thruster durante operação com ROV',
  'Um thruster principal apresentou falha durante operação submarina com ROV em DP Classe 2. Sistema compensou automaticamente mas capacidade redundância foi reduzida.',
  '2024-12-20',
  'DP Class 2',
  'system_failure',
  'medium',
  'Desgaste prematuro de rolamento devido a manutenção inadequada',
  ARRAY['M103', 'M190'],
  ARRAY['thruster', 'mechanical'],
  ARRAY[
    'Substituição do thruster defeituoso',
    'Inspeção de todos os outros thrusters da mesma série',
    'Revisão do plano de manutenção preventiva'
  ],
  ARRAY[
    'Manutenção preditiva baseada em análise de vibração',
    'Monitoramento contínuo de performance de thrusters',
    'Programa de substituição preventiva de componentes críticos'
  ],
  'closed',
  ARRAY['thruster', 'maintenance', 'rov', 'subsea']
);

-- Grant permissions
GRANT ALL ON public.dp_incidents TO authenticated;
GRANT SELECT ON public.dp_incidents TO anon;
