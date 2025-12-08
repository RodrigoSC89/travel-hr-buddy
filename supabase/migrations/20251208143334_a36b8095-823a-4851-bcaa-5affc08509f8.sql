
-- =============================================
-- FASE 1: GAPS CRÍTICOS
-- =============================================

-- Drydock Events
CREATE TABLE public.drydock_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('scheduled', 'emergency', 'intermediate', 'special')),
  shipyard_name TEXT NOT NULL,
  shipyard_location TEXT,
  planned_start_date DATE NOT NULL,
  planned_end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'delayed')),
  work_scope JSONB DEFAULT '[]',
  class_requirements JSONB DEFAULT '[]',
  documents TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hull Inspections
CREATE TABLE public.hull_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('underwater', 'drydock', 'afloat', 'thickness_measurement', 'coating')),
  inspection_date DATE NOT NULL,
  inspector_name TEXT,
  inspector_company TEXT,
  hull_condition_score INTEGER CHECK (hull_condition_score BETWEEN 1 AND 10),
  fouling_level TEXT CHECK (fouling_level IN ('none', 'light', 'moderate', 'heavy', 'severe')),
  coating_condition TEXT CHECK (coating_condition IN ('excellent', 'good', 'fair', 'poor', 'failed')),
  anodes_condition TEXT CHECK (anodes_condition IN ('excellent', 'good', 'fair', 'poor', 'depleted')),
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  photos TEXT[] DEFAULT '{}',
  next_inspection_due DATE,
  report_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classification Societies
CREATE TABLE public.classification_societies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  logo_url TEXT,
  is_iacs_member BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert major classification societies
INSERT INTO public.classification_societies (code, name, country, is_iacs_member) VALUES
('DNV', 'DNV GL', 'Norway', true),
('LR', 'Lloyd''s Register', 'United Kingdom', true),
('BV', 'Bureau Veritas', 'France', true),
('ABS', 'American Bureau of Shipping', 'United States', true),
('ClassNK', 'Nippon Kaiji Kyokai', 'Japan', true),
('RINA', 'RINA Services', 'Italy', true),
('KR', 'Korean Register', 'South Korea', true),
('CCS', 'China Classification Society', 'China', true),
('IRS', 'Indian Register of Shipping', 'India', true),
('RS', 'Russian Maritime Register', 'Russia', true);

-- Class Surveys
CREATE TABLE public.class_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  classification_society_id UUID REFERENCES public.classification_societies(id),
  survey_type TEXT NOT NULL CHECK (survey_type IN ('annual', 'intermediate', 'special', 'bottom', 'tailshaft', 'boiler', 'docking', 'class_renewal', 'condition_of_class')),
  survey_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  window_start DATE,
  window_end DATE,
  completed_date DATE,
  surveyor_name TEXT,
  survey_location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'due_soon', 'overdue', 'in_progress', 'completed', 'postponed')),
  findings JSONB DEFAULT '[]',
  conditions_of_class JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  certificates_issued TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STCW Competencies
CREATE TABLE public.stcw_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stcw_table TEXT NOT NULL,
  stcw_chapter TEXT,
  function_area TEXT CHECK (function_area IN ('navigation', 'cargo_handling', 'marine_engineering', 'electrical', 'maintenance', 'radio_communications', 'safety')),
  level TEXT CHECK (level IN ('support', 'operational', 'management')),
  applicable_ranks TEXT[] DEFAULT '{}',
  training_required BOOLEAN DEFAULT false,
  sea_service_months INTEGER,
  assessment_criteria JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert common STCW competencies
