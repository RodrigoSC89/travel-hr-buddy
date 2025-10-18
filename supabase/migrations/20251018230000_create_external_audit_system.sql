-- ===========================
-- ETAPA 32: External Audit System
-- AI-Powered Audit Simulation, Performance Dashboard, Evidence Management
-- ===========================

-- ===========================
-- 1. AUDIT SIMULATIONS TABLE
-- Stores AI-generated audit results
-- ===========================
CREATE TABLE IF NOT EXISTS public.audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  vessel_name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN (
    'Petrobras_PEODP', 'IBAMA_SGSO', 'IMO_ISM', 'IMO_MODU', 
    'ISO_9001', 'ISO_14001', 'ISO_45001', 'IMCA'
  )),
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  
  -- Structured results
  conformities JSONB DEFAULT '[]'::jsonb,
  non_conformities JSONB DEFAULT '[]'::jsonb,
  scores_by_norm JSONB DEFAULT '{}'::jsonb,
  technical_report TEXT,
  action_plan JSONB DEFAULT '[]'::jsonb,
  
  -- AI Analysis metadata
  ai_model TEXT DEFAULT 'gpt-4',
  processing_time_ms INTEGER,
  
  -- Audit context
  vessel_data JSONB,
  incidents_analyzed INTEGER DEFAULT 0,
  practices_analyzed INTEGER DEFAULT 0,
  
  -- Timestamps
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's audit simulations"
  ON public.audit_simulations FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Authenticated users can create audit simulations"
  ON public.audit_simulations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own audit simulations"
  ON public.audit_simulations FOR UPDATE
  USING (created_by = auth.uid());

-- Indexes
CREATE INDEX idx_audit_simulations_vessel ON public.audit_simulations(vessel_id);
CREATE INDEX idx_audit_simulations_type ON public.audit_simulations(audit_type);
CREATE INDEX idx_audit_simulations_date ON public.audit_simulations(audit_date DESC);
CREATE INDEX idx_audit_simulations_created_by ON public.audit_simulations(created_by);

-- ===========================
-- 2. VESSEL PERFORMANCE METRICS TABLE
-- Aggregated performance data by vessel and date
-- ===========================
CREATE TABLE IF NOT EXISTS public.vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  vessel_name TEXT NOT NULL,
  metric_date DATE NOT NULL,
  
  -- Key Performance Indicators
  compliance_percentage NUMERIC(5,2) CHECK (compliance_percentage BETWEEN 0 AND 100),
  failure_frequency INTEGER DEFAULT 0,
  mttr_hours NUMERIC(10,2), -- Mean Time To Repair
  ai_actions INTEGER DEFAULT 0,
  human_actions INTEGER DEFAULT 0,
  training_completions INTEGER DEFAULT 0,
  
  -- System-specific failures
  failures_by_system JSONB DEFAULT '{}'::jsonb,
  
  -- Derived metrics
  performance_score NUMERIC(5,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(vessel_id, metric_date)
);

-- Enable RLS
ALTER TABLE public.vessel_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view performance metrics"
  ON public.vessel_performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'user')
    )
  );

CREATE POLICY "Admins can insert performance metrics"
  ON public.vessel_performance_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_vessel_performance_vessel ON public.vessel_performance_metrics(vessel_id);
CREATE INDEX idx_vessel_performance_date ON public.vessel_performance_metrics(metric_date DESC);

-- ===========================
-- 3. COMPLIANCE EVIDENCES TABLE
-- Evidence repository for certification compliance
-- ===========================
CREATE TABLE IF NOT EXISTS public.compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  vessel_name TEXT NOT NULL,
  
  -- Norm classification
  norm_type TEXT NOT NULL CHECK (norm_type IN (
    'ISO_9001', 'ISO_14001', 'ISO_45001', 
    'ISM_CODE', 'ISPS_CODE', 'MODU_CODE',
    'IBAMA', 'Petrobras', 'IMCA'
  )),
  clause_number TEXT NOT NULL,
  clause_description TEXT NOT NULL,
  
  -- Evidence details
  evidence_title TEXT NOT NULL,
  evidence_description TEXT,
  file_path TEXT, -- Supabase Storage path
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Validation workflow
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'validated', 'rejected')),
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_evidences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view compliance evidences"
  ON public.compliance_evidences FOR SELECT
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Authenticated users can upload evidences"
  ON public.compliance_evidences FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own evidences"
  ON public.compliance_evidences FOR UPDATE
  USING (uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Indexes
CREATE INDEX idx_compliance_evidences_vessel ON public.compliance_evidences(vessel_id);
CREATE INDEX idx_compliance_evidences_norm ON public.compliance_evidences(norm_type);
CREATE INDEX idx_compliance_evidences_status ON public.compliance_evidences(status);
CREATE INDEX idx_compliance_evidences_uploaded_by ON public.compliance_evidences(uploaded_by);

-- ===========================
-- 4. AUDIT NORM TEMPLATES TABLE
-- Standardized clauses for major norms
-- ===========================
CREATE TABLE IF NOT EXISTS public.audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm_type TEXT NOT NULL CHECK (norm_type IN (
    'ISO_9001', 'ISO_14001', 'ISO_45001', 
    'ISM_CODE', 'ISPS_CODE', 'MODU_CODE',
    'IBAMA', 'Petrobras', 'IMCA'
  )),
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT NOT NULL,
  requirements TEXT[],
  category TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(norm_type, clause_number)
);

