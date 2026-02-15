
-- MLC Wage Records (Reg. 2.2)
CREATE TABLE IF NOT EXISTS public.mlc_wage_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID REFERENCES public.crew_members(id),
  crew_name TEXT NOT NULL,
  rank TEXT,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  overtime_hours NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  allotment_percent NUMERIC DEFAULT 0,
  allotment_recipient TEXT,
  net_pay NUMERIC DEFAULT 0,
  paid_on_time BOOLEAN DEFAULT true,
  pay_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid','pending','overdue')),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mlc_wage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view wage records" ON public.mlc_wage_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert wage records" ON public.mlc_wage_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update wage records" ON public.mlc_wage_records FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete wage records" ON public.mlc_wage_records FOR DELETE USING (auth.uid() IS NOT NULL);

-- MLC Wage Compliance Checks
CREATE TABLE IF NOT EXISTS public.mlc_wage_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement TEXT NOT NULL,
  regulation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'partial' CHECK (status IN ('compliant','non_compliant','partial')),
  details TEXT,
  last_checked DATE,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mlc_wage_compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage wage compliance" ON public.mlc_wage_compliance FOR ALL USING (auth.uid() IS NOT NULL);

-- MLC Recruitment Agencies (Reg. 1.4)
CREATE TABLE IF NOT EXISTS public.mlc_recruitment_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_code TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  license_number TEXT,
  license_expiry DATE,
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('approved','conditional','under_review','blacklisted')),
  compliance_score NUMERIC DEFAULT 0,
  last_audit DATE,
  placements INTEGER DEFAULT 0,
  complaints INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mlc_recruitment_agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage recruitment agencies" ON public.mlc_recruitment_agencies FOR ALL USING (auth.uid() IS NOT NULL);

-- MLC Recruitment Checklist
CREATE TABLE IF NOT EXISTS public.mlc_recruitment_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement TEXT NOT NULL,
  regulation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'partial' CHECK (status IN ('compliant','non_compliant','partial')),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mlc_recruitment_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage recruitment checklist" ON public.mlc_recruitment_checklist FOR ALL USING (auth.uid() IS NOT NULL);

-- PEOTRAM NC Action Plans
CREATE TABLE IF NOT EXISTS public.peotram_nc_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nc_number TEXT NOT NULL,
  element INTEGER NOT NULL,
  element_name TEXT NOT NULL,
  item_id TEXT,
  description TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  priority TEXT NOT NULL DEFAULT 'C' CHECK (priority IN ('A','B','C','D')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','evidence_pending','verification','closed')),
  responsible TEXT,
  responsible_email TEXT,
  due_date DATE,
  closed_at DATE,
  evidence_count INTEGER DEFAULT 0,
  verified_by TEXT,
  escalated BOOLEAN DEFAULT false,
  percent_complete INTEGER DEFAULT 0,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peotram_nc_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage NC actions" ON public.peotram_nc_actions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_peotram_nc_status ON public.peotram_nc_actions(status);
CREATE INDEX idx_peotram_nc_priority ON public.peotram_nc_actions(priority);

-- PEO-DP Operational Window Records
CREATE TABLE IF NOT EXISTS public.peodp_operational_window (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parameter TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  yellow_limit NUMERIC NOT NULL,
  red_limit NUMERIC NOT NULL,
  asog_status TEXT DEFAULT 'GREEN' CHECK (asog_status IN ('GREEN','YELLOW','RED')),
  dp_class TEXT DEFAULT 'DP2',
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  recorded_by UUID,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peodp_operational_window ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage operational window" ON public.peodp_operational_window FOR ALL USING (auth.uid() IS NOT NULL);

-- PEO-DP Equipment Status
CREATE TABLE IF NOT EXISTS public.peodp_equipment_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online','standby','offline','fault')),
  redundancy TEXT,
  last_check DATE,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peodp_equipment_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage equipment status" ON public.peodp_equipment_status FOR ALL USING (auth.uid() IS NOT NULL);
