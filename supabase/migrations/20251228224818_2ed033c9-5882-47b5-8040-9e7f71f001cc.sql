-- MIGRATION: Create missing tables - Part 1 (Core Performance & Maintenance)

-- 1. MAINTENANCE_TASKS
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'preventive',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  scheduled_date DATE,
  due_date DATE,
  completed_date TIMESTAMPTZ,
  assigned_to UUID,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2),
  component_id TEXT,
  component_name TEXT,
  parts_required JSONB DEFAULT '[]'::jsonb,
  labor_cost NUMERIC(12,2),
  parts_cost NUMERIC(12,2),
  total_cost NUMERIC(12,2),
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. VESSEL_PERFORMANCE
CREATE TABLE IF NOT EXISTS public.vessel_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  vessel_name TEXT,
  evaluation_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  evaluation_period_end DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_performance_rating NUMERIC(4,2),
  fuel_efficiency_score NUMERIC(4,2),
  maintenance_compliance_score NUMERIC(4,2),
  safety_score NUMERIC(4,2),
  crew_performance_avg NUMERIC(4,2),
  operational_uptime_percent NUMERIC(5,2),
  incidents_count INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. CREW_PERFORMANCE
CREATE TABLE IF NOT EXISTS public.crew_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  crew_member_name TEXT,
  vessel_id UUID REFERENCES public.vessels(id),
  evaluation_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  evaluation_period_end DATE NOT NULL DEFAULT CURRENT_DATE,
  evaluator_id UUID,
  evaluator_name TEXT,
  overall_performance_rating NUMERIC(4,2),
  technical_skills_score NUMERIC(4,2),
  safety_compliance_score NUMERIC(4,2),
  teamwork_score NUMERIC(4,2),
  notes TEXT,
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. PERFORMANCE_OUTLIERS
CREATE TABLE IF NOT EXISTS public.performance_outliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(12,4),
  expected_value NUMERIC(12,4),
  deviation_percent NUMERIC(8,2),
  severity TEXT DEFAULT 'medium',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_outliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "auth_access" ON public.maintenance_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.vessel_performance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.crew_performance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.performance_outliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mt_org ON public.maintenance_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_mt_vessel ON public.maintenance_tasks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vp_vessel ON public.vessel_performance(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cp_crew ON public.crew_performance(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_po_org ON public.performance_outliers(organization_id);