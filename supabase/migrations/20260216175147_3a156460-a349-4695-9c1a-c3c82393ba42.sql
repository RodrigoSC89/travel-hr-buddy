
-- Warranty Claims table
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT,
  equipment TEXT NOT NULL,
  manufacturer TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  failure_description TEXT,
  failure_date DATE,
  claim_date DATE DEFAULT CURRENT_DATE,
  warranty_expiry DATE,
  claim_amount NUMERIC DEFAULT 0,
  recovered_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warranty_claims_all" ON public.warranty_claims FOR ALL USING (true) WITH CHECK (true);

-- Insurance Policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  insurer TEXT NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id),
  premium NUMERIC DEFAULT 0,
  coverage NUMERIC DEFAULT 0,
  deductible NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_policies_all" ON public.insurance_policies FOR ALL USING (true) WITH CHECK (true);

-- Insurance Claims table
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID REFERENCES public.insurance_policies(id),
  vessel_id UUID REFERENCES public.vessels(id),
  incident_date DATE,
  description TEXT,
  amount_claimed NUMERIC DEFAULT 0,
  amount_recovered NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_claims_all" ON public.insurance_claims FOR ALL USING (true) WITH CHECK (true);

-- Class Surveys table
CREATE TABLE IF NOT EXISTS public.class_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  survey_type TEXT NOT NULL,
  class_society TEXT DEFAULT 'DNV',
  due_date DATE,
  last_completed DATE,
  surveyor TEXT,
  findings INTEGER DEFAULT 0,
  open_conditions INTEGER DEFAULT 0,
  cost NUMERIC,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.class_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class_surveys_all" ON public.class_surveys FOR ALL USING (true) WITH CHECK (true);

-- Class Conditions table
CREATE TABLE IF NOT EXISTS public.class_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  condition_number TEXT,
  description TEXT,
  imposed_date DATE,
  due_date DATE,
  status TEXT DEFAULT 'open',
  category TEXT DEFAULT 'class',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.class_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class_conditions_all" ON public.class_conditions FOR ALL USING (true) WITH CHECK (true);
