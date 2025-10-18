-- ===========================
-- ETAPA 34 - AUDIT PREDICTIONS TABLE
-- AI-Powered Audit Score Prediction System
-- ===========================

-- Create audit_predictions table
CREATE TABLE IF NOT EXISTS public.audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO', 'DNV', 'ABS', 'Outro')),
  expected_score INTEGER NOT NULL CHECK (expected_score BETWEEN 0 AND 100),
  probability_pass TEXT NOT NULL CHECK (probability_pass IN ('Alta', 'Média', 'Baixa')),
  weaknesses JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  compliance_areas JSONB DEFAULT '{}',
  risk_factors JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'outdated', 'validated', 'archived')),
  ai_confidence NUMERIC(5,2) CHECK (ai_confidence BETWEEN 0 AND 100),
  based_on_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_predictions_vessel_id ON public.audit_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_type ON public.audit_predictions(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_status ON public.audit_predictions(status);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_generated_at ON public.audit_predictions(generated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users"
  ON public.audit_predictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.audit_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.audit_predictions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON public.audit_predictions FOR DELETE
  TO authenticated
  USING (true);

-- Create function to get latest audit predictions by vessel
CREATE OR REPLACE FUNCTION get_latest_audit_predictions(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  probability_pass TEXT,
  weaknesses JSONB,
  recommendations JSONB,
  ai_confidence NUMERIC,
  generated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (ap.vessel_id, ap.audit_type)
    ap.id,
    ap.vessel_id,
    v.name as vessel_name,
    ap.audit_type,
    ap.expected_score,
    ap.probability_pass,
    ap.weaknesses,
    ap.recommendations,
    ap.ai_confidence,
    ap.generated_at
  FROM public.audit_predictions ap
  JOIN public.vessels v ON v.id = ap.vessel_id
  WHERE ap.status = 'active'
    AND (p_vessel_id IS NULL OR ap.vessel_id = p_vessel_id)
  ORDER BY ap.vessel_id, ap.audit_type, ap.generated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get audit readiness summary
CREATE OR REPLACE FUNCTION get_audit_readiness_summary(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_audits INTEGER,
  high_probability_pass INTEGER,
  medium_probability_pass INTEGER,
  low_probability_pass INTEGER,
  avg_expected_score NUMERIC,
  critical_weaknesses INTEGER,
  pending_recommendations INTEGER,
  overall_readiness TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vessel_id,
    v.name as vessel_name,
    COUNT(DISTINCT ap.audit_type)::INTEGER as total_audits,
    COUNT(CASE WHEN ap.probability_pass = 'Alta' THEN 1 END)::INTEGER as high_probability_pass,
    COUNT(CASE WHEN ap.probability_pass = 'Média' THEN 1 END)::INTEGER as medium_probability_pass,
    COUNT(CASE WHEN ap.probability_pass = 'Baixa' THEN 1 END)::INTEGER as low_probability_pass,
    ROUND(AVG(ap.expected_score), 2) as avg_expected_score,
    COUNT(
      CASE 
        WHEN jsonb_array_length(ap.weaknesses) > 2 THEN 1 
      END
    )::INTEGER as critical_weaknesses,
    COUNT(
      CASE 
        WHEN jsonb_array_length(ap.recommendations) > 0 THEN 1 
      END
    )::INTEGER as pending_recommendations,
    CASE 
      WHEN AVG(ap.expected_score) >= 80 THEN 'Pronto'
      WHEN AVG(ap.expected_score) >= 60 THEN 'Preparação Necessária'
      WHEN AVG(ap.expected_score) >= 40 THEN 'Atenção Requerida'
      ELSE 'Crítico'
    END as overall_readiness
  FROM public.vessels v
  LEFT JOIN (
    SELECT DISTINCT ON (vessel_id, audit_type) *
    FROM public.audit_predictions
    WHERE status = 'active'
    ORDER BY vessel_id, audit_type, generated_at DESC
  ) ap ON ap.vessel_id = v.id
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
  GROUP BY v.id, v.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE public.audit_predictions IS 'Stores AI-predicted audit scores and readiness assessments';
