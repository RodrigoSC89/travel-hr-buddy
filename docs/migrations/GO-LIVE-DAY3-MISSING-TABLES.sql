-- =============================================
-- GO-LIVE DAY 3: CREATE MISSING TABLES + RLS HARDENING
-- Execute manually: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- =============================================

-- 1. VOYAGE_CHARTERS TABLE
CREATE TABLE IF NOT EXISTS public.voyage_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  vessel_id UUID,
  charter_type TEXT DEFAULT 'voyage' CHECK (charter_type IN ('voyage', 'time', 'bareboat', 'spot')),
  charterer_name TEXT NOT NULL,
  charterer_contact TEXT,
  cargo_type TEXT,
  cargo_quantity DECIMAL(15,2),
  loading_port TEXT,
  discharge_port TEXT,
  laycan_start DATE,
  laycan_end DATE,
  freight_rate DECIMAL(15,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'loading', 'sailing', 'discharging', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AI_INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  confidence DECIMAL(3,2) DEFAULT 0.80,
  related_module TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AI_COMMANDS TABLE
CREATE TABLE IF NOT EXISTS public.ai_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  command_type TEXT DEFAULT 'voice',
  raw_input TEXT NOT NULL,
  parsed_intent TEXT,
  response TEXT,
  execution_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MMI_MAINTENANCE_JOBS TABLE
CREATE TABLE IF NOT EXISTS public.mmi_maintenance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  vessel_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  scheduled_date DATE,
  completed_date TIMESTAMPTZ,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ACCESS_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  organization_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE public.voyage_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mmi_maintenance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (use security definer functions from Phase 1)
CREATE POLICY "voyage_charters_org_select" ON public.voyage_charters FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "ai_insights_org_select" ON public.ai_insights FOR SELECT TO authenticated
USING (user_id = auth.uid() OR organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "ai_commands_user_select" ON public.ai_commands FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "mmi_jobs_org_select" ON public.mmi_maintenance_jobs FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "access_logs_admin_select" ON public.access_logs FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_voyage_charters_org ON public.voyage_charters(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org ON public.ai_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_commands_user ON public.ai_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_mmi_jobs_org ON public.mmi_maintenance_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON public.access_logs(user_id);
