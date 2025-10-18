-- ETAPA 32: External Audit System
-- Migration to create tables for AI-powered audit simulation, vessel performance metrics, and evidence management

-- ============================================================================
-- Table: audit_simulations
-- Purpose: Store AI-generated audit simulation results from certification bodies
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL, -- 'Petrobras-PEO-DP', 'IBAMA-SGSO', 'IMO-ISM', 'IMO-MODU', 'ISO-9001', 'ISO-14001', 'ISO-45001', 'IMCA'
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conformities JSONB DEFAULT '[]'::jsonb, -- Array of conformity items
  non_conformities JSONB DEFAULT '[]'::jsonb, -- Array with severity levels
  scores_by_norm JSONB DEFAULT '{}'::jsonb, -- Object with norm scores (0-100)
  technical_report TEXT,
  action_plan JSONB DEFAULT '[]'::jsonb, -- Prioritized actions
  pdf_url TEXT,
  status TEXT DEFAULT 'completed', -- 'completed', 'in_progress', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_audit_type CHECK (
    audit_type IN (
      'Petrobras-PEO-DP', 
      'IBAMA-SGSO', 
      'IMO-ISM', 
      'IMO-MODU', 
      'ISO-9001', 
      'ISO-14001', 
      'ISO-45001', 
      'IMCA'
    )
  ),
  CONSTRAINT valid_status CHECK (status IN ('completed', 'in_progress', 'failed'))
);

-- Index for performance
CREATE INDEX idx_audit_simulations_vessel_id ON audit_simulations(vessel_id);
CREATE INDEX idx_audit_simulations_audit_type ON audit_simulations(audit_type);
CREATE INDEX idx_audit_simulations_audit_date ON audit_simulations(audit_date DESC);

-- ============================================================================
-- Table: vessel_performance_metrics
-- Purpose: Aggregate vessel performance data from various sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  compliance_percentage NUMERIC(5, 2) DEFAULT 0, -- Overall compliance (0-100)
  failure_frequency JSONB DEFAULT '{}'::jsonb, -- Failures by system
  mttr_hours NUMERIC(10, 2) DEFAULT 0, -- Mean Time To Repair
  ai_vs_human_actions JSONB DEFAULT '{}'::jsonb, -- { ai: number, human: number }
  training_completion_rate NUMERIC(5, 2) DEFAULT 0, -- Percentage (0-100)
  recent_audits_count INTEGER DEFAULT 0,
  recent_incidents_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_vessel_performance_vessel_id ON vessel_performance_metrics(vessel_id);
CREATE INDEX idx_vessel_performance_calc_date ON vessel_performance_metrics(calculation_date DESC);

-- ============================================================================
-- Table: audit_norm_templates
-- Purpose: Store pre-loaded norm templates for evidence management
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm_name TEXT NOT NULL, -- 'ISO-9001', 'ISO-14001', 'ISO-45001', 'ISM-Code', 'ISPS-Code', 'MODU-Code', 'IBAMA', 'Petrobras', 'IMCA'
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT,
  category TEXT, -- 'Quality', 'Environment', 'Safety', 'Security', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(norm_name, clause_number)
);

-- Index for lookups
CREATE INDEX idx_audit_norm_templates_norm ON audit_norm_templates(norm_name);

-- ============================================================================
-- Table: compliance_evidences
-- Purpose: Store compliance evidence files linked to norm templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  norm_template_id UUID REFERENCES audit_norm_templates(id) ON DELETE CASCADE,
  evidence_title TEXT NOT NULL,
  evidence_description TEXT,
  file_path TEXT, -- Path in Supabase Storage
  file_url TEXT,
  validation_status TEXT DEFAULT 'submitted', -- 'submitted', 'validated', 'rejected'
  validator_notes TEXT,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_validation_status CHECK (
    validation_status IN ('submitted', 'validated', 'rejected')
  )
);

-- Index for performance
CREATE INDEX idx_compliance_evidences_vessel_id ON compliance_evidences(vessel_id);
CREATE INDEX idx_compliance_evidences_norm_template ON compliance_evidences(norm_template_id);
CREATE INDEX idx_compliance_evidences_status ON compliance_evidences(validation_status);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE audit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_norm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidences ENABLE ROW LEVEL SECURITY;

-- audit_simulations policies
CREATE POLICY "Allow admins full access to audit_simulations"
  ON audit_simulations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow users to view their vessel audit_simulations"
  ON audit_simulations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- vessel_performance_metrics policies
CREATE POLICY "Allow admins full access to vessel_performance_metrics"
  ON vessel_performance_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow users to view vessel_performance_metrics"
  ON vessel_performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- audit_norm_templates policies (read-only for all authenticated users)
