-- ===========================
-- ETAPA 34 - TACTICAL RISKS TABLE
-- Tactical Operational Risk Intelligence System
-- ===========================

-- Create tactical_risks table for operational risk predictions
CREATE TABLE IF NOT EXISTS public.tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  system TEXT NOT NULL CHECK (system IN ('DP', 'Energia', 'SGSO', 'Comunicações', 'Navegação', 'Propulsão', 'Segurança', 'Outro')),
  predicted_risk TEXT NOT NULL CHECK (predicted_risk IN ('Falha', 'Intermitência', 'Atraso', 'Degradação', 'Normal')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  suggested_action TEXT,
  analysis_details JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'acknowledged', 'monitoring')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tactical_risks_vessel_id ON public.tactical_risks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_status ON public.tactical_risks(status);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_generated_at ON public.tactical_risks(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_risk_score ON public.tactical_risks(risk_score DESC);

-- Enable Row Level Security
ALTER TABLE public.tactical_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users"
  ON public.tactical_risks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.tactical_risks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.tactical_risks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON public.tactical_risks FOR DELETE
  TO authenticated
  USING (true);

-- Create function to get vessel risk summary
CREATE OR REPLACE FUNCTION get_vessel_risk_summary(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_risks INTEGER,
  critical_risks INTEGER,
  high_risks INTEGER,
  medium_risks INTEGER,
  low_risks INTEGER,
  avg_risk_score NUMERIC,
  most_critical_system TEXT,
  last_update TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vessel_id,
    v.name as vessel_name,
    COUNT(tr.id)::INTEGER as total_risks,
    COUNT(CASE WHEN tr.risk_score >= 80 THEN 1 END)::INTEGER as critical_risks,
    COUNT(CASE WHEN tr.risk_score >= 60 AND tr.risk_score < 80 THEN 1 END)::INTEGER as high_risks,
    COUNT(CASE WHEN tr.risk_score >= 40 AND tr.risk_score < 60 THEN 1 END)::INTEGER as medium_risks,
    COUNT(CASE WHEN tr.risk_score < 40 THEN 1 END)::INTEGER as low_risks,
    ROUND(AVG(tr.risk_score), 2) as avg_risk_score,
    (
      SELECT tr2.system 
      FROM public.tactical_risks tr2 
      WHERE tr2.vessel_id = v.id 
        AND tr2.status = 'active'
      ORDER BY tr2.risk_score DESC 
      LIMIT 1
    ) as most_critical_system,
    MAX(tr.generated_at) as last_update
  FROM public.vessels v
  LEFT JOIN public.tactical_risks tr ON tr.vessel_id = v.id 
    AND tr.status = 'active'
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
  GROUP BY v.id, v.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE public.tactical_risks IS 'Stores AI-predicted operational risks for vessels by system';
