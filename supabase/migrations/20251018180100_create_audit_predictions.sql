-- Create audit_predictions table for AI-generated audit simulations
CREATE TABLE IF NOT EXISTS public.audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO')),
  expected_score INTEGER NOT NULL CHECK (expected_score >= 0 AND expected_score <= 100),
  probability TEXT NOT NULL CHECK (probability IN ('Alta', 'Média', 'Baixa')),
  confidence_level DECIMAL(3,2), -- 0.00 to 1.00
  weaknesses JSONB, -- Array of identified weaknesses
  recommendations JSONB, -- Array of actionable recommendations
  compliance_areas JSONB, -- Breakdown by compliance area
  predicted_date TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'validated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_predictions_vessel_id ON public.audit_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_type ON public.audit_predictions(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_status ON public.audit_predictions(status);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_predicted_date ON public.audit_predictions(predicted_date);

-- Enable Row Level Security
ALTER TABLE public.audit_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view audit predictions"
  ON public.audit_predictions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert audit predictions"
  ON public.audit_predictions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update audit predictions"
  ON public.audit_predictions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete audit predictions"
  ON public.audit_predictions
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_audit_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_predictions_updated_at
  BEFORE UPDATE ON public.audit_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_predictions_updated_at();
