-- =============================================================================
-- MÓDULO 1: CONTRATO DO BARCO + IA DE DOWNTIME
-- =============================================================================

-- Contratos de embarcação
CREATE TABLE IF NOT EXISTS public.vessel_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  operator_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sla_downtime_percent NUMERIC(5,2) DEFAULT 0.00,
  penalty_per_hour NUMERIC(12,2) DEFAULT 0.00,
  penalty_currency TEXT DEFAULT 'USD',
  terms_conditions JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Eventos de downtime
CREATE TABLE IF NOT EXISTS public.downtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.vessel_contracts(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_hours NUMERIC(10,2),
  reason TEXT NOT NULL,
  reason_category TEXT CHECK (reason_category IN ('mechanical', 'electrical', 'weather', 'operational', 'scheduled', 'emergency', 'other')),
  system_affected TEXT,
  impact_level TEXT DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  justification_required BOOLEAN DEFAULT false,
  justification_status TEXT DEFAULT 'pending' CHECK (justification_status IN ('pending', 'approved', 'rejected', 'na')),
  justification_text TEXT,
  ai_analysis JSONB DEFAULT '{}',
  evidence_files JSONB DEFAULT '[]',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registros BROA (Boletim de Registro de Ocorrências e Avarias)
CREATE TABLE IF NOT EXISTS public.broa_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  downtime_event_id UUID REFERENCES public.downtime_events(id) ON DELETE SET NULL,
  broa_number TEXT NOT NULL UNIQUE,
  occurrence_date DATE NOT NULL,
  occurrence_time TIME NOT NULL,
  description TEXT NOT NULL,
  technical_analysis TEXT,
  cause_analysis TEXT,
  ai_cause_analysis TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  affected_equipment JSONB DEFAULT '[]',
  signatures JSONB DEFAULT '{}',
  pdf_path TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'signed', 'sent', 'archived')),
  sent_to_authorities_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 2: CTS + VERIFICAÇÃO DE TRIPULAÇÃO
-- =============================================================================

-- Certificado Técnico da Embarcação
CREATE TABLE IF NOT EXISTS public.cts_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  cts_number TEXT NOT NULL,
  flag_state TEXT NOT NULL,
  classification_society TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  vessel_categories JSONB DEFAULT '[]',
  certified_equipment JSONB DEFAULT '[]',
  required_positions JSONB DEFAULT '[]',
  certification_docs JSONB DEFAULT '[]',
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'suspended', 'pending_renewal')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certificações da tripulação
CREATE TABLE IF NOT EXISTS public.crew_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  certification_type TEXT NOT NULL,
  certificate_category TEXT CHECK (certificate_category IN ('A', 'B', 'C', 'Master', 'STCW', 'GMDSS', 'DP', 'Other')),
  certificate_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issue_authority TEXT,
  scope_description TEXT,
  document_file_path TEXT,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'suspended', 'pending_renewal')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Verificações de conformidade CTS
CREATE TABLE IF NOT EXISTS public.cts_conformity_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  cts_record_id UUID REFERENCES public.cts_records(id) ON DELETE SET NULL,
  check_date TIMESTAMPTZ DEFAULT now(),
  checked_by UUID,
  non_conformities JSONB DEFAULT '[]',
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  overall_status TEXT DEFAULT 'compliant' CHECK (overall_status IN ('compliant', 'partial', 'non_compliant')),
  corrective_actions_required BOOLEAN DEFAULT false,
  corrective_actions JSONB DEFAULT '[]',
  next_check_date DATE,
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 3: IMCA INCIDENTS
-- =============================================================================

-- Base de incidentes IMCA
CREATE TABLE IF NOT EXISTS public.imca_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  imca_reference TEXT,
  category TEXT NOT NULL CHECK (category IN ('diving', 'marine', 'regulatory', 'lifting', 'dp', 'rov', 'hse', 'other')),
  incident_date DATE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  lessons_learned TEXT,
  recommendations JSONB DEFAULT '[]',
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_imca_official BOOLEAN DEFAULT false,
  source_url TEXT,
  related_vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Briefings de segurança baseados em IMCA
