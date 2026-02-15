
-- =============================================
-- PEO-DP TABLES
-- =============================================

-- Equipment DP (IMCA M 166)
CREATE TABLE IF NOT EXISTS public.peodp_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  status TEXT DEFAULT 'operational',
  status_notes TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  last_calibration DATE,
  next_calibration DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  install_date DATE,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment Maintenance History
CREATE TABLE IF NOT EXISTS public.peodp_equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.peodp_equipment(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  performed_by TEXT,
  performed_at TIMESTAMPTZ DEFAULT now(),
  next_due DATE,
  result TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DP Audit Trail (immutable)
CREATE TABLE IF NOT EXISTS public.peodp_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  performed_by UUID,
  organization_id UUID REFERENCES public.organizations(id),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- DP Incidents (CIRAS)
CREATE TABLE IF NOT EXISTS public.peodp_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  incident_type TEXT NOT NULL,
  severity TEXT DEFAULT 'minor',
  title TEXT NOT NULL,
  description TEXT,
  dp_class TEXT,
  position_loss BOOLEAN DEFAULT false,
  weather_conditions JSONB,
  equipment_involved JSONB DEFAULT '[]',
  root_cause TEXT,
  corrective_actions TEXT,
  reported_to_ciras BOOLEAN DEFAULT false,
  ciras_reference TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  reported_by UUID,
  status TEXT DEFAULT 'open',
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PEOTRAM TABLES
-- =============================================

-- Checklist Items (350+ items IMCA S 081)
CREATE TABLE IF NOT EXISTS public.peotram_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  subsection TEXT,
  description TEXT NOT NULL,
  reference TEXT,
  acceptance_criteria TEXT,
  is_critical BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Checklist Responses per operation
CREATE TABLE IF NOT EXISTS public.peotram_checklist_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.peotram_checklist_items(id) ON DELETE CASCADE,
  operation_id UUID,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  evidence_url TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SAT System Status
CREATE TABLE IF NOT EXISTS public.peotram_sat_chambers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  chamber_name TEXT NOT NULL,
  chamber_type TEXT DEFAULT 'living',
  current_pressure DECIMAL(8,2),
  target_pressure DECIMAL(8,2),
  o2_percentage DECIMAL(5,2),
  co2_ppm DECIMAL(8,2),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  status TEXT DEFAULT 'operational',
  last_reading_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diver Records
CREATE TABLE IF NOT EXISTS public.peotram_divers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id),
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  diver_class TEXT NOT NULL,
  imca_cert_number TEXT,
  imca_cert_expiry DATE,
  hse_cert_number TEXT,
  hse_cert_expiry DATE,
  medical_fitness TEXT DEFAULT 'fit',
  medical_expiry DATE,
  total_sat_hours DECIMAL(10,2) DEFAULT 0,
  last_dive_date DATE,
  emergency_contact TEXT,
  blood_type TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gas Inventory
CREATE TABLE IF NOT EXISTS public.peotram_gas_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  gas_type TEXT NOT NULL,
  quantity_m3 DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_quantity_m3 DECIMAL(12,2) DEFAULT 0,
  max_capacity_m3 DECIMAL(12,2),
  unit_cost_usd DECIMAL(10,2),
  last_refill_date DATE,
  next_refill_date DATE,
  supplier TEXT,
  status TEXT DEFAULT 'normal',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MLC 2006 TABLES
-- =============================================

-- Work/Rest Records (Reg. 2.3)
CREATE TABLE IF NOT EXISTS public.mlc_work_rest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  record_date DATE NOT NULL,
  work_hours DECIMAL(5,2) DEFAULT 0,
  rest_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  night_hours DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  has_violation BOOLEAN DEFAULT false,
  violation_type TEXT,
  recorded_by UUID,
  signed_by_seafarer BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crew_member_id, record_date)
);

-- DCM (Declaration of Maritime Labour Compliance)
CREATE TABLE IF NOT EXISTS public.mlc_dcm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  part TEXT NOT NULL DEFAULT 'II',
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issued_by TEXT,
  flag_state TEXT,
  document_url TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MLC Complaints (Reg. 5.1.5)
