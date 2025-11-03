-- PATCH 600: Painel Consolidado de Risco (RiskOps AI)
-- Creates tables for consolidated risk monitoring and analysis

-- Table: risk_assessments
-- Consolidated risk data from all compliance modules
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('PSC', 'MLC', 'LSA_FFA', 'OVID', 'DRILL', 'GENERAL')),
  risk_type TEXT NOT NULL CHECK (risk_type IN ('compliance', 'human', 'technical', 'operational', 'environmental')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  risk_score NUMERIC(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_title TEXT NOT NULL,
  risk_description TEXT,
  affected_areas JSONB DEFAULT '[]'::jsonb,
  mitigation_actions JSONB DEFAULT '[]'::jsonb,
  ai_classification JSONB DEFAULT '{}'::jsonb,
  linked_findings JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('active', 'mitigating', 'resolved', 'accepted')) DEFAULT 'active',
  assessed_by UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: risk_trends
-- Historical risk trend data for visualization
CREATE TABLE IF NOT EXISTS risk_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('PSC', 'MLC', 'LSA_FFA', 'OVID', 'DRILL', 'GENERAL', 'OVERALL')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  average_risk_score NUMERIC(5,2),
  critical_risks_count INTEGER DEFAULT 0,
  high_risks_count INTEGER DEFAULT 0,
  medium_risks_count INTEGER DEFAULT 0,
  low_risks_count INTEGER DEFAULT 0,
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'worsening')),
  key_issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: risk_heatmap_data
-- Data for risk heatmap visualization
CREATE TABLE IF NOT EXISTS risk_heatmap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  region TEXT,
  module_type TEXT NOT NULL CHECK (module_type IN ('PSC', 'MLC', 'LSA_FFA', 'OVID', 'DRILL', 'OVERALL')),
  risk_intensity NUMERIC(5,2) NOT NULL CHECK (risk_intensity >= 0 AND risk_intensity <= 100),
  risk_count INTEGER DEFAULT 0,
  last_incident_date TIMESTAMPTZ,
  coordinates JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: risk_alerts
-- Watchdog alerts for critical risks
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_exceeded', 'pattern_detected', 'anomaly', 'deadline_approaching', 'regulatory_change')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  risk_assessment_id UUID REFERENCES risk_assessments(id),
  action_required BOOLEAN DEFAULT false,
  action_description TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: risk_exports
-- Tracks exported risk reports
CREATE TABLE IF NOT EXISTS risk_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL CHECK (export_type IN ('PDF', 'CSV', 'JSON', 'EXCEL')),
  export_scope TEXT NOT NULL CHECK (export_scope IN ('vessel', 'fleet', 'module', 'custom')),
  filters JSONB DEFAULT '{}'::jsonb,
  file_path TEXT,
  file_size_bytes BIGINT,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  downloaded_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_risk_assessments_vessel_id ON risk_assessments(vessel_id);
CREATE INDEX idx_risk_assessments_module_type ON risk_assessments(module_type);
CREATE INDEX idx_risk_assessments_risk_type ON risk_assessments(risk_type);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_assessed_at ON risk_assessments(assessed_at);

CREATE INDEX idx_risk_trends_vessel_id ON risk_trends(vessel_id);
CREATE INDEX idx_risk_trends_module_type ON risk_trends(module_type);
CREATE INDEX idx_risk_trends_period_start ON risk_trends(period_start);
CREATE INDEX idx_risk_trends_period_end ON risk_trends(period_end);

CREATE INDEX idx_risk_heatmap_vessel_id ON risk_heatmap_data(vessel_id);
CREATE INDEX idx_risk_heatmap_module_type ON risk_heatmap_data(module_type);
CREATE INDEX idx_risk_heatmap_period_date ON risk_heatmap_data(period_date);

CREATE INDEX idx_risk_alerts_vessel_id ON risk_alerts(vessel_id);
CREATE INDEX idx_risk_alerts_severity ON risk_alerts(severity);
CREATE INDEX idx_risk_alerts_acknowledged ON risk_alerts(acknowledged);
CREATE INDEX idx_risk_alerts_resolved ON risk_alerts(resolved);
CREATE INDEX idx_risk_alerts_created_at ON risk_alerts(created_at);

CREATE INDEX idx_risk_exports_export_type ON risk_exports(export_type);
CREATE INDEX idx_risk_exports_generated_by ON risk_exports(generated_by);
CREATE INDEX idx_risk_exports_generated_at ON risk_exports(generated_at);

-- Enable Row Level Security
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view risk assessments for their vessels"
  ON risk_assessments FOR SELECT
  USING (vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create risk assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (auth.uid() = assessed_by);

CREATE POLICY "Users can update risk assessments"
  ON risk_assessments FOR UPDATE
  USING (auth.uid() = assessed_by);

CREATE POLICY "Users can view risk trends for their vessels"
  ON risk_trends FOR SELECT
  USING (vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can manage risk trends"
  ON risk_trends FOR ALL
  USING (true);

CREATE POLICY "Users can view heatmap data"
  ON risk_heatmap_data FOR SELECT
  USING (vessel_id IS NULL OR vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view risk alerts for their vessels"
  ON risk_alerts FOR SELECT
  USING (vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can acknowledge alerts"
  ON risk_alerts FOR UPDATE
  USING (vessel_id IN (
    SELECT vessel_id FROM user_vessel_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their exports"
  ON risk_exports FOR SELECT
  USING (auth.uid() = generated_by);

CREATE POLICY "Users can create exports"
  ON risk_exports FOR INSERT
  WITH CHECK (auth.uid() = generated_by);

-- Triggers
CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_trends_updated_at
  BEFORE UPDATE ON risk_trends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_heatmap_data_updated_at
  BEFORE UPDATE ON risk_heatmap_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_alerts_updated_at
  BEFORE UPDATE ON risk_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
