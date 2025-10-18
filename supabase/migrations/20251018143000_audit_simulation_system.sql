-- ===========================
-- ETAPA 32 - SISTEMA DE SIMULAÇÃO DE AUDITORIA E EVIDÊNCIAS
-- Sistema completo para simulação de auditorias externas e gestão de evidências
-- ===========================

-- 1. AUDIT SIMULATIONS - Simulações de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('petrobras_peo_dp', 'ibama_sgso', 'imo_ism', 'imo_modu', 'iso_9001', 'iso_14001', 'iso_45001', 'imca')),
  audit_entity TEXT NOT NULL,
  norms_applied JSONB DEFAULT '[]',
  conformities JSONB DEFAULT '[]',
  non_conformities JSONB DEFAULT '[]',
  scores_by_norm JSONB DEFAULT '{}',
  overall_score INTEGER DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  technical_report TEXT,
  action_plan JSONB DEFAULT '[]',
  simulated_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  simulated_by UUID REFERENCES auth.users(id),
  report_pdf_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. PERFORMANCE METRICS - Métricas de Performance por Embarcação
CREATE TABLE IF NOT EXISTS public.vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Conformidade normativa
  compliance_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (compliance_percentage BETWEEN 0 AND 100),
  audit_score_avg NUMERIC(5,2) DEFAULT 0.00,
  
  -- Falhas e incidentes
  total_failures INTEGER DEFAULT 0,
  failures_by_system JSONB DEFAULT '{}',
  
  -- Tempo de resposta
  mttr_hours NUMERIC(10,2), -- Mean Time To Repair
  mtbf_hours NUMERIC(10,2), -- Mean Time Between Failures
  
  -- Ações com IA
  ai_actions_count INTEGER DEFAULT 0,
  human_actions_count INTEGER DEFAULT 0,
  ai_effectiveness_percentage NUMERIC(5,2),
  
  -- Treinamentos
  trainings_completed INTEGER DEFAULT 0,
  trainings_per_failure NUMERIC(5,2),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vessel_id, metric_date)
);

-- 3. COMPLIANCE EVIDENCES - Evidências para Certificadoras
CREATE TABLE IF NOT EXISTS public.compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  norm TEXT NOT NULL CHECK (norm IN ('ISO_9001', 'ISO_14001', 'ISO_45001', 'ISM_CODE', 'ISPS_CODE', 'MODU_CODE', 'IBAMA', 'PETROBRAS', 'IMCA')),
  clause TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  evidence_type TEXT CHECK (evidence_type IN ('document', 'video', 'photo', 'log', 'report', 'certificate', 'other')),
  file_size_bytes BIGINT,
  submitted_by UUID REFERENCES auth.users(id),
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id),
  validation_date TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  related_incident_id UUID REFERENCES public.safety_incidents(id),
  related_audit_id UUID REFERENCES public.audit_simulations(id),
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. AUDIT TEMPLATES - Templates de Normas e Cláusulas
CREATE TABLE IF NOT EXISTS public.audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm TEXT NOT NULL,
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT,
  required_evidences JSONB DEFAULT '[]',
  checklist_items JSONB DEFAULT '[]',
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor', 'observation')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(norm, clause_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_simulations_vessel ON public.audit_simulations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_type ON public.audit_simulations(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_date ON public.audit_simulations(simulated_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_vessel ON public.vessel_performance_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON public.vessel_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_vessel ON public.compliance_evidences(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_norm ON public.compliance_evidences(norm);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_validated ON public.compliance_evidences(validated);

-- Enable Row Level Security
ALTER TABLE public.audit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_norm_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_simulations
CREATE POLICY "Users can view audits from their organization"
  ON public.audit_simulations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create audits for their organization"
  ON public.audit_simulations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for vessel_performance_metrics
CREATE POLICY "Users can view performance metrics from their organization"
  ON public.vessel_performance_metrics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create performance metrics for their organization"
  ON public.vessel_performance_metrics FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for compliance_evidences
CREATE POLICY "Users can view evidences from their organization"
  ON public.compliance_evidences FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create evidences for their organization"
  ON public.compliance_evidences FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update evidences from their organization"
  ON public.compliance_evidences FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for audit_norm_templates (public read)
