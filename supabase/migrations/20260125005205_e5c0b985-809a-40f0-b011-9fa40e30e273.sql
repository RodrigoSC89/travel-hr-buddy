-- IMCA Incidents Database - Migrar bulletins para banco de dados
-- Esta tabela substitui o array hardcoded na Edge Function

CREATE TABLE IF NOT EXISTS public.imca_incidents_database (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  bulletin_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  root_causes TEXT[] DEFAULT '{}',
  lessons_learned TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  incident_date DATE,
  source TEXT DEFAULT 'IMCA',
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_imca_incidents_category ON public.imca_incidents_database(category);
CREATE INDEX IF NOT EXISTS idx_imca_incidents_severity ON public.imca_incidents_database(severity);
CREATE INDEX IF NOT EXISTS idx_imca_incidents_org ON public.imca_incidents_database(organization_id);

-- RLS
ALTER TABLE public.imca_incidents_database ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver bulletins globais ou da própria organização
CREATE POLICY "Users can view IMCA bulletins"
  ON public.imca_incidents_database FOR SELECT
  USING (
    is_global = true
    OR organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Política: Apenas admins podem inserir
CREATE POLICY "Admins can insert IMCA bulletins"
  ON public.imca_incidents_database FOR INSERT
  WITH CHECK (
    public.is_admin_or_hr(auth.uid())
  );

-- Política: Apenas admins podem atualizar
CREATE POLICY "Admins can update IMCA bulletins"
  ON public.imca_incidents_database FOR UPDATE
  USING (
    public.is_admin_or_hr(auth.uid())
  );

-- Tabela de análises de incidentes locais
CREATE TABLE IF NOT EXISTS public.imca_local_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  incident_code TEXT NOT NULL,
  vessel_name TEXT,
  incident_date DATE NOT NULL,
  category TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')) DEFAULT 'moderate',
  description TEXT NOT NULL,
  equipment_involved TEXT,
  injuries INTEGER DEFAULT 0,
  environmental_impact BOOLEAN DEFAULT false,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ai_analysis JSONB DEFAULT '{}',
  similar_bulletins JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('open', 'investigating', 'closed', 'archived')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_imca_local_category ON public.imca_local_incidents(category);
CREATE INDEX IF NOT EXISTS idx_imca_local_status ON public.imca_local_incidents(status);
CREATE INDEX IF NOT EXISTS idx_imca_local_org ON public.imca_local_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_imca_local_vessel ON public.imca_local_incidents(vessel_id);

-- RLS
ALTER TABLE public.imca_local_incidents ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver incidentes da própria organização
CREATE POLICY "Users can view local incidents"
  ON public.imca_local_incidents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "Users can create local incidents"
  ON public.imca_local_incidents FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Política: Usuários podem atualizar incidentes da própria organização
CREATE POLICY "Users can update own org incidents"
  ON public.imca_local_incidents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_imca_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_imca_database_updated_at
  BEFORE UPDATE ON public.imca_incidents_database
  FOR EACH ROW
  EXECUTE FUNCTION public.update_imca_updated_at();

CREATE TRIGGER update_imca_local_updated_at
  BEFORE UPDATE ON public.imca_local_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_imca_updated_at();

-- Inserir dados iniciais (bulletins globais IMCA)
INSERT INTO public.imca_incidents_database (bulletin_id, title, category, description, root_causes, lessons_learned, recommendations, severity, incident_date, is_global)
VALUES 
  ('SF-2024-01', 'Failure of crane wire during subsea operations', 'Lifting & Mechanical Handling', 'Crane wire parted during routine subsea equipment recovery operation', ARRAY['Wire fatigue not detected', 'Inspection interval exceeded', 'Load cell malfunction'], ARRAY['Implement weekly wire rope inspections', 'Install backup load monitoring', 'Review lifting procedures'], ARRAY['Reduce inspection interval to 7 days', 'Install redundant load cells', 'Update risk assessment'], 'high', '2024-03-15', true),
  ('SF-2024-02', 'DP excursion due to thruster failure', 'DP Operations', 'Vessel experienced uncontrolled excursion after main thruster tripped offline', ARRAY['VFD overheating', 'Cooling system fouled', 'Maintenance backlog'], ARRAY['VFD cooling critical for DP reliability', 'Thruster redundancy must be verified daily'], ARRAY['Implement thermal monitoring', 'Clean cooling systems quarterly', 'Update DP FMEA'], 'critical', '2024-02-28', true),
  ('SF-2024-03', 'Personnel injury during offshore transfer', 'Personal Safety', 'Crew member sustained injury during personnel basket transfer', ARRAY['Improper PPE usage', 'Weather window misjudged', 'Communication breakdown'], ARRAY['Strict adherence to transfer weather limits', 'Two-way radio mandatory for all transfers'], ARRAY['Review POB transfer procedures', 'Implement weather monitoring automation'], 'medium', '2024-01-20', true),
  ('SF-2023-15', 'Engine room fire during maintenance', 'Fire & Explosion', 'Fire broke out in engine room during hot work operations', ARRAY['Hot work permit not properly executed', 'Fire watch not maintained', 'Combustible materials nearby'], ARRAY['Zero tolerance for hot work permit violations', '30-minute fire watch minimum after work'], ARRAY['Reinforce hot work training', 'Install additional fixed fire detection'], 'critical', '2023-11-05', true),
  ('SF-2024-04', 'Diving bell umbilical snag', 'Diving Operations', 'Diving bell umbilical became entangled with subsea structure during bell run', ARRAY['Inadequate survey of bell path', 'Current conditions underestimated', 'Communication gap between dive control and bridge'], ARRAY['Full path survey mandatory before bell operations', 'Current monitoring at dive site', 'Establish clear bridge-dive control protocols'], ARRAY['Deploy ROV for path survey', 'Install current meters at operational depth'], 'high', '2024-04-10', true),
  ('SF-2024-05', 'Mooring line failure during cargo ops', 'Marine Operations', 'Forward mooring line parted during side-by-side cargo transfer operation', ARRAY['Line age exceeded limits', 'Surge conditions exceeded safe parameters', 'Tension monitoring not in use'], ARRAY['Mooring lines must be within certification period', 'Weather limits strictly enforced'], ARRAY['Replace all lines over 5 years', 'Mandatory tension monitoring system'], 'high', '2024-05-22', true)
ON CONFLICT (bulletin_id) DO NOTHING;