
-- 1. Create the trigger function first
CREATE OR REPLACE FUNCTION public.update_maritime_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create mlc_dmlc table
CREATE TABLE IF NOT EXISTS public.mlc_dmlc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  dmlc_part TEXT DEFAULT 'II' CHECK (dmlc_part IN ('I','II')),
  title_1_measures JSONB DEFAULT '{}',
  title_2_measures JSONB DEFAULT '{}',
  title_3_measures JSONB DEFAULT '{}',
  title_4_measures JSONB DEFAULT '{}',
  title_5_measures JSONB DEFAULT '{}',
  issued_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  issuing_authority TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','expired','revoked')),
  last_inspection_date TIMESTAMPTZ,
  next_inspection_date TIMESTAMPTZ,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mlc_dmlc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage mlc_dmlc" ON public.mlc_dmlc FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Create triggers on mlc_dmlc
DROP TRIGGER IF EXISTS trg_mlc_dmlc_updated ON public.mlc_dmlc;
CREATE TRIGGER trg_mlc_dmlc_updated BEFORE UPDATE ON public.mlc_dmlc FOR EACH ROW EXECUTE FUNCTION public.update_maritime_compliance_updated_at();

-- 4. Create missing indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mlc_dmlc_vessel') THEN CREATE INDEX idx_mlc_dmlc_vessel ON public.mlc_dmlc(vessel_id); END IF;
END $$;