-- Enable RLS
ALTER TABLE public.audit_norm_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view norm templates"
  ON public.audit_norm_templates FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage norm templates"
  ON public.audit_norm_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_audit_norm_templates_type ON public.audit_norm_templates(norm_type);
CREATE INDEX idx_audit_norm_templates_clause ON public.audit_norm_templates(clause_number);

-- ===========================
-- 5. POSTGRESQL FUNCTIONS
-- ===========================

-- Function to calculate vessel performance metrics
CREATE OR REPLACE FUNCTION public.calculate_vessel_performance_metrics(
  p_vessel_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  compliance_percentage NUMERIC,
  failure_frequency BIGINT,
  mttr_hours NUMERIC,
  ai_actions BIGINT,
  human_actions BIGINT,
  training_completions BIGINT,
  failures_by_system JSONB
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH audit_stats AS (
    SELECT 
      asm.vessel_id,
      asm.vessel_name,
      AVG(asm.overall_score) as avg_score,
      COUNT(*) as audit_count
    FROM public.audit_simulations asm
    WHERE asm.vessel_id = p_vessel_id
      AND DATE(asm.audit_date) BETWEEN p_start_date AND p_end_date
    GROUP BY asm.vessel_id, asm.vessel_name
  ),
  incident_stats AS (
    SELECT 
      COUNT(*) as total_incidents,
      AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours
    FROM public.dp_incidents
    WHERE vessel = (SELECT vessel_name FROM audit_stats LIMIT 1)
      AND DATE(created_at) BETWEEN p_start_date AND p_end_date
  ),
  training_stats AS (
    SELECT 
      COUNT(*) as completed_trainings
    FROM public.crew_training_records
    WHERE vessel_id = p_vessel_id
      AND status = 'completed'
      AND DATE(completed_date) BETWEEN p_start_date AND p_end_date
  )
  SELECT 
    ast.vessel_id,
    ast.vessel_name,
    COALESCE(ast.avg_score, 0)::NUMERIC as compliance_percentage,
    COALESCE(ist.total_incidents, 0)::BIGINT as failure_frequency,
    COALESCE(ist.avg_resolution_hours, 0)::NUMERIC as mttr_hours,
    0::BIGINT as ai_actions,
    COALESCE(ist.total_incidents, 0)::BIGINT as human_actions,
    COALESCE(tst.completed_trainings, 0)::BIGINT as training_completions,
    '{}'::JSONB as failures_by_system
  FROM audit_stats ast
  CROSS JOIN incident_stats ist
  CROSS JOIN training_stats tst;
END;
$$ LANGUAGE plpgsql;

-- Function to get missing evidences for a vessel
CREATE OR REPLACE FUNCTION public.get_missing_evidences(
  p_vessel_id UUID,
  p_norm_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  norm_type TEXT,
  clause_number TEXT,
  clause_title TEXT,
  clause_description TEXT,
  is_mandatory BOOLEAN
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ant.norm_type,
    ant.clause_number,
    ant.clause_title,
    ant.clause_description,
    ant.is_mandatory
  FROM public.audit_norm_templates ant
  WHERE (p_norm_type IS NULL OR ant.norm_type = p_norm_type)
    AND NOT EXISTS (
      SELECT 1 
      FROM public.compliance_evidences ce
      WHERE ce.vessel_id = p_vessel_id
        AND ce.norm_type = ant.norm_type
        AND ce.clause_number = ant.clause_number
        AND ce.status = 'validated'
    )
  ORDER BY ant.norm_type, ant.clause_number;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_vessel_performance_metrics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_missing_evidences(UUID, TEXT) TO authenticated;

-- ===========================
-- 6. SEED NORM TEMPLATES
-- ===========================

-- ISO 9001 Quality Management
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('ISO_9001', '4.1', 'Understanding the organization and its context', 'Organization must determine external and internal issues relevant to its purpose and strategic direction', ARRAY['Documented context analysis', 'Stakeholder identification', 'Risk assessment'], 'Context', true),
('ISO_9001', '5.1', 'Leadership and commitment', 'Top management must demonstrate leadership and commitment to QMS', ARRAY['Management review records', 'Resource allocation evidence', 'Policy communication'], 'Leadership', true),
('ISO_9001', '8.1', 'Operational planning and control', 'Organization must plan, implement and control processes for products/services', ARRAY['Operational procedures', 'Process documentation', 'Control measures'], 'Operation', true),
('ISO_9001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Organization must determine what needs monitoring and measurement', ARRAY['Monitoring procedures', 'Measurement records', 'Analysis reports'], 'Performance', true),
('ISO_9001', '10.1', 'Improvement', 'Organization must improve suitability, adequacy and effectiveness of QMS', ARRAY['Corrective actions', 'Improvement plans', 'Change management'], 'Improvement', true);

-- ISO 14001 Environmental Management
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('ISO_14001', '4.1', 'Understanding the organization and its context', 'Determine external and internal issues that affect environmental management system', ARRAY['Environmental aspects identification', 'Context analysis', 'Regulatory requirements'], 'Context', true),
('ISO_14001', '6.1', 'Actions to address risks and opportunities', 'Organization must plan actions to address risks and opportunities', ARRAY['Risk assessment', 'Environmental risk register', 'Mitigation plans'], 'Planning', true),
('ISO_14001', '8.1', 'Operational planning and control', 'Organization must establish, implement and maintain processes for environmental requirements', ARRAY['Environmental procedures', 'Operational controls', 'Emergency preparedness'], 'Operation', true),
('ISO_14001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Determine what needs monitoring related to environmental performance', ARRAY['Environmental monitoring', 'Measurement equipment', 'Performance indicators'], 'Performance', true);

-- ISO 45001 Occupational Health & Safety
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('ISO_45001', '4.1', 'Understanding the organization and its context', 'Determine issues that affect OH&S management system', ARRAY['Hazard identification', 'Context analysis', 'Worker consultation'], 'Context', true),
('ISO_45001', '6.1', 'Actions to address risks and opportunities', 'Plan actions to address OH&S risks and opportunities', ARRAY['Risk assessment', 'Hazard register', 'Control hierarchy'], 'Planning', true),
('ISO_45001', '8.1', 'Operational planning and control', 'Establish processes to eliminate hazards and reduce OH&S risks', ARRAY['Safety procedures', 'Operational controls', 'Emergency response'], 'Operation', true),
('ISO_45001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Determine what needs monitoring for OH&S performance', ARRAY['Safety metrics', 'Incident tracking', 'Performance review'], 'Performance', true);

-- ISM Code (International Safety Management)
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('ISM_CODE', '1.2', 'Objectives', 'Provide safe practices and working environment', ARRAY['Safety policy', 'Safety objectives', 'Safety culture'], 'General', true),
('ISM_CODE', '3', 'Company responsibilities and authority', 'Define responsibility of shore-based personnel', ARRAY['Organization chart', 'Responsibility matrix', 'Authority documentation'], 'Management', true),
('ISM_CODE', '6', 'Resources and personnel', 'Ensure master is properly qualified and resourced', ARRAY['Crew qualifications', 'Training records', 'Resource allocation'], 'Resources', true),
('ISM_CODE', '9', 'Reports and analysis of non-conformities', 'Procedures for reporting accidents and hazardous occurrences', ARRAY['Incident reporting', 'Non-conformity procedures', 'Corrective actions'], 'Improvement', true),
('ISM_CODE', '12', 'Company verification, review and evaluation', 'Internal audits and management reviews', ARRAY['Audit schedule', 'Management review', 'Verification records'], 'Verification', true);

-- MODU Code (Mobile Offshore Drilling Units)
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('MODU_CODE', '1.2', 'General provisions', 'Application of safety regulations to MODUs', ARRAY['MODU certificate', 'Classification society approval', 'Flag state compliance'], 'General', true),
('MODU_CODE', '8', 'Life-saving appliances', 'Requirements for life-saving equipment', ARRAY['Lifeboat maintenance', 'Life raft inspections', 'Emergency equipment'], 'Safety', true),
('MODU_CODE', '9', 'Radio communications', 'Communication equipment requirements', ARRAY['Radio equipment', 'Communication procedures', 'Distress signals'], 'Communications', true),
('MODU_CODE', '13', 'Marine environment protection', 'Prevention of pollution from MODUs', ARRAY['Pollution prevention', 'Waste management', 'Oil spill response'], 'Environment', true);

-- IBAMA (Brazilian Environmental Agency)
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('IBAMA', 'SGSO-1', 'Sistema de Gestão de Segurança Operacional', 'Implementation of Operational Safety Management System', ARRAY['SGSO documentation', 'Risk management', 'Operational procedures'], 'Management', true),
('IBAMA', 'SGSO-2', 'Análise de Riscos', 'Risk analysis and assessment procedures', ARRAY['Risk assessment', 'Hazard identification', 'Risk mitigation'], 'Risk', true),
('IBAMA', 'SGSO-3', 'Planos de Emergência', 'Emergency response and contingency plans', ARRAY['Emergency procedures', 'Drill records', 'Response equipment'], 'Emergency', true),
('IBAMA', 'SGSO-4', 'Gestão de Mudanças', 'Management of change procedures', ARRAY['Change management', 'Impact assessment', 'Authorization process'], 'Change', true);

-- Petrobras PEO-DP
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('Petrobras', 'PEO-1', 'Sistema DP - Requisitos Gerais', 'General requirements for DP systems', ARRAY['DP certification', 'System documentation', 'Operational procedures'], 'General', true),
('Petrobras', 'PEO-2', 'Operação e Manutenção', 'DP operation and maintenance requirements', ARRAY['Maintenance records', 'Operational logs', 'System testing'], 'Operations', true),
('Petrobras', 'PEO-3', 'Tripulação e Treinamento', 'Crew qualifications and training', ARRAY['DP operator certificates', 'Training records', 'Competency assessments'], 'Personnel', true),
('Petrobras', 'PEO-4', 'Análise de Riscos DP', 'DP risk analysis requirements', ARRAY['FMEA analysis', 'Worst case failure', 'Risk mitigation'], 'Risk', true);

-- IMCA (International Marine Contractors Association)
INSERT INTO public.audit_norm_templates (norm_type, clause_number, clause_title, clause_description, requirements, category, is_mandatory) VALUES
('IMCA', 'M103-1', 'DP Control System', 'Requirements for DP control systems', ARRAY['System architecture', 'Redundancy design', 'Control philosophy'], 'Technical', true),
('IMCA', 'M103-2', 'Power and Propulsion', 'Power generation and propulsion requirements', ARRAY['Power management', 'Thruster configuration', 'Fuel systems'], 'Technical', true),
('IMCA', 'M117-1', 'DP Operations', 'Operational guidance for DP vessels', ARRAY['Operations manual', 'ASOG (Annual Summary)', 'Activity-specific plans'], 'Operations', true),
('IMCA', 'M190-1', 'Competence and Training', 'DP operator competence requirements', ARRAY['Training matrix', 'Certification records', 'Competence assessment'], 'Personnel', true);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_external_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_simulations_updated_at
  BEFORE UPDATE ON public.audit_simulations
  FOR EACH ROW EXECUTE FUNCTION update_external_audit_updated_at();

CREATE TRIGGER update_vessel_performance_metrics_updated_at
  BEFORE UPDATE ON public.vessel_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_external_audit_updated_at();

CREATE TRIGGER update_compliance_evidences_updated_at
  BEFORE UPDATE ON public.compliance_evidences
  FOR EACH ROW EXECUTE FUNCTION update_external_audit_updated_at();

CREATE TRIGGER update_audit_norm_templates_updated_at
  BEFORE UPDATE ON public.audit_norm_templates
  FOR EACH ROW EXECUTE FUNCTION update_external_audit_updated_at();

-- Comments
COMMENT ON TABLE public.audit_simulations IS 'ETAPA 32.1: AI-generated audit simulation results';
COMMENT ON TABLE public.vessel_performance_metrics IS 'ETAPA 32.2: Aggregated vessel performance metrics';
COMMENT ON TABLE public.compliance_evidences IS 'ETAPA 32.3: Evidence repository for compliance';
COMMENT ON TABLE public.audit_norm_templates IS 'ETAPA 32.3: Standardized norm clause templates';
COMMENT ON FUNCTION public.calculate_vessel_performance_metrics IS 'Calculate performance metrics for a vessel over date range';
COMMENT ON FUNCTION public.get_missing_evidences IS 'Identify missing evidences for vessel compliance';
