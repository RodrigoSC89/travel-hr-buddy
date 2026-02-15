
CREATE OR REPLACE FUNCTION public.update_generic_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.hull_integrity_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  inspection_type TEXT NOT NULL DEFAULT 'visual',
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT, zone TEXT,
  plate_thickness_mm NUMERIC(6,2), original_thickness_mm NUMERIC(6,2),
  diminution_percent NUMERIC(5,2), coating_condition TEXT DEFAULT 'good',
  corrosion_type TEXT, severity TEXT DEFAULT 'minor', status TEXT DEFAULT 'open',
  findings TEXT, recommended_action TEXT, photos JSONB DEFAULT '[]'::jsonb,
  inspector_name TEXT, next_inspection_date DATE,
  organization_id UUID, created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hull_integrity_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage hull_integrity" ON public.hull_integrity_records FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_hull_integrity_vessel ON public.hull_integrity_records(vessel_id);
CREATE INDEX idx_hull_integrity_status ON public.hull_integrity_records(status);

CREATE TRIGGER trg_hull_integrity_updated_at BEFORE UPDATE ON public.hull_integrity_records
FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