INSERT INTO public.stcw_competencies (code, name, stcw_table, function_area, level, applicable_ranks) VALUES
('NAV-01', 'Plan and conduct a passage and determine position', 'A-II/1', 'navigation', 'operational', ARRAY['officer', 'chief_officer', 'master']),
('NAV-02', 'Maintain a safe navigational watch', 'A-II/1', 'navigation', 'operational', ARRAY['officer', 'chief_officer', 'master']),
('NAV-03', 'Use of radar and ARPA to maintain safety of navigation', 'A-II/1', 'navigation', 'operational', ARRAY['officer', 'chief_officer', 'master']),
('NAV-04', 'Use of ECDIS to maintain safety of navigation', 'A-II/1', 'navigation', 'operational', ARRAY['officer', 'chief_officer', 'master']),
('ENG-01', 'Maintain a safe engineering watch', 'A-III/1', 'marine_engineering', 'operational', ARRAY['engineer', 'second_engineer', 'chief_engineer']),
('ENG-02', 'Operate main and auxiliary machinery', 'A-III/1', 'marine_engineering', 'operational', ARRAY['engineer', 'second_engineer', 'chief_engineer']),
('ENG-03', 'Operate fuel, lubrication and cooling systems', 'A-III/1', 'marine_engineering', 'operational', ARRAY['engineer', 'second_engineer', 'chief_engineer']),
('SAFE-01', 'Personal survival techniques', 'A-VI/1', 'safety', 'support', ARRAY['all']),
('SAFE-02', 'Fire prevention and fire fighting', 'A-VI/1', 'safety', 'support', ARRAY['all']),
('SAFE-03', 'Elementary first aid', 'A-VI/1', 'safety', 'support', ARRAY['all']),
('SAFE-04', 'Personal safety and social responsibilities', 'A-VI/1', 'safety', 'support', ARRAY['all']);

-- Crew Competency Assessments
CREATE TABLE public.crew_competency_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  crew_member_id UUID REFERENCES public.crew_members(id),
  competency_id UUID REFERENCES public.stcw_competencies(id),
  assessment_date DATE NOT NULL,
  assessor_id UUID,
  assessor_name TEXT,
  status TEXT DEFAULT 'not_assessed' CHECK (status IN ('not_assessed', 'in_training', 'competent', 'not_yet_competent', 'expired')),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  evidence_type TEXT CHECK (evidence_type IN ('training_record', 'sea_service', 'assessment', 'certificate', 'simulation')),
  evidence_reference TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FASE 2: DIFERENCIAÇÃO
-- =============================================

-- CBT Courses
CREATE TABLE public.cbt_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('stcw_mandatory', 'stcw_specialized', 'company_specific', 'safety', 'technical', 'soft_skills', 'compliance')),
  stcw_reference TEXT,
  duration_minutes INTEGER,
  passing_score INTEGER DEFAULT 80,
  is_mandatory BOOLEAN DEFAULT false,
  applicable_ranks TEXT[] DEFAULT '{}',
  content_type TEXT CHECK (content_type IN ('video', 'scorm', 'interactive', 'document', 'quiz')),
  content_url TEXT,
  thumbnail_url TEXT,
  language TEXT DEFAULT 'en',
  version TEXT DEFAULT '1.0',
  validity_months INTEGER,
  prerequisites UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CBT Progress
CREATE TABLE public.cbt_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  crew_member_id UUID REFERENCES public.crew_members(id),
  course_id UUID REFERENCES public.cbt_courses(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'expired')),
  certificate_issued BOOLEAN DEFAULT false,
  certificate_number TEXT,
  expiry_date DATE,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crew_member_id, course_id)
);

-- Crew Payroll
CREATE TABLE public.crew_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  crew_member_id UUID REFERENCES public.crew_members(id),
  vessel_id UUID REFERENCES public.vessels(id),
  payroll_period_start DATE NOT NULL,
  payroll_period_end DATE NOT NULL,
  base_salary DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  days_onboard INTEGER,
  overtime_hours DECIMAL(6,2) DEFAULT 0,
  overtime_rate DECIMAL(8,2),
  overtime_amount DECIMAL(12,2) DEFAULT 0,
  bonuses JSONB DEFAULT '[]',
  deductions JSONB DEFAULT '[]',
  allowances JSONB DEFAULT '[]',
  gross_pay DECIMAL(12,2),
  net_pay DECIMAL(12,2),
  tax_amount DECIMAL(12,2) DEFAULT 0,
  pension_contribution DECIMAL(12,2) DEFAULT 0,
  union_dues DECIMAL(12,2) DEFAULT 0,
  allotments JSONB DEFAULT '[]',
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'cash', 'check', 'allotment')),
  payment_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processed', 'paid', 'cancelled')),
  bank_reference TEXT,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MLC Rest Hours
CREATE TABLE public.mlc_rest_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  crew_member_id UUID REFERENCES public.crew_members(id),
  vessel_id UUID REFERENCES public.vessels(id),
  record_date DATE NOT NULL,
  rest_periods JSONB NOT NULL DEFAULT '[]',
  total_rest_hours DECIMAL(4,2),
  total_work_hours DECIMAL(4,2),
  compliant BOOLEAN DEFAULT true,
  violation_type TEXT,
  violation_details TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crew_member_id, record_date)
);

