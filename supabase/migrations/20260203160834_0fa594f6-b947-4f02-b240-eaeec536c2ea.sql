-- ============================================
-- Migration: Add missing tables for @ts-nocheck removal
-- Tables needed by 8+ files with schema dependencies
-- ============================================

-- 1. DP Incidents table (for use-safety-incident-data.ts)
CREATE TABLE IF NOT EXISTS public.dp_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  incident_type TEXT DEFAULT 'near_miss',
  severity TEXT DEFAULT 'low',
  description TEXT,
  status TEXT DEFAULT 'reported',
  location TEXT,
  reported_by UUID,
  root_cause TEXT,
  corrective_actions JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Emissions Records (for use-environmental-data.ts)
CREATE TABLE IF NOT EXISTS public.emissions_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  co2_tonnes NUMERIC(12,2) DEFAULT 0,
  nox_kg NUMERIC(10,2) DEFAULT 0,
  sox_kg NUMERIC(10,2) DEFAULT 0,
  pm_kg NUMERIC(10,2) DEFAULT 0,
  fuel_consumed_mt NUMERIC(12,2) DEFAULT 0,
  fuel_type TEXT DEFAULT 'HFO',
  voyage_id UUID,
  distance_nm NUMERIC(10,2) DEFAULT 0,
  cargo_carried_mt NUMERIC(12,2) DEFAULT 0,
  carbon_intensity NUMERIC(8,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CII Ratings (for use-environmental-data.ts)
CREATE TABLE IF NOT EXISTS public.cii_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  annual_co2_tonnes NUMERIC(12,2) DEFAULT 0,
  annual_distance_nm NUMERIC(12,2) DEFAULT 0,
  annual_cargo_mt NUMERIC(12,2) DEFAULT 0,
  attained_cii NUMERIC(8,4) DEFAULT 0,
  required_cii NUMERIC(8,4) DEFAULT 0,
  rating CHAR(1) DEFAULT 'C' CHECK (rating IN ('A', 'B', 'C', 'D', 'E')),
  improvement_plan JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Waste Records (for use-environmental-data.ts)
CREATE TABLE IF NOT EXISTS public.waste_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  waste_type TEXT NOT NULL DEFAULT 'garbage' CHECK (waste_type IN ('garbage', 'oily', 'sewage', 'ballast_water')),
  quantity NUMERIC(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'm3',
  disposal_method TEXT DEFAULT 'port_reception' CHECK (disposal_method IN ('port_reception', 'incineration', 'treatment', 'discharge')),
  disposal_date TIMESTAMPTZ DEFAULT now(),
  port_code TEXT,
  marpol_annex TEXT,
  certificate_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Ballast Water Records (for use-environmental-data.ts)
CREATE TABLE IF NOT EXISTS public.ballast_water_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL DEFAULT 'uptake' CHECK (operation_type IN ('uptake', 'discharge', 'exchange')),
  volume_m3 NUMERIC(10,2) DEFAULT 0,
  location_lat NUMERIC(10,6),
  location_lng NUMERIC(10,6),
  water_depth_m NUMERIC(8,2),
  salinity_ppt NUMERIC(6,2),
  temperature_c NUMERIC(5,2),
  operation_date TIMESTAMPTZ DEFAULT now(),
  treatment_method TEXT DEFAULT 'UV',
  compliant BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Maritime Regulations (for use-compliance-regulatory-data.ts)
CREATE TABLE IF NOT EXISTS public.maritime_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  regulation_type TEXT DEFAULT 'SOLAS' CHECK (regulation_type IN ('SOLAS', 'MARPOL', 'MLC', 'ISM', 'ISPS', 'FLAG_STATE', 'PORT_STATE')),
  requirement_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('compliant', 'non_compliant', 'pending', 'expired')),
  due_date TIMESTAMPTZ,
  last_verified TIMESTAMPTZ,
  evidence_files TEXT[] DEFAULT '{}',
  ai_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PEOTRAM Audits (for use-compliance-regulatory-data.ts)
CREATE TABLE IF NOT EXISTS public.peotram_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  audit_type TEXT DEFAULT 'internal',
  auditor_name TEXT,
  audit_date TIMESTAMPTZ DEFAULT now(),
  findings JSONB DEFAULT '[]',
  overall_score NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  corrective_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PSC Inspections (for use-compliance-regulatory-data.ts)
CREATE TABLE IF NOT EXISTS public.psc_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  port_code TEXT NOT NULL,
  inspection_date TIMESTAMPTZ DEFAULT now(),
  inspector_name TEXT,
  deficiencies JSONB DEFAULT '[]',
  detention BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Non Conformities (for use-quality-management-data.ts)
CREATE TABLE IF NOT EXISTS public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  ncr_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'operations',
  source TEXT DEFAULT 'internal_audit' CHECK (source IN ('internal_audit', 'external_audit', 'inspection', 'observation', 'customer_complaint')),
  severity TEXT DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'corrective_action', 'verification', 'closed')),
  root_cause TEXT,
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  closed_date TIMESTAMPTZ,
  evidence_files TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Corrective Actions (for use-quality-management-data.ts)
