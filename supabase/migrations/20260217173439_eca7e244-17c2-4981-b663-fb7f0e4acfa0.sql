-- Create time_charters table for TC-In/TC-Out management
CREATE TABLE public.time_charters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  charter_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tc-in', 'tc-out')),
  counterparty TEXT NOT NULL,
  hire_rate NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD/day',
  period TEXT,
  commencement_date DATE NOT NULL,
  redelivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'terminated')),
  address_commission TEXT,
  bunker_on_delivery JSONB DEFAULT '{}',
  bunker_on_redelivery JSONB,
  off_hire_days NUMERIC DEFAULT 0,
  total_hire_earned NUMERIC DEFAULT 0,
  cp_form TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.time_charters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_charters_select" ON public.time_charters FOR SELECT TO authenticated USING (true);
CREATE POLICY "time_charters_insert" ON public.time_charters FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "time_charters_update" ON public.time_charters FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "time_charters_delete" ON public.time_charters FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_time_charters_updated_at BEFORE UPDATE ON public.time_charters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();