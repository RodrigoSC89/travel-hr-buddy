-- ETAPA 32: External Audit System Migration
-- Creates tables for audit simulation, performance metrics, and compliance evidence

-- Table 1: audit_simulations - Stores AI-generated audit results
CREATE TABLE IF NOT EXISTS audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'IMO', 'ISO', 'IMCA')),
  norms_applied TEXT[] NOT NULL,
  conformities TEXT[],
  non_conformities JSONB, -- Array of {severity, description, clause}
  scores_by_norm JSONB, -- Object with norm names as keys and scores 0-100 as values
  technical_report TEXT,
  action_plan JSONB, -- Array of {priority, action, deadline}
  simulated_by UUID REFERENCES auth.users(id),
  simulated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: vessel_performance_metrics - Aggregated performance data
CREATE TABLE IF NOT EXISTS vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  metric_date DATE NOT NULL,
  compliance_percentage DECIMAL(5,2), -- 0-100
  failure_frequency_by_system JSONB, -- {system_name: count}
  mttr_hours DECIMAL(10,2), -- Mean Time To Repair in hours
  ai_vs_human_actions JSONB, -- {ai_actions: count, human_actions: count}
  training_completions INTEGER DEFAULT 0,
  total_incidents INTEGER DEFAULT 0,
  resolved_incidents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vessel_id, metric_date)
);

-- Table 3: compliance_evidences - Evidence repository for certifications
CREATE TABLE IF NOT EXISTS compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id TEXT,
  norm TEXT NOT NULL CHECK (norm IN ('ISO-9001', 'ISO-14001', 'ISO-45001', 'ISM-Code', 'ISPS-Code', 'MODU-Code', 'IBAMA', 'Petrobras', 'IMCA')),
  clause TEXT NOT NULL,
  description TEXT,
  evidence_url TEXT, -- Supabase Storage URL
  file_name TEXT,
  file_type TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: audit_norm_templates - Standardized clauses for major norms
CREATE TABLE IF NOT EXISTS audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm TEXT NOT NULL,
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT,
  required_evidence_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(norm, clause_number)
);

-- Enable Row Level Security on all tables
ALTER TABLE audit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_norm_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_simulations
CREATE POLICY "Allow authenticated users to read audit_simulations"
  ON audit_simulations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert audit_simulations"
  ON audit_simulations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update audit_simulations"
  ON audit_simulations FOR UPDATE TO authenticated USING (true);

-- RLS Policies for vessel_performance_metrics
CREATE POLICY "Allow authenticated users to read vessel_performance_metrics"
  ON vessel_performance_metrics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert vessel_performance_metrics"
  ON vessel_performance_metrics FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update vessel_performance_metrics"
  ON vessel_performance_metrics FOR UPDATE TO authenticated USING (true);

-- RLS Policies for compliance_evidences
CREATE POLICY "Allow authenticated users to read compliance_evidences"
  ON compliance_evidences FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert compliance_evidences"
  ON compliance_evidences FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update compliance_evidences"
  ON compliance_evidences FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete compliance_evidences"
  ON compliance_evidences FOR DELETE TO authenticated USING (true);

