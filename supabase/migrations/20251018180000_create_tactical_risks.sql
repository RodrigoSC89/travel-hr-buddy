-- Create tactical_risks table for AI-predicted operational risks
CREATE TABLE IF NOT EXISTS public.tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  system TEXT NOT NULL, -- DP, Energia, SGSO, Comunicações, etc.
  risk_type TEXT NOT NULL CHECK (risk_type IN ('Failure', 'Intermittency', 'Delay', 'Degradation', 'Normal')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Low')),
  description TEXT,
  predicted_date TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  suggested_action TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tactical_risks_vessel_id ON public.tactical_risks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_status ON public.tactical_risks(status);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_risk_level ON public.tactical_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_predicted_date ON public.tactical_risks(predicted_date);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_assigned_to ON public.tactical_risks(assigned_to);

-- Enable Row Level Security
ALTER TABLE public.tactical_risks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tactical risks"
  ON public.tactical_risks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert tactical risks"
  ON public.tactical_risks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tactical risks"
  ON public.tactical_risks
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete tactical risks"
  ON public.tactical_risks
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tactical_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tactical_risks_updated_at
  BEFORE UPDATE ON public.tactical_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_risks_updated_at();
