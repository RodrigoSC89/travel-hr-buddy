-- ===========================
-- SGSO - SISTEMA DE GESTÃO DE SEGURANÇA OPERACIONAL
-- Sistema completo para compliance ANP Resolução 43/2007
-- ===========================

-- 1. SGSO PRACTICES - 17 Práticas Obrigatórias ANP
CREATE TABLE IF NOT EXISTS public.sgso_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  practice_number INTEGER NOT NULL CHECK (practice_number BETWEEN 1 AND 17),
  practice_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('compliant', 'non_compliant', 'pending', 'in_progress')),
  compliance_level INTEGER DEFAULT 0 CHECK (compliance_level BETWEEN 0 AND 100),
  responsible_user_id UUID REFERENCES auth.users(id),
  last_audit_date TIMESTAMP WITH TIME ZONE,
  next_audit_date TIMESTAMP WITH TIME ZONE,
  documentation JSONB DEFAULT '{}',
  evidence_files JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, practice_number)
);

-- 2. SAFETY INCIDENTS - Registro de Incidentes de Segurança
CREATE TABLE IF NOT EXISTS public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  incident_number TEXT UNIQUE NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('accident', 'near_miss', 'environmental', 'security', 'operational', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'negligible')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  crew_members_involved JSONB DEFAULT '[]',
  description TEXT NOT NULL,
  immediate_actions TEXT,
  root_cause_analysis TEXT,
  corrective_actions JSONB DEFAULT '[]',
  preventive_actions JSONB DEFAULT '[]',
  lessons_learned TEXT,
  reported_by UUID REFERENCES auth.users(id),
  investigated_by UUID REFERENCES auth.users(id),
  attachments JSONB DEFAULT '[]',
  notifications_sent JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. RISK ASSESSMENTS - Matriz de Riscos 5x5
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  assessment_number TEXT UNIQUE NOT NULL,
  risk_title TEXT NOT NULL,
  risk_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('operational', 'environmental', 'health_safety', 'security', 'compliance', 'financial')),
  vessel_id UUID REFERENCES public.vessels(id),
  operation_type TEXT,
  probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN probability * impact >= 20 THEN 'critical'
      WHEN probability * impact >= 15 THEN 'high'
      WHEN probability * impact >= 8 THEN 'medium'
      WHEN probability * impact >= 4 THEN 'low'
      ELSE 'negligible'
    END
  ) STORED,
  risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  existing_controls JSONB DEFAULT '[]',
  additional_controls_needed JSONB DEFAULT '[]',
  residual_probability INTEGER,
  residual_impact INTEGER,
  residual_risk_level TEXT,
  mitigation_plan TEXT,
  responsible_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigating', 'monitoring', 'closed')),
  review_date TIMESTAMP WITH TIME ZONE,
  next_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. TRAINING RECORDS - Registros de Treinamento SGSO
CREATE TABLE IF NOT EXISTS public.sgso_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL CHECK (training_type IN ('sgso_awareness', 'emergency_response', 'risk_assessment', 'incident_investigation', 'safety_procedures', 'regulatory_compliance', 'other')),
  training_title TEXT NOT NULL,
  training_provider TEXT,
  training_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'expired', 'cancelled')),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  certificate_number TEXT,
  certificate_file TEXT,
  instructor_name TEXT,
  duration_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. SGSO AUDITS - Planejamento e Execução de Auditorias
CREATE TABLE IF NOT EXISTS public.sgso_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  audit_number TEXT UNIQUE NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('internal', 'external', 'anp', 'antaq', 'classification_society', 'client')),
  audit_scope TEXT NOT NULL,
  audit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'follow_up', 'closed')),
  vessel_id UUID REFERENCES public.vessels(id),
  auditors JSONB DEFAULT '[]',
  findings JSONB DEFAULT '[]',
  non_conformities JSONB DEFAULT '[]',
  observations JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  overall_rating TEXT CHECK (overall_rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory')),
  corrective_actions_due TIMESTAMP WITH TIME ZONE,
  report_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. NON-CONFORMITIES - Gestão de Não Conformidades
CREATE TABLE IF NOT EXISTS public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nc_number TEXT UNIQUE NOT NULL,
  nc_type TEXT NOT NULL CHECK (nc_type IN ('major', 'minor', 'observation')),
  source TEXT NOT NULL CHECK (source IN ('audit', 'inspection', 'incident', 'self_assessment', 'regulatory', 'other')),
  audit_id UUID REFERENCES public.sgso_audits(id),
  incident_id UUID REFERENCES public.safety_incidents(id),
  practice_id UUID REFERENCES public.sgso_practices(id),
  description TEXT NOT NULL,
  requirement_reference TEXT,
  identified_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'corrective_action', 'verification', 'closed')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  responsible_user_id UUID REFERENCES auth.users(id),
  root_cause TEXT,
  immediate_action TEXT,
  corrective_action_plan TEXT,
  preventive_action_plan TEXT,
  target_closure_date TIMESTAMP WITH TIME ZONE,
  actual_closure_date TIMESTAMP WITH TIME ZONE,
  verification_evidence TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. REGULATORY REPORTING - Relatórios ANP/ANTAQ
CREATE TABLE IF NOT EXISTS public.regulatory_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('anp_monthly', 'anp_annual', 'antaq_quarterly', 'incident_notification', 'audit_report', 'compliance_report')),
  report_number TEXT UNIQUE NOT NULL,
  reporting_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  reporting_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_deadline TIMESTAMP WITH TIME ZONE,
  submission_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'submitted', 'accepted', 'rejected')),
  report_data JSONB DEFAULT '{}',
  report_file TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  regulatory_response TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. EMERGENCY RESPONSE - Planos e Exercícios de Resposta a Emergências
