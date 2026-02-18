
-- =============================================
-- WAVE 1 GAP COVERAGE — ALL REMAINING GAPS
-- =============================================

-- GAP 1: Inventory Items → IMPA/ISSA Coding (Sprint 9)
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS impa_code TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS issa_code TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS maker_reference TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS maker_name TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS part_number TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS drawing_number TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS equipment_id UUID; -- link to pms_components
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS reorder_point INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS last_ordered_at TIMESTAMPTZ;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS criticality TEXT; -- vital, essential, desirable

CREATE INDEX IF NOT EXISTS idx_inventory_impa ON public.inventory_items(impa_code);
CREATE INDEX IF NOT EXISTS idx_inventory_issa ON public.inventory_items(issa_code);

-- GAP 2: Vessels → EEXI/IMO DCS specs
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS eexi_attained NUMERIC(10,4);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS eexi_required NUMERIC(10,4);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS eexi_compliant BOOLEAN;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS main_engine_power_kw NUMERIC(10,2);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS main_engine_type TEXT;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS main_engine_rpm NUMERIC(8,1);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS epla_applied BOOLEAN DEFAULT false;
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS shaft_generator_kw NUMERIC(8,2);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS aux_engine_power_kw NUMERIC(10,2);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS design_speed_knots NUMERIC(5,2);
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS reference_speed_knots NUMERIC(5,2);

-- GAP 3: Maintenance Tasks → PMS Job link
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS pms_job_id UUID REFERENCES public.pms_jobs(id);
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS pms_component_id UUID REFERENCES public.pms_components(id);
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS work_order_ref TEXT;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending'; -- pending, approved, rejected
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_maint_pms_job ON public.maintenance_tasks(pms_job_id);

-- GAP 4: Invoices → invoice_type for freight/hire/demurrage
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT; -- freight, hire, demurrage, despatch, bunker, agency, misc
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS charter_party_id UUID REFERENCES public.charter_parties(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS laytime_id UUID;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'; -- [{description, quantity, rate, amount}]
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS remittance_reference TEXT;

-- GAP 5: IMO DCS Reporting (Data Collection System)
CREATE TABLE IF NOT EXISTS public.imo_dcs_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  reporting_year INTEGER NOT NULL,
  -- Vessel particulars
  imo_number TEXT NOT NULL,
  vessel_type TEXT,
  gross_tonnage NUMERIC(10,1),
  net_tonnage NUMERIC(10,1),
  deadweight NUMERIC(10,1),
  -- Annual fuel consumption by type (metric tonnes)
  hfo_mt NUMERIC(10,3) DEFAULT 0,
  lfo_mt NUMERIC(10,3) DEFAULT 0,
  mdo_mt NUMERIC(10,3) DEFAULT 0,
  mgo_mt NUMERIC(10,3) DEFAULT 0,
  lng_mt NUMERIC(10,3) DEFAULT 0,
  lpg_mt NUMERIC(10,3) DEFAULT 0,
  methanol_mt NUMERIC(10,3) DEFAULT 0,
  ethanol_mt NUMERIC(10,3) DEFAULT 0,
  other_fuel_mt NUMERIC(10,3) DEFAULT 0,
  total_fuel_mt NUMERIC(10,3),
  -- CO2 emissions
  total_co2_mt NUMERIC(10,3),
  -- Distance and hours
  distance_travelled_nm NUMERIC(10,1),
  hours_underway NUMERIC(10,1),
  -- Transport work
  dwt_distance NUMERIC(14,1), -- DWT × distance
  -- Calculated metrics
  aer NUMERIC(10,6), -- Annual Efficiency Ratio (gCO2/dwt·nm)
  eeoi NUMERIC(10,6), -- Energy Efficiency Operational Indicator
  -- Submission
  flag_state TEXT,
  classification_society TEXT,
  verified_by_org TEXT,
  verification_date DATE,
  statement_of_compliance TEXT, -- SOC number
  soc_issued_date DATE,
  soc_expiry_date DATE,
  -- Status
  status TEXT DEFAULT 'draft', -- draft, under_review, verified, submitted_to_imo
  submission_date DATE,
  imo_confirmation_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vessel_id, reporting_year)
);

ALTER TABLE public.imo_dcs_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View DCS reports" ON public.imo_dcs_reports FOR SELECT USING (true);
CREATE POLICY "Insert DCS reports" ON public.imo_dcs_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update DCS reports" ON public.imo_dcs_reports FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_dcs_vessel_year ON public.imo_dcs_reports(vessel_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_dcs_status ON public.imo_dcs_reports(status);

