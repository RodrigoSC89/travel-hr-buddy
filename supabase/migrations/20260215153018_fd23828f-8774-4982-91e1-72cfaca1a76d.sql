
-- PEOTRAM Lessons Learned
CREATE TABLE IF NOT EXISTS public.peotram_lessons_learned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'operation',
  element_code TEXT,
  element_name TEXT,
  severity TEXT DEFAULT 'info',
  date_identified TIMESTAMPTZ DEFAULT now(),
  vessel_name TEXT,
  action_taken TEXT,
  benefit TEXT,
  shared_with TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'new',
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.peotram_lessons_learned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_select_peotram_lessons" ON public.peotram_lessons_learned FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_peotram_lessons" ON public.peotram_lessons_learned FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_peotram_lessons" ON public.peotram_lessons_learned FOR UPDATE TO authenticated USING (true);

-- PEOTRAM Audit Milestones
CREATE TABLE IF NOT EXISTS public.peotram_audit_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  category TEXT DEFAULT 'documentation',
  element TEXT,
  priority TEXT DEFAULT 'medium',
  completed_date TIMESTAMPTZ,
  assignee TEXT,
  progress INTEGER DEFAULT 0,
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.peotram_audit_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_select_peotram_milestones" ON public.peotram_audit_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_peotram_milestones" ON public.peotram_audit_milestones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_peotram_milestones" ON public.peotram_audit_milestones FOR UPDATE TO authenticated USING (true);

-- PEO-DP SIMOPS
CREATE TABLE IF NOT EXISTS public.peodp_simops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_name TEXT NOT NULL,
  operation_type TEXT DEFAULT 'crane_ops',
  status TEXT DEFAULT 'planned',
  risk_level TEXT DEFAULT 'medium',
  start_time TEXT DEFAULT '00:00',
  end_time TEXT DEFAULT '23:59',
  supervisor TEXT,
  dp_requirements TEXT,
  restrictions TEXT[] DEFAULT '{}',
  conflicts_with TEXT[] DEFAULT '{}',
  weather_limit TEXT,
  vessel_id UUID,
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.peodp_simops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_select_peodp_simops" ON public.peodp_simops FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_peodp_simops" ON public.peodp_simops FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_peodp_simops" ON public.peodp_simops FOR UPDATE TO authenticated USING (true);

-- MLC Food Inspections
CREATE TABLE IF NOT EXISTS public.mlc_food_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT UNIQUE NOT NULL,
  category TEXT,
  requirement TEXT,
  regulation TEXT,
  status TEXT DEFAULT 'not_inspected',
  notes TEXT DEFAULT '',
  is_critical BOOLEAN DEFAULT false,
  inspected_at TIMESTAMPTZ,
  vessel_id UUID,
  inspector_id UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mlc_food_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_select_mlc_food" ON public.mlc_food_inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_mlc_food" ON public.mlc_food_inspections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_mlc_food" ON public.mlc_food_inspections FOR UPDATE TO authenticated USING (true);
