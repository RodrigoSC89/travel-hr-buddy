-- Create tactical_risks table for AI-powered operational risk predictions
CREATE TABLE IF NOT EXISTS public.tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  system TEXT NOT NULL CHECK (system IN ('DP', 'Energia', 'SGSO', 'Comunicações', 'Propulsão', 'Navegação', 'Outros')),
  predicted_risk TEXT NOT NULL CHECK (predicted_risk IN ('Failure', 'Intermittency', 'Delay', 'Degradation', 'Normal')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN risk_score >= 80 THEN 'Critical'
      WHEN risk_score >= 60 THEN 'High'
      WHEN risk_score >= 30 THEN 'Medium'
      ELSE 'Low'
    END
  ) STORED,
  suggested_action TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '15 days'),
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  ai_confidence NUMERIC(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tactical_risks_vessel_id ON public.tactical_risks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_status ON public.tactical_risks(status);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_risk_level ON public.tactical_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_generated_at ON public.tactical_risks(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_valid_until ON public.tactical_risks(valid_until);

-- Enable Row Level Security
ALTER TABLE public.tactical_risks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view tactical risks"
  ON public.tactical_risks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tactical risks"
  ON public.tactical_risks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tactical risks"
  ON public.tactical_risks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to get vessel risk summary
CREATE OR REPLACE FUNCTION public.get_vessel_risk_summary(vessel_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_risks BIGINT,
  critical_risks BIGINT,
  high_risks BIGINT,
  medium_risks BIGINT,
  low_risks BIGINT,
  avg_risk_score NUMERIC,
  pending_actions BIGINT,
  latest_prediction TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    COUNT(tr.id) AS total_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'Critical') AS critical_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'High') AS high_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'Medium') AS medium_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'Low') AS low_risks,
    ROUND(AVG(tr.risk_score), 2) AS avg_risk_score,
    COUNT(tr.id) FILTER (WHERE tr.status = 'pending') AS pending_actions,
    MAX(tr.generated_at) AS latest_prediction
  FROM public.vessels v
  LEFT JOIN public.tactical_risks tr ON v.id = tr.vessel_id 
    AND tr.status != 'resolved' 
    AND tr.valid_until > now()
  WHERE (vessel_uuid IS NULL OR v.id = vessel_uuid)
    AND v.status = 'active'
  GROUP BY v.id, v.name
  ORDER BY critical_risks DESC, high_risks DESC, avg_risk_score DESC;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE public.tactical_risks IS 'Stores AI-predicted operational risks by vessel and system for proactive risk management';
COMMENT ON COLUMN public.tactical_risks.vessel_id IS 'Reference to the vessel affected by this risk';
COMMENT ON COLUMN public.tactical_risks.system IS 'System or area affected (DP, Energia, SGSO, Comunicações, etc.)';
COMMENT ON COLUMN public.tactical_risks.predicted_risk IS 'Type of predicted risk (Failure, Intermittency, Delay, Degradation, Normal)';
COMMENT ON COLUMN public.tactical_risks.risk_score IS 'Risk severity score from 0-100';
COMMENT ON COLUMN public.tactical_risks.risk_level IS 'Auto-calculated risk level based on score (Critical/High/Medium/Low)';
COMMENT ON COLUMN public.tactical_risks.suggested_action IS 'AI-recommended action to mitigate the risk';
COMMENT ON COLUMN public.tactical_risks.assigned_to IS 'User assigned to handle this risk';
COMMENT ON COLUMN public.tactical_risks.status IS 'Current status of the risk (pending, in_progress, resolved, dismissed)';
COMMENT ON COLUMN public.tactical_risks.valid_until IS 'Risk prediction validity period (defaults to 15 days)';
COMMENT ON COLUMN public.tactical_risks.ai_confidence IS 'AI confidence level in the prediction (0-1)';