CREATE TABLE IF NOT EXISTS public.mlc_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  submitted_by UUID REFERENCES public.crew_members(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  escalation_level INTEGER DEFAULT 1,
  assigned_to UUID,
  response TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MLC Compliance Scores (cached)
CREATE TABLE IF NOT EXISTS public.mlc_compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  overall_score INTEGER DEFAULT 0,
  title1_score INTEGER DEFAULT 0,
  title2_score INTEGER DEFAULT 0,
  title3_score INTEGER DEFAULT 0,
  title4_score INTEGER DEFAULT 0,
  title5_score INTEGER DEFAULT 0,
  critical_ncs JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  calculated_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.peodp_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peodp_equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peodp_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peodp_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_checklist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_sat_chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_divers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_gas_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_work_rest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_dcm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_compliance_scores ENABLE ROW LEVEL SECURITY;

-- PEO-DP Policies (vessel-based access)
CREATE POLICY "peodp_equipment_vessel_access" ON public.peodp_equipment FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "peodp_maintenance_access" ON public.peodp_equipment_maintenance FOR ALL
  USING (equipment_id IN (SELECT id FROM public.peodp_equipment WHERE public.has_vessel_access(auth.uid(), vessel_id)));

CREATE POLICY "peodp_audit_trail_read" ON public.peodp_audit_trail FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "peodp_audit_trail_insert" ON public.peodp_audit_trail FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "peodp_incidents_vessel_access" ON public.peodp_incidents FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

-- PEOTRAM Policies
CREATE POLICY "peotram_checklist_items_read" ON public.peotram_checklist_items FOR SELECT
  USING (true);

CREATE POLICY "peotram_checklist_items_manage" ON public.peotram_checklist_items FOR ALL
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "peotram_responses_vessel_access" ON public.peotram_checklist_responses FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "peotram_sat_vessel_access" ON public.peotram_sat_chambers FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "peotram_divers_vessel_access" ON public.peotram_divers FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "peotram_gas_vessel_access" ON public.peotram_gas_inventory FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

-- MLC Policies
CREATE POLICY "mlc_work_rest_vessel_access" ON public.mlc_work_rest_records FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "mlc_dcm_vessel_access" ON public.mlc_dcm FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "mlc_complaints_vessel_access" ON public.mlc_complaints FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

CREATE POLICY "mlc_scores_vessel_access" ON public.mlc_compliance_scores FOR ALL
  USING (public.has_vessel_access(auth.uid(), vessel_id));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_peodp_equipment_vessel ON public.peodp_equipment(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peodp_equipment_system ON public.peodp_equipment(system_type);
CREATE INDEX IF NOT EXISTS idx_peodp_equipment_status ON public.peodp_equipment(status);
CREATE INDEX IF NOT EXISTS idx_peodp_incidents_vessel ON public.peodp_incidents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peodp_incidents_status ON public.peodp_incidents(status);
CREATE INDEX IF NOT EXISTS idx_peotram_checklist_section ON public.peotram_checklist_items(section);
CREATE INDEX IF NOT EXISTS idx_peotram_responses_item ON public.peotram_checklist_responses(item_id);
CREATE INDEX IF NOT EXISTS idx_peotram_sat_vessel ON public.peotram_sat_chambers(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peotram_divers_vessel ON public.peotram_divers(vessel_id);
CREATE INDEX IF NOT EXISTS idx_peotram_gas_vessel ON public.peotram_gas_inventory(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mlc_work_rest_crew_date ON public.mlc_work_rest_records(crew_member_id, record_date);
CREATE INDEX IF NOT EXISTS idx_mlc_work_rest_vessel ON public.mlc_work_rest_records(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mlc_dcm_vessel ON public.mlc_dcm(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mlc_dcm_expiry ON public.mlc_dcm(expiry_date);
CREATE INDEX IF NOT EXISTS idx_mlc_complaints_vessel ON public.mlc_complaints(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mlc_complaints_status ON public.mlc_complaints(status);
CREATE INDEX IF NOT EXISTS idx_mlc_scores_vessel ON public.mlc_compliance_scores(vessel_id);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_peodp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_peodp_incidents_updated_at
  BEFORE UPDATE ON public.peodp_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_peodp_updated_at();

CREATE TRIGGER update_peotram_sat_updated_at
  BEFORE UPDATE ON public.peotram_sat_chambers
  FOR EACH ROW EXECUTE FUNCTION public.update_peodp_updated_at();

CREATE TRIGGER update_peotram_divers_updated_at
  BEFORE UPDATE ON public.peotram_divers
  FOR EACH ROW EXECUTE FUNCTION public.update_peodp_updated_at();

CREATE TRIGGER update_peotram_gas_updated_at
  BEFORE UPDATE ON public.peotram_gas_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_peodp_updated_at();

CREATE TRIGGER update_mlc_dcm_updated_at
  BEFORE UPDATE ON public.mlc_dcm
  FOR EACH ROW EXECUTE FUNCTION public.update_peodp_updated_at();

CREATE TRIGGER update_mlc_complaints_updated_at
  BEFORE UPDATE ON public.mlc_complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_peodp_updated_at();
