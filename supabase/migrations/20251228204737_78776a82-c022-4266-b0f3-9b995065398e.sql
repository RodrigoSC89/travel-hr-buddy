-- PATCH 661.4: Documents & Workflows tables
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT,
  file_path TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  changes_summary TEXT,
  created_by UUID,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  document_type TEXT NOT NULL,
  template_id UUID,
  prompt_used TEXT,
  ai_model TEXT,
  confidence_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft',
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.smart_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL DEFAULT 'sequential',
  status TEXT NOT NULL DEFAULT 'draft',
  trigger_type TEXT,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.smart_workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.smart_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  conditions JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checklist_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_items INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  vessel_id UUID REFERENCES public.vessels(id),
  assigned_to UUID,
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_versions_all" ON public.document_versions FOR ALL USING (true);
CREATE POLICY "ai_generated_documents_all" ON public.ai_generated_documents FOR ALL USING (true);
CREATE POLICY "smart_workflows_all" ON public.smart_workflows FOR ALL USING (true);
CREATE POLICY "smart_workflow_steps_all" ON public.smart_workflow_steps FOR ALL USING (true);
CREATE POLICY "checklist_records_all" ON public.checklist_records FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_doc_versions_doc_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_smart_workflows_status ON public.smart_workflows(status);
CREATE INDEX IF NOT EXISTS idx_checklist_records_vessel ON public.checklist_records(vessel_id);