CREATE TABLE IF NOT EXISTS public.safety_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  imca_incident_id UUID REFERENCES public.imca_incidents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  briefing_date TIMESTAMPTZ,
  presenter_id UUID,
  participants JSONB DEFAULT '[]',
  quiz_questions JSONB DEFAULT '[]',
  quiz_results JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'completed', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 4: HISTÓRICO POR EMBARCAÇÃO
-- =============================================================================

-- Histórico de eventos da embarcação
CREATE TABLE IF NOT EXISTS public.vessel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('ownership', 'flag', 'modification', 'inspection', 'certification', 'maintenance', 'accident', 'repair', 'upgrade', 'other')),
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  documents JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  relevance_score INTEGER DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Manuais da embarcação
CREATE TABLE IF NOT EXISTS public.vessel_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  manual_type TEXT NOT NULL CHECK (manual_type IN ('operation', 'maintenance', 'emergency', 'safety', 'ism', 'blueprints', 'equipment', 'procedures', 'other')),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  upload_date TIMESTAMPTZ DEFAULT now(),
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'current' CHECK (status IN ('current', 'archived', 'superseded')),
  searchable_text TEXT,
  ocr_processed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 5: MATRIZ DE RESPONSABILIDADES
-- =============================================================================

-- Matrizes de responsabilidade RACI
CREATE TABLE IF NOT EXISTS public.responsibility_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  activities JSONB DEFAULT '[]',
  people_roles JSONB DEFAULT '[]',
  matrix_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itens de ação
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  responsibility_matrix_id UUID REFERENCES public.responsibility_matrices(id) ON DELETE SET NULL,
  source_module TEXT,
  source_reference_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID,
  assigned_to_name TEXT,
  assigned_to_email TEXT,
  assigned_to_phone TEXT,
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  evidence_files JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  zapier_webhook_url TEXT,
  notification_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 6: GMUD (Gestão de Mudanças)
-- =============================================================================

-- Solicitações de mudança
CREATE TABLE IF NOT EXISTS public.gmud_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  gmud_number TEXT NOT NULL UNIQUE,
  change_type TEXT NOT NULL CHECK (change_type IN ('operational', 'technical', 'procedural', 'structural', 'software', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT NOT NULL,
  impact_assessment TEXT,
  impact_areas JSONB DEFAULT '[]',
  implementation_date DATE,
  rollback_plan TEXT,
  technical_docs JSONB DEFAULT '[]',
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'implementing', 'implemented', 'rolled_back')),
  current_approver_role TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Matriz de responsabilidade do GMUD
CREATE TABLE IF NOT EXISTS public.gmud_responsibility_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmud_request_id UUID REFERENCES public.gmud_requests(id) ON DELETE CASCADE,
  roles JSONB DEFAULT '{}',
  raci_matrix JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas do GMUD
CREATE TABLE IF NOT EXISTS public.gmud_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmud_request_id UUID REFERENCES public.gmud_requests(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  role_order INTEGER NOT NULL,
  signed_by UUID,
  signed_by_name TEXT,
  signed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  comments TEXT,
  deadline TIMESTAMPTZ,
  notification_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Implementação do GMUD
CREATE TABLE IF NOT EXISTS public.gmud_implementation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmud_request_id UUID REFERENCES public.gmud_requests(id) ON DELETE CASCADE,
  checklist_items JSONB DEFAULT '[]',
  evidence_files JSONB DEFAULT '[]',
  test_results TEXT,
  test_passed BOOLEAN,
  actual_implementation_date TIMESTAMPTZ,
  lessons_learned TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'rolled_back')),
  implemented_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 7: PEOTRAM MELHORADO
-- =============================================================================

-- Elementos PEOTRAM (6 elementos com foco em 4 e 6)
CREATE TABLE IF NOT EXISTS public.peotram_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peotram_audit_id UUID,
  element_number INTEGER NOT NULL CHECK (element_number BETWEEN 1 AND 13),
  element_name TEXT NOT NULL,
  description TEXT,
  is_critical BOOLEAN DEFAULT false,
  weight_percentage NUMERIC(5,2) DEFAULT 0,
  items JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'compliant', 'non_compliant')),
  score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itens PEOTRAM
