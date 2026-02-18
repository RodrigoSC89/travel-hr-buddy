
-- Sprint 21-22: Charter Party & Laytime/Demurrage

-- 1. Charter Party Clauses (BIMCO standard forms)
CREATE TABLE IF NOT EXISTS public.charter_party_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  charter_party_id UUID REFERENCES public.charter_parties(id),
  organization_id UUID REFERENCES public.organizations(id),
  clause_number INTEGER NOT NULL,
  clause_title TEXT NOT NULL,
  clause_text TEXT,
  clause_type TEXT DEFAULT 'standard', -- standard, rider, addendum, amendment
  bimco_reference TEXT, -- e.g. 'GENCON 2022 Cl.14'
  is_negotiable BOOLEAN DEFAULT true,
  negotiation_status TEXT DEFAULT 'draft', -- draft, proposed, counter, agreed, rejected
  proposed_by TEXT, -- owner, charterer, broker
  amendments JSONB DEFAULT '[]', -- history of changes
  risk_assessment TEXT, -- low, medium, high
  legal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.charter_party_clauses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View charter clauses" ON public.charter_party_clauses FOR SELECT USING (true);
CREATE POLICY "Insert charter clauses" ON public.charter_party_clauses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update charter clauses" ON public.charter_party_clauses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Delete charter clauses" ON public.charter_party_clauses FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. Laytime & Demurrage Calculations
CREATE TABLE IF NOT EXISTS public.laytime_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voyage_id UUID,
  charter_party_id UUID REFERENCES public.charter_parties(id),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  port_name TEXT NOT NULL,
  port_type TEXT DEFAULT 'loading', -- loading, discharging
  cargo_quantity NUMERIC(12,3),
  cargo_unit TEXT DEFAULT 'MT',
  -- Laytime terms
  laytime_type TEXT DEFAULT 'reversible', -- reversible, non_reversible, average
  laytime_allowed_hours NUMERIC(10,2),
  laytime_commencement TEXT, -- WIBON, WIFPON, WIPON
  nor_tendered_at TIMESTAMPTZ, -- Notice of Readiness
  nor_accepted_at TIMESTAMPTZ,
  laytime_starts_at TIMESTAMPTZ,
  laytime_ends_at TIMESTAMPTZ,
  -- Time tracking
  time_used_hours NUMERIC(10,2),
  time_saved_hours NUMERIC(10,2),
  time_exceeded_hours NUMERIC(10,2),
  -- Exclusions
  excluded_periods JSONB DEFAULT '[]', -- [{reason, from, to, hours}]
  sundays_holidays_excluded BOOLEAN DEFAULT false, -- SHEX, SHINC
  weather_working_days BOOLEAN DEFAULT false, -- WWD
  -- Financial
  demurrage_rate_per_day NUMERIC(12,2),
  despatch_rate_per_day NUMERIC(12,2), -- usually half demurrage
  demurrage_amount NUMERIC(12,2),
  despatch_amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  -- Status
  status TEXT DEFAULT 'draft', -- draft, calculated, disputed, agreed, invoiced
  dispute_notes TEXT,
  agreed_amount NUMERIC(12,2),
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.laytime_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View laytime" ON public.laytime_calculations FOR SELECT USING (true);
CREATE POLICY "Insert laytime" ON public.laytime_calculations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update laytime" ON public.laytime_calculations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Delete laytime" ON public.laytime_calculations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_charter_clauses_cp ON public.charter_party_clauses(charter_party_id);
CREATE INDEX IF NOT EXISTS idx_laytime_voyage ON public.laytime_calculations(voyage_id);
CREATE INDEX IF NOT EXISTS idx_laytime_vessel ON public.laytime_calculations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_laytime_status ON public.laytime_calculations(status);
