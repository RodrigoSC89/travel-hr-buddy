-- ETAPA 32: External Audit System Migration
-- Creates tables for audit simulations, performance metrics, compliance evidences, and audit norm templates

-- Create audit_simulations table
CREATE TABLE IF NOT EXISTS audit_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL,
  vessel_name TEXT NOT NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('PEO-DP', 'SGSO', 'ISM Code', 'MODU Code', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'IMCA')),
  simulation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  conformities JSONB DEFAULT '[]'::jsonb,
  non_conformities JSONB DEFAULT '[]'::jsonb,
  scores_by_norm JSONB DEFAULT '{}'::jsonb,
  technical_report TEXT,
  action_plan JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'exported')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vessel_performance_metrics table
CREATE TABLE IF NOT EXISTS vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  vessel_name TEXT NOT NULL,
  metric_date DATE NOT NULL,
  compliance_percentage DECIMAL(5,2),
  failure_frequency_by_system JSONB DEFAULT '{}'::jsonb,
  mttr_average DECIMAL(10,2), -- Mean Time To Repair in hours
  ai_vs_human_actions JSONB DEFAULT '{"ai": 0, "human": 0}'::jsonb,
  training_completions INTEGER DEFAULT 0,
  audit_count INTEGER DEFAULT 0,
  incident_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vessel_id, metric_date)
);

-- Create audit_norm_templates table
CREATE TABLE IF NOT EXISTS audit_norm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norm_type TEXT NOT NULL CHECK (norm_type IN ('ISO 9001', 'ISO 14001', 'ISO 45001', 'ISM Code', 'ISPS Code', 'MODU Code', 'IBAMA', 'Petrobras', 'IMCA')),
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  clause_description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(norm_type, clause_number)
);