CREATE POLICY "Anyone can view norm templates"
  ON public.audit_norm_templates FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample audit norm templates for ISO standards
INSERT INTO public.audit_norm_templates (norm, clause_number, clause_title, clause_description, severity, category) VALUES
  ('ISO_9001', '4.1', 'Understanding the organization and its context', 'The organization shall determine external and internal issues relevant to its purpose and strategic direction', 'major', 'Context of Organization'),
  ('ISO_9001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment with respect to the quality management system', 'critical', 'Leadership'),
  ('ISO_9001', '8.1', 'Operational planning and control', 'The organization shall plan, implement and control the processes needed to meet requirements', 'major', 'Operation'),
  ('ISO_14001', '4.1', 'Understanding the organization and its context', 'The organization shall determine external and internal issues relevant to environmental management', 'major', 'Context'),
  ('ISO_14001', '6.1', 'Actions to address risks and opportunities', 'The organization shall determine risks and opportunities related to environmental aspects', 'critical', 'Planning'),
  ('ISO_45001', '4.1', 'Understanding the organization and its context', 'The organization shall determine issues relevant to OH&S management system', 'major', 'Context'),
  ('ISO_45001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership with respect to OH&S management system', 'critical', 'Leadership'),
  ('ISM_CODE', '1.2', 'Objectives', 'The objectives of the Code are to ensure safety at sea and prevention of pollution', 'critical', 'General'),
  ('ISM_CODE', '5', 'Master''s responsibility and authority', 'The Company should clearly define the master''s responsibility', 'critical', 'Management'),
  ('ISPS_CODE', 'A/2', 'Ship security assessment', 'A Ship Security Assessment shall be carried out', 'critical', 'Security')
ON CONFLICT (norm, clause_number) DO NOTHING;

-- Function to calculate vessel performance metrics
CREATE OR REPLACE FUNCTION calculate_vessel_performance_metrics(
  p_vessel_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  compliance_percentage NUMERIC,
  audit_score_avg NUMERIC,
  total_failures BIGINT,
  mttr_hours NUMERIC,
  ai_actions_count BIGINT,
  human_actions_count BIGINT,
  trainings_completed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Compliance from audits
    COALESCE(AVG(a.overall_score), 0)::NUMERIC AS compliance_percentage,
    COALESCE(AVG(a.overall_score), 0)::NUMERIC AS audit_score_avg,
    -- Failures from incidents
    COALESCE(COUNT(DISTINCT i.id), 0)::BIGINT AS total_failures,
    -- MTTR from incident resolution time (mock calculation)
    COALESCE(AVG(EXTRACT(EPOCH FROM (i.updated_at - i.created_at)) / 3600), 0)::NUMERIC AS mttr_hours,
    -- AI actions (mock - would need real tracking)
    0::BIGINT AS ai_actions_count,
    COALESCE(COUNT(DISTINCT i.id), 0)::BIGINT AS human_actions_count,
    -- Trainings
    COALESCE(COUNT(DISTINCT t.id), 0)::BIGINT AS trainings_completed
  FROM
    public.vessels v
    LEFT JOIN public.audit_simulations a ON a.vessel_id = v.id 
      AND a.simulated_date BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.safety_incidents i ON i.vessel_id = v.id
      AND i.incident_date BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.sgso_training_records t ON t.completion_date BETWEEN p_start_date AND p_end_date
  WHERE
    v.id = p_vessel_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get missing evidences for a vessel
CREATE OR REPLACE FUNCTION get_missing_evidences(
  p_vessel_id UUID,
  p_norm TEXT DEFAULT NULL
)
RETURNS TABLE (
  norm TEXT,
  clause_number TEXT,
  clause_title TEXT,
  severity TEXT,
  has_evidence BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.norm,
    t.clause_number,
    t.clause_title,
    t.severity,
    EXISTS(
      SELECT 1 FROM public.compliance_evidences e
      WHERE e.vessel_id = p_vessel_id
        AND e.norm = t.norm
        AND e.clause = t.clause_number
        AND e.validated = true
    ) AS has_evidence
  FROM
    public.audit_norm_templates t
  WHERE
    (p_norm IS NULL OR t.norm = p_norm)
  ORDER BY
    t.norm, t.clause_number;
END;
$$ LANGUAGE plpgsql;
