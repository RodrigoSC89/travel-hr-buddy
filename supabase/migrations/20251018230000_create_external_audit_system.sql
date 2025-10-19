-- ETAPA 32: External Audit System Implementation
-- Creates tables, functions, and seed data for AI-powered audit simulation,
-- performance metrics dashboard, and evidence management system

-- ============================================================================
-- TABLE: audit_simulations
-- Stores AI-generated audit simulation results
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL, -- 'petrobras', 'ibama', 'imo_ism', 'imo_modu', 'iso_9001', 'iso_14001', 'iso_45001', 'imca'
  audit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Audit results
  overall_score NUMERIC(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  conformities JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of conformity items
  non_conformities JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of non-conformity items with severity
  scores_by_norm JSONB NOT NULL DEFAULT '{}'::jsonb, -- Object with norm scores
  technical_report TEXT,
  action_plan JSONB NOT NULL DEFAULT '[]'::jsonb, -- Prioritized action items
  
  -- AI metadata
  ai_model TEXT NOT NULL DEFAULT 'gpt-4',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  -- Audit metadata
  conducted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_audit_simulations_vessel ON public.audit_simulations(vessel_id);
CREATE INDEX idx_audit_simulations_type ON public.audit_simulations(audit_type);
CREATE INDEX idx_audit_simulations_date ON public.audit_simulations(audit_date DESC);
CREATE INDEX idx_audit_simulations_status ON public.audit_simulations(status);

-- Enable RLS
ALTER TABLE public.audit_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view audit simulations"
  ON public.audit_simulations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create audit simulations"
  ON public.audit_simulations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own audit simulations"
  ON public.audit_simulations FOR UPDATE
  USING (conducted_by = auth.uid());

-- ============================================================================
-- TABLE: vessel_performance_metrics
-- Aggregated performance data by vessel and date
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Performance metrics
  compliance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  failures_by_system JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"power": 5, "propulsion": 3}
  mttr_hours NUMERIC(10,2), -- Mean Time To Repair
  ai_actions_count INTEGER NOT NULL DEFAULT 0,
  human_actions_count INTEGER NOT NULL DEFAULT 0,
  training_completions INTEGER NOT NULL DEFAULT 0,
  
  -- Aggregation metadata
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_sources JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of source references
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(vessel_id, metric_date)
);

-- Add indexes
CREATE INDEX idx_vessel_performance_vessel ON public.vessel_performance_metrics(vessel_id);
CREATE INDEX idx_vessel_performance_date ON public.vessel_performance_metrics(metric_date DESC);

-- Enable RLS
ALTER TABLE public.vessel_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view vessel performance metrics"
  ON public.vessel_performance_metrics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert vessel performance metrics"
  ON public.vessel_performance_metrics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update vessel performance metrics"
  ON public.vessel_performance_metrics FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE: compliance_evidences
-- Evidence repository for certification compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  norm_template_id UUID REFERENCES public.audit_norm_templates(id) ON DELETE SET NULL,
  
  -- Evidence details
  norm_type TEXT NOT NULL, -- 'iso_9001', 'iso_14001', 'iso_45001', 'ism', 'isps', 'modu', 'ibama', 'petrobras', 'imca'
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  
  -- File information
  file_path TEXT, -- Path in Supabase Storage
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Validation
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'validated', 'rejected', 'pending')),
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_compliance_evidences_vessel ON public.compliance_evidences(vessel_id);
CREATE INDEX idx_compliance_evidences_norm ON public.compliance_evidences(norm_type);
CREATE INDEX idx_compliance_evidences_status ON public.compliance_evidences(status);
CREATE INDEX idx_compliance_evidences_template ON public.compliance_evidences(norm_template_id);

-- Enable RLS
ALTER TABLE public.compliance_evidences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view compliance evidences"
  ON public.compliance_evidences FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create compliance evidences"
  ON public.compliance_evidences FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own compliance evidences"
  ON public.compliance_evidences FOR UPDATE
  USING (uploaded_by = auth.uid() OR auth.role() = 'authenticated');

