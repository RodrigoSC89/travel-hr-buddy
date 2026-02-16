
-- CREW CHANGES
CREATE TABLE IF NOT EXISTS public.crew_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT NOT NULL,
  port TEXT NOT NULL,
  planned_date DATE NOT NULL,
  sign_on_count INT DEFAULT 0,
  sign_off_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning',
  readiness_percent INT DEFAULT 0,
  coordinator_id UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.crew_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_changes_select" ON public.crew_changes FOR SELECT TO authenticated USING (true);
CREATE POLICY "crew_changes_insert" ON public.crew_changes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "crew_changes_update" ON public.crew_changes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "crew_changes_delete" ON public.crew_changes FOR DELETE TO authenticated USING (true);

-- CREW CHANGE TASKS
CREATE TABLE IF NOT EXISTS public.crew_change_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_change_id UUID REFERENCES public.crew_changes(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  assigned_to TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.crew_change_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_change_tasks_all" ON public.crew_change_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PERMITS TO WORK
CREATE TABLE IF NOT EXISTS public.permits_to_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  permit_number TEXT NOT NULL,
  permit_type TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  requested_by UUID,
  requested_by_name TEXT,
  approved_by UUID,
  approved_by_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  risk_level TEXT DEFAULT 'medium',
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  checklist JSONB DEFAULT '[]',
  gas_readings JSONB DEFAULT '[]',
  ppe_required TEXT[],
  isolation_points JSONB DEFAULT '[]',
  rejection_reason TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.permits_to_work ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ptw_select" ON public.permits_to_work FOR SELECT TO authenticated USING (true);
CREATE POLICY "ptw_insert" ON public.permits_to_work FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ptw_update" ON public.permits_to_work FOR UPDATE TO authenticated USING (true);
CREATE POLICY "ptw_delete" ON public.permits_to_work FOR DELETE TO authenticated USING (true);

-- STOWAGE PLANS
CREATE TABLE IF NOT EXISTS public.stowage_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  voyage_ref TEXT,
  status TEXT DEFAULT 'draft',
  displacement NUMERIC,
  draft_fwd NUMERIC,
  draft_aft NUMERIC,
  trim NUMERIC,
  gm NUMERIC,
  gm_required NUMERIC DEFAULT 0.15,
  sf_max NUMERIC,
  sf_limit NUMERIC DEFAULT 100,
  bm_max NUMERIC,
  bm_limit NUMERIC DEFAULT 100,
  cargo_holds JSONB DEFAULT '[]',
  total_cargo_mt NUMERIC DEFAULT 0,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.stowage_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stowage_all" ON public.stowage_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SHIP VETTING RECORDS
CREATE TABLE IF NOT EXISTS public.ship_vetting_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT NOT NULL,
  inspection_type TEXT NOT NULL,
  inspector_name TEXT,
  inspection_date DATE,
  port TEXT,
  overall_score NUMERIC,
  observations_count INT DEFAULT 0,
  critical_findings INT DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  findings JSONB DEFAULT '[]',
  oil_major_approvals JSONB DEFAULT '[]',
  rightship_ghg_rating TEXT,
  next_due_date DATE,
  report_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ship_vetting_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vetting_all" ON public.ship_vetting_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- NOON REPORT ENTRIES
CREATE TABLE IF NOT EXISTS public.noon_report_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  report_date DATE NOT NULL,
  position_lat NUMERIC,
  position_lon NUMERIC,
  course NUMERIC,
  speed_avg NUMERIC,
  speed_ordered NUMERIC,
  distance_nm NUMERIC,
  fuel_consumed_mt NUMERIC,
  fuel_rob_mt NUMERIC,
  fuel_type TEXT,
  wind_force INT,
  wind_direction TEXT,
  sea_state INT,
  swell_height NUMERIC,
  weather_conditions TEXT,
  engine_rpm NUMERIC,
  slip_percent NUMERIC,
  me_power_kw NUMERIC,
  cargo_onboard_mt NUMERIC,
  draft_fwd NUMERIC,
  draft_aft NUMERIC,
  remarks TEXT,
  reported_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.noon_report_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "noon_reports_all" ON public.noon_report_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers (safe)
DO $$ BEGIN
  CREATE TRIGGER trg_crew_changes_upd BEFORE UPDATE ON public.crew_changes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_ptw_upd BEFORE UPDATE ON public.permits_to_work FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_stowage_upd BEFORE UPDATE ON public.stowage_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_vetting_upd BEFORE UPDATE ON public.ship_vetting_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_noon_upd BEFORE UPDATE ON public.noon_report_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
