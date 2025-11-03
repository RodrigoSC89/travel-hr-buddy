-- PATCH 600: Risk Ops AI
-- Creates tables for AI-powered risk operations and analysis

-- Create risk_operations table
CREATE TABLE IF NOT EXISTS risk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  risk_type VARCHAR(50) NOT NULL, -- operational, compliance, safety, environmental, financial
  module VARCHAR(50) NOT NULL, -- PSC, MLC, LSA, OVID, etc.
  vessel_id UUID,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  likelihood VARCHAR(20) NOT NULL DEFAULT 'medium', -- unlikely, possible, likely, almost_certain
  risk_score DECIMAL(5,2),
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, mitigated, closed
  mitigation_plan TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create risk_assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES risk_operations(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  severity VARCHAR(20) NOT NULL,
  likelihood VARCHAR(20) NOT NULL,
  risk_score DECIMAL(5,2),
  comments TEXT,
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create risk_trends table
CREATE TABLE IF NOT EXISTS risk_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  vessel_id UUID,
  module VARCHAR(50),
  risk_type VARCHAR(50),
  total_risks INTEGER DEFAULT 0,
  open_risks INTEGER DEFAULT 0,
  closed_risks INTEGER DEFAULT 0,
  average_risk_score DECIMAL(5,2),
  high_severity_count INTEGER DEFAULT 0,
  critical_severity_count INTEGER DEFAULT 0,
  trend_direction VARCHAR(20), -- improving, stable, degrading
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_risk_operations_vessel ON risk_operations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_operations_module ON risk_operations(module);
CREATE INDEX IF NOT EXISTS idx_risk_operations_type ON risk_operations(risk_type);
CREATE INDEX IF NOT EXISTS idx_risk_operations_severity ON risk_operations(severity);
CREATE INDEX IF NOT EXISTS idx_risk_operations_status ON risk_operations(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk ON risk_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_trends_period ON risk_trends(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_risk_trends_vessel ON risk_trends(vessel_id);
CREATE INDEX IF NOT EXISTS idx_risk_trends_module ON risk_trends(module);

-- Enable RLS
ALTER TABLE risk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_trends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for risk_operations
CREATE POLICY "Users can view risks"
  ON risk_operations FOR SELECT
  USING (true);

CREATE POLICY "Safety officers and admins can create risks"
  ON risk_operations FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'safety_officer', 'supervisor', 'risk_manager')
    )
  );

CREATE POLICY "Risk managers can update risks"
  ON risk_operations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'risk_manager', 'safety_officer')
    )
  );

-- Create RLS policies for risk_assessments
CREATE POLICY "Users can view assessments"
  ON risk_assessments FOR SELECT
  USING (true);

CREATE POLICY "Assessors can create assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (auth.uid() = assessor_id);

-- Create RLS policies for risk_trends
CREATE POLICY "Users can view risk trends"
  ON risk_trends FOR SELECT
  USING (true);

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score(
  p_severity VARCHAR,
  p_likelihood VARCHAR
)
RETURNS DECIMAL AS $$
DECLARE
  severity_weight DECIMAL;
  likelihood_weight DECIMAL;
BEGIN
  -- Assign weights to severity
  severity_weight := CASE p_severity
    WHEN 'low' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'high' THEN 3
    WHEN 'critical' THEN 4
    ELSE 2
  END;
  
  -- Assign weights to likelihood
  likelihood_weight := CASE p_likelihood
    WHEN 'unlikely' THEN 1
    WHEN 'possible' THEN 2
    WHEN 'likely' THEN 3
    WHEN 'almost_certain' THEN 4
    ELSE 2
  END;
  
  -- Calculate risk score (severity * likelihood * 6.25 to get 0-100 scale)
  RETURN (severity_weight * likelihood_weight * 6.25);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-calculate risk score
CREATE OR REPLACE FUNCTION update_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_score = calculate_risk_score(NEW.severity, NEW.likelihood);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_risk_score_trigger
  BEFORE INSERT OR UPDATE ON risk_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_score();

CREATE TRIGGER calculate_assessment_risk_score_trigger
  BEFORE INSERT OR UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_score();

-- Create function to get risk statistics
CREATE OR REPLACE FUNCTION get_risk_statistics(
  p_vessel_id UUID DEFAULT NULL,
  p_module VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_risks', COUNT(*),
    'open_risks', COUNT(*) FILTER (WHERE status = 'open'),
    'closed_risks', COUNT(*) FILTER (WHERE status = 'closed'),
    'mitigated_risks', COUNT(*) FILTER (WHERE status = 'mitigated'),
    'critical_risks', COUNT(*) FILTER (WHERE severity = 'critical'),
    'high_risks', COUNT(*) FILTER (WHERE severity = 'high'),
    'average_risk_score', COALESCE(AVG(risk_score), 0),
    'risks_by_type', jsonb_object_agg(
      risk_type,
      COUNT(*)
    ),
    'risks_by_module', jsonb_object_agg(
      module,
      COUNT(*)
    )
  )
  INTO result
  FROM risk_operations
  WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
    AND (p_module IS NULL OR module = p_module);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate risk heatmap data
CREATE OR REPLACE FUNCTION get_risk_heatmap(
  p_vessel_id UUID DEFAULT NULL
)
RETURNS TABLE (
  severity VARCHAR,
  likelihood VARCHAR,
  count BIGINT,
  avg_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ro.severity,
    ro.likelihood,
    COUNT(*) as count,
    AVG(ro.risk_score) as avg_score
  FROM risk_operations ro
  WHERE (p_vessel_id IS NULL OR ro.vessel_id = p_vessel_id)
    AND ro.status = 'open'
  GROUP BY ro.severity, ro.likelihood
  ORDER BY ro.severity DESC, ro.likelihood DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE risk_operations IS 'PATCH 600: Risk operations with AI analysis and scoring';
COMMENT ON TABLE risk_assessments IS 'PATCH 600: Historical risk assessments';
COMMENT ON TABLE risk_trends IS 'PATCH 600: Risk trends over time';
