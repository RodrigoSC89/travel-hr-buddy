-- Criar tabelas para SGSO (Sistema de Gestão de Segurança Operacional - ANP)

-- Tabela principal de auditorias SGSO
CREATE TABLE IF NOT EXISTS public.sgso_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  installation_name TEXT NOT NULL,
  installation_type TEXT CHECK (installation_type IN ('fpso', 'platform', 'drillship', 'semi-submersible')),
  audit_period TEXT NOT NULL,
  audit_date DATE NOT NULL,
  audit_type TEXT NOT NULL DEFAULT 'annual' CHECK (audit_type IN ('annual', 'periodic', 'extraordinary')),
  status TEXT NOT NULL DEFAULT 'preparation' CHECK (status IN ('preparation', 'in_progress', 'completed', 'approved', 'rejected')),
  auditor_name TEXT NOT NULL,
  auditor_certification TEXT,
  compliance_score NUMERIC CHECK (compliance_score >= 0 AND compliance_score <= 100),
  non_conformities_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  anp_reference TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tabela das 17 práticas obrigatórias ANP (Resolução ANP nº 43/2007)
CREATE TABLE IF NOT EXISTS public.sgso_anp_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  practice_number INTEGER NOT NULL CHECK (practice_number >= 1 AND practice_number <= 17),
  practice_name TEXT NOT NULL,
  practice_description TEXT NOT NULL,
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'partial', 'non_compliant')),
  compliance_percentage NUMERIC CHECK (compliance_percentage >= 0 AND compliance_percentage <= 100),
  evidence_documents TEXT[],
  findings TEXT,
  corrective_actions TEXT,
  responsible TEXT,
  deadline DATE,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de avaliação de riscos operacionais
CREATE TABLE IF NOT EXISTS public.sgso_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  risk_category TEXT NOT NULL CHECK (risk_category IN ('operational', 'environmental', 'safety', 'health', 'security')),
  risk_description TEXT NOT NULL,
  probability TEXT NOT NULL CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  severity TEXT NOT NULL CHECK (severity IN ('negligible', 'minor', 'moderate', 'major', 'catastrophic')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  mitigation_measures TEXT[],
  residual_risk TEXT,
  responsible TEXT,
  review_date DATE,
  status TEXT CHECK (status IN ('identified', 'mitigated', 'accepted', 'transferred')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de gestão de treinamentos obrigatórios
CREATE TABLE IF NOT EXISTS public.sgso_training_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  training_name TEXT NOT NULL,
  mandatory BOOLEAN NOT NULL DEFAULT true,
  anp_requirement TEXT,
  frequency_months INTEGER,
  last_training_date DATE,
  next_training_date DATE,
  participants_count INTEGER,
  completion_rate NUMERIC CHECK (completion_rate >= 0 AND completion_rate <= 100),
  instructor_name TEXT,
  certification_issued BOOLEAN DEFAULT false,
  evidence_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de gestão de incidentes e não-conformidades
CREATE TABLE IF NOT EXISTS public.sgso_incident_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('accident', 'incident', 'near_miss', 'non_conformity', 'observation')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  occurrence_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  immediate_actions TEXT,
  root_cause_analysis TEXT,
  corrective_actions TEXT[],
  preventive_actions TEXT[],
  responsible TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'correcting', 'closed', 'cancelled')),
  anp_notification_required BOOLEAN DEFAULT false,
  anp_notification_date TIMESTAMP WITH TIME ZONE,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relatórios regulamentares ANP
CREATE TABLE IF NOT EXISTS public.sgso_regulatory_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('annual', 'incident', 'compliance', 'environmental', 'safety')),
  submission_deadline DATE NOT NULL,
  submission_date DATE,
  anp_protocol TEXT,
  ibama_protocol TEXT,
  report_data JSONB NOT NULL,
  file_url TEXT,
  approval_status TEXT CHECK (approval_status IN ('pending', 'submitted', 'approved', 'rejected', 'revision_required')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de sistema de gestão integrado
CREATE TABLE IF NOT EXISTS public.sgso_management_system (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.sgso_audits(id) ON DELETE CASCADE,
  system_element TEXT NOT NULL,
  element_description TEXT NOT NULL,
  procedures_count INTEGER DEFAULT 0,
  documented BOOLEAN DEFAULT false,
  implemented BOOLEAN DEFAULT false,
  effective BOOLEAN DEFAULT false,
  last_review_date DATE,
  next_review_date DATE,
  responsible TEXT,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'partial', 'non_compliant')),
  evidence_documents TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sgso_audits_org ON public.sgso_audits(organization_id);
CREATE INDEX IF NOT EXISTS idx_sgso_audits_status ON public.sgso_audits(status);
CREATE INDEX IF NOT EXISTS idx_sgso_practices_audit ON public.sgso_anp_practices(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_risks_audit ON public.sgso_risk_assessments(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_training_audit ON public.sgso_training_management(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_incidents_audit ON public.sgso_incident_management(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_reports_audit ON public.sgso_regulatory_reports(audit_id);
CREATE INDEX IF NOT EXISTS idx_sgso_management_audit ON public.sgso_management_system(audit_id);

-- Comentários nas tabelas
COMMENT ON TABLE public.sgso_audits IS 'Auditorias SGSO - Sistema de Gestão de Segurança Operacional ANP';
COMMENT ON TABLE public.sgso_anp_practices IS '17 Práticas Obrigatórias ANP - Resolução ANP nº 43/2007';
COMMENT ON TABLE public.sgso_risk_assessments IS 'Avaliação de Riscos Operacionais';
COMMENT ON TABLE public.sgso_training_management IS 'Gestão de Treinamentos Obrigatórios';
COMMENT ON TABLE public.sgso_incident_management IS 'Gestão de Incidentes e Não-Conformidades';
COMMENT ON TABLE public.sgso_regulatory_reports IS 'Relatórios Regulamentares ANP/IBAMA';
COMMENT ON TABLE public.sgso_management_system IS 'Sistema de Gestão Integrado';