CREATE TABLE IF NOT EXISTS public.peotram_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peotram_element_id UUID REFERENCES public.peotram_elements(id) ON DELETE CASCADE,
  item_number TEXT NOT NULL,
  item_description TEXT NOT NULL,
  requirement TEXT,
  norm_reference TEXT,
  evidence_required JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'compliant', 'non_compliant', 'na')),
  score INTEGER CHECK (score BETWEEN 0 AND 4),
  auditor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evidências PEOTRAM geradas por IA
CREATE TABLE IF NOT EXISTS public.peotram_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  peotram_item_id UUID REFERENCES public.peotram_items(id) ON DELETE CASCADE,
  evidence_type TEXT DEFAULT 'text' CHECK (evidence_type IN ('text', 'photo', 'video', 'document', 'audio')),
  title TEXT NOT NULL,
  description TEXT,
  technical_analysis TEXT,
  norm_reference TEXT,
  risk_identified TEXT,
  recommendations TEXT,
  corrective_action TEXT,
  file_path TEXT,
  generated_by_ai BOOLEAN DEFAULT false,
  ai_confidence NUMERIC(5,2),
  generated_at TIMESTAMPTZ DEFAULT now(),
  signed_at TIMESTAMPTZ,
  signature_path TEXT,
  signature_data JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voice chats PEOTRAM
CREATE TABLE IF NOT EXISTS public.peotram_voice_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  peotram_audit_id UUID,
  user_id UUID,
  question TEXT NOT NULL,
  ai_response_text TEXT,
  ai_response_audio_path TEXT,
  context_element INTEGER,
  context_item TEXT,
  language TEXT DEFAULT 'pt-BR',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- MÓDULO 8: NEUROCIÊNCIA + QE + FATORES HUMANOS
-- =============================================================================

-- Inteligência emocional da tripulação
CREATE TABLE IF NOT EXISTS public.crew_emotional_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  self_awareness_score NUMERIC(5,2),
  self_regulation_score NUMERIC(5,2),
  empathy_score NUMERIC(5,2),
  social_skills_score NUMERIC(5,2),
  motivation_score NUMERIC(5,2),
  total_eq_score NUMERIC(5,2),
  test_date TIMESTAMPTZ DEFAULT now(),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  recommendations JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fatores humanos em incidentes
CREATE TABLE IF NOT EXISTS public.human_factors_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  incident_id UUID,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE SET NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  communication_issue BOOLEAN DEFAULT false,
  attention_lapse BOOLEAN DEFAULT false,
  risk_taking BOOLEAN DEFAULT false,
  procedure_violation BOOLEAN DEFAULT false,
  overconfidence BOOLEAN DEFAULT false,
  personal_issues BOOLEAN DEFAULT false,
  substance_related BOOLEAN DEFAULT false,
  other_factors JSONB DEFAULT '[]',
  ai_analysis JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Avaliação de risco comportamental
CREATE TABLE IF NOT EXISTS public.behavioral_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  assessment_date TIMESTAMPTZ DEFAULT now(),
  behavior_score NUMERIC(5,2),
  incident_history_score NUMERIC(5,2),
  emotional_score NUMERIC(5,2),
  stress_fatigue_score NUMERIC(5,2),
  total_risk_score NUMERIC(5,2),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommendations JSONB DEFAULT '[]',
  next_assessment_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Planos de bem-estar
CREATE TABLE IF NOT EXISTS public.wellness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  psychological_assessment TEXT,
  identified_risks JSONB DEFAULT '[]',
  relaxation_exercises JSONB DEFAULT '[]',
  recommended_breaks JSONB DEFAULT '[]',
  mental_health_resources JSONB DEFAULT '[]',
  follow_up_schedule JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dinâmica de equipe
