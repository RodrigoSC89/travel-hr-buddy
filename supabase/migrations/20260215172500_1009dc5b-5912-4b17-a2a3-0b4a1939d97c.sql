
-- =============================================
-- DRYDOCK PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.drydock_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  vessel_name TEXT NOT NULL,
  yard_name TEXT NOT NULL,
  yard_location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','preparation','in_dock','completed','cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_planned INTEGER NOT NULL DEFAULT 30,
  days_elapsed INTEGER NOT NULL DEFAULT 0,
  budget_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  work_items JSONB DEFAULT '[]'::jsonb,
  class_reqs INTEGER NOT NULL DEFAULT 0,
  class_completed INTEGER NOT NULL DEFAULT 0,
  critical_path JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.drydock_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drydock_projects_select" ON public.drydock_projects FOR SELECT USING (true);
CREATE POLICY "drydock_projects_insert" ON public.drydock_projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "drydock_projects_update" ON public.drydock_projects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "drydock_projects_delete" ON public.drydock_projects FOR DELETE USING (auth.uid() IS NOT NULL);

-- =============================================
-- DRILL RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.drill_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('fire','abandon_ship','mob','oil_spill','flooding','collision','security','medical','piracy')),
  scenario_name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  planned_date DATE,
  executed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  planned_duration_minutes INTEGER DEFAULT 30,
  participants_count INTEGER DEFAULT 0,
  score NUMERIC(5,2),
  passed BOOLEAN,
  objectives JSONB DEFAULT '[]'::jsonb,
  completed_objectives JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  participants JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.drill_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drill_records_select" ON public.drill_records FOR SELECT USING (true);
CREATE POLICY "drill_records_insert" ON public.drill_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "drill_records_update" ON public.drill_records FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "drill_records_delete" ON public.drill_records FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_drill_records_vessel ON public.drill_records(vessel_id);
CREATE INDEX idx_drill_records_type ON public.drill_records(scenario_type);
CREATE INDEX idx_drill_records_status ON public.drill_records(status);
CREATE INDEX idx_drydock_projects_vessel ON public.drydock_projects(vessel_id);
CREATE INDEX idx_drydock_projects_status ON public.drydock_projects(status);