CREATE TABLE IF NOT EXISTS public.emergency_response_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('fire', 'oil_spill', 'medical', 'evacuation', 'man_overboard', 'collision', 'grounding', 'general')),
  vessel_id UUID REFERENCES public.vessels(id),
  plan_version TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  review_date TIMESTAMP WITH TIME ZONE,
  next_review_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  plan_content TEXT,
  response_procedures JSONB DEFAULT '[]',
  contact_list JSONB DEFAULT '[]',
  equipment_checklist JSONB DEFAULT '[]',
  last_drill_date TIMESTAMP WITH TIME ZONE,
  next_drill_date TIMESTAMP WITH TIME ZONE,
  drill_frequency TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. EMERGENCY DRILLS - Registro de Exercícios e Simulados
CREATE TABLE IF NOT EXISTS public.emergency_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  drill_number TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES public.emergency_response_plans(id),
  drill_type TEXT NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  drill_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  participants JSONB DEFAULT '[]',
  scenario_description TEXT,
  objectives JSONB DEFAULT '[]',
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory')),
  strengths TEXT,
  areas_for_improvement TEXT,
  lessons_learned TEXT,
  corrective_actions JSONB DEFAULT '[]',
  conducted_by UUID REFERENCES auth.users(id),
  report_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sgso_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sgso_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_response_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_drills ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for SGSO tables
-- All tables follow the same pattern: users can only access data from their organization

-- SGSO Practices
CREATE POLICY "Users can view their organization's SGSO practices"
  ON public.sgso_practices FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert SGSO practices for their organization"
  ON public.sgso_practices FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's SGSO practices"
  ON public.sgso_practices FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Safety Incidents (repeat similar patterns for other tables)
CREATE POLICY "Users can view their organization's safety incidents"
  ON public.safety_incidents FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert safety incidents for their organization"
  ON public.safety_incidents FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's safety incidents"
  ON public.safety_incidents FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Risk Assessments
CREATE POLICY "Users can view their organization's risk assessments"
  ON public.risk_assessments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert risk assessments for their organization"
  ON public.risk_assessments FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's risk assessments"
  ON public.risk_assessments FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_sgso_practices_org ON public.sgso_practices(organization_id);
CREATE INDEX idx_sgso_practices_status ON public.sgso_practices(status);
CREATE INDEX idx_safety_incidents_org ON public.safety_incidents(organization_id);
CREATE INDEX idx_safety_incidents_severity ON public.safety_incidents(severity);
CREATE INDEX idx_safety_incidents_status ON public.safety_incidents(status);
CREATE INDEX idx_risk_assessments_org ON public.risk_assessments(organization_id);
CREATE INDEX idx_risk_assessments_level ON public.risk_assessments(risk_level);
CREATE INDEX idx_sgso_audits_org ON public.sgso_audits(organization_id);
CREATE INDEX idx_non_conformities_org ON public.non_conformities(organization_id);
CREATE INDEX idx_non_conformities_status ON public.non_conformities(status);

-- Insert default 17 ANP practices template
INSERT INTO public.sgso_practices (practice_number, practice_name, description, status, organization_id)
SELECT 
  practice.number,
  practice.name,
  practice.description,
  'pending',
  org.id
FROM 
  public.organizations org,
  (VALUES 
    (1, 'Liderança e Responsabilidade', 'Definição de responsabilidades e liderança em segurança operacional'),
    (2, 'Identificação de Perigos e Avaliação de Riscos', 'Processos sistemáticos de identificação e avaliação de riscos'),
    (3, 'Controle de Riscos', 'Implementação de medidas de controle e mitigação de riscos'),
    (4, 'Competência, Treinamento e Conscientização', 'Gestão de competências e programas de treinamento'),
    (5, 'Comunicação e Consulta', 'Canais de comunicação e consulta sobre segurança'),
    (6, 'Documentação do SGSO', 'Gestão documental do sistema de segurança'),
    (7, 'Controle Operacional', 'Procedimentos operacionais e controles'),
    (8, 'Preparação e Resposta a Emergências', 'Planos de emergência e resposta'),
    (9, 'Monitoramento e Medição', 'Indicadores e métricas de segurança'),
    (10, 'Avaliação de Conformidade', 'Avaliação de conformidade regulatória'),
    (11, 'Investigação de Incidentes', 'Processos de investigação e análise de incidentes'),
    (12, 'Análise Crítica pela Direção', 'Revisões gerenciais do SGSO'),
    (13, 'Gestão de Mudanças', 'Processos de gestão de mudanças organizacionais'),
    (14, 'Aquisição e Contratação', 'Critérios de segurança em aquisições'),
    (15, 'Projeto e Construção', 'Segurança em projetos e construções'),
    (16, 'Informações de Segurança de Processo', 'Gestão de informações críticas de segurança'),
    (17, 'Integridade Mecânica', 'Manutenção e integridade de equipamentos')
  ) AS practice(number, name, description)
ON CONFLICT (organization_id, practice_number) DO NOTHING;

-- Create updated_at trigger for all SGSO tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sgso_practices_updated_at BEFORE UPDATE ON public.sgso_practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_incidents_updated_at BEFORE UPDATE ON public.safety_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sgso_training_updated_at BEFORE UPDATE ON public.sgso_training_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sgso_audits_updated_at BEFORE UPDATE ON public.sgso_audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_non_conformities_updated_at BEFORE UPDATE ON public.non_conformities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_reports_updated_at BEFORE UPDATE ON public.regulatory_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_plans_updated_at BEFORE UPDATE ON public.emergency_response_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_drills_updated_at BEFORE UPDATE ON public.emergency_drills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
