
-- ============================================
-- WAVE 5: COMPETITIVE GAP CLOSURE
-- Sprint 1-2: Quick Wins (Schema)
-- ============================================

-- 1) LOTO Procedures (Lock Out / Tag Out)
CREATE TABLE IF NOT EXISTS public.loto_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_to_work_id UUID REFERENCES public.permits_to_work(id) ON DELETE SET NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_tag TEXT,
  energy_source TEXT NOT NULL, -- electrical, hydraulic, pneumatic, thermal, chemical, gravitational
  isolation_point TEXT NOT NULL,
  isolation_method TEXT NOT NULL, -- valve, breaker, disconnect, blank_flange, lock
  lock_number TEXT,
  tag_number TEXT,
  locked_by TEXT,
  locked_by_user_id UUID,
  locked_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  released_by TEXT,
  released_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','locked','verified','released','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loto_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view LOTO procedures" ON public.loto_procedures FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage LOTO procedures" ON public.loto_procedures FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_loto_vessel ON public.loto_procedures(vessel_id);
CREATE INDEX idx_loto_status ON public.loto_procedures(status);
CREATE INDEX idx_loto_ptw ON public.loto_procedures(permit_to_work_id);

-- 2) JSA Templates (Job Safety Analysis)
CREATE TABLE IF NOT EXISTS public.jsa_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_type TEXT NOT NULL, -- hot_work, confined_space, working_at_height, lifting, diving, electrical, painting, tank_cleaning, mooring, cargo_operations
  description TEXT,
  hazards JSONB NOT NULL DEFAULT '[]',
  control_measures JSONB NOT NULL DEFAULT '[]',
  ppe_required TEXT[] DEFAULT '{}',
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  regulatory_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jsa_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view JSA templates" ON public.jsa_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage JSA templates" ON public.jsa_templates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_jsa_job_type ON public.jsa_templates(job_type);

-- 3) JSA Records (actual JSA assessments)
CREATE TABLE IF NOT EXISTS public.jsa_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.jsa_templates(id) ON DELETE SET NULL,
  permit_to_work_id UUID REFERENCES public.permits_to_work(id) ON DELETE SET NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  location TEXT,
  team_members TEXT[] DEFAULT '{}',
  supervisor TEXT,
  identified_hazards JSONB NOT NULL DEFAULT '[]',
  control_measures JSONB NOT NULL DEFAULT '[]',
  residual_risk_level TEXT DEFAULT 'medium',
  assessment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','reviewed','approved','completed','cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jsa_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view JSA records" ON public.jsa_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage JSA records" ON public.jsa_records FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_jsa_records_vessel ON public.jsa_records(vessel_id);

-- 4) Spare Parts Photo Catalog — add photo_url to inventory_items
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS photo_thumbnail_url TEXT;

-- 5) Fixture Negotiation Workflow
CREATE TABLE IF NOT EXISTS public.fixture_negotiations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  charterer_name TEXT NOT NULL,
  broker_name TEXT,
  cargo_type TEXT,
  cargo_quantity_mt NUMERIC,
  load_port TEXT,
  discharge_port TEXT,
  laycan_start DATE,
  laycan_end DATE,
  freight_rate NUMERIC,
  freight_unit TEXT DEFAULT 'USD/MT', -- USD/MT, lumpsum, USD/day
  commission_pct NUMERIC DEFAULT 3.75,
  address_commission_pct NUMERIC DEFAULT 2.5,
  demurrage_rate NUMERIC,
  laytime_hours NUMERIC,
  status TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN ('inquiry','offer','counter_offer','subjects','fixed','failed','withdrawn')),
  current_round INTEGER DEFAULT 1,
  subjects TEXT[] DEFAULT '{}',
  subjects_deadline TIMESTAMPTZ,
  notes TEXT,
  charter_party_id UUID,
  fixed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fixture_negotiations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view fixture negotiations" ON public.fixture_negotiations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage fixture negotiations" ON public.fixture_negotiations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_fixture_neg_status ON public.fixture_negotiations(status);