CREATE TABLE IF NOT EXISTS public.team_dynamics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  assessment_date TIMESTAMPTZ DEFAULT now(),
  cohesion_score NUMERIC(5,2),
  leadership_score NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  trust_score NUMERIC(5,2),
  conflict_resolution_score NUMERIC(5,2),
  overall_team_health NUMERIC(5,2),
  recommendations JSONB DEFAULT '[]',
  team_building_activities JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_vessel_contracts_vessel ON public.vessel_contracts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_contracts_status ON public.vessel_contracts(status);
CREATE INDEX IF NOT EXISTS idx_downtime_events_vessel ON public.downtime_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_downtime_events_contract ON public.downtime_events(contract_id);
CREATE INDEX IF NOT EXISTS idx_broa_records_vessel ON public.broa_records(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cts_records_vessel ON public.cts_records(vessel_id);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_crew ON public.crew_certifications(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_expiry ON public.crew_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_imca_incidents_category ON public.imca_incidents(category);
CREATE INDEX IF NOT EXISTS idx_vessel_history_vessel ON public.vessel_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_manuals_vessel ON public.vessel_manuals(vessel_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned ON public.action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.action_items(status);
CREATE INDEX IF NOT EXISTS idx_gmud_requests_status ON public.gmud_requests(status);
CREATE INDEX IF NOT EXISTS idx_gmud_signatures_request ON public.gmud_signatures(gmud_request_id);
CREATE INDEX IF NOT EXISTS idx_peotram_elements_audit ON public.peotram_elements(peotram_audit_id);
CREATE INDEX IF NOT EXISTS idx_peotram_items_element ON public.peotram_items(peotram_element_id);
CREATE INDEX IF NOT EXISTS idx_crew_eq_crew ON public.crew_emotional_intelligence(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_risk_crew ON public.behavioral_risk_assessments(crew_member_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE public.vessel_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downtime_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broa_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cts_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cts_conformity_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imca_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsibility_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmud_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmud_responsibility_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmud_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmud_implementation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_voice_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_emotional_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_factors_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_dynamics ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para usuários autenticados
CREATE POLICY "vessel_contracts_org_access" ON public.vessel_contracts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "downtime_events_org_access" ON public.downtime_events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "broa_records_org_access" ON public.broa_records FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "cts_records_org_access" ON public.cts_records FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "crew_certifications_org_access" ON public.crew_certifications FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "cts_conformity_checks_org_access" ON public.cts_conformity_checks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "imca_incidents_org_access" ON public.imca_incidents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "safety_briefings_org_access" ON public.safety_briefings FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "vessel_history_org_access" ON public.vessel_history FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "vessel_manuals_org_access" ON public.vessel_manuals FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "responsibility_matrices_org_access" ON public.responsibility_matrices FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "action_items_org_access" ON public.action_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "gmud_requests_org_access" ON public.gmud_requests FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "gmud_responsibility_matrix_org_access" ON public.gmud_responsibility_matrix FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "gmud_signatures_org_access" ON public.gmud_signatures FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "gmud_implementation_org_access" ON public.gmud_implementation FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_elements_org_access" ON public.peotram_elements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_items_org_access" ON public.peotram_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_evidences_org_access" ON public.peotram_evidences FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_voice_chats_org_access" ON public.peotram_voice_chats FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "crew_eq_org_access" ON public.crew_emotional_intelligence FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "human_factors_org_access" ON public.human_factors_incidents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "behavioral_risk_org_access" ON public.behavioral_risk_assessments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "wellness_plans_org_access" ON public.wellness_plans FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "team_dynamics_org_access" ON public.team_dynamics FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT unnest(ARRAY[
      'vessel_contracts', 'downtime_events', 'broa_records', 'cts_records',
      'crew_certifications', 'cts_conformity_checks', 'imca_incidents', 'safety_briefings',
      'vessel_history', 'vessel_manuals', 'responsibility_matrices', 'action_items',
      'gmud_requests', 'gmud_implementation', 'peotram_elements', 'peotram_items',
      'crew_emotional_intelligence', 'wellness_plans'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s;
      CREATE TRIGGER update_%s_updated_at
      BEFORE UPDATE ON public.%s
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;