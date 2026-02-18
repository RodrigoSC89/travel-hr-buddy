
-- ============================================
-- ISM CODE: 16 Elements Structure + Evidence + CAPA Workflow
-- ============================================

-- ISM Elements (the 16 chapters)
CREATE TABLE IF NOT EXISTS public.ism_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  element_number INTEGER NOT NULL CHECK (element_number BETWEEN 1 AND 16),
  title TEXT NOT NULL,
  description TEXT,
  imo_reference TEXT, -- e.g. 'ISM Code Section 1'
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(element_number, organization_id)
);

-- ISM Requirements (sub-items per element)
CREATE TABLE IF NOT EXISTS public.ism_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id UUID NOT NULL REFERENCES public.ism_elements(id) ON DELETE CASCADE,
  requirement_code VARCHAR(20) NOT NULL, -- e.g. '1.2.1'
  title TEXT NOT NULL,
  description TEXT,
  evidence_type TEXT, -- 'document', 'record', 'procedure', 'drill', 'interview'
  is_mandatory BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ISM Evidence (actual proof linked to requirements)
CREATE TABLE IF NOT EXISTS public.ism_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID NOT NULL REFERENCES public.ism_requirements(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  evidence_type VARCHAR(30) NOT NULL, -- 'document', 'photo', 'record', 'certificate', 'drill_log'
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  document_id UUID, -- link to ai_documents
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'valid', 'expired', 'rejected'
  valid_from DATE,
  valid_until DATE,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ISM Gap Analysis (per vessel per element)
CREATE TABLE IF NOT EXISTS public.ism_gap_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  element_id UUID NOT NULL REFERENCES public.ism_elements(id) ON DELETE CASCADE,
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
  total_requirements INTEGER DEFAULT 0,
  met_requirements INTEGER DEFAULT 0,
  gap_details JSONB DEFAULT '[]'::jsonb,
  last_assessed_at TIMESTAMPTZ,
  assessed_by TEXT,
  next_review_date DATE,
  status VARCHAR(20) DEFAULT 'not_assessed', -- 'not_assessed', 'partial', 'compliant', 'non_compliant'
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ISM CAPA (Corrective & Preventive Actions from audit findings)
CREATE TABLE IF NOT EXISTS public.ism_capa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id UUID REFERENCES public.ism_elements(id),
  requirement_id UUID REFERENCES public.ism_requirements(id),
  vessel_id UUID REFERENCES public.vessels(id),
  finding_type VARCHAR(30) NOT NULL, -- 'major_nc', 'minor_nc', 'observation', 'improvement'
  title TEXT NOT NULL,
  description TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  assigned_to TEXT,
  due_date DATE,
  completion_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'implemented', 'verified', 'closed'
  priority VARCHAR(20) DEFAULT 'medium',
  evidence_of_closure TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  source VARCHAR(30), -- 'internal_audit', 'external_audit', 'psc', 'flag_state', 'class'
  source_reference TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ism_elements_org ON public.ism_elements(organization_id);
CREATE INDEX idx_ism_requirements_element ON public.ism_requirements(element_id);
CREATE INDEX idx_ism_evidence_req ON public.ism_evidence(requirement_id);
CREATE INDEX idx_ism_evidence_vessel ON public.ism_evidence(vessel_id);
CREATE INDEX idx_ism_gap_vessel ON public.ism_gap_analysis(vessel_id);
CREATE INDEX idx_ism_gap_element ON public.ism_gap_analysis(element_id);
CREATE INDEX idx_ism_capa_status ON public.ism_capa(status);
CREATE INDEX idx_ism_capa_vessel ON public.ism_capa(vessel_id);

-- RLS
ALTER TABLE public.ism_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ism_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ism_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ism_gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ism_capa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated manage ism_elements" ON public.ism_elements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage ism_requirements" ON public.ism_requirements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage ism_evidence" ON public.ism_evidence FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage ism_gap_analysis" ON public.ism_gap_analysis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated manage ism_capa" ON public.ism_capa FOR ALL USING (true) WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_ism_elements_updated_at BEFORE UPDATE ON public.ism_elements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ism_evidence_updated_at BEFORE UPDATE ON public.ism_evidence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ism_gap_updated_at BEFORE UPDATE ON public.ism_gap_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ism_capa_updated_at BEFORE UPDATE ON public.ism_capa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed ISM 16 Elements (universal, org-agnostic)
INSERT INTO public.ism_elements (element_number, title, description, imo_reference) VALUES
(1, 'General', 'Defines objectives of the ISM Code, application and functional requirements for a Safety Management System (SMS)', 'ISM Code 1.0'),
(2, 'Safety and Environmental Protection Policy', 'Company policy for safety and environment including instructions and procedures to ensure safe operation and environmental protection', 'ISM Code 2.0'),
(3, 'Company Responsibilities and Authority', 'Define and document responsibility, authority and interrelation of all personnel', 'ISM Code 3.0'),
(4, 'Designated Person(s)', 'Designate a person ashore with direct access to highest level of management for SMS monitoring', 'ISM Code 4.0'),
(5, 'Master''s Responsibility and Authority', 'Define master''s responsibility for implementing safety and environmental policies, motivating crew, issuing orders', 'ISM Code 5.0'),
(6, 'Resources and Personnel', 'Ensure adequate resources including qualified, certified and medically fit personnel', 'ISM Code 6.0'),
(7, 'Shipboard Operations', 'Establish procedures, plans and instructions for key shipboard operations concerning safety and pollution prevention', 'ISM Code 7.0'),
(8, 'Emergency Preparedness', 'Identify potential emergency situations and establish procedures to respond to them', 'ISM Code 8.0'),
(9, 'Reports and Analysis of Non-Conformities, Accidents and Hazardous Occurrences', 'Procedures ensuring NCs, accidents and hazardous situations are reported, investigated and analyzed', 'ISM Code 9.0'),
(10, 'Maintenance of the Ship and Equipment', 'Establish procedures to ensure ship and equipment are maintained in conformity with regulations and company standards', 'ISM Code 10.0'),
(11, 'Documentation', 'Establish procedures to control all documents and data relevant to the SMS', 'ISM Code 11.0'),
(12, 'Company Verification, Review and Evaluation', 'Conduct internal safety audits and management reviews at specified intervals', 'ISM Code 12.0'),
(13, 'Certification and Periodical Verification', 'Ship should be operated by a company holding a DOC and vessel should carry a valid SMC', 'ISM Code 13.0'),
(14, 'Interim Certification', 'Interim DOC and interim SMC procedures for new companies or new ships', 'ISM Code 14.0'),
(15, 'Verification', 'All verifications required by the Code shall be carried out by the Administration or recognized organization', 'ISM Code 15.0'),
(16, 'Forms of Certificates', 'DOC, SMC and interim certificates shall conform to models in the appendix', 'ISM Code 16.0')
ON CONFLICT DO NOTHING;