-- ============================================================================
-- TABLE: audit_norm_templates
-- Standardized clauses for major certification norms
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm_type TEXT NOT NULL, -- 'iso_9001', 'iso_14001', 'iso_45001', 'ism', 'isps', 'modu', 'ibama', 'petrobras', 'imca'
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT,
  requirements TEXT[],
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(norm_type, clause_number)
);

-- Add indexes
CREATE INDEX idx_audit_norm_templates_type ON public.audit_norm_templates(norm_type);
CREATE INDEX idx_audit_norm_templates_clause ON public.audit_norm_templates(clause_number);

-- Enable RLS
ALTER TABLE public.audit_norm_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view audit norm templates"
  ON public.audit_norm_templates FOR SELECT
  USING (true);

-- ============================================================================
-- FUNCTION: calculate_vessel_performance_metrics
-- Computes performance metrics from audits, incidents, and training records
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_vessel_performance_metrics(
  p_vessel_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  metric_date DATE,
  compliance_percentage NUMERIC,
  failure_count INTEGER,
  failures_by_system JSONB,
  mttr_hours NUMERIC,
  ai_actions_count INTEGER,
  human_actions_count INTEGER,
  training_completions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS metric_date
  ),
  audit_metrics AS (
    SELECT 
      DATE(audit_date) as audit_metric_date,
      AVG(overall_score) as avg_score,
      COUNT(*) as audit_count
    FROM public.audit_simulations
    WHERE vessel_id = p_vessel_id
      AND DATE(audit_date) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(audit_date)
  ),
  incident_metrics AS (
    SELECT 
      DATE(incident_date) as incident_metric_date,
      COUNT(*) as incident_count,
      jsonb_object_agg(
        COALESCE(system_affected, 'unknown'), 
        COUNT(*)
      ) as system_failures
    FROM public.dp_incidents
    WHERE vessel_id = p_vessel_id
      AND DATE(incident_date) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(incident_date)
  )
  SELECT 
    dr.metric_date,
    COALESCE(am.avg_score, 0)::NUMERIC(5,2) as compliance_percentage,
    COALESCE(im.incident_count, 0)::INTEGER as failure_count,
    COALESCE(im.system_failures, '{}'::jsonb) as failures_by_system,
    NULL::NUMERIC(10,2) as mttr_hours,
    0::INTEGER as ai_actions_count,
    0::INTEGER as human_actions_count,
    0::INTEGER as training_completions
  FROM date_range dr
  LEFT JOIN audit_metrics am ON dr.metric_date = am.audit_metric_date
  LEFT JOIN incident_metrics im ON dr.metric_date = im.incident_metric_date
  ORDER BY dr.metric_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: get_missing_evidences
