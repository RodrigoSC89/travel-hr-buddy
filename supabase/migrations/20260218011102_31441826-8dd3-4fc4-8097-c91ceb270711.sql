
-- =============================================
-- Sprint 9-10: IMPA Spare Parts Catalog + SIRE 2.0 Vetting
-- =============================================

-- 1) IMPA-coded Spare Parts Master Catalog
CREATE TABLE public.impa_spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impa_code VARCHAR(10) NOT NULL,
  issa_code VARCHAR(10),
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
  standard_unit_cost NUMERIC(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  weight_kg NUMERIC(8,2),
  dimensions TEXT,
  manufacturer VARCHAR(200),
  part_number VARCHAR(100),
  equipment_type VARCHAR(100),
  criticality VARCHAR(20) DEFAULT 'normal' CHECK (criticality IN ('critical','high','normal','low')),
  lead_time_days INTEGER DEFAULT 14,
  min_stock INTEGER DEFAULT 1,
  max_stock INTEGER DEFAULT 10,
  reorder_point INTEGER DEFAULT 2,
  is_hazardous BOOLEAN DEFAULT false,
  hazmat_class VARCHAR(20),
  shelf_life_months INTEGER,
  notes TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for IMPA code lookup
CREATE INDEX idx_impa_spare_parts_impa_code ON public.impa_spare_parts(impa_code);
CREATE INDEX idx_impa_spare_parts_category ON public.impa_spare_parts(category);
CREATE INDEX idx_impa_spare_parts_vessel ON public.impa_spare_parts(vessel_id);
CREATE INDEX idx_impa_spare_parts_org ON public.impa_spare_parts(organization_id);

ALTER TABLE public.impa_spare_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view spare parts" ON public.impa_spare_parts FOR SELECT USING (true);
CREATE POLICY "Auth users can insert spare parts" ON public.impa_spare_parts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update spare parts" ON public.impa_spare_parts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete spare parts" ON public.impa_spare_parts FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2) Spare Parts Stock Movements (receipts, issues, adjustments)
CREATE TABLE public.spare_parts_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spare_part_id UUID NOT NULL REFERENCES public.impa_spare_parts(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('receipt','issue','adjustment','transfer','return','scrap')),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(12,2),
  reference_number VARCHAR(100),
  reference_type VARCHAR(50), -- 'work_order', 'purchase_order', 'inventory_count'
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  vessel_id UUID REFERENCES public.vessels(id),
  performed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_spare_movements_part ON public.spare_parts_movements(spare_part_id);
ALTER TABLE public.spare_parts_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view movements" ON public.spare_parts_movements FOR SELECT USING (true);
CREATE POLICY "Auth users can insert movements" ON public.spare_parts_movements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3) SIRE 2.0 Inspection Records
CREATE TABLE public.sire2_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  inspection_number VARCHAR(50),
  inspection_type VARCHAR(30) NOT NULL DEFAULT 'SIRE' CHECK (inspection_type IN ('SIRE','CDI','OVID','EBIS','Rightship')),
  inspector_name VARCHAR(200),
  inspector_company VARCHAR(200),
  oil_major VARCHAR(100), -- Shell, BP, TotalEnergies, etc.
  port VARCHAR(100),
  country VARCHAR(100),
  inspection_date DATE NOT NULL,
  report_date DATE,
  status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','report_issued','closed')),
  overall_score NUMERIC(5,2),
  max_score NUMERIC(5,2) DEFAULT 100,
  risk_rating VARCHAR(20) DEFAULT 'standard' CHECK (risk_rating IN ('low','standard','elevated','high','unacceptable')),
  total_observations INTEGER DEFAULT 0,
  total_non_conformities INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  chapters_assessed JSONB DEFAULT '[]',
  summary TEXT,
  corrective_actions_due DATE,
  next_inspection_date DATE,
  report_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sire2_vessel ON public.sire2_inspections(vessel_id);
CREATE INDEX idx_sire2_org ON public.sire2_inspections(organization_id);
CREATE INDEX idx_sire2_date ON public.sire2_inspections(inspection_date DESC);

ALTER TABLE public.sire2_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sire2 inspections" ON public.sire2_inspections FOR SELECT USING (true);
CREATE POLICY "Auth users can insert sire2" ON public.sire2_inspections FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update sire2" ON public.sire2_inspections FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete sire2" ON public.sire2_inspections FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4) SIRE 2.0 Chapter Questions & Findings
CREATE TABLE public.sire2_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.sire2_inspections(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL, -- 1-13 SIRE 2.0 chapters
  chapter_name VARCHAR(200),
  question_ref VARCHAR(20), -- e.g. "3.2.1"
  question_text TEXT,
  finding_type VARCHAR(30) DEFAULT 'observation' CHECK (finding_type IN ('observation','non_conformity','positive','not_applicable','not_inspected')),
  severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN ('critical','major','minor','advisory')),
  description TEXT,
  evidence_provided TEXT,
  corrective_action TEXT,
  target_date DATE,
  completion_date DATE,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in_progress','closed','verified','overdue')),
  root_cause TEXT,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sire2_findings_inspection ON public.sire2_findings(inspection_id);
CREATE INDEX idx_sire2_findings_chapter ON public.sire2_findings(chapter_number);

ALTER TABLE public.sire2_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sire2 findings" ON public.sire2_findings FOR SELECT USING (true);
CREATE POLICY "Auth users can insert sire2 findings" ON public.sire2_findings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update sire2 findings" ON public.sire2_findings FOR UPDATE USING (auth.uid() IS NOT NULL);
