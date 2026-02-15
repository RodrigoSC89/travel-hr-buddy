
-- Only create tables that don't exist yet

-- NOON REPORT SYSTEM
CREATE TABLE IF NOT EXISTS public.noon_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  voyage_id UUID,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  report_time TIME NOT NULL DEFAULT '12:00:00',
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  course NUMERIC(5,1),
  speed_avg NUMERIC(5,1),
  speed_ordered NUMERIC(5,1),
  distance_run NUMERIC(7,1),
  distance_to_go NUMERIC(7,1),
  eta TIMESTAMPTZ,
  rob_hfo NUMERIC(8,1),
  rob_mdo NUMERIC(8,1),
  rob_mgo NUMERIC(8,1),
  rob_lsfo NUMERIC(8,1),
  consumption_hfo NUMERIC(6,1),
  consumption_mdo NUMERIC(6,1),
  consumption_mgo NUMERIC(6,1),
  me_rpm NUMERIC(5,1),
  me_power NUMERIC(7,1),
  me_load_percent NUMERIC(5,1),
  wind_direction TEXT,
  wind_force INTEGER,
  sea_state INTEGER,
  swell_height NUMERIC(4,1),
  visibility TEXT,
  air_temp NUMERIC(4,1),
  sea_temp NUMERIC(4,1),
  draft_fwd NUMERIC(5,2),
  draft_aft NUMERIC(5,2),
  trim NUMERIC(5,2),
  vessel_status TEXT DEFAULT 'at-sea',
  remarks TEXT,
  submitted_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.noon_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage noon reports" ON public.noon_reports FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_noon_reports_vessel ON public.noon_reports(vessel_id);
CREATE INDEX IF NOT EXISTS idx_noon_reports_date ON public.noon_reports(report_date DESC);

-- DEFECT LOG & WORK REQUESTS WITH CAPA
CREATE TABLE IF NOT EXISTS public.defect_work_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  defect_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'mechanical',
  equipment_name TEXT,
  location_onboard TEXT,
  priority TEXT DEFAULT 'medium',
  source TEXT DEFAULT 'crew-report',
  source_reference_id UUID,
  linked_capa_id UUID,
  status TEXT DEFAULT 'open',
  converted_to_pms BOOLEAN DEFAULT false,
  pms_job_id UUID,
  reported_by UUID,
  reported_by_name TEXT,
  assigned_to TEXT,
  assigned_department TEXT,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  completed_date DATE,
  verified_date DATE,
  verified_by TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  capa_status TEXT DEFAULT 'pending',
  photos JSON DEFAULT '[]',
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.defect_work_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage defect work requests" ON public.defect_work_requests FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_defect_wr_vessel ON public.defect_work_requests(vessel_id);
CREATE INDEX IF NOT EXISTS idx_defect_wr_status ON public.defect_work_requests(status);
CREATE INDEX IF NOT EXISTS idx_defect_wr_priority ON public.defect_work_requests(priority);
