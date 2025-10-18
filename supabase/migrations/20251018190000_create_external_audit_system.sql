-- ===========================
-- EXTERNAL AUDIT SYSTEM (ETAPA 32)
-- Tables for AI-powered audit simulation, performance metrics, and evidence management
-- ===========================

-- Create audit_simulations table
CREATE TABLE IF NOT EXISTS public.audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN (
    'Petrobras PEO-DP',
    'IBAMA SGSO',
    'IMO ISM Code',
    'IMO MODU Code',
    'ISO 9001',
    'ISO 14001',
    'ISO 45001',
    'IMCA'
  )),
  execution_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  conformities JSONB DEFAULT '[]',
  non_conformities JSONB DEFAULT '[]',
  scores JSONB DEFAULT '[]',
  technical_report TEXT,
  action_plan JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create vessel_performance_metrics table
CREATE TABLE IF NOT EXISTS public.vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  compliance_percentage NUMERIC CHECK (compliance_percentage >= 0 AND compliance_percentage <= 100),
  failure_frequency_by_system JSONB DEFAULT '{}',
  mttr_hours NUMERIC DEFAULT 0,
  ai_actions_vs_human JSONB DEFAULT '{"ai": 0, "human": 0}',
  training_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vessel_id, metric_date)
);

-- Create audit_norm_templates table
CREATE TABLE IF NOT EXISTS public.audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm_name TEXT NOT NULL,
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT,
  category TEXT,
  required_evidence_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(norm_name, clause_number)
);