CREATE INDEX idx_fixture_neg_vessel ON public.fixture_negotiations(vessel_id);

-- 6) Fixture Offers (rounds of offers/counter-offers)
CREATE TABLE IF NOT EXISTS public.fixture_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negotiation_id UUID NOT NULL REFERENCES public.fixture_negotiations(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('offer','counter_offer','final','acceptance','rejection')),
  offered_by TEXT NOT NULL, -- 'owner' or 'charterer'
  freight_rate NUMERIC,
  demurrage_rate NUMERIC,
  laytime_hours NUMERIC,
  laycan_start DATE,
  laycan_end DATE,
  additional_terms JSONB DEFAULT '{}',
  notes TEXT,
  offered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fixture_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view fixture offers" ON public.fixture_offers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage fixture offers" ON public.fixture_offers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_fixture_offers_neg ON public.fixture_offers(negotiation_id);

-- 7) Manning Agent Portal
CREATE TABLE IF NOT EXISTS public.manning_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  country TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  mlc_compliant BOOLEAN DEFAULT false,
  flag_state_approved TEXT[] DEFAULT '{}',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','terminated')),
  portal_access_token TEXT,
  portal_enabled BOOLEAN DEFAULT false,
  last_portal_access TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manning_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view manning agents" ON public.manning_agents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage manning agents" ON public.manning_agents FOR ALL USING (auth.uid() IS NOT NULL);

-- 8) Manning Agent Candidates
CREATE TABLE IF NOT EXISTS public.manning_agent_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.manning_agents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  rank TEXT,
  nationality TEXT,
  date_of_birth DATE,
  passport_number TEXT,
  seaman_book_number TEXT,
  stcw_certificates JSONB DEFAULT '[]',
  medical_expiry DATE,
  availability_date DATE,
  experience_years NUMERIC,
  previous_vessels JSONB DEFAULT '[]',
  salary_expectation NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'available' CHECK (status IN ('available','shortlisted','interviewed','selected','rejected','embarked')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manning_agent_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view manning candidates" ON public.manning_agent_candidates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage manning candidates" ON public.manning_agent_candidates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_manning_candidates_agent ON public.manning_agent_candidates(agent_id);
CREATE INDEX idx_manning_candidates_status ON public.manning_agent_candidates(status);

-- 9) Sensor-to-Logbook Auto-fill Configuration
CREATE TABLE IF NOT EXISTS public.sensor_logbook_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  sensor_id UUID,
  sensor_type TEXT NOT NULL, -- temperature, pressure, flow_rate, rpm, power, level
  logbook_type TEXT NOT NULL, -- engine_log, deck_log, orb, grb
  logbook_field TEXT NOT NULL, -- the field to auto-populate
  conversion_formula TEXT, -- optional formula for unit conversion
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  auto_fill_enabled BOOLEAN DEFAULT true,
  last_reading NUMERIC,
  last_reading_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sensor_logbook_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sensor mappings" ON public.sensor_logbook_mappings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage sensor mappings" ON public.sensor_logbook_mappings FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_sensor_logbook_vessel ON public.sensor_logbook_mappings(vessel_id);

-- 10) EU MRV Submission Records
CREATE TABLE IF NOT EXISTS public.eu_mrv_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  total_co2_emissions NUMERIC,
  total_fuel_consumption NUMERIC,
  total_distance_nm NUMERIC,
  total_cargo_carried_mt NUMERIC,
  transport_work NUMERIC,
  avg_energy_efficiency NUMERIC,
  time_at_sea_hours NUMERIC,
  verification_body TEXT,
  verification_status TEXT DEFAULT 'draft' CHECK (verification_status IN ('draft','submitted','under_review','verified','rejected')),
  xml_report_url TEXT,
  submission_date DATE,
  thetis_mrv_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.eu_mrv_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view EU MRV submissions" ON public.eu_mrv_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage EU MRV submissions" ON public.eu_mrv_submissions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_eu_mrv_vessel ON public.eu_mrv_submissions(vessel_id);

