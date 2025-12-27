-- ============================================
-- Migration: Create missing tables for @ts-nocheck removal
-- Tables: clone_context_storage, clone_snapshots, user_settings, modules
-- ============================================

-- 1. Clone Context Storage (for cognitiveClone.ts)
CREATE TABLE IF NOT EXISTS public.clone_context_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clone_id UUID NOT NULL REFERENCES public.clone_registry(id) ON DELETE CASCADE,
  context_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Clone Snapshots (for cognitiveClone.ts)
CREATE TABLE IF NOT EXISTS public.clone_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  modules JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  llm_state JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Settings (for cognitiveClone.ts)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_key TEXT NOT NULL,
  settings_value JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, settings_key)
);

-- 4. Modules table (for cognitiveClone.ts)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  config JSONB DEFAULT '{}',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. AI Memory (for cognitiveClone.ts)
CREATE TABLE IF NOT EXISTS public.ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  embedding TEXT,
  importance NUMERIC(3,2) DEFAULT 0.5,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Jobs table (for autoBalancer.ts)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.clone_context_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clone_context_storage
CREATE POLICY "Users can view clone context in their organization"
  ON public.clone_context_storage FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clone_registry cr
    JOIN public.organization_users ou ON ou.organization_id = cr.organization_id
    WHERE cr.id = clone_context_storage.clone_id AND ou.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert clone context"
  ON public.clone_context_storage FOR INSERT TO authenticated
  WITH CHECK (true);

-- RLS Policies for clone_snapshots
CREATE POLICY "Users can view snapshots in their organization"
  ON public.clone_snapshots FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert snapshots"
  ON public.clone_snapshots FOR INSERT TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings"
  ON public.user_settings FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for modules
CREATE POLICY "Users can view modules in their organization"
  ON public.modules FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
  ) OR organization_id IS NULL);

CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- RLS Policies for ai_memory
CREATE POLICY "Users can manage their own AI memory"
  ON public.ai_memory FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for jobs
CREATE POLICY "Users can view jobs in their organization"
  ON public.jobs FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage jobs"
  ON public.jobs FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clone_context_storage_clone_id ON public.clone_context_storage(clone_id);
CREATE INDEX IF NOT EXISTS idx_clone_snapshots_org_id ON public.clone_snapshots(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_org_id ON public.modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_user_id ON public.ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_due_date ON public.jobs(due_date);

-- Create update triggers
CREATE TRIGGER update_clone_context_storage_updated_at
  BEFORE UPDATE ON public.clone_context_storage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_memory_updated_at
  BEFORE UPDATE ON public.ai_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();