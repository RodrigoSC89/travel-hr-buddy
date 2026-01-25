-- PATCH: Create crew_rotations table only
CREATE TABLE IF NOT EXISTS public.crew_rotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  embark_date DATE NOT NULL,
  disembark_date DATE,
  position TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crew_rotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crew_rotations
CREATE POLICY "Users can view rotations in their organization"
  ON public.crew_rotations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create rotations in their organization"
  ON public.crew_rotations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update rotations in their organization"
  ON public.crew_rotations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rotations in their organization"
  ON public.crew_rotations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_rotations_crew_member ON public.crew_rotations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_rotations_vessel ON public.crew_rotations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_crew_rotations_status ON public.crew_rotations(status);