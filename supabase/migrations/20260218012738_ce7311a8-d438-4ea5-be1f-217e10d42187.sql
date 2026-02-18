
-- Sprint 19-20: CAP Assessment & System Integration Tables

-- 1. CAP (Condition Assessment Programme) Assessments
CREATE TABLE IF NOT EXISTS public.cap_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  survey_type TEXT NOT NULL DEFAULT 'CAP', -- CAP, CAS, ESP
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  surveyor_name TEXT,
  classification_society TEXT, -- DNV, LR, BV, ABS, ClassNK
  overall_rating TEXT, -- 1(Good), 2(Satisfactory), 3(Poor)
  overall_score NUMERIC(4,2),
  hull_condition JSONB DEFAULT '{}', -- coating_condition, wastage, pitting, structural_integrity
  machinery_condition JSONB DEFAULT '{}', -- main_engine, aux_engines, boilers, pumps
  cargo_systems JSONB DEFAULT '{}', -- tanks, piping, pumps, IG_system
  accommodation JSONB DEFAULT '{}', -- living_quarters, galley, safety_equipment
  navigation_equipment JSONB DEFAULT '{}', -- radar, ECDIS, AIS, communications
  findings JSONB DEFAULT '[]', -- array of {area, description, severity, corrective_action, due_date}
  photos JSONB DEFAULT '[]', -- array of {url, area, description, timestamp}
  recommendations TEXT,
  next_survey_due DATE,
  report_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, in_progress, completed, approved
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cap_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view CAP assessments" ON public.cap_assessments
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert CAP assessments" ON public.cap_assessments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update CAP assessments" ON public.cap_assessments
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete CAP assessments" ON public.cap_assessments
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. System Integration Log (cross-module event tracking)
CREATE TABLE IF NOT EXISTS public.system_integration_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  source_module TEXT NOT NULL, -- e.g. 'maintenance', 'compliance', 'crew'
  target_module TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'data_sync', 'alert_trigger', 'workflow_step', 'api_call'
  event_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_integration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view integration events" ON public.system_integration_events
  FOR SELECT USING (true);
CREATE POLICY "System can insert integration events" ON public.system_integration_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cap_vessel ON public.cap_assessments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cap_status ON public.cap_assessments(status);
CREATE INDEX IF NOT EXISTS idx_integration_source ON public.system_integration_events(source_module);
CREATE INDEX IF NOT EXISTS idx_integration_created ON public.system_integration_events(created_at DESC);
