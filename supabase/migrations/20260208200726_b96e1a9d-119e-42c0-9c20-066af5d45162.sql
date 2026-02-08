-- Create OKRs table for Objectives & Key Results
CREATE TABLE public.hr_okrs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective TEXT NOT NULL,
  owner TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  level TEXT NOT NULL DEFAULT 'team' CHECK (level IN ('company', 'team', 'individual')),
  quarter TEXT NOT NULL,
  progress NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'achieved')),
  parent_okr_id UUID REFERENCES public.hr_okrs(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Key Results table
CREATE TABLE public.hr_key_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  okr_id UUID NOT NULL REFERENCES public.hr_okrs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC NOT NULL DEFAULT 100,
  unit TEXT NOT NULL DEFAULT '%',
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'achieved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_key_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for hr_okrs
CREATE POLICY "Users can view OKRs in their organization"
  ON public.hr_okrs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create OKRs in their organization"
  ON public.hr_okrs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update OKRs in their organization"
  ON public.hr_okrs FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete OKRs in their organization"
  ON public.hr_okrs FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- RLS policies for hr_key_results (inherit access via okr_id)
CREATE POLICY "Users can view key results"
  ON public.hr_key_results FOR SELECT
  USING (
    okr_id IN (SELECT id FROM public.hr_okrs WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create key results"
  ON public.hr_key_results FOR INSERT
  WITH CHECK (
    okr_id IN (SELECT id FROM public.hr_okrs WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update key results"
  ON public.hr_key_results FOR UPDATE
  USING (
    okr_id IN (SELECT id FROM public.hr_okrs WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can delete key results"
  ON public.hr_key_results FOR DELETE
  USING (
    okr_id IN (SELECT id FROM public.hr_okrs WHERE organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
  );

-- Triggers for updated_at
CREATE TRIGGER update_hr_okrs_updated_at
  BEFORE UPDATE ON public.hr_okrs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_key_results_updated_at
  BEFORE UPDATE ON public.hr_key_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