-- 11) Q88 Vetting Questionnaires
CREATE TABLE IF NOT EXISTS public.q88_questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  questionnaire_version TEXT,
  last_synced_at TIMESTAMPTZ,
  q88_vessel_id TEXT, -- external Q88 ID
  responses JSONB DEFAULT '{}',
  completion_percent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','submitted','expired')),
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.q88_questionnaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view Q88 questionnaires" ON public.q88_questionnaires FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage Q88 questionnaires" ON public.q88_questionnaires FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_q88_vessel ON public.q88_questionnaires(vessel_id);

-- 12) Baltic Exchange Market Data
CREATE TABLE IF NOT EXISTS public.baltic_exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  index_code TEXT NOT NULL, -- BDI, BCI, BPI, BSI, BHSI, BDTI, BCTI
  index_name TEXT NOT NULL,
  rate_date DATE NOT NULL,
  value NUMERIC NOT NULL,
  change_abs NUMERIC,
  change_pct NUMERIC,
  route_code TEXT,
  route_description TEXT,
  vessel_size TEXT,
  source TEXT DEFAULT 'baltic_exchange',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.baltic_exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view Baltic rates" ON public.baltic_exchange_rates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage Baltic rates" ON public.baltic_exchange_rates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE UNIQUE INDEX idx_baltic_unique ON public.baltic_exchange_rates(index_code, rate_date, COALESCE(route_code, ''));
CREATE INDEX idx_baltic_date ON public.baltic_exchange_rates(rate_date DESC);

-- 13) Chartering Email Parser Results
CREATE TABLE IF NOT EXISTS public.chartering_email_extractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email_subject TEXT,
  email_from TEXT,
  email_received_at TIMESTAMPTZ,
  raw_content TEXT,
  extracted_data JSONB DEFAULT '{}', -- vessel, cargo, ports, laycan, rate, etc.
  confidence_score NUMERIC,
  fixture_negotiation_id UUID REFERENCES public.fixture_negotiations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processed','linked','discarded')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chartering_email_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view email extractions" ON public.chartering_email_extractions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage email extractions" ON public.chartering_email_extractions FOR ALL USING (auth.uid() IS NOT NULL);

-- 14) Dry Dock Gantt Tasks (for visual Gantt chart)
CREATE TABLE IF NOT EXISTS public.drydock_gantt_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drydock_project_id UUID NOT NULL,
  task_name TEXT NOT NULL,
  category TEXT, -- hull, machinery, piping, electrical, painting, class_survey, navigation
  planned_start DATE NOT NULL,
  planned_end DATE NOT NULL,
  actual_start DATE,
  actual_end DATE,
  progress_percent NUMERIC DEFAULT 0,
  dependencies UUID[] DEFAULT '{}', -- IDs of predecessor tasks
  assigned_contractor TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  is_critical_path BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','delayed','cancelled')),
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.drydock_gantt_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view drydock gantt tasks" ON public.drydock_gantt_tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage drydock gantt tasks" ON public.drydock_gantt_tasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_drydock_gantt_project ON public.drydock_gantt_tasks(drydock_project_id);

-- 15) Punch-out Catalog (OCI/cXML) Suppliers
CREATE TABLE IF NOT EXISTS public.punchout_catalogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  catalog_name TEXT NOT NULL,
  protocol TEXT DEFAULT 'cXML' CHECK (protocol IN ('cXML','OCI','ARIBA')),
  endpoint_url TEXT,
  identity TEXT,
  shared_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.punchout_catalogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view punchout catalogs" ON public.punchout_catalogs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage punchout catalogs" ON public.punchout_catalogs FOR ALL USING (auth.uid() IS NOT NULL);