-- Create compliance_evidences table
CREATE TABLE IF NOT EXISTS compliance_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL,
  vessel_name TEXT,
  norm_template_id UUID REFERENCES audit_norm_templates(id) ON DELETE SET NULL,
  norm_type TEXT NOT NULL,
  clause_number TEXT NOT NULL,
  clause_title TEXT NOT NULL,
  evidence_title TEXT NOT NULL,
  evidence_description TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  validation_status TEXT DEFAULT 'submitted' CHECK (validation_status IN ('submitted', 'validated', 'rejected', 'pending')),
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_simulations_org ON audit_simulations(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_vessel ON audit_simulations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_type ON audit_simulations(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_simulations_date ON audit_simulations(simulation_date);

CREATE INDEX IF NOT EXISTS idx_vessel_performance_org ON vessel_performance_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_vessel ON vessel_performance_metrics(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_performance_date ON vessel_performance_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_compliance_evidences_org ON compliance_evidences(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_vessel ON compliance_evidences(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_norm ON compliance_evidences(norm_type);
CREATE INDEX IF NOT EXISTS idx_compliance_evidences_status ON compliance_evidences(validation_status);

CREATE INDEX IF NOT EXISTS idx_audit_norm_templates_type ON audit_norm_templates(norm_type);
CREATE INDEX IF NOT EXISTS idx_audit_norm_templates_active ON audit_norm_templates(is_active);

-- Add triggers for updated_at
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

CREATE TRIGGER update_compliance_evidences_updated_at
  BEFORE UPDATE ON compliance_evidences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_norm_templates_updated_at
  BEFORE UPDATE ON audit_norm_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE audit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_norm_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_simulations
CREATE POLICY "Users can view audit simulations from their organization"
  ON audit_simulations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert audit simulations"
  ON audit_simulations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT uo.organization_id FROM user_organizations uo
      JOIN user_roles ur ON ur.user_id = uo.user_id
      WHERE uo.user_id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can update audit simulations"
  ON audit_simulations FOR UPDATE
  USING (
    organization_id IN (
      SELECT uo.organization_id FROM user_organizations uo
      JOIN user_roles ur ON ur.user_id = uo.user_id
      WHERE uo.user_id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can delete audit simulations"
  ON audit_simulations FOR DELETE
  USING (
    organization_id IN (
      SELECT uo.organization_id FROM user_organizations uo
      JOIN user_roles ur ON ur.user_id = uo.user_id
      WHERE uo.user_id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for vessel_performance_metrics
CREATE POLICY "Users can view performance metrics from their organization"
  ON vessel_performance_metrics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert performance metrics"
  ON vessel_performance_metrics FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can update performance metrics"
  ON vessel_performance_metrics FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for compliance_evidences
CREATE POLICY "Users can view evidences from their organization"
  ON compliance_evidences FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert evidences"
  ON compliance_evidences FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own evidences"
  ON compliance_evidences FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Admins can update any evidence"
  ON compliance_evidences FOR UPDATE
  USING (
    organization_id IN (
      SELECT uo.organization_id FROM user_organizations uo
      JOIN user_roles ur ON ur.user_id = uo.user_id
      WHERE uo.user_id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can delete evidences"
  ON compliance_evidences FOR DELETE
  USING (
    organization_id IN (
      SELECT uo.organization_id FROM user_organizations uo
      JOIN user_roles ur ON ur.user_id = uo.user_id
      WHERE uo.user_id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for audit_norm_templates (read-only for most users)
CREATE POLICY "All authenticated users can view norm templates"
  ON audit_norm_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert norm templates"
  ON audit_norm_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update norm templates"
  ON audit_norm_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Insert default audit norm templates
INSERT INTO audit_norm_templates (norm_type, clause_number, clause_title, clause_description, category) VALUES
-- ISO 9001:2015
('ISO 9001', '4.1', 'Understanding the organization and its context', 'The organization shall determine external and internal issues relevant to its purpose and strategic direction.', 'Context of the Organization'),
('ISO 9001', '4.2', 'Understanding the needs and expectations of interested parties', 'The organization shall determine relevant interested parties and their requirements.', 'Context of the Organization'),
('ISO 9001', '5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment with respect to the quality management system.', 'Leadership'),
('ISO 9001', '6.1', 'Actions to address risks and opportunities', 'The organization shall plan actions to address risks and opportunities.', 'Planning'),
('ISO 9001', '7.1', 'Resources', 'The organization shall determine and provide the resources needed for QMS.', 'Support'),
('ISO 9001', '8.1', 'Operational planning and control', 'The organization shall plan, implement and control processes needed to meet requirements.', 'Operation'),
('ISO 9001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'The organization shall determine what needs to be monitored and measured.', 'Performance Evaluation'),
('ISO 9001', '10.1', 'Improvement', 'The organization shall determine and select opportunities for improvement.', 'Improvement'),

-- ISO 14001:2015
('ISO 14001', '4.1', 'Understanding the organization and its context', 'The organization shall determine external and internal issues relevant to environmental management.', 'Context'),
('ISO 14001', '6.1', 'Actions to address risks and opportunities', 'The organization shall plan actions to address environmental risks and opportunities.', 'Planning'),
('ISO 14001', '8.1', 'Operational planning and control', 'The organization shall establish environmental operational controls.', 'Operation'),
('ISO 14001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'The organization shall monitor and measure environmental performance.', 'Performance Evaluation'),

-- ISO 45001:2018
('ISO 45001', '4.1', 'Understanding the organization and its context', 'The organization shall determine issues relevant to OH&S management.', 'Context'),
('ISO 45001', '6.1', 'Actions to address risks and opportunities', 'The organization shall plan actions to address OH&S risks and opportunities.', 'Planning'),
('ISO 45001', '8.1', 'Operational planning and control', 'The organization shall establish OH&S operational controls.', 'Operation'),
('ISO 45001', '9.1', 'Monitoring, measurement, analysis and evaluation', 'The organization shall monitor and measure OH&S performance.', 'Performance Evaluation'),

-- ISM Code
('ISM Code', '1.2', 'Objectives', 'The objectives of the Code are to ensure safety at sea and prevention of pollution.', 'General'),
('ISM Code', '2', 'Safety and environmental protection policy', 'The Company should establish a safety and environmental protection policy.', 'Policy'),
('ISM Code', '3', 'Company responsibilities and authority', 'The Company should define and document responsibility and authority of all personnel.', 'Organization'),
('ISM Code', '6', 'Resources and personnel', 'The Company should ensure that the master is properly qualified and trained.', 'Resources'),
('ISM Code', '9', 'Reports and analysis of non-conformities', 'The SMS should include procedures ensuring that non-conformities are reported and analyzed.', 'Evaluation'),
('ISM Code', '10', 'Maintenance of the ship and equipment', 'The Company should establish procedures to ensure that the ship is maintained in conformity.', 'Maintenance'),
('ISM Code', '12', 'Company verification, review and evaluation', 'The Company should carry out internal safety audits.', 'Audit'),

-- MODU Code
('MODU Code', '1.1', 'Application', 'This Code applies to mobile offshore drilling units.', 'General'),
('MODU Code', '1.2', 'Objectives', 'To provide an international standard for safe construction and equipment of MODUs.', 'General'),

-- IMCA
('IMCA', 'M117', 'DP Incident Reporting', 'Requirements for reporting Dynamic Positioning system incidents.', 'DP Operations'),
('IMCA', 'M220', 'Guidance on DP Annual Trials', 'Guidance on conducting annual DP trials and proving tests.', 'DP Operations'),
('IMCA', 'M103', 'DP Operator Training', 'Guidelines for DP operator training and certification.', 'Training'),

-- IBAMA (Brazilian Environmental Agency)
('IBAMA', 'SGSO-01', 'Management System', 'Requirements for environmental management system.', 'Management'),
('IBAMA', 'SGSO-02', 'Emergency Response', 'Requirements for emergency response plans.', 'Emergency'),
('IBAMA', 'SGSO-03', 'Monitoring and Measurement', 'Environmental monitoring requirements.', 'Monitoring'),

-- Petrobras
('Petrobras', 'PEO-DP', 'Dynamic Positioning Operations', 'Requirements for DP operations in Petrobras contracts.', 'DP Operations'),
('Petrobras', 'PEO-001', 'Management System', 'Requirements for operational excellence management system.', 'Management'),
('Petrobras', 'PEO-002', 'Safety Management', 'Requirements for safety management in operations.', 'Safety')
ON CONFLICT (norm_type, clause_number) DO NOTHING;

-- Create function to calculate vessel performance metrics
CREATE OR REPLACE FUNCTION calculate_vessel_performance_metrics(
  p_vessel_id UUID,
  p_organization_id UUID,
  p_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_compliance_percentage DECIMAL(5,2);
  v_failure_frequency JSONB;
  v_mttr_average DECIMAL(10,2);
  v_ai_vs_human JSONB;
  v_training_completions INTEGER;
  v_audit_count INTEGER;
  v_incident_count INTEGER;
BEGIN
  -- Calculate compliance percentage from audit simulations
  SELECT COALESCE(AVG(overall_score), 0)
  INTO v_compliance_percentage
  FROM audit_simulations
  WHERE vessel_id = p_vessel_id
    AND organization_id = p_organization_id
    AND DATE(simulation_date) <= p_date
    AND DATE(simulation_date) >= p_date - INTERVAL '30 days';

  -- Calculate failure frequency by system from incidents
  SELECT COALESCE(
    jsonb_object_agg(
      COALESCE(system_affected, 'Unknown'),
      count
    ),
    '{}'::jsonb
  )
  INTO v_failure_frequency
  FROM (
    SELECT 
      system_affected,
      COUNT(*) as count
    FROM dp_incidents
    WHERE vessel_id = p_vessel_id
      AND organization_id = p_organization_id
      AND DATE(incident_date) <= p_date
      AND DATE(incident_date) >= p_date - INTERVAL '30 days'
    GROUP BY system_affected
  ) subq;

  -- Calculate MTTR (Mean Time To Repair)
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolution_date - incident_date))/3600), 0)
  INTO v_mttr_average
  FROM dp_incidents
  WHERE vessel_id = p_vessel_id
    AND organization_id = p_organization_id
    AND resolution_date IS NOT NULL
    AND DATE(incident_date) <= p_date
    AND DATE(incident_date) >= p_date - INTERVAL '30 days';

  -- AI vs Human actions (placeholder - can be enhanced with actual data)
  v_ai_vs_human := jsonb_build_object('ai', 0, 'human', 0);

  -- Count training completions
  SELECT COUNT(*)
  INTO v_training_completions
  FROM training_completions
  WHERE organization_id = p_organization_id
    AND DATE(completed_at) <= p_date
    AND DATE(completed_at) >= p_date - INTERVAL '30 days';

  -- Count audit simulations
  SELECT COUNT(*)
  INTO v_audit_count
  FROM audit_simulations
  WHERE vessel_id = p_vessel_id
    AND organization_id = p_organization_id
    AND DATE(simulation_date) <= p_date
    AND DATE(simulation_date) >= p_date - INTERVAL '30 days';

  -- Count incidents
  SELECT COUNT(*)
  INTO v_incident_count
  FROM dp_incidents
  WHERE vessel_id = p_vessel_id
    AND organization_id = p_organization_id
    AND DATE(incident_date) <= p_date
    AND DATE(incident_date) >= p_date - INTERVAL '30 days';

  -- Build result JSON
  v_result := jsonb_build_object(
    'compliance_percentage', v_compliance_percentage,
    'failure_frequency_by_system', v_failure_frequency,
    'mttr_average', v_mttr_average,
    'ai_vs_human_actions', v_ai_vs_human,
    'training_completions', v_training_completions,
    'audit_count', v_audit_count,
    'incident_count', v_incident_count
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get missing evidences for a vessel
CREATE OR REPLACE FUNCTION get_missing_evidences(
  p_vessel_id UUID,
  p_organization_id UUID,
  p_norm_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  norm_type TEXT,
  clause_number TEXT,
  clause_title TEXT,
  clause_description TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ant.norm_type,
    ant.clause_number,
    ant.clause_title,
    ant.clause_description,
    ant.category
  FROM audit_norm_templates ant
  WHERE ant.is_active = TRUE
    AND (p_norm_types IS NULL OR ant.norm_type = ANY(p_norm_types))
    AND NOT EXISTS (
      SELECT 1 
      FROM compliance_evidences ce
      WHERE ce.norm_type = ant.norm_type
        AND ce.clause_number = ant.clause_number
        AND ce.vessel_id = p_vessel_id
        AND ce.organization_id = p_organization_id
        AND ce.validation_status = 'validated'
    )
  ORDER BY ant.norm_type, ant.clause_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create comments for documentation
COMMENT ON TABLE audit_simulations IS 'Stores AI-generated audit simulation results for vessels';
COMMENT ON TABLE vessel_performance_metrics IS 'Aggregated performance metrics for vessels';
COMMENT ON TABLE compliance_evidences IS 'Evidence repository for compliance certifications';
COMMENT ON TABLE audit_norm_templates IS 'Template clauses for various audit norms and standards';
COMMENT ON FUNCTION calculate_vessel_performance_metrics IS 'Calculates performance metrics for a vessel on a specific date';
COMMENT ON FUNCTION get_missing_evidences IS 'Returns list of missing compliance evidences for a vessel';