CREATE TABLE IF NOT EXISTS public.corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ncr_id UUID REFERENCES public.non_conformities(id) ON DELETE CASCADE,
  action_type TEXT DEFAULT 'corrective' CHECK (action_type IN ('corrective', 'preventive')),
  description TEXT NOT NULL,
  responsible UUID,
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
  effectiveness_verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Internal Audits (for use-quality-management-data.ts)
CREATE TABLE IF NOT EXISTS public.internal_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  audit_number TEXT NOT NULL,
  department TEXT,
  audit_type TEXT DEFAULT 'compliance',
  auditor_name TEXT,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  checklist_id UUID,
  findings_count INTEGER DEFAULT 0,
  score NUMERIC(5,2),
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Improvement Suggestions (for use-quality-management-data.ts)
CREATE TABLE IF NOT EXISTS public.improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'operations',
  submitted_by UUID,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'implemented', 'rejected')),
  estimated_benefit TEXT,
  actual_benefit TEXT,
  implementation_cost NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Workflow AI Suggestions (for KanbanAISuggestions.tsx)
CREATE TABLE IF NOT EXISTS public.workflow_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  suggestion_type TEXT DEFAULT 'automation',
  title TEXT NOT NULL,
  description TEXT,
  confidence NUMERIC(5,4) DEFAULT 0.85,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'applied')),
  action_data JSONB DEFAULT '{}',
  applied_at TIMESTAMPTZ,
  applied_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Navigation History (for use-ai-navigation.ts)
CREATE TABLE IF NOT EXISTS public.navigation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_path TEXT NOT NULL,
  module_name TEXT,
  visit_count INTEGER DEFAULT 1,
  last_visited_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Module Access Log (for use-ai-navigation.ts)
CREATE TABLE IF NOT EXISTS public.module_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  action TEXT DEFAULT 'view',
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.dp_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emissions_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cii_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ballast_water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peotram_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_access_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view own org data" ON public.dp_incidents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert dp_incidents" ON public.dp_incidents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update dp_incidents" ON public.dp_incidents FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view emissions" ON public.emissions_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert emissions" ON public.emissions_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view cii_ratings" ON public.cii_ratings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert cii_ratings" ON public.cii_ratings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view waste_records" ON public.waste_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert waste_records" ON public.waste_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view ballast_water" ON public.ballast_water_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert ballast_water" ON public.ballast_water_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view regulations" ON public.maritime_regulations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage regulations" ON public.maritime_regulations FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view peotram_audits" ON public.peotram_audits FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage peotram_audits" ON public.peotram_audits FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view psc_inspections" ON public.psc_inspections FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage psc_inspections" ON public.psc_inspections FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view non_conformities" ON public.non_conformities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage non_conformities" ON public.non_conformities FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view corrective_actions" ON public.corrective_actions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage corrective_actions" ON public.corrective_actions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view internal_audits" ON public.internal_audits FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage internal_audits" ON public.internal_audits FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view improvement_suggestions" ON public.improvement_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage improvement_suggestions" ON public.improvement_suggestions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view workflow_ai_suggestions" ON public.workflow_ai_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage workflow_ai_suggestions" ON public.workflow_ai_suggestions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own navigation" ON public.navigation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own navigation" ON public.navigation_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own module_access" ON public.module_access_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own module_access" ON public.module_access_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';