-- =============================================
-- FASE 3: INOVAÇÃO AVANÇADA
-- =============================================

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  company_name TEXT NOT NULL,
  trading_name TEXT,
  category TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  ports_served TEXT[] DEFAULT '{}',
  countries TEXT[] DEFAULT '{}',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  rating DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5),
  total_orders INTEGER DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  payment_terms TEXT,
  lead_time_days INTEGER,
  certifications TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RFQ (Request for Quotation)
CREATE TABLE public.rfq_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  rfq_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  delivery_port TEXT,
  delivery_date DATE,
  items JSONB NOT NULL DEFAULT '[]',
  invited_suppliers UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'quoted', 'awarded', 'cancelled', 'expired')),
  deadline TIMESTAMPTZ,
  budget_estimate DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  awarded_supplier_id UUID REFERENCES public.suppliers(id),
  awarded_amount DECIMAL(15,2),
  awarded_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RFQ Quotations
CREATE TABLE public.rfq_quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID REFERENCES public.rfq_requests(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  quoted_items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  validity_date DATE,
  delivery_date DATE,
  payment_terms TEXT,
  notes TEXT,
  attachments TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'under_review', 'accepted', 'rejected')),
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ECDIS Data
CREATE TABLE public.ecdis_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vessel_id UUID REFERENCES public.vessels(id),
  ecdis_manufacturer TEXT,
  ecdis_model TEXT,
  software_version TEXT,
  enc_permit_status TEXT CHECK (enc_permit_status IN ('valid', 'expiring', 'expired')),
  enc_cells_installed INTEGER,
  last_update_date DATE,
  next_update_due DATE,
  routes JSONB DEFAULT '[]',
  chart_folios TEXT[] DEFAULT '{}',
  backup_arrangements TEXT,
  type_approval_number TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.drydock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hull_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stcw_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlc_rest_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecdis_data ENABLE ROW LEVEL SECURITY;

-- Policies for organization-based access
CREATE POLICY "org_access_drydock" ON public.drydock_events FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_hull" ON public.hull_inspections FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_surveys" ON public.class_surveys FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "public_read_competencies" ON public.stcw_competencies FOR SELECT USING (true);
CREATE POLICY "org_access_assessments" ON public.crew_competency_assessments FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_cbt_courses" ON public.cbt_courses FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_cbt_progress" ON public.cbt_progress FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_payroll" ON public.crew_payroll FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_mlc" ON public.mlc_rest_hours FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_suppliers" ON public.suppliers FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_rfq" ON public.rfq_requests FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "org_access_quotations" ON public.rfq_quotations FOR ALL USING (rfq_id IN (SELECT id FROM public.rfq_requests WHERE organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')));
CREATE POLICY "org_access_ecdis" ON public.ecdis_data FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active'));

-- Indexes for performance
CREATE INDEX idx_drydock_vessel ON public.drydock_events(vessel_id);
CREATE INDEX idx_drydock_status ON public.drydock_events(status);
CREATE INDEX idx_hull_vessel ON public.hull_inspections(vessel_id);
CREATE INDEX idx_surveys_vessel ON public.class_surveys(vessel_id);
CREATE INDEX idx_surveys_due ON public.class_surveys(due_date);
CREATE INDEX idx_assessments_crew ON public.crew_competency_assessments(crew_member_id);
CREATE INDEX idx_cbt_progress_crew ON public.cbt_progress(crew_member_id);
CREATE INDEX idx_payroll_crew ON public.crew_payroll(crew_member_id);
CREATE INDEX idx_payroll_period ON public.crew_payroll(payroll_period_start, payroll_period_end);
CREATE INDEX idx_mlc_crew_date ON public.mlc_rest_hours(crew_member_id, record_date);
CREATE INDEX idx_rfq_status ON public.rfq_requests(status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_competitive_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_drydock_updated_at BEFORE UPDATE ON public.drydock_events FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_hull_updated_at BEFORE UPDATE ON public.hull_inspections FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.class_surveys FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.crew_competency_assessments FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_cbt_courses_updated_at BEFORE UPDATE ON public.cbt_courses FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_cbt_progress_updated_at BEFORE UPDATE ON public.cbt_progress FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.crew_payroll FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_rfq_updated_at BEFORE UPDATE ON public.rfq_requests FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
CREATE TRIGGER update_ecdis_updated_at BEFORE UPDATE ON public.ecdis_data FOR EACH ROW EXECUTE FUNCTION update_competitive_tables_updated_at();
