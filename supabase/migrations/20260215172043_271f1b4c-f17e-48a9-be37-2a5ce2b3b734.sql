
-- =============================================
-- PEO-DP Digital Logbook
-- =============================================
CREATE TABLE public.peodp_logbook_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID DEFAULT auth.uid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL CHECK (event_type IN ('operation','incident','handover','drill','maintenance','environmental')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  dpo_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position_lat TEXT,
  position_lng TEXT,
  heading NUMERIC,
  wind_speed NUMERIC,
  wave_height NUMERIC,
  dp_mode TEXT,
  thrusters_active INTEGER,
  excursion NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peodp_logbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logbook entries" ON public.peodp_logbook_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create logbook entries" ON public.peodp_logbook_entries
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own logbook entries" ON public.peodp_logbook_entries
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own logbook entries" ON public.peodp_logbook_entries
  FOR DELETE USING (auth.uid() = created_by);

CREATE INDEX idx_peodp_logbook_vessel ON public.peodp_logbook_entries(vessel_id);
CREATE INDEX idx_peodp_logbook_type ON public.peodp_logbook_entries(event_type);
CREATE INDEX idx_peodp_logbook_timestamp ON public.peodp_logbook_entries(timestamp DESC);

-- =============================================
-- Computer Vision Inspections
-- =============================================
CREATE TABLE public.peodp_cv_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID DEFAULT auth.uid(),
  image_name TEXT NOT NULL,
  equipment TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'analyzing' CHECK (status IN ('analyzing','passed','warning','failed')),
  confidence NUMERIC DEFAULT 0,
  storage_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peodp_cv_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view CV inspections" ON public.peodp_cv_inspections
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create CV inspections" ON public.peodp_cv_inspections
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own CV inspections" ON public.peodp_cv_inspections
  FOR UPDATE USING (auth.uid() = created_by);

CREATE INDEX idx_peodp_cv_inspections_vessel ON public.peodp_cv_inspections(vessel_id);
CREATE INDEX idx_peodp_cv_inspections_status ON public.peodp_cv_inspections(status);

-- =============================================
-- Computer Vision Findings
-- =============================================
CREATE TABLE public.peodp_cv_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.peodp_cv_inspections(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('corrosion','damage','wear','leak','misalignment','ok')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  description TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0,
  recommendation TEXT,
  location_x NUMERIC DEFAULT 0,
  location_y NUMERIC DEFAULT 0,
  location_width NUMERIC DEFAULT 0,
  location_height NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peodp_cv_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view CV findings" ON public.peodp_cv_findings
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create CV findings" ON public.peodp_cv_findings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_peodp_cv_findings_inspection ON public.peodp_cv_findings(inspection_id);
CREATE INDEX idx_peodp_cv_findings_severity ON public.peodp_cv_findings(severity);
