-- Create audit_predictions table for AI-powered audit outcome simulations
CREATE TABLE IF NOT EXISTS public.audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO')),
  expected_score INTEGER NOT NULL CHECK (expected_score >= 0 AND expected_score <= 100),
  probability TEXT NOT NULL CHECK (probability IN ('Alta', 'Média', 'Baixa')),
  weaknesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  compliance_areas JSONB DEFAULT '{}'::JSONB,
  risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_confidence NUMERIC(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_predictions_vessel_id ON public.audit_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_type ON public.audit_predictions(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_probability ON public.audit_predictions(probability);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_generated_at ON public.audit_predictions(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_valid_until ON public.audit_predictions(valid_until);

-- Enable Row Level Security
ALTER TABLE public.audit_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view audit predictions"
  ON public.audit_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert audit predictions"
  ON public.audit_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update audit predictions"
  ON public.audit_predictions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to get latest audit predictions by vessel
CREATE OR REPLACE FUNCTION public.get_latest_audit_predictions(vessel_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  probability TEXT,
  weaknesses TEXT[],
  recommendations TEXT[],
  compliance_areas JSONB,
  risk_factors TEXT[],
  ai_confidence NUMERIC,
  generated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (v.id, ap.audit_type)
    ap.id,
    v.id AS vessel_id,
    v.name AS vessel_name,
    ap.audit_type,
    ap.expected_score,
    ap.probability,
    ap.weaknesses,
    ap.recommendations,
    ap.compliance_areas,
    ap.risk_factors,
    ap.ai_confidence,
    ap.generated_at
  FROM public.vessels v
  LEFT JOIN public.audit_predictions ap ON v.id = ap.vessel_id 
    AND ap.valid_until > now()
  WHERE (vessel_uuid IS NULL OR v.id = vessel_uuid)
    AND v.status = 'active'
    AND ap.id IS NOT NULL
  ORDER BY v.id, ap.audit_type, ap.generated_at DESC;
END;
$$;

-- Create function to get audit readiness summary
CREATE OR REPLACE FUNCTION public.get_audit_readiness_summary(vessel_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  probability TEXT,
  total_weaknesses INTEGER,
  total_recommendations INTEGER,
  readiness_status TEXT,
  last_update TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH latest_predictions AS (
    SELECT DISTINCT ON (ap.vessel_id, ap.audit_type)
      ap.vessel_id,
      ap.audit_type,
      ap.expected_score,
      ap.probability,
      ap.weaknesses,
      ap.recommendations,
      ap.generated_at
    FROM public.audit_predictions ap
    WHERE ap.valid_until > now()
      AND (vessel_uuid IS NULL OR ap.vessel_id = vessel_uuid)
    ORDER BY ap.vessel_id, ap.audit_type, ap.generated_at DESC
  )
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    lp.audit_type,
    lp.expected_score,
    lp.probability,
    COALESCE(array_length(lp.weaknesses, 1), 0) AS total_weaknesses,
    COALESCE(array_length(lp.recommendations, 1), 0) AS total_recommendations,
    CASE
      WHEN lp.expected_score >= 80 AND lp.probability = 'Alta' THEN 'Pronto'
      WHEN lp.expected_score >= 60 AND lp.probability IN ('Alta', 'Média') THEN 'Parcialmente Pronto'
      ELSE 'Requer Ação'
    END AS readiness_status,
    lp.generated_at AS last_update
  FROM public.vessels v
  INNER JOIN latest_predictions lp ON v.id = lp.vessel_id
  WHERE v.status = 'active'
  ORDER BY 
    CASE lp.probability
      WHEN 'Baixa' THEN 1
      WHEN 'Média' THEN 2
      WHEN 'Alta' THEN 3
    END,
    lp.expected_score ASC;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE public.audit_predictions IS 'Stores AI-generated audit simulations for proactive compliance management';
COMMENT ON COLUMN public.audit_predictions.vessel_id IS 'Reference to the vessel being evaluated';
COMMENT ON COLUMN public.audit_predictions.audit_type IS 'Type of audit (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)';
COMMENT ON COLUMN public.audit_predictions.expected_score IS 'AI-predicted audit score (0-100)';
COMMENT ON COLUMN public.audit_predictions.probability IS 'Probability of passing the audit (Alta/Média/Baixa)';
COMMENT ON COLUMN public.audit_predictions.weaknesses IS 'Identified weaknesses and non-compliance areas';
COMMENT ON COLUMN public.audit_predictions.recommendations IS 'AI-recommended actions to improve audit readiness';
COMMENT ON COLUMN public.audit_predictions.compliance_areas IS 'JSON object with detailed compliance scores by area';
COMMENT ON COLUMN public.audit_predictions.risk_factors IS 'Key risk factors that may affect audit outcome';
COMMENT ON COLUMN public.audit_predictions.ai_confidence IS 'AI confidence level in the prediction (0-1)';
COMMENT ON COLUMN public.audit_predictions.valid_until IS 'Prediction validity period (defaults to 30 days)';