-- Create compliance_evidences table
CREATE TABLE IF NOT EXISTS public.compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  norm_template_id UUID NOT NULL REFERENCES public.audit_norm_templates(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  validation_status TEXT DEFAULT 'submitted' CHECK (validation_status IN ('submitted', 'validated', 'rejected')),
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validation_date TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_norm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_simulations
CREATE POLICY "Users can view audits from their organization"
  ON public.audit_simulations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert audits for their organization"
  ON public.audit_simulations
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for vessel_performance_metrics
CREATE POLICY "Users can view metrics from their organization"
  ON public.vessel_performance_metrics
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert metrics for their organization"
  ON public.vessel_performance_metrics
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for audit_norm_templates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view norm templates"
  ON public.audit_norm_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for compliance_evidences
CREATE POLICY "Users can view evidences from their organization"
  ON public.compliance_evidences
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert evidences for their organization"
  ON public.compliance_evidences
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update evidences from their organization"
  ON public.compliance_evidences
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_simulations_org ON public.audit_simulations(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_vessel ON public.audit_simulations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_date ON public.audit_simulations(execution_date);

CREATE INDEX IF NOT EXISTS idx_vessel_performance_org ON public.vessel_performance_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_vessel ON public.vessel_performance_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_date ON public.vessel_performance_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_compliance_evidences_org ON public.compliance_evidences(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_vessel ON public.compliance_evidences(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_template ON public.compliance_evidences(norm_template_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_status ON public.compliance_evidences(validation_status);

-- Create function to calculate vessel performance metrics
CREATE OR REPLACE FUNCTION calculate_vessel_performance_metrics(
  p_vessel_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  compliance_percentage NUMERIC,
  failure_frequency JSONB,
  mttr_hours NUMERIC,
  ai_vs_human JSONB,
  training_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(
      (SELECT COUNT(*) FILTER (WHERE non_conformities = '[]'::jsonb) * 100.0 / NULLIF(COUNT(*), 0)
       FROM audit_simulations
       WHERE vessel_id = p_vessel_id
       AND execution_date BETWEEN p_start_date AND p_end_date),
      0
    )::NUMERIC AS compliance_percentage,
    '{}'::JSONB AS failure_frequency,
    0::NUMERIC AS mttr_hours,
    '{"ai": 0, "human": 0}'::JSONB AS ai_vs_human,
    0 AS training_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get missing evidences
CREATE OR REPLACE FUNCTION get_missing_evidences(p_organization_id UUID, p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  norm_template_id UUID,
  norm_name TEXT,
  clause_number TEXT,
  clause_title TEXT,
  required_evidence_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nt.id,
    nt.norm_name,
    nt.clause_number,
    nt.clause_title,
    nt.required_evidence_type
  FROM audit_norm_templates nt
  WHERE NOT EXISTS (
    SELECT 1
    FROM compliance_evidences ce
    WHERE ce.norm_template_id = nt.id
    AND ce.organization_id = p_organization_id
    AND (p_vessel_id IS NULL OR ce.vessel_id = p_vessel_id)
    AND ce.validation_status = 'validated'
  )
  ORDER BY nt.norm_name, nt.clause_number;
END;
$$ LANGUAGE plpgsql;

-- Insert norm templates for major standards
INSERT INTO public.audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category, required_evidence_type) VALUES
-- ISO 9001
('ISO 9001', '4.1', 'Understanding the organization and its context', 'The organization shall determine external and internal issues', 'Context', 'Document'),
('ISO 9001', '4.2', 'Understanding the needs and expectations of interested parties', 'The organization shall determine interested parties', 'Context', 'Document'),
('ISO 9001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership', 'Leadership', 'Policy/Procedure'),
('ISO 9001', '6.1', 'Actions to address risks and opportunities', 'The organization shall plan actions to address risks', 'Planning', 'Risk Assessment'),
('ISO 9001', '7.1', 'Resources', 'The organization shall determine and provide resources', 'Support', 'Resource Plan'),
('ISO 9001', '8.1', 'Operational planning and control', 'The organization shall plan and control processes', 'Operation', 'Process Map'),
('ISO 9001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'The organization shall monitor and measure', 'Performance', 'Metrics Report'),
('ISO 9001', '10.1', 'Improvement', 'The organization shall improve products and services', 'Improvement', 'Improvement Plan'),

-- ISO 14001
('ISO 14001', '4.1', 'Understanding the organization', 'Determine external and internal environmental issues', 'Context', 'Environmental Assessment'),
('ISO 14001', '5.1', 'Leadership', 'Top management environmental responsibility', 'Leadership', 'Environmental Policy'),
('ISO 14001', '6.1', 'Actions for risks and opportunities', 'Environmental risk assessment', 'Planning', 'Risk Register'),
('ISO 14001', '8.1', 'Operational planning', 'Environmental operational controls', 'Operation', 'Operational Procedures'),

-- ISO 45001
('ISO 45001', '4.1', 'Understanding the organization', 'Determine OH&S context', 'Context', 'OH&S Assessment'),
('ISO 45001', '5.1', 'Leadership and commitment', 'OH&S leadership', 'Leadership', 'OH&S Policy'),
('ISO 45001', '6.1', 'Actions to address risks', 'OH&S risk assessment', 'Planning', 'Hazard Identification'),
('ISO 45001', '8.1', 'Operational planning', 'OH&S operational controls', 'Operation', 'Safe Work Procedures'),

-- IMO ISM Code
('IMO ISM Code', '1.2', 'Safety and environmental protection policy', 'Company policy statement', 'Policy', 'Safety Policy'),
('IMO ISM Code', '3', 'Company responsibilities and authority', 'Defined responsibilities', 'Management', 'Organization Chart'),
('IMO ISM Code', '4', 'Designated person(s)', 'Shore-based support', 'Management', 'Appointment Letter'),
('IMO ISM Code', '6', 'Resources and personnel', 'Qualified personnel', 'Resources', 'Training Records'),
('IMO ISM Code', '9', 'Reports and analysis', 'Non-conformity reporting', 'Monitoring', 'Incident Reports'),
('IMO ISM Code', '10', 'Maintenance', 'Maintenance procedures', 'Operation', 'Maintenance Plan'),

-- IMO MODU Code
('IMO MODU Code', '1', 'General provisions', 'MODU compliance', 'General', 'Certificate'),
('IMO MODU Code', '3', 'Stability', 'Stability requirements', 'Technical', 'Stability Book'),
('IMO MODU Code', '8', 'Fire safety', 'Fire prevention and detection', 'Safety', 'Fire Plan'),

-- Petrobras PEO-DP
('Petrobras PEO-DP', '1', 'DP System Requirements', 'DP system configuration', 'Technical', 'DP Manual'),
('Petrobras PEO-DP', '2', 'DP Operations', 'DP operational procedures', 'Operation', 'DP Procedures'),
('Petrobras PEO-DP', '3', 'DP Trials', 'Annual DP trials', 'Testing', 'Trial Report'),
('Petrobras PEO-DP', '4', 'DP Training', 'DP operator training', 'Training', 'Training Certificates'),

-- IBAMA SGSO
('IBAMA SGSO', '1', 'Política de SMS', 'Safety management policy', 'Policy', 'SMS Policy'),
('IBAMA SGSO', '2', 'Organização e Responsabilidades', 'Organizational structure', 'Management', 'Organization Chart'),
('IBAMA SGSO', '3', 'Identificação de Perigos', 'Hazard identification', 'Planning', 'Hazard Register'),
('IBAMA SGSO', '4', 'Controle Operacional', 'Operational controls', 'Operation', 'Operational Procedures'),
('IBAMA SGSO', '5', 'Resposta a Emergências', 'Emergency response', 'Emergency', 'Emergency Plan'),

-- IMCA
('IMCA', 'M220', 'DP Operations Requirements', 'DP operational standards', 'Operation', 'DP Operations Manual'),
('IMCA', 'M103', 'DP Vessel Design Philosophy', 'DP design principles', 'Technical', 'Design Philosophy'),
('IMCA', 'M166', 'DP Annual Trials', 'Annual DP testing', 'Testing', 'Annual Trial Report'),
('IMCA', 'M117', 'DP Positioning Analysis', 'Position analysis', 'Analysis', 'FMEA Report')
ON CONFLICT (norm_name, clause_number) DO NOTHING;
