
-- =============================================
-- Sprint 17-18: Crew Planning Hub + Vessel KPI Dashboard
-- =============================================

-- Crew Planning (6-month rotation matrix, leave management)
CREATE TABLE IF NOT EXISTS public.crew_planning_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  crew_member_id UUID REFERENCES public.crew_members(id),
  position TEXT NOT NULL, -- master, chief_officer, 2nd_officer, chief_engineer, etc.
  rank TEXT,
  assignment_type TEXT DEFAULT 'rotation', -- rotation, permanent, temporary, relief
  -- Period
  embark_date DATE NOT NULL,
  disembark_date DATE,
  planned_duration_months INTEGER DEFAULT 4,
  actual_duration_days INTEGER,
  embark_port TEXT,
  disembark_port TEXT,
  -- Relief planning
  relief_crew_id UUID,
  relief_confirmed BOOLEAN DEFAULT false,
  handover_days INTEGER DEFAULT 3,
  -- Leave tracking
  leave_start DATE,
  leave_end DATE,
  leave_type TEXT, -- annual, compensatory, medical, personal, training
  leave_days_entitled INTEGER DEFAULT 0,
  leave_days_used INTEGER DEFAULT 0,
  leave_days_remaining INTEGER DEFAULT 0,
  -- Contract
  contract_start DATE,
  contract_end DATE,
  contract_type TEXT, -- permanent, fixed_term, freelance
  sea_service_start DATE,
  -- Travel
  travel_booked BOOLEAN DEFAULT false,
  travel_booking_ref TEXT,
  visa_required BOOLEAN DEFAULT false,
  visa_status TEXT, -- not_required, pending, approved, expired
  -- Status
  status TEXT DEFAULT 'planned', -- planned, confirmed, embarked, disembarked, cancelled
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crew_planning_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage crew_planning" ON public.crew_planning_assignments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_crew_plan_vessel ON public.crew_planning_assignments(vessel_id);
CREATE INDEX idx_crew_plan_crew ON public.crew_planning_assignments(crew_member_id);
CREATE INDEX idx_crew_plan_status ON public.crew_planning_assignments(status);

-- Vessel KPI Tracking (monthly snapshots)
CREATE TABLE IF NOT EXISTS public.vessel_kpi_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  snapshot_date DATE NOT NULL,
  period TEXT DEFAULT 'monthly', -- daily, weekly, monthly, quarterly
  -- Operational KPIs
  availability_pct NUMERIC(5,2), -- % time available
  utilization_pct NUMERIC(5,2), -- % time earning revenue
  sea_days INTEGER DEFAULT 0,
  port_days INTEGER DEFAULT 0,
  off_hire_days NUMERIC(8,2) DEFAULT 0,
  idle_days NUMERIC(8,2) DEFAULT 0,
  -- Financial KPIs
  daily_opex NUMERIC(12,2),
  tce_rate NUMERIC(12,2), -- Time Charter Equivalent
  revenue NUMERIC(14,2) DEFAULT 0,
  voyage_costs NUMERIC(14,2) DEFAULT 0,
  running_costs NUMERIC(14,2) DEFAULT 0,
  drydock_reserve NUMERIC(14,2) DEFAULT 0,
  net_earnings NUMERIC(14,2) DEFAULT 0,
  budget_variance_pct NUMERIC(5,2),
  -- Technical KPIs
  pms_compliance_pct NUMERIC(5,2), -- PMS tasks on time
  overdue_jobs INTEGER DEFAULT 0,
  critical_spares_stock_pct NUMERIC(5,2),
  deficiency_count INTEGER DEFAULT 0,
  breakdown_hours NUMERIC(8,2) DEFAULT 0,
  mtbf_hours NUMERIC(10,2), -- Mean Time Between Failures
  -- Safety KPIs
  ltif NUMERIC(8,4), -- Lost Time Injury Frequency
  trir NUMERIC(8,4), -- Total Recordable Incident Rate
  near_miss_count INTEGER DEFAULT 0,
  safety_observations INTEGER DEFAULT 0,
  drills_completed INTEGER DEFAULT 0,
  drills_planned INTEGER DEFAULT 0,
  -- Environmental KPIs
  cii_rating TEXT, -- A, B, C, D, E
  eexi_compliance BOOLEAN DEFAULT true,
  co2_emissions_mt NUMERIC(10,2),
  sox_emissions_mt NUMERIC(8,2),
  fuel_consumption_mt NUMERIC(10,2),
  fuel_efficiency NUMERIC(8,4), -- mt/nm or mt/day
  -- Crew KPIs
  crew_retention_pct NUMERIC(5,2),
  training_compliance_pct NUMERIC(5,2),
  crew_satisfaction_score NUMERIC(5,2),
  avg_fatigue_score NUMERIC(5,2),
  cert_expiry_alerts INTEGER DEFAULT 0,
  -- Compliance KPIs
  psc_deficiencies INTEGER DEFAULT 0,
  vetting_score NUMERIC(5,2),
  audit_findings INTEGER DEFAULT 0,
  open_ncs INTEGER DEFAULT 0,
  overdue_capa INTEGER DEFAULT 0,
  -- Overall
  overall_score NUMERIC(5,2),
  scoring_methodology TEXT DEFAULT 'weighted_average',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vessel_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage vessel_kpi" ON public.vessel_kpi_snapshots FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_kpi_vessel ON public.vessel_kpi_snapshots(vessel_id);
CREATE INDEX idx_kpi_date ON public.vessel_kpi_snapshots(snapshot_date);
CREATE UNIQUE INDEX idx_kpi_vessel_date ON public.vessel_kpi_snapshots(vessel_id, snapshot_date, period);

-- Triggers
DROP TRIGGER IF EXISTS update_crew_planning_updated_at ON public.crew_planning_assignments;
CREATE TRIGGER update_crew_planning_updated_at BEFORE UPDATE ON public.crew_planning_assignments FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();

DROP TRIGGER IF EXISTS update_vessel_kpi_updated_at ON public.vessel_kpi_snapshots;
CREATE TRIGGER update_vessel_kpi_updated_at BEFORE UPDATE ON public.vessel_kpi_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_generic_updated_at();