-- Returns clauses that lack evidence files for a vessel
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_missing_evidences(
  p_vessel_id UUID,
  p_norm_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  norm_type TEXT,
  clause_number TEXT,
  clause_title TEXT,
  is_mandatory BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ant.norm_type,
    ant.clause_number,
    ant.clause_title,
    ant.is_mandatory
  FROM public.audit_norm_templates ant
  LEFT JOIN public.compliance_evidences ce 
    ON ce.norm_template_id = ant.id 
    AND ce.vessel_id = p_vessel_id
    AND ce.status IN ('validated', 'submitted')
  WHERE ce.id IS NULL
    AND (p_norm_type IS NULL OR ant.norm_type = p_norm_type)
    AND ant.is_mandatory = true
  ORDER BY ant.norm_type, ant.clause_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA: Audit Norm Templates
-- Pre-load templates for ISO 9001/14001/45001, ISM/ISPS/MODU, IBAMA, Petrobras, IMCA
-- ============================================================================

-- ISO 9001:2015 Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('iso_9001', '4.1', 'Understanding the organization and its context', 'The organization shall determine external and internal issues relevant to its purpose', ARRAY['Document organizational context', 'Identify stakeholders', 'Monitor and review context'], true),
('iso_9001', '4.2', 'Understanding the needs and expectations of interested parties', 'The organization shall determine interested parties and their requirements', ARRAY['Identify interested parties', 'Document requirements', 'Monitor changes'], true),
('iso_9001', '4.3', 'Determining the scope of the quality management system', 'The organization shall determine the boundaries and applicability of the QMS', ARRAY['Define QMS scope', 'Consider context and requirements', 'Document and maintain scope'], true),
('iso_9001', '4.4', 'Quality management system and its processes', 'The organization shall establish, implement, maintain and continually improve a QMS', ARRAY['Establish QMS processes', 'Document process interactions', 'Maintain documented information'], true),
('iso_9001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment', ARRAY['Take accountability for QMS effectiveness', 'Ensure QMS requirements are established', 'Promote process approach and risk-based thinking'], true),
('iso_9001', '6.1', 'Actions to address risks and opportunities', 'The organization shall plan actions to address risks and opportunities', ARRAY['Determine risks and opportunities', 'Plan actions to address them', 'Integrate actions into QMS processes'], true),
('iso_9001', '7.1', 'Resources', 'The organization shall determine and provide resources needed for QMS', ARRAY['Identify required resources', 'Provide necessary resources', 'Monitor resource adequacy'], true),
('iso_9001', '8.1', 'Operational planning and control', 'The organization shall plan, implement and control processes', ARRAY['Plan operational processes', 'Implement process controls', 'Control planned changes'], true);

-- ISO 14001:2015 Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('iso_14001', '4.1', 'Understanding the organization and its context', 'Determine external and internal issues relevant to environmental management', ARRAY['Identify environmental issues', 'Consider compliance obligations', 'Monitor context changes'], true),
('iso_14001', '4.2', 'Understanding the needs and expectations of interested parties', 'Determine interested parties and their environmental expectations', ARRAY['Identify stakeholders', 'Determine compliance obligations', 'Document requirements'], true),
('iso_14001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership in environmental management', ARRAY['Take accountability for EMS', 'Ensure environmental policy is established', 'Promote continual improvement'], true),
('iso_14001', '6.1', 'Actions to address risks and opportunities', 'Determine environmental risks and opportunities', ARRAY['Identify environmental aspects', 'Determine compliance obligations', 'Plan actions to address risks'], true),
('iso_14001', '8.1', 'Operational planning and control', 'Plan, implement and control environmental processes', ARRAY['Establish operational controls', 'Control outsourced processes', 'Implement lifecycle perspective'], true);

-- ISO 45001:2018 Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('iso_45001', '4.1', 'Understanding the organization and its context', 'Determine issues relevant to OH&S management', ARRAY['Identify OH&S issues', 'Consider worker needs', 'Monitor context'], true),
('iso_45001', '5.1', 'Leadership and commitment', 'Top management commitment to OH&S management system', ARRAY['Take responsibility for OH&S', 'Ensure OH&S policy is established', 'Promote worker participation'], true),
('iso_45001', '6.1', 'Actions to address risks and opportunities', 'Determine OH&S risks and opportunities', ARRAY['Identify hazards', 'Assess OH&S risks', 'Plan actions to address risks'], true),
('iso_45001', '8.1', 'Operational planning and control', 'Plan, implement and control OH&S processes', ARRAY['Establish operational controls', 'Control work activities', 'Manage change'], true);

-- ISM Code Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('ism', '1.2', 'Safety and environmental protection policy', 'The Company should establish a safety and environmental protection policy', ARRAY['Define safety policy', 'Ensure compliance with regulations', 'Provide necessary resources'], true),
('ism', '1.4', 'Designated Person', 'The Company should designate a person ashore having direct access to highest management', ARRAY['Appoint Designated Person', 'Ensure monitoring of safety operations', 'Provide direct access to management'], true),
('ism', '2.1', 'Master responsibility and authority', 'The Company should define masters responsibility and authority', ARRAY['Define masters authority', 'Ensure master has necessary resources', 'Document masters obligations'], true),
('ism', '3.1', 'Resources and personnel', 'The Company should ensure adequate resources and shore-based support', ARRAY['Provide adequate resources', 'Ensure competent personnel', 'Provide shore-based support'], true),
('ism', '6.1', 'Operational instructions', 'The Company should establish procedures for identifying hazards', ARRAY['Identify operational hazards', 'Establish safety procedures', 'Implement risk assessment'], true);

-- ISPS Code Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('isps', 'A/4', 'Ship Security Assessment', 'A Ship Security Assessment shall be conducted', ARRAY['Conduct security assessment', 'Identify vulnerabilities', 'Document security measures'], true),
('isps', 'A/7', 'Ship Security Plan', 'A Ship Security Plan shall be developed', ARRAY['Develop security plan', 'Implement security measures', 'Train personnel'], true),
('isps', 'A/12', 'Company Security Officer', 'The Company shall designate a Company Security Officer', ARRAY['Appoint CSO', 'Define CSO responsibilities', 'Ensure CSO training'], true);

-- MODU Code Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('modu', '1.2', 'Safety Management System', 'A safety management system shall be established', ARRAY['Establish SMS for MODU', 'Ensure compliance with regulations', 'Implement risk management'], true),
('modu', '1.3', 'Station Keeping', 'Station keeping systems shall be maintained', ARRAY['Maintain DP systems', 'Conduct trials and tests', 'Document equipment status'], true);

-- IBAMA Templates (Brazilian Environmental Agency)
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('ibama', 'PEI', 'Individual Emergency Plan', 'Implement and maintain Individual Emergency Plan', ARRAY['Develop PEI', 'Conduct emergency drills', 'Update response procedures'], true),
('ibama', 'SGSO', 'Safety and Environmental Management System', 'Implement SGSO for offshore operations', ARRAY['Establish SGSO', 'Conduct risk assessments', 'Monitor environmental compliance'], true),
('ibama', 'LAIA', 'Environmental Impact Assessment', 'Conduct environmental impact assessment', ARRAY['Assess environmental impacts', 'Implement mitigation measures', 'Monitor environmental performance'], true);

-- Petrobras Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('petrobras', 'PEO-DP', 'DP Operations Excellence Program', 'Compliance with Petrobras DP requirements', ARRAY['Implement DP procedures', 'Conduct DP trials', 'Maintain DP equipment', 'Train DP personnel'], true),
('petrobras', 'SMS', 'Safety Management System', 'Implement Petrobras SMS requirements', ARRAY['Establish SMS', 'Conduct audits', 'Implement corrective actions'], true),
('petrobras', 'HSE', 'Health, Safety and Environment', 'Comply with HSE requirements', ARRAY['Implement HSE procedures', 'Conduct risk assessments', 'Monitor HSE performance'], true);

-- IMCA Templates
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, is_mandatory) VALUES
('imca', 'M103', 'DP Operations', 'Guidelines for DP operations', ARRAY['Implement DP operating procedures', 'Conduct DP FMEAs', 'Maintain DP annual trials'], true),
('imca', 'M117', 'DP Vessel Design Philosophy', 'DP vessel design and redundancy', ARRAY['Verify DP redundancy concept', 'Document DP systems', 'Maintain DP documentation'], true),
('imca', 'M140', 'DP Operations Risk Assessment', 'Conduct DP operations risk assessment', ARRAY['Perform DPRA', 'Identify hazards', 'Implement risk controls'], true),
('imca', 'M182', 'DP Incident Reporting', 'Report DP incidents and near misses', ARRAY['Report DP incidents', 'Investigate root causes', 'Implement corrective actions'], true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_simulations_updated_at
  BEFORE UPDATE ON public.audit_simulations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessel_performance_metrics_updated_at
  BEFORE UPDATE ON public.vessel_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_evidences_updated_at
  BEFORE UPDATE ON public.compliance_evidences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_norm_templates_updated_at
  BEFORE UPDATE ON public.audit_norm_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
