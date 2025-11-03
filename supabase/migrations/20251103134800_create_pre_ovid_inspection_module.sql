-- ✅ PATCH 650 - Pre-OVID Inspection Module
-- Supabase Schema for Pre-OVID (Offshore Vessel Inspection Questionnaire) Module

-- Tabela de inspeções Pré-OVID
CREATE TABLE IF NOT EXISTS pre_ovid_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  inspector_id UUID REFERENCES profiles(id),
  inspection_date TIMESTAMPTZ DEFAULT now(),
  status TEXT CHECK (status IN ('draft', 'submitted', 'reviewed')) DEFAULT 'draft',
  risk_rating TEXT,
  notes TEXT,
  location TEXT,
  checklist_version TEXT DEFAULT 'ovid-v3',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de respostas do questionário por seção
CREATE TABLE IF NOT EXISTS pre_ovid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES pre_ovid_inspections(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  question_number TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response TEXT,
  comments TEXT,
  non_conformity BOOLEAN DEFAULT false,
  ai_suggestion TEXT,
  ai_risk_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de evidências (fotos, documentos, vídeos)
CREATE TABLE IF NOT EXISTS pre_ovid_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES pre_ovid_inspections(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  related_section TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de relatórios gerados por IA
CREATE TABLE IF NOT EXISTS pre_ovid_ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES pre_ovid_inspections(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT now(),
  summary TEXT,
  critical_findings TEXT,
  suggested_plan TEXT,
  risk_score INTEGER,
  compliance_score INTEGER,
  created_by UUID REFERENCES profiles(id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pre_ovid_inspections_vessel ON pre_ovid_inspections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_pre_ovid_inspections_inspector ON pre_ovid_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_pre_ovid_inspections_date ON pre_ovid_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_pre_ovid_responses_inspection ON pre_ovid_responses(inspection_id);
CREATE INDEX IF NOT EXISTS idx_pre_ovid_evidences_inspection ON pre_ovid_evidences(inspection_id);
CREATE INDEX IF NOT EXISTS idx_pre_ovid_ai_reports_inspection ON pre_ovid_ai_reports(inspection_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE pre_ovid_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_ovid_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_ovid_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_ovid_ai_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Inspetor pode ver suas próprias inspeções
CREATE POLICY "Inspector can view own inspections" ON pre_ovid_inspections
  FOR SELECT USING (inspector_id = auth.uid());

CREATE POLICY "Inspector can create inspections" ON pre_ovid_inspections
  FOR INSERT WITH CHECK (inspector_id = auth.uid());

CREATE POLICY "Inspector can update own inspections" ON pre_ovid_inspections
  FOR UPDATE USING (inspector_id = auth.uid());

-- Políticas RLS: Admin pode tudo
CREATE POLICY "Admin full access to inspections" ON pre_ovid_inspections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Políticas para responses
CREATE POLICY "Users can view responses of their inspections" ON pre_ovid_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pre_ovid_inspections 
      WHERE id = inspection_id 
      AND (inspector_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Users can insert responses" ON pre_ovid_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pre_ovid_inspections 
      WHERE id = inspection_id AND inspector_id = auth.uid()
    )
  );

-- Políticas para evidences
CREATE POLICY "Users can view evidences of their inspections" ON pre_ovid_evidences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pre_ovid_inspections 
      WHERE id = inspection_id 
      AND (inspector_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Users can upload evidences" ON pre_ovid_evidences
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Políticas para AI reports
CREATE POLICY "Users can view AI reports of their inspections" ON pre_ovid_ai_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pre_ovid_inspections 
      WHERE id = inspection_id 
      AND (inspector_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "System can create AI reports" ON pre_ovid_ai_reports
  FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_pre_ovid_inspections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pre_ovid_inspections_updated_at
  BEFORE UPDATE ON pre_ovid_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_pre_ovid_inspections_updated_at();

-- Comentários das tabelas para documentação
COMMENT ON TABLE pre_ovid_inspections IS 'Tabela principal de inspeções pré-OVID (Offshore Vessel Inspection Questionnaire)';
COMMENT ON TABLE pre_ovid_responses IS 'Respostas detalhadas do questionário OVID por seção';
COMMENT ON TABLE pre_ovid_evidences IS 'Evidências coletadas durante inspeções (fotos, documentos, vídeos)';
COMMENT ON TABLE pre_ovid_ai_reports IS 'Relatórios e análises gerados por IA com base nas inspeções';