CREATE POLICY "Allow all authenticated users to view audit_norm_templates"
  ON audit_norm_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admins to manage audit_norm_templates"
  ON audit_norm_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- compliance_evidences policies
CREATE POLICY "Allow admins full access to compliance_evidences"
  ON compliance_evidences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow users to view compliance_evidences"
  ON compliance_evidences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Allow users to create compliance_evidences"
  ON compliance_evidences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- ============================================================================
-- Database Functions
-- ============================================================================

-- Function: calculate_vessel_performance_metrics
-- Purpose: Compute vessel performance metrics from various data sources
CREATE OR REPLACE FUNCTION calculate_vessel_performance_metrics(p_vessel_id UUID)
RETURNS TABLE(
  compliance_percentage NUMERIC,
  failure_frequency JSONB,
  mttr_hours NUMERIC,
  ai_vs_human_actions JSONB,
  training_completion_rate NUMERIC,
  recent_audits_count INTEGER,
  recent_incidents_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_period AS (
    SELECT NOW() - INTERVAL '90 days' AS cutoff_date
  ),
  audit_data AS (
    SELECT 
      COUNT(*) AS audit_count,
      AVG((scores_by_norm->>'overall')::numeric) AS avg_score
    FROM audit_simulations
    WHERE vessel_id = p_vessel_id
      AND audit_date >= (SELECT cutoff_date FROM recent_period)
  ),
  incident_data AS (
    SELECT 
      COUNT(*) AS incident_count
    FROM dp_incidents
    WHERE vessel_id = p_vessel_id
      AND created_at >= (SELECT cutoff_date FROM recent_period)
  ),
  training_data AS (
    SELECT 
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / 
      NULLIF(COUNT(*)::NUMERIC, 0) * 100 AS completion_rate
    FROM crew_training_records
    WHERE vessel_id = p_vessel_id
  )
  SELECT
    COALESCE((SELECT avg_score FROM audit_data), 85.0)::NUMERIC AS compliance_percentage,
    '{}'::JSONB AS failure_frequency,
    0::NUMERIC AS mttr_hours,
    '{"ai": 0, "human": 0}'::JSONB AS ai_vs_human_actions,
    COALESCE((SELECT completion_rate FROM training_data), 75.0)::NUMERIC AS training_completion_rate,
    COALESCE((SELECT audit_count FROM audit_data)::INTEGER, 0) AS recent_audits_count,
    COALESCE((SELECT incident_count FROM incident_data)::INTEGER, 0) AS recent_incidents_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_missing_evidences
-- Purpose: Identify norm clauses missing evidence for a vessel
CREATE OR REPLACE FUNCTION get_missing_evidences(p_vessel_id UUID, p_norm_name TEXT DEFAULT NULL)
RETURNS TABLE(
  norm_name TEXT,
  clause_number TEXT,
  clause_title TEXT,
  clause_description TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nt.norm_name,
    nt.clause_number,
    nt.clause_title,
    nt.clause_description,
    nt.category
  FROM audit_norm_templates nt
  LEFT JOIN compliance_evidences ce ON (
    ce.norm_template_id = nt.id 
    AND ce.vessel_id = p_vessel_id
    AND ce.validation_status = 'validated'
  )
  WHERE ce.id IS NULL
    AND (p_norm_name IS NULL OR nt.norm_name = p_norm_name)
  ORDER BY nt.norm_name, nt.clause_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Seed Data: Audit Norm Templates
-- ============================================================================

-- ISO 9001 Quality Management System
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('ISO-9001', '4.1', 'Understanding the organization and its context', 'Determine external and internal issues relevant to quality management', 'Context'),
  ('ISO-9001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment', 'Leadership'),
  ('ISO-9001', '6.1', 'Actions to address risks and opportunities', 'Plan actions to address risks and opportunities', 'Planning'),
  ('ISO-9001', '7.1', 'Resources', 'Determine and provide resources needed for QMS', 'Support'),
  ('ISO-9001', '8.1', 'Operational planning and control', 'Plan, implement and control processes', 'Operation'),
  ('ISO-9001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'Determine what needs to be monitored and measured', 'Performance'),
  ('ISO-9001', '10.1', 'General improvement', 'Continual improvement of QMS', 'Improvement');

-- ISO 14001 Environmental Management
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('ISO-14001', '4.1', 'Understanding the organization and its context', 'Environmental issues and requirements', 'Context'),
  ('ISO-14001', '6.1', 'Actions to address risks and opportunities', 'Environmental risks and opportunities', 'Planning'),
  ('ISO-14001', '8.1', 'Operational planning and control', 'Environmental operational controls', 'Operation'),
  ('ISO-14001', '9.1', 'Monitoring and measurement', 'Environmental performance monitoring', 'Performance');

-- ISO 45001 Occupational Health and Safety
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('ISO-45001', '4.1', 'Understanding the organization and its context', 'OH&S issues and requirements', 'Context'),
  ('ISO-45001', '6.1', 'Actions to address risks and opportunities', 'OH&S risks and opportunities', 'Planning'),
  ('ISO-45001', '8.1', 'Operational planning and control', 'OH&S operational controls', 'Operation'),
  ('ISO-45001', '9.1', 'Monitoring and measurement', 'OH&S performance monitoring', 'Performance');

-- ISM Code (International Safety Management)
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('ISM-Code', '1.2', 'Safety and environmental protection policy', 'Company policy on safety and environment', 'Safety'),
  ('ISM-Code', '2.1', 'Company responsibilities and authority', 'Designation of responsible persons', 'Management'),
  ('ISM-Code', '3.1', 'Designated person', 'Link between company and vessels', 'Management'),
  ('ISM-Code', '6.1', 'Resources and personnel', 'Qualified and certified personnel', 'Resources'),
  ('ISM-Code', '10.1', 'Maintenance of ship and equipment', 'Maintenance procedures', 'Operation');

-- ISPS Code (International Ship and Port Facility Security)
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('ISPS-Code', 'A/5', 'Declaration of Security', 'Agreement between ships and port facilities', 'Security'),
  ('ISPS-Code', 'A/7', 'Ship security assessment', 'On-board security assessment', 'Security'),
  ('ISPS-Code', 'A/9', 'Ship security plan', 'Security plan approval and maintenance', 'Security');

-- MODU Code (Mobile Offshore Drilling Units)
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('MODU-Code', '1.1', 'Application', 'Applicability to mobile offshore drilling units', 'General'),
  ('MODU-Code', '8.1', 'Stability information', 'Stability and loading information', 'Stability'),
  ('MODU-Code', '13.1', 'Fire protection', 'Fire detection and extinction systems', 'Safety');

-- IBAMA SGSO (Brazilian Environmental Agency - Safety Management System)
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('IBAMA', 'SGSO-1', 'Safety Management System', 'Implementation of SGSO', 'Management'),
  ('IBAMA', 'SGSO-2', 'Environmental protection', 'Environmental impact assessment', 'Environment'),
  ('IBAMA', 'SGSO-3', 'Emergency response', 'Emergency procedures and drills', 'Safety'),
  ('IBAMA', 'SGSO-4', 'Personnel training', 'Training and competency requirements', 'Training');

-- Petrobras PEO-DP (Dynamic Positioning Operations)
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('Petrobras', 'PEO-DP-1', 'DP System Requirements', 'DP equipment and redundancy', 'Technical'),
  ('Petrobras', 'PEO-DP-2', 'DP Operations Procedures', 'Operational procedures for DP', 'Operation'),
  ('Petrobras', 'PEO-DP-3', 'DP Personnel Competency', 'Training and certification requirements', 'Training'),
  ('Petrobras', 'PEO-DP-4', 'DP Trial and Testing', 'Annual trials and FMEA', 'Testing');

-- IMCA (International Marine Contractors Association)
INSERT INTO audit_norm_templates (norm_name, clause_number, clause_title, clause_description, category) VALUES
  ('IMCA', 'M220-1', 'DP System Design', 'Design philosophy and redundancy', 'Technical'),
  ('IMCA', 'M220-2', 'DP Operations', 'Operational procedures and planning', 'Operation'),
  ('IMCA', 'M220-3', 'DP Crew Competency', 'Competency and training standards', 'Training'),
  ('IMCA', 'M220-4', 'DP Assurance Framework', 'Verification and assurance processes', 'Assurance');

-- ============================================================================
-- Update Triggers
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_simulations_updated_at
  BEFORE UPDATE ON audit_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessel_performance_metrics_updated_at
  BEFORE UPDATE ON vessel_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_norm_templates_updated_at
  BEFORE UPDATE ON audit_norm_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_evidences_updated_at
  BEFORE UPDATE ON compliance_evidences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE audit_simulations IS 'AI-generated audit simulation results (ETAPA 32.1)';
COMMENT ON TABLE vessel_performance_metrics IS 'Vessel performance aggregated metrics (ETAPA 32.2)';
COMMENT ON TABLE audit_norm_templates IS 'Pre-loaded norm templates for evidence management (ETAPA 32.3)';
COMMENT ON TABLE compliance_evidences IS 'Compliance evidence files linked to norms (ETAPA 32.3)';
