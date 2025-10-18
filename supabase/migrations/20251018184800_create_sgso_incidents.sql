-- Create sgso_incidents table as specified in requirements
CREATE TABLE IF NOT EXISTS public.sgso_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  type TEXT,
  description TEXT,
  reported_at TIMESTAMP WITH TIME ZONE,
  severity TEXT,
  status TEXT DEFAULT 'open',
  corrective_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.sgso_incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view sgso_incidents from their organization"
  ON public.sgso_incidents FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM public.vessels 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert sgso_incidents for their organization vessels"
  ON public.sgso_incidents FOR INSERT
  WITH CHECK (
    vessel_id IN (
      SELECT id FROM public.vessels 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update sgso_incidents from their organization"
  ON public.sgso_incidents FOR UPDATE
  USING (
    vessel_id IN (
      SELECT id FROM public.vessels 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete sgso_incidents from their organization"
  ON public.sgso_incidents FOR DELETE
  USING (
    vessel_id IN (
      SELECT id FROM public.vessels 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_sgso_incidents_vessel ON public.sgso_incidents(vessel_id);
CREATE INDEX idx_sgso_incidents_severity ON public.sgso_incidents(severity);
CREATE INDEX idx_sgso_incidents_status ON public.sgso_incidents(status);
CREATE INDEX idx_sgso_incidents_reported_at ON public.sgso_incidents(reported_at);

-- Add trigger for updated_at column
CREATE TRIGGER update_sgso_incidents_updated_at BEFORE UPDATE ON public.sgso_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.sgso_incidents IS 'SGSO incidents table for tracking safety incidents per vessel';