-- GAP 6: SIRE 2.0 Question Bank (13 chapters, 400+ questions)
CREATE TABLE IF NOT EXISTS public.sire2_question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_number INTEGER NOT NULL, -- 1-13
  chapter_title TEXT NOT NULL,
  section_number TEXT, -- e.g. '1.2.3'
  question_code TEXT NOT NULL UNIQUE, -- e.g. 'NAV-001'
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'observation', -- observation, interview, document_review, drill
  applicable_vessel_types TEXT[] DEFAULT '{}', -- tanker, bulk, gas, chemical, container
  kpi_category TEXT, -- navigation, cargo, mooring, safety, pollution_prevention
  risk_weight NUMERIC(4,2) DEFAULT 1.0,
  guidance_notes TEXT,
  expected_evidence TEXT[], -- list of evidence types needed
  ism_element_ref TEXT, -- ISM code element reference
  regulatory_reference TEXT, -- SOLAS, MARPOL, etc.
  common_findings TEXT[], -- frequently observed deficiencies
  best_practice TEXT,
  is_critical BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sire2_question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View SIRE questions" ON public.sire2_question_bank FOR SELECT USING (true);
CREATE POLICY "Manage SIRE questions" ON public.sire2_question_bank FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update SIRE questions" ON public.sire2_question_bank FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_sire2_chapter ON public.sire2_question_bank(chapter_number);
CREATE INDEX IF NOT EXISTS idx_sire2_code ON public.sire2_question_bank(question_code);
CREATE INDEX IF NOT EXISTS idx_sire2_critical ON public.sire2_question_bank(is_critical) WHERE is_critical = true;

-- GAP 7: SIRE 2.0 Inspection Responses (link findings to questions)
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES public.sire2_question_bank(id);
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS response_status TEXT; -- satisfactory, observation, non_conformity, not_applicable
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS evidence_provided JSONB DEFAULT '[]';
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS inspector_comment TEXT;
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS company_response TEXT;
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS corrective_action_due DATE;
ALTER TABLE public.sire2_findings ADD COLUMN IF NOT EXISTS corrective_action_completed DATE;

-- GAP 8: NC → CAPA auto-link (enhance non_conformities)
ALTER TABLE public.non_conformities ADD COLUMN IF NOT EXISTS capa_id UUID REFERENCES public.ism_capa(id);
ALTER TABLE public.non_conformities ADD COLUMN IF NOT EXISTS ism_element_id UUID REFERENCES public.ism_elements(id);
ALTER TABLE public.non_conformities ADD COLUMN IF NOT EXISTS auto_action_item_id UUID REFERENCES public.action_items(id);
ALTER TABLE public.non_conformities ADD COLUMN IF NOT EXISTS recurrence_count INTEGER DEFAULT 0;
ALTER TABLE public.non_conformities ADD COLUMN IF NOT EXISTS effectiveness_review_date DATE;
ALTER TABLE public.non_conformities ADD COLUMN IF NOT EXISTS effectiveness_verified BOOLEAN DEFAULT false;

-- GAP 9: PMS Work Orders → enhanced lifecycle
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS spare_parts_used JSONB DEFAULT '[]'; -- [{part_id, quantity, cost}]
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS safety_precautions TEXT;
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS permit_to_work_required BOOLEAN DEFAULT false;
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS permit_to_work_id UUID;
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS downtime_hours NUMERIC(8,2);
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS quality_check JSONB DEFAULT '{}'; -- {checked_by, date, result, notes}
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS photos_before JSONB DEFAULT '[]';
ALTER TABLE public.pms_work_orders ADD COLUMN IF NOT EXISTS photos_after JSONB DEFAULT '[]';

-- GAP 10: PSC Inspections → enhanced deficiency tracking
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS deficiency_codes JSONB DEFAULT '[]'; -- [{code, description, convention, action_code}]
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS detention_reason TEXT;
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS detention_duration_days INTEGER;
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS rectification_deadline DATE;
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS rectification_completed DATE;
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS mou_region TEXT; -- paris, tokyo, indian_ocean, etc.
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS ship_risk_profile TEXT; -- low, standard, high
ALTER TABLE public.psc_inspections ADD COLUMN IF NOT EXISTS follow_up_inspection_date DATE;

-- GAP 11: Running Hours → auto-trigger enhancement
ALTER TABLE public.pms_running_hours_triggers ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;
ALTER TABLE public.pms_running_hours_triggers ADD COLUMN IF NOT EXISTS trigger_count INTEGER DEFAULT 0;
ALTER TABLE public.pms_running_hours_triggers ADD COLUMN IF NOT EXISTS auto_create_wo BOOLEAN DEFAULT true;
ALTER TABLE public.pms_running_hours_triggers ADD COLUMN IF NOT EXISTS notification_channels TEXT[] DEFAULT '{"dashboard"}';
ALTER TABLE public.pms_running_hours_triggers ADD COLUMN IF NOT EXISTS cooldown_hours INTEGER DEFAULT 24;
