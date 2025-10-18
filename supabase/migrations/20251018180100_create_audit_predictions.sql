-- ===========================
-- Audit Predictions Table
-- Audit outcome simulation and readiness assessment
-- ===========================

-- Create audit_predictions table
CREATE TABLE IF NOT EXISTS public.audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id TEXT NOT NULL,
  
  -- Audit information
  audit_type TEXT NOT NULL CHECK (audit_type IN (
    'petrobras', 'ibama', 'iso', 'imca', 'ism', 'sgso'
  )),
  audit_date DATE,
  
  -- Prediction scores
  predicted_score INTEGER CHECK (predicted_score BETWEEN 0 AND 100),
  pass_probability DECIMAL(3,2) CHECK (pass_probability BETWEEN 0 AND 1),
  readiness_level TEXT CHECK (readiness_level IN ('low', 'medium', 'high', 'excellent')),
  
  -- Analysis
  weaknesses JSONB, -- Array of weak areas
  recommendations JSONB, -- Array of recommended actions
  compliance_gaps JSONB, -- Specific compliance gaps
  
  -- Simulation metadata
  based_on_months INTEGER DEFAULT 6, -- Historical data period used
  simulated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  simulated_by TEXT DEFAULT 'ai',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.audit_predictions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all audit predictions
CREATE POLICY "Allow authenticated users to read audit_predictions"
  ON public.audit_predictions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert audit predictions
CREATE POLICY "Allow authenticated users to insert audit_predictions"
  ON public.audit_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update audit predictions
CREATE POLICY "Allow authenticated users to update audit_predictions"
  ON public.audit_predictions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Performance-optimized indexes
CREATE INDEX IF NOT EXISTS idx_audit_predictions_vessel_id ON public.audit_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_type ON public.audit_predictions(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_date ON public.audit_predictions(audit_date);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_created_at ON public.audit_predictions(created_at DESC);

-- Automatic timestamp trigger
CREATE OR REPLACE FUNCTION update_audit_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_predictions_updated_at
  BEFORE UPDATE ON public.audit_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_predictions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.audit_predictions IS 'Audit outcome simulation and readiness assessment for vessels';
COMMENT ON COLUMN public.audit_predictions.audit_type IS 'Type of audit (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)';
COMMENT ON COLUMN public.audit_predictions.predicted_score IS 'Predicted audit score (0-100)';
COMMENT ON COLUMN public.audit_predictions.pass_probability IS 'Probability of passing the audit (0.0 to 1.0)';
COMMENT ON COLUMN public.audit_predictions.readiness_level IS 'Overall readiness level (low, medium, high, excellent)';
