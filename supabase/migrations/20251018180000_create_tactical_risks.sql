-- ===========================
-- Tactical Risks Table
-- AI-powered risk forecasting for offshore vessel operations
-- ===========================

-- Create tactical_risks table
CREATE TABLE IF NOT EXISTS public.tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id TEXT NOT NULL,
  
  -- Risk identification
  risk_type TEXT NOT NULL CHECK (risk_type IN (
    'operational', 'safety', 'environmental', 'compliance', 
    'weather', 'equipment', 'crew', 'logistical'
  )),
  risk_title TEXT NOT NULL,
  risk_description TEXT NOT NULL,
  
  -- Risk assessment
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  probability TEXT NOT NULL CHECK (probability IN ('low', 'medium', 'high')),
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
  
  -- Forecast details
  forecast_date DATE NOT NULL,
  forecast_window_days INTEGER DEFAULT 15,
  predicted_by TEXT DEFAULT 'ai', -- 'ai' or 'manual' or 'rule-based'
  
  -- Action tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'mitigated', 'closed')),
  assigned_to TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Mitigation
  recommended_action TEXT,
  mitigation_plan TEXT,
  mitigation_deadline DATE,
  
  -- Metadata
  data_source JSONB, -- Stores AI analysis context
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.tactical_risks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all tactical risks
CREATE POLICY "Allow authenticated users to read tactical_risks"
  ON public.tactical_risks
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert tactical risks
CREATE POLICY "Allow authenticated users to insert tactical_risks"
  ON public.tactical_risks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update tactical risks
CREATE POLICY "Allow authenticated users to update tactical_risks"
  ON public.tactical_risks
  FOR UPDATE
  TO authenticated
  USING (true);

-- Performance-optimized indexes
CREATE INDEX IF NOT EXISTS idx_tactical_risks_vessel_id ON public.tactical_risks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_forecast_date ON public.tactical_risks(forecast_date DESC);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_severity ON public.tactical_risks(severity);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_status ON public.tactical_risks(status);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_created_at ON public.tactical_risks(created_at DESC);

-- Automatic timestamp trigger
CREATE OR REPLACE FUNCTION update_tactical_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tactical_risks_updated_at
  BEFORE UPDATE ON public.tactical_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_risks_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.tactical_risks IS 'AI-powered tactical risk forecasting for offshore vessel operations';
COMMENT ON COLUMN public.tactical_risks.risk_type IS 'Category of risk (operational, safety, environmental, compliance, weather, equipment, crew, logistical)';
COMMENT ON COLUMN public.tactical_risks.severity IS 'Risk severity level (low, medium, high, critical)';
COMMENT ON COLUMN public.tactical_risks.probability IS 'Probability of risk occurrence (low, medium, high)';
COMMENT ON COLUMN public.tactical_risks.forecast_date IS 'Date when this risk is predicted to occur';
COMMENT ON COLUMN public.tactical_risks.predicted_by IS 'Method used for prediction (ai, manual, rule-based)';
COMMENT ON COLUMN public.tactical_risks.confidence_score IS 'AI confidence score (0.0 to 1.0)';