-- RLS Policies for audit_norm_templates (read-only for most users)
CREATE POLICY "Allow all authenticated users to read audit_norm_templates"
  ON audit_norm_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert audit_norm_templates"
  ON audit_norm_templates FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_simulations_vessel ON audit_simulations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_type ON audit_simulations(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_date ON audit_simulations(simulated_at);

CREATE INDEX IF NOT EXISTS idx_vessel_performance_vessel ON vessel_performance_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_date ON vessel_performance_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_compliance_evidences_vessel ON compliance_evidences(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_norm ON compliance_evidences(norm);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_validated ON compliance_evidences(validated);

CREATE INDEX IF NOT EXISTS idx_audit_norm_templates_norm ON audit_norm_templates(norm);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_audit_simulations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_simulations_updated_at_trigger
  BEFORE UPDATE ON audit_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_simulations_updated_at();

CREATE OR REPLACE FUNCTION update_vessel_performance_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vessel_performance_metrics_updated_at_trigger
  BEFORE UPDATE ON vessel_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_vessel_performance_metrics_updated_at();

CREATE OR REPLACE FUNCTION update_compliance_evidences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_evidences_updated_at_trigger
  BEFORE UPDATE ON compliance_evidences
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_evidences_updated_at();

-- Function 1: Calculate vessel performance metrics
CREATE OR REPLACE FUNCTION calculate_vessel_performance_metrics(
  p_vessel_id TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  compliance_percentage DECIMAL,
  failure_frequency JSONB,
  mttr_hours DECIMAL,
  ai_vs_human JSONB,
  training_count INTEGER,
  incident_count INTEGER,
  resolved_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH incident_stats AS (
    SELECT 
      COUNT(*) as total_incidents,
      COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
      COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 0) as avg_mttr
    FROM dp_incidents
    WHERE vessel = p_vessel_id
      AND incident_date BETWEEN p_start_date AND p_end_date
  ),
  conformity_stats AS (
    SELECT 
      COALESCE(AVG(
        CASE 
          WHEN non_conformities IS NOT NULL 
          THEN 100 - (jsonb_array_length(non_conformities) * 10)
          ELSE 100
        END
      ), 100) as compliance_pct
    FROM audit_simulations
    WHERE vessel_id = p_vessel_id
      AND simulated_at BETWEEN p_start_date AND p_end_date
  )
  SELECT
    COALESCE(c.compliance_pct, 100)::DECIMAL as compliance_percentage,
    '{}'::JSONB as failure_frequency,
    COALESCE(i.avg_mttr, 0)::DECIMAL as mttr_hours,
    jsonb_build_object('ai_actions', 0, 'human_actions', COALESCE(i.total_incidents, 0)) as ai_vs_human,
    0 as training_count,
    COALESCE(i.total_incidents, 0)::INTEGER as incident_count,
    COALESCE(i.resolved, 0)::INTEGER as resolved_count
  FROM conformity_stats c
  CROSS JOIN incident_stats i;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get missing evidences for a norm
CREATE OR REPLACE FUNCTION get_missing_evidences(
  p_vessel_id TEXT,
  p_norm TEXT
)
RETURNS TABLE (
  clause_number TEXT,
  clause_title TEXT,
  clause_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.clause_number,
    t.clause_title,
    t.clause_description
  FROM audit_norm_templates t
  WHERE t.norm = p_norm
    AND NOT EXISTS (
      SELECT 1 FROM compliance_evidences e
      WHERE e.vessel_id = p_vessel_id
        AND e.norm = p_norm
        AND e.clause = t.clause_number
        AND e.validated = true
    )
  ORDER BY t.clause_number;
END;
$$ LANGUAGE plpgsql;

-- Insert default norm templates for ISO 9001
INSERT INTO audit_norm_templates (norm, clause_number, clause_title, clause_description, required_evidence_types) VALUES
('ISO-9001', '4.1', 'Understanding the organization and its context', 'Documentation of internal and external issues affecting the QMS', ARRAY['document', 'report']),
('ISO-9001', '4.2', 'Understanding stakeholder needs', 'Documented information about stakeholder requirements', ARRAY['document', 'report']),
('ISO-9001', '5.1', 'Leadership and commitment', 'Evidence of top management commitment to QMS', ARRAY['document', 'minutes']),
('ISO-9001', '6.1', 'Risk and opportunity management', 'Risk assessment and mitigation plans', ARRAY['document', 'report']),
('ISO-9001', '7.1', 'Resources', 'Evidence of resource planning and allocation', ARRAY['document', 'report']),
('ISO-9001', '8.1', 'Operational planning', 'Process documentation and control plans', ARRAY['document', 'procedure']),
('ISO-9001', '9.1', 'Monitoring and measurement', 'Performance monitoring records', ARRAY['report', 'log']),
('ISO-9001', '10.1', 'Nonconformity and corrective action', 'NC reports and corrective actions', ARRAY['report', 'log'])
ON CONFLICT (norm, clause_number) DO NOTHING;

-- Insert default norm templates for ISO 14001
INSERT INTO audit_norm_templates (norm, clause_number, clause_title, clause_description, required_evidence_types) VALUES
('ISO-14001', '4.1', 'Environmental context', 'Environmental aspects and impacts documentation', ARRAY['document', 'report']),
('ISO-14001', '5.1', 'Environmental policy', 'Documented environmental policy', ARRAY['document', 'policy']),
('ISO-14001', '6.1', 'Environmental risk assessment', 'Environmental risk register', ARRAY['document', 'report']),
('ISO-14001', '8.1', 'Operational controls', 'Environmental control procedures', ARRAY['procedure', 'document']),
('ISO-14001', '9.1', 'Environmental monitoring', 'Environmental monitoring records', ARRAY['report', 'log'])
ON CONFLICT (norm, clause_number) DO NOTHING;

-- Insert default norm templates for ISO 45001
INSERT INTO audit_norm_templates (norm, clause_number, clause_title, clause_description, required_evidence_types) VALUES
('ISO-45001', '4.1', 'OH&S context', 'Occupational health and safety context analysis', ARRAY['document', 'report']),
('ISO-45001', '5.1', 'OH&S policy', 'Documented OH&S policy', ARRAY['document', 'policy']),
('ISO-45001', '6.1', 'Hazard identification', 'Hazard register and risk assessment', ARRAY['document', 'report']),
('ISO-45001', '8.1', 'OH&S operational controls', 'Safety procedures and controls', ARRAY['procedure', 'document']),
('ISO-45001', '9.1', 'OH&S monitoring', 'Safety monitoring and incident records', ARRAY['report', 'log'])
ON CONFLICT (norm, clause_number) DO NOTHING;

-- Insert default norm templates for ISM Code
INSERT INTO audit_norm_templates (norm, clause_number, clause_title, clause_description, required_evidence_types) VALUES
('ISM-Code', '1.2', 'Safety management objectives', 'Safety and environmental protection objectives', ARRAY['document', 'policy']),
('ISM-Code', '2.1', 'Company responsibilities', 'Company safety management system documentation', ARRAY['document', 'manual']),
('ISM-Code', '3.1', 'Designated person', 'Designated person appointment and responsibilities', ARRAY['document', 'certificate']),
('ISM-Code', '6.1', 'Resources and personnel', 'Crew competency and training records', ARRAY['certificate', 'log']),
('ISM-Code', '9.1', 'Reports and analysis', 'Incident reports and analysis', ARRAY['report', 'log']),
('ISM-Code', '10.1', 'Maintenance', 'Planned maintenance system records', ARRAY['log', 'report'])
ON CONFLICT (norm, clause_number) DO NOTHING;

-- Insert default norm templates for IMCA
INSERT INTO audit_norm_templates (norm, clause_number, clause_title, clause_description, required_evidence_types) VALUES
('IMCA', 'M-182', 'DP operational guidance', 'DP operations manual and procedures', ARRAY['manual', 'procedure']),
('IMCA', 'M-103', 'DP vessel design philosophy', 'DP system design documentation', ARRAY['document', 'manual']),
('IMCA', 'M-206', 'DP FMEA guidance', 'FMEA proving trials documentation', ARRAY['report', 'certificate']),
('IMCA', 'M-220', 'DP annual trials', 'Annual DP trials records', ARRAY['report', 'certificate'])
ON CONFLICT (norm, clause_number) DO NOTHING